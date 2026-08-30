<?php
declare(strict_types=1);

namespace App\Services;

use App\Models\User;
use App\Models\Withdrawal;
use Nemesis\Core\Fluent;

class WithdrawalService
{
    /**
     * Validate and create a withdrawal request. Returns a structured result.
     */
    public function request(User $user, float $amount, string $gateway, string $walletAddress): array
    {
        if ($amount <= 0) {
            return ['success' => false, 'message' => 'Amount must be positive.'];
        }
        if (!in_array($gateway, ['bkash', 'nagad'], true)) {
            return ['success' => false, 'message' => 'Gateway must be bKash or Nagad.'];
        }
        if (!preg_match('/^[0-9+\-]{8,20}$/', $walletAddress)) {
            return ['success' => false, 'message' => 'Invalid wallet address format.'];
        }
        if ((float) $user->balance < $amount) {
            return [
                'success' => false,
                'message' => 'Insufficient balance. Available: $' . number_format((float) $user->balance, 2),
            ];
        }
        if (!$user->canWithdraw()) {
            $minReferrals = (int) (getenv('WITHDRAW_MIN_REFERRALS') ?: 0);
            return [
                'success' => false,
                'message' => "You need at least {$minReferrals} referral(s) to withdraw.",
            ];
        }

        // Pending withdrawal cap: 1 at a time
        $pending = Withdrawal::pendingForUser((int) $user->id);
        if (count($pending) > 0) {
            return [
                'success' => false,
                'message' => 'You already have a pending withdrawal. Wait for it to be processed.',
            ];
        }

        $id = Fluent::table('withdrawals')->insert([
            'user_id'        => $user->id,
            'amount'         => $amount,
            'gateway'        => $gateway,
            'wallet_address' => $walletAddress,
            'status'         => Withdrawal::STATUS_PENDING,
            'requested_at'   => date('Y-m-d H:i:s'),
        ]);

        // Decrement balance
        $newBalance = round(((float) $user->balance) - $amount, 4);
        Fluent::table('users')
            ->where('id', '=', $user->id)
            ->update([
                'balance'    => $newBalance,
                'updated_at' => date('Y-m-d H:i:s'),
            ]);
        $user->balance = $newBalance;

        return [
            'success'    => true,
            'withdrawal' => Withdrawal::find((int) $id),
        ];
    }
}
