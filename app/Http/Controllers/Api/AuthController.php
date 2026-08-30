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
}
