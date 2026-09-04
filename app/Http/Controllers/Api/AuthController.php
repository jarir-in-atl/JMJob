<?php
declare(strict_types=1);

namespace App\Http\Controllers\Api;

use Nemesis\Core\Controller;
use Nemesis\Http\Request;
use Nemesis\Http\Response;
use App\Models\User;
use App\Models\Session as UserSession;
use Nemesis\Core\Fluent;
use Nemesis\Core\Validator;
use Nemesis\Exceptions\ValidationException;
use App\Services\NotificationService;

// For password reset OTP
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

/**
 * AuthController — register, login, logout, me.
 *
 * Uses Nemesis\Session model for opaque Bearer tokens (not PHP sessions).
 * Tokens are persisted in the `sessions` table with TTL.
 */
class AuthController extends Controller
{
    /**
     * POST /api/auth/register
     * Body: { name, email, password, password_confirmation, referral_code? }
     */
    public function register(Request $request): Response
    {
        $data = $this->readJson($request);

        $validator = new Validator();
        $rules = [
            'name'     => 'required|string|min:2|max:100',
            'email'    => 'required|email|max:100',
            'password' => 'required|string|min:6',
        ];
        if (!$validator->validate($data, $rules)) {
            return Response::json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors'  => $validator->errors(),
            ], 422);
        }

        // Uniqueness
        $exists = Fluent::table('users')
            ->select(['COUNT(*) AS c'])
            ->where('email', '=', $data['email'])
            ->first();
        if ((int) ($exists['c'] ?? 0) > 0) {
            return Response::json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors'  => ['email' => ['Email is already registered.']],
            ], 422);
        }

        $username   = User::generateUsername($data['name']);
        $referral   = User::generateReferralCode();
        $referredBy = null;
        if (!empty($data['referral_code'])) {
            $refRow = Fluent::table('users')
                ->select(['id'])
                ->where('referral_code', '=', $data['referral_code'])
                ->first();
            if ($refRow) {
                $referredBy = (int) $refRow['id'];
            }
        }

        $id = Fluent::table('users')->insert([
            'name'           => $data['name'],
            'email'          => $data['email'],
            'username'       => $username,
            'password'       => password_hash($data['password'], PASSWORD_BCRYPT),
            'referral_code'  => $referral,
            'referred_by'    => $referredBy,
            'balance'        => 0,
            'lifetime_earned'=> 0,
            'today_earned'   => 0,
            'ads_limit'      => 50,
            'today_ads'      => 0,
            'last_ad_reset_at'=> date('Y-m-d'),
            'is_admin'       => 0,
            'created_at'     => date('Y-m-d H:i:s'),
            'updated_at'     => date('Y-m-d H:i:s'),
        ]);

        $user = User::find((int) $id);
        NotificationService::send(
            $user,
            'Welcome to JMJob',
            'Your account is ready. Explore available jobs and complete your profile.',
            'success',
            'bi-stars',
            '/'
        );
        $session = UserSession::createForUser(
            (int) $id,
            $_SERVER['REMOTE_ADDR'] ?? null,
            substr((string) ($_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 250)
        );

        return Response::json([
            'success' => true,
            'data'    => [
                'user'  => $this->serializeUser($user),
                'token' => $session->token,
            ],
            'message' => 'Registered successfully.',
        ], 201);
    }

    /**
     * POST /api/auth/login
     * Body: { email, password }
     */
    public function login(Request $request): Response
    {
        $data = $this->readJson($request);

        $validator = new Validator();
        if (!$validator->validate($data, [
            'email'    => 'required|email',
            'password' => 'required|string',
        ])) {
            return Response::json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $row = Fluent::table('users')
            ->where('email', '=', $data['email'])
            ->first();
        if (!$row) {
            return Response::json([
                'success' => false,
                'message' => 'Invalid email or password.',
            ], 401);
        }

        if (!password_verify($data['password'], (string) $row['password'])) {
            return Response::json([
                'success' => false,
                'message' => 'Invalid email or password.',
            ], 401);
        }

        $user = User::find((int) $row['id']);
        $session = UserSession::createForUser(
            (int) $row['id'],
            $_SERVER['REMOTE_ADDR'] ?? null,
            substr((string) ($_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 250)
        );

        return Response::json([
            'success' => true,
            'data'    => [
                'user'  => $this->serializeUser($user),
                'token' => $session->token,
            ],
            'message' => 'Logged in.',
        ]);
    }

    /**
     * POST /api/auth/logout (auth.api)
     * Body: empty
     */
    public function logout(Request $request): Response
    {
        $session = $request->getMeta('auth.session');
        if ($session !== null) {
            $session->delete();
        }
        return Response::json([
            'success' => true,
            'message' => 'Logged out.',
        ]);
    }

    /**
     * GET /api/auth/me (auth.api)
     */
    public function me(Request $request): Response
    {
        $user = $request->getMeta('auth.user');
        return Response::json([
            'success' => true,
            'data'    => $this->serializeUser($user),
        ]);
    }

    private function serializeUser(?User $user): array
    {
        if ($user === null) {
            return [];
        }
        $user->resetDailyCountersIfNeeded();
        $array = $user->toArray();
        unset($array['password']);
        $array['referral_count'] = $user->referralCount();
        $array['ads_remaining']  = $user->adsRemainingToday();
        $array['can_withdraw']   = $user->canWithdraw();
        $array['avatar_url']     = $user->getAvatarUrlAttribute();
        $array['is_admin']       = $user->isAdmin();
        return $array;
    }

    private function readJson(Request $request): array
    {
        $body = file_get_contents('php://input');
        if ($body !== false && $body !== '') {
            $data = json_decode($body, true);
            if (is_array($data)) {
                return $data;
            }
        }
        return $request->all();
    }

    /**
     * POST /api/auth/forgot-password
     * Sends a password reset OTP to the user's email.
     * Body: { email }
     */
    public function forgotPassword(Request $request): Response
    {
        $data = $this->readJson($request);

        $validator = new Validator();
        if (!$validator->validate($data, [
            'email' => 'required|email',
        ])) {
            return Response::json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $email = $data['email'];

        // Check if user exists
        $user = Fluent::table('users')
            ->where('email', '=', $email)
            ->first();

        // Always return success to prevent email enumeration
        if (!$user) {
            return Response::json([
                'success' => true,
                'message' => 'If an account exists with this email, you will receive a password reset code.',
            ]);
        }

        // Generate 6-digit OTP
        $otp = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $expiresAt = date('Y-m-d H:i:s', strtotime('+15 minutes'));

        // Store OTP in database (using a simple approach with password_reset_tokens table or user meta)
        // For simplicity, we'll store it directly in a custom table or use sessions
        $this->storeResetToken($user['id'], $otp, $expiresAt);

        // Send email
        $this->sendPasswordResetEmail($email, $otp, $user['name']);

        return Response::json([
            'success' => true,
            'message' => 'If an account exists with this email, you will receive a password reset code.',
        ]);
    }

    /**
     * POST /api/auth/reset-password
     * Resets the user's password using the OTP.
     * Body: { email, otp, password, password_confirmation }
     */
    public function resetPassword(Request $request): Response
    {
        $data = $this->readJson($request);

        $validator = new Validator();
        if (!$validator->validate($data, [
            'email'    => 'required|email',
            'otp'      => 'required|string|size:6',
            'password' => 'required|string|min:6',
        ])) {
            return Response::json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $email = $data['email'];
        $otp = $data['otp'];
        $password = $data['password'];

        // Find user
        $user = Fluent::table('users')
            ->where('email', '=', $email)
            ->first();

        if (!$user) {
            return Response::json([
                'success' => false,
                'message' => 'Invalid or expired reset code.',
            ], 400);
        }

        // Verify OTP
        $validToken = $this->verifyResetToken($user['id'], $otp);
        if (!$validToken) {
            return Response::json([
                'success' => false,
                'message' => 'Invalid or expired reset code.',
            ], 400);
        }

        // Update password
        Fluent::table('users')
            ->where('id', '=', $user['id'])
            ->update([
                'password' => password_hash($password, PASSWORD_BCRYPT),
                'updated_at' => date('Y-m-d H:i:s'),
            ]);

        // Delete used token
        $this->deleteResetToken($user['id']);

        return Response::json([
            'success' => true,
            'message' => 'Password reset successfully. You can now log in with your new password.',
        ]);
    }

    /**
     * POST /api/auth/change-password
     * Changes the user's password (requires current password).
     * Body: { current_password, new_password }
     */
    public function changePassword(Request $request): Response
    {
        $user = $request->getMeta('auth.user');
        if (!$user) {
            return Response::json([
                'success' => false,
                'message' => 'Unauthorized.',
            ], 401);
        }

        $data = $this->readJson($request);

        $validator = new Validator();
        if (!$validator->validate($data, [
            'current_password' => 'required|string',
            'new_password'     => 'required|string|min:6',
        ])) {
            return Response::json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Verify current password
        if (!password_verify($data['current_password'], (string) $user->password)) {
            return Response::json([
                'success' => false,
                'message' => 'Current password is incorrect.',
            ], 400);
        }

        // Update password
        Fluent::table('users')
            ->where('id', '=', $user->id)
            ->update([
                'password' => password_hash($data['new_password'], PASSWORD_BCRYPT),
                'updated_at' => date('Y-m-d H:i:s'),
            ]);

        return Response::json([
            'success' => true,
            'message' => 'Password changed successfully.',
        ]);
    }

    private function storeResetToken(int $userId, string $token, string $expiresAt): void
    {
        // Delete any existing tokens for this user
        Fluent::table('password_reset_tokens')
            ->where('user_id', '=', $userId)
            ->delete();

        // Insert new token
        Fluent::table('password_reset_tokens')->insert([
            'user_id'    => $userId,
            'token'      => password_hash($token, PASSWORD_BCRYPT),
            'expires_at' => $expiresAt,
            'created_at' => date('Y-m-d H:i:s'),
        ]);
    }

    private function verifyResetToken(int $userId, string $token): bool
    {
        $row = Fluent::table('password_reset_tokens')
            ->where('user_id', '=', $userId)
            ->where('expires_at', '>', date('Y-m-d H:i:s'))
            ->first();

        if (!$row) {
            return false;
        }

        return password_verify($token, (string) $row['token']);
    }

    private function deleteResetToken(int $userId): void
    {
        Fluent::table('password_reset_tokens')
            ->where('user_id', '=', $userId)
            ->delete();
    }

    private function sendPasswordResetEmail(string $email, string $otp, string $name): void
    {
        try {
            $mail = new PHPMailer(true);

            // SMTP Configuration
            $mail->isSMTP();
            $mail->Host       = getenv('MAIL_HOST') ?: 'mail.jmjob.xyz';
            $mail->SMTPAuth   = true;
            $mail->Username   = getenv('MAIL_USERNAME') ?: '_mainaccount@jmjob.xyz';
            $mail->Password   = getenv('MAIL_PASSWORD') ?: '';
            $mail->SMTPAutoTLS = false;
            $mail->Port       = getenv('MAIL_PORT') ?: 587;

            // Recipients
            $mail->setFrom(
                getenv('MAIL_FROM_ADDRESS') ?: '_mainaccount@jmjob.xyz',
                getenv('MAIL_FROM_NAME') ?: 'JMJob'
            );
            $mail->addAddress($email, $name);

            // Content
            $mail->isHTML(true);
            $mail->Subject = 'JMJob - Password Reset Code';
            $mail->Body    = $this->getEmailTemplate($otp, $name);
            $mail->AltBody = "Your password reset code is: {$otp}\nThis code expires in 15 minutes.";

            $mail->send();
        } catch (Exception $e) {
            // Log error but don't expose to user
            error_log("Failed to send password reset email to {$email}: " . $e->getMessage());
        }
    }

    private function getEmailTemplate(string $otp, string $name): string
    {
        return "
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Inter', -apple-system, sans-serif; background: #0a0e1a; color: #ffffff; margin: 0; padding: 20px; }
                .container { max-width: 500px; margin: 0 auto; background: #1e293b; border-radius: 16px; padding: 32px; border: 1px solid #374151; }
                .logo { font-size: 24px; font-weight: 800; margin-bottom: 24px; }
                .logo span { color: #7c3aed; }
                h1 { font-size: 20px; margin-bottom: 16px; }
                .otp { background: #7c3aed; color: white; font-size: 32px; font-weight: 700; text-align: center; padding: 16px; border-radius: 8px; margin: 24px 0; letter-spacing: 8px; }
                .text { color: #9ca3af; font-size: 14px; line-height: 1.6; }
                .footer { margin-top: 24px; padding-top: 16px; border-top: 1px solid #374151; color: #6b7280; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='logo'><span>JM</span>JOB</div>
                <h1>Password Reset Code</h1>
                <p class='text'>Hi {$name},</p>
                <p class='text'>We received a request to reset your password. Use the code below to reset it:</p>
                <div class='otp'>{$otp}</div>
                <p class='text'>This code will expire in <strong>15 minutes</strong>.</p>
                <p class='text'>If you didn't request this, you can safely ignore this email.</p>
                <div class='footer'>
                    <p>This is an automated message from JMJob. Do not reply to this email.</p>
                </div>
            </div>
        </body>
        </html>";
    }
}
