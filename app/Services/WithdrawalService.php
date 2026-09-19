<?php
declare(strict_types=1);

namespace App\Services;

use App\Models\User;
use App\Models\Withdrawal;
use App\Services\NotificationService;
use Nemesis\Core\Database;
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
        if ($user->isBanned()) {
            return ['success' => false, 'message' => 'Banned users cannot request withdrawals.'];
        }

        $db = Database::connect();
        try {
            Database::beginWriteTransaction($db);
            $lockSql = 'SELECT * FROM users WHERE id = :id LIMIT 1';
            if (Database::getDriverName() !== 'sqlite') $lockSql .= ' FOR UPDATE';
            $lock = $db->prepare($lockSql);
            $lock->execute(['id' => (int) $user->id]);
            $lockedRow = $lock->fetch(\PDO::FETCH_ASSOC);
            $currentUser = $lockedRow ? new User($lockedRow) : null;
            if ($currentUser === null) throw new \RuntimeException('User not found.');
            if ($currentUser->isBanned()) throw new \RuntimeException('Banned users cannot request withdrawals.');
            if ((float) $currentUser->balance < $amount) {
                throw new \RuntimeException('Insufficient balance. Available: $' . number_format((float) $currentUser->balance, 2));
            }
            if (!$currentUser->canWithdraw()) {
                $minReferrals = (int) (getenv('WITHDRAW_MIN_REFERRALS') ?: 0);
                throw new \RuntimeException("You need at least {$minReferrals} referral(s) to withdraw.");
            }
            if (count(Withdrawal::pendingForUser((int) $currentUser->id)) > 0) {
                throw new \RuntimeException('You already have a pending withdrawal. Wait for it to be processed.');
            }

            $now = date('Y-m-d H:i:s');
            $id = (int) Fluent::table('withdrawals')->insert([
                'user_id'        => $currentUser->id,
                'amount'         => $amount,
                'gateway'        => $gateway,
                'wallet_address' => $walletAddress,
                'status'         => Withdrawal::STATUS_PENDING,
                'requested_at'   => $now,
            ]);
            $newBalance = round(((float) $currentUser->balance) - $amount, 4);
            Fluent::table('users')->where('id', '=', $currentUser->id)->update([
                'balance'    => $newBalance,
                'updated_at' => $now,
            ]);
            Database::commitWriteTransaction($db);
        } catch (\Throwable $e) {
            Database::rollbackWriteTransaction($db);
            return ['success' => false, 'message' => $e->getMessage()];
        }

        $user->balance = $newBalance;

        NotificationService::send(
            $user,
            'Withdrawal requested',
            'Your withdrawal request for ' . number_format($amount, 2) . ' BDT is awaiting admin review.',
            'info',
            'bi-wallet2',
            '/withdraw'
        );
        NotificationService::sendToAdmins(
            'New withdrawal request',
            ($user->name ?: $user->email) . ' requested a ' . number_format($amount, 2) . ' BDT withdrawal.',
            'info',
            'bi-wallet2',
            '/admin/withdrawals'
        );

        return [
            'success'    => true,
            'withdrawal' => Withdrawal::find((int) $id),
        ];
    }
}
