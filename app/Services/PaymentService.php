<?php
declare(strict_types=1);

namespace App\Services;

use App\Models\PaymentSubmission;
use App\Models\Transaction;
use App\Models\User;
use App\Services\NotificationService;
use Nemesis\Core\Fluent;
use RuntimeException;

/**
 * PaymentService — TRXID-based deposit flow.
 *
 * submit()      User submits TRXID + amount + gateway → creates a pending row.
 * approve()     Admin marks a submission approved → credits user balance.
 * reject()      Admin marks a submission rejected with optional note.
 * list() / listForUser() — read-side helpers.
 */
class PaymentService
{
    public function __construct(
        private PaymentGatewayRegistry $registry = new PaymentGatewayRegistry()
    ) {}

    /**
     * User submits a payment (TRXID-based deposit).
     *
     * Validates gateway/amount/format, ensures TRXID is unique, and writes a
     * pending row to payment_submissions. No balance change here — the funds
     * are credited only after admin approval.
     */
    public function submit(User $user, string $gateway, string $senderNumber, float $amount, string $trxid): array
    {
        $gateway = strtolower(trim($gateway));
        $trxid = strtoupper(trim($trxid));

        if (!$this->registry->isValidKey($gateway)) {
            return ['success' => false, 'message' => 'Unsupported payment method.'];
        }

        $min = (float) (getenv('PAYMENT_MIN_AMOUNT') ?: 1);
        $max = (float) (getenv('PAYMENT_MAX_AMOUNT') ?: 50000);
        if ($amount < $min || $amount > $max) {
            return ['success' => false, 'message' => "Amount must be between {$min} and {$max}."];
        }

        if (!preg_match('/^[0-9+\-]{8,20}$/', $senderNumber)) {
            return ['success' => false, 'message' => 'Invalid sender number format.'];
        }

        if (!preg_match('/^[A-Z0-9]{4,40}$/', $trxid)) {
            return ['success' => false, 'message' => 'TRXID must be 4-40 uppercase letters or digits.'];
        }

        // Reject duplicate TRXID — UNIQUE constraint will catch it too, but
        // this gives a friendly message instead of a DB error.
        if (PaymentSubmission::findByTrxid($trxid) !== null) {
            return ['success' => false, 'message' => 'This TRXID has already been submitted.'];
        }

        $id = Fluent::table('payment_submissions')->insert([
            'user_id'       => $user->id,
            'gateway'       => $gateway,
            'sender_number' => $senderNumber,
            'amount'        => round($amount, 4),
            'trxid'         => $trxid,
            'status'        => PaymentSubmission::STATUS_PENDING,
            'created_at'    => date('Y-m-d H:i:s'),
        ]);

        if (!$id) {
            return ['success' => false, 'message' => 'Failed to create payment submission.'];
        }

        return [
            'success'    => true,
            'submission' => PaymentSubmission::find((int) $id),
        ];
    }

    /**
     * Admin approves a submission → credits user balance and marks approved.
     * Atomic: if balance update fails, status is not flipped.
     */
    public function approve(int $submissionId, User $admin, ?string $note = null): array
    {
        $submission = PaymentSubmission::find($submissionId);
        if ($submission === null) {
            return ['success' => false, 'message' => 'Submission not found.'];
        }
        if (!$submission->isPending()) {
            return ['success' => false, 'message' => 'Submission is not pending.'];
        }
        if (!$admin->isAdmin()) {
            return ['success' => false, 'message' => 'Forbidden. Admin access required.'];
        }

        $user = $submission->user();
        if ($user === null) {
            return ['success' => false, 'message' => 'Submission user not found.'];
        }

        $db = \Nemesis\Core\Database::connect();
        $amount = (float) $submission->amount;

        try {
            $db->beginTransaction();

            // Deposits fund the role-specific available wallet. Workers use
            // `balance`; posters use `wallet_balance` for job escrow.
            $isPoster = ($user->role ?? null) === 'poster';
            $newBalance = round(((float) $user->balance) + ($isPoster ? 0 : $amount), 4);
            $newWallet = round(((float) ($user->wallet_balance ?? 0)) + ($isPoster ? $amount : 0), 4);
            Fluent::table('users')
                ->where('id', '=', $user->id)
                ->update([
                    'balance'        => $newBalance,
                    'wallet_balance' => $newWallet,
                    'updated_at'    => date('Y-m-d H:i:s'),
                ]);

            // Deposits are funding events, not earned income. Keep them in
            // the financial ledger without inflating lifetime earnings.
            JobService::logTransaction(
                (int) $user->id, null, Transaction::TYPE_DEPOSIT, $amount, 'BDT',
                $isPoster ? $newWallet : $newBalance,
                null, 'payment:' . $submission->id, 'Approved manual deposit'
            );

            // Update submission
            Fluent::table('payment_submissions')
                ->where('id', '=', $submission->id)
                ->update([
                    'status'      => PaymentSubmission::STATUS_APPROVED,
                    'admin_id'    => $admin->id,
                    'admin_note'  => $note,
                    'verified_at' => date('Y-m-d H:i:s'),
                    'updated_at'  => date('Y-m-d H:i:s'),
                ]);

            $db->commit();
        } catch (\Throwable $e) {
            $db->rollBack();
            return ['success' => false, 'message' => 'Approval failed: ' . $e->getMessage()];
        }

        NotificationService::send(
            $user,
            'Deposit approved',
            'Your ' . number_format($amount, 2) . ' BDT deposit is now available in your wallet.',
            'success',
            'bi-wallet2',
            '/deposit'
        );

        return [
            'success'    => true,
            'submission' => PaymentSubmission::find($submission->id),
        ];
    }

    /**
     * Admin rejects a submission. No balance change.
     */
    public function reject(int $submissionId, User $admin, ?string $note = null): array
    {
        $submission = PaymentSubmission::find($submissionId);
        if ($submission === null) {
            return ['success' => false, 'message' => 'Submission not found.'];
        }
        if (!$submission->isPending()) {
            return ['success' => false, 'message' => 'Submission is not pending.'];
        }
        if (!$admin->isAdmin()) {
            return ['success' => false, 'message' => 'Forbidden. Admin access required.'];
        }

        $user = $submission->user();
        if ($user === null) {
            return ['success' => false, 'message' => 'Submission user not found.'];
        }

        Fluent::table('payment_submissions')
            ->where('id', '=', $submission->id)
            ->update([
                'status'      => PaymentSubmission::STATUS_REJECTED,
                'admin_id'    => $admin->id,
                'admin_note'  => $note,
                'verified_at' => date('Y-m-d H:i:s'),
                'updated_at'  => date('Y-m-d H:i:s'),
            ]);

        NotificationService::send(
            $user,
            'Deposit rejected',
            $note ? 'Your deposit was rejected: ' . $note : 'Your deposit was rejected. Please review the submission and try again.',
            'warning',
            'bi-exclamation-circle',
            '/deposit'
        );

        return [
            'success'    => true,
            'submission' => PaymentSubmission::find($submission->id),
        ];
    }

    public function list(?string $status = null, int $limit = 200): array
    {
        return PaymentSubmission::allFiltered($status, $limit);
    }

    public function listForUser(int $userId, int $limit = 50): array
    {
        return PaymentSubmission::allForUser($userId, $limit);
    }

    public function listPending(int $limit = 100): array
    {
        return PaymentSubmission::allPending($limit);
    }

    public function registry(): PaymentGatewayRegistry
    {
        return $this->registry;
    }
}
