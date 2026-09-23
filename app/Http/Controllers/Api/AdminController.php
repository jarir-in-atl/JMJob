<?php
declare(strict_types=1);

namespace App\Http\Controllers\Api;

use Nemesis\Core\Controller;
use Nemesis\Http\Request;
use Nemesis\Http\Response;
use App\Models\Withdrawal;
use App\Models\User;
use App\Models\Job;
use App\Models\JobAssignment;
use App\Models\JobSubmission;
use App\Models\UserBanHistory;
use App\Models\AdminActionLog;
use App\Services\JobService;
use App\Services\NotificationService;
use App\Services\SettingService;
use Nemesis\Core\Fluent;
use Nemesis\Core\Database;
use App\Models\AdProvider;

/**
 * AdminController — protected by 'admin' middleware.
 *
 *   GET    /api/admin/withdrawals          — list pending withdrawals
 *   POST   /api/admin/withdrawals/{id}/approve
 *   POST   /api/admin/withdrawals/{id}/reject
 *   POST   /api/admin/withdrawals/{id}/pay
 *   GET    /api/admin/users                — list all users
 *   POST   /api/admin/users/{id}/role      — update a user's role
 *   GET    /api/admin/stats                — top-line counts
 *   GET    /api/admin/ad-providers         — list providers
 *   POST   /api/admin/ad-providers         — update a provider
 */
class AdminController extends Controller
{
    public function __construct(
        private JobService $jobService = new JobService()
    ) {}

    public function withdrawals(Request $request): Response
    {
        if ($guard = $this->adminGuard($request)) return $guard;
        $status = 'pending';
        $queryStr = parse_url($request->uri(), PHP_URL_QUERY);
        if (is_string($queryStr)) {
            parse_str($queryStr, $q);
            if (isset($q['status']) && is_string($q['status'])) {
                $status = $q['status'];
            }
        }
        $rows = Fluent::table('withdrawals')
            ->where('status', '=', $status)
            ->orderBy('id', 'desc')
            ->get();

        $items = [];
        foreach ($rows as $row) {
            $user = User::find((int) $row['user_id']);
            $items[] = [
                'id'              => (int) $row['id'],
                'user_id'         => (int) $row['user_id'],
                'user_name'       => $user ? $user->name : '(deleted)',
                'user_email'      => $user ? $user->email : null,
                'amount'          => (float) $row['amount'],
                'gateway'         => $row['gateway'],
                'wallet_address'  => $row['wallet_address'],
                'status'          => $row['status'],
                'admin_note'      => $row['admin_note'],
                'requested_at'    => $row['requested_at'],
                'processed_at'    => $row['processed_at'],
            ];
        }
        return Response::json([
            'success' => true,
            'data'    => $items,
        ]);
    }

    public function approve(Request $request, string $id): Response
    {
        return $this->setStatus($request, $id, Withdrawal::STATUS_APPROVED);
    }

    public function reject(Request $request, string $id): Response
    {
        return $this->setStatus($request, $id, Withdrawal::STATUS_REJECTED, true);
    }

    public function pay(Request $request, string $id): Response
    {
        return $this->setStatus($request, $id, Withdrawal::STATUS_PAID);
    }

    private function setStatus(Request $request, string $id, string $newStatus, bool $refund = false): Response
    {
        if ($guard = $this->adminGuard($request)) return $guard;
        $admin = $request->getMeta('auth.user');
        $withdrawal = Withdrawal::find((int) $id);
        if ($withdrawal === null) {
            return Response::json(['success' => false, 'message' => 'Withdrawal not found.'], 404);
        }

        $body = $this->readJson($request);
        $note = isset($body['admin_note']) && is_scalar($body['admin_note'])
            ? (string) $body['admin_note']
            : null;
        $allowedFrom = match ($newStatus) {
            Withdrawal::STATUS_APPROVED, Withdrawal::STATUS_REJECTED => [Withdrawal::STATUS_PENDING],
            Withdrawal::STATUS_PAID => [Withdrawal::STATUS_APPROVED],
            default => [],
        };

        $db = Database::connect();
        try {
            Database::beginWriteTransaction($db);

            // Keep the lock order aligned with WithdrawalService::request,
            // which locks the user before checking/creating withdrawals. This
            // avoids a user/withdrawal lock inversion during rejection races.
            $lockedUserRow = null;
            if ($refund) {
                $userLockSql = 'SELECT * FROM users WHERE id = :id LIMIT 1';
                if (Database::getDriverName() !== 'sqlite') $userLockSql .= ' FOR UPDATE';
                $userLock = $db->prepare($userLockSql);
                $userLock->execute(['id' => (int) $withdrawal->user_id]);
                $lockedUserRow = $userLock->fetch(\PDO::FETCH_ASSOC);
                if (!$lockedUserRow) throw new \RuntimeException('Withdrawal owner not found.');
            }

            $lockSql = 'SELECT * FROM withdrawals WHERE id = :id LIMIT 1';
            if (Database::getDriverName() !== 'sqlite') $lockSql .= ' FOR UPDATE';
            $lock = $db->prepare($lockSql);
            $lock->execute(['id' => (int) $withdrawal->id]);
            $lockedRow = $lock->fetch(\PDO::FETCH_ASSOC);
            if (!$lockedRow) throw new \RuntimeException('Withdrawal not found.');

            $currentStatus = (string) ($lockedRow['status'] ?? '');
            if (!in_array($currentStatus, $allowedFrom, true)) {
                Database::rollbackWriteTransaction($db);
                return Response::json([
                    'success' => false,
                    'message' => "Withdrawal is already {$currentStatus} and cannot be marked as {$newStatus}.",
                ], 422);
            }

            $now = date('Y-m-d H:i:s');
            Fluent::table('withdrawals')
                ->where('id', '=', (int) $withdrawal->id)
                ->where('status', '=', $currentStatus)
                ->update([
                    'status'       => $newStatus,
                    'admin_note'   => $note,
                    'processed_at' => $now,
                    'processed_by' => (int) $admin->id,
                ]);

            // Rejection refunds the reserved balance within the same
            // transaction as the state change, so a repeated or failed action
            // cannot credit the worker twice or leave a rejected request held.
            if ($refund) {
                $newBalance = round((float) $lockedUserRow['balance'] + (float) $lockedRow['amount'], 4);
                Fluent::table('users')
                    ->where('id', '=', (int) $lockedRow['user_id'])
                    ->update([
                        'balance'    => $newBalance,
                        'updated_at' => $now,
                    ]);
            }

            Database::commitWriteTransaction($db);
        } catch (\Throwable $e) {
            Database::rollbackWriteTransaction($db);
            return Response::json(['success' => false, 'message' => 'Withdrawal status update failed.'], 500);
        }

        $withdrawal = Withdrawal::find((int) $id);
        $user = User::find((int) $withdrawal->user_id);
        if ($user) {
            $statusLabel = ucfirst(str_replace('_', ' ', $newStatus));
            $message = "Your withdrawal of " . number_format((float) $withdrawal->amount, 2) . " BDT was marked as {$statusLabel}.";
            if ($refund) $message .= ' The amount was returned to your balance.';
            if (is_string($note) && trim($note) !== '') $message .= ' Note: ' . trim($note);
            NotificationService::send(
                $user,
                "Withdrawal {$statusLabel}",
                $message,
                $refund ? 'warning' : 'success',
                $refund ? 'bi-exclamation-circle' : 'bi-wallet2',
                '/withdraw'
            );
        }
        $this->auditAdminAction($admin, 'withdrawal.status', 'withdrawal', (int) $withdrawal->id, [
            'status' => $newStatus,
            'refunded' => $refund,
            'admin_note' => is_string($note) ? trim($note) : null,
        ]);
        return Response::json([
            'success' => true,
            'data'    => [
                'id'     => (int) $withdrawal->id,
                'status' => $withdrawal->status,
            ],
            'message' => "Withdrawal marked as {$newStatus}.",
        ]);
    }

    public function users(Request $request): Response
    {
        if ($guard = $this->adminGuard($request)) return $guard;
        $rows = Fluent::table('users')
            ->orderBy('id', 'desc')
            ->limit(200)
            ->get();

        $items = [];
        foreach ($rows as $row) {
            $isAdmin = (bool) $row['is_admin'];
            $items[] = [
                'id'              => (int) $row['id'],
                'name'            => $row['name'],
                'email'           => $row['email'],
                'username'        => $row['username'],
                'referral_code'   => $row['referral_code'],
                'balance'         => (float) $row['balance'],
                'lifetime_earned' => (float) $row['lifetime_earned'],
                'today_earned'    => (float) $row['today_earned'],
                'today_ads'       => (int) $row['today_ads'],
                'is_admin'        => $isAdmin,
                'role'            => $isAdmin ? 'admin' : (string) ($row['role'] ?? 'worker'),
                'phone'           => $row['phone'] ?? null,
                'is_banned'       => (bool) ($row['is_banned'] ?? 0),
                'banned_at'       => $row['banned_at'] ?? null,
                'ban_reason'      => $row['ban_reason'] ?? null,
                'created_at'      => $row['created_at'],
            ];
        }
        return Response::json([
            'success' => true,
            'data'    => $items,
        ]);
    }

    public function banUser(Request $request, string $id): Response
    {
        if ($guard = $this->adminGuard($request)) return $guard;
        $admin = $request->getMeta('auth.user');
        $userId = (int) $id;
        if ($admin && (int) $admin->id === $userId) {
            return Response::json(['success' => false, 'message' => 'You cannot ban your own account.'], 422);
        }

        $body = (array) $this->readJson($request);
        $reason = trim((string) ($body['reason'] ?? ''));
        if ($reason === '') return Response::json(['success' => false, 'message' => 'Ban reason is required.'], 422);

        $now = date('Y-m-d H:i:s');
        $db = Database::connect();
        try {
            Database::beginWriteTransaction($db);

            $lockSql = 'SELECT * FROM users WHERE id = :id LIMIT 1';
            if (Database::getDriverName() !== 'sqlite') $lockSql .= ' FOR UPDATE';
            $lock = $db->prepare($lockSql);
            $lock->execute(['id' => $userId]);
            $lockedRow = $lock->fetch(\PDO::FETCH_ASSOC);
            if (!$lockedRow) {
                Database::rollbackWriteTransaction($db);
                return Response::json(['success' => false, 'message' => 'User not found.'], 404);
            }
            $target = new User($lockedRow);
            if ($target->isBanned()) {
                Database::rollbackWriteTransaction($db);
                return Response::json(['success' => false, 'message' => 'User is already banned.'], 422);
            }
            $snapshot = $this->userActivitySnapshot($target);
            $updated = $db->prepare(
                'UPDATE users SET is_banned = 1, banned_at = :banned_at, banned_by = :banned_by,
                 ban_reason = :ban_reason, updated_at = :updated_at
                 WHERE id = :id AND is_banned = 0'
            );
            $updated->execute([
                'banned_at' => $now,
                'banned_by' => (int) $admin->id,
                'ban_reason' => $reason,
                'updated_at' => $now,
                'id' => $userId,
            ]);
            if ($updated->rowCount() !== 1) {
                throw new \RuntimeException('User is already banned.');
            }
            Fluent::table('user_ban_history')->insert([
                'user_id'           => $userId,
                'admin_id'          => (int) $admin->id,
                'action'            => UserBanHistory::ACTION_BAN,
                'reason'            => $reason,
                'user_snapshot'     => json_encode(['id' => $userId, 'name' => $target->name, 'email' => $target->email], JSON_UNESCAPED_UNICODE),
                'previous_activity' => json_encode($snapshot, JSON_UNESCAPED_UNICODE),
                'created_at'        => $now,
            ]);
            Fluent::table('admin_action_logs')->insert([
                'admin_id'    => (int) $admin->id,
                'action'      => 'user.ban',
                'entity_type' => 'user',
                'entity_id'   => $userId,
                'details'     => json_encode(['reason' => $reason, 'activity' => $snapshot], JSON_UNESCAPED_UNICODE),
                'created_at'  => $now,
            ]);
            Fluent::table('sessions')->where('user_id', '=', $userId)->delete();
            Database::commitWriteTransaction($db);
        } catch (\Throwable $e) {
            Database::rollbackWriteTransaction($db);
            return Response::json(['success' => false, 'message' => 'Ban failed: ' . $e->getMessage()], 500);
        }

        NotificationService::send(
            $target,
            'Account banned',
            'Your JMJob account has been banned. Reason: ' . $reason,
            'danger',
            'bi-slash-circle',
            '/profile'
        );

        return Response::json([
            'success' => true,
            'message' => 'User banned and active sessions revoked.',
            'data'    => ['id' => $userId, 'is_banned' => true, 'banned_at' => $now, 'reason' => $reason],
        ]);
    }

    public function unbanUser(Request $request, string $id): Response
    {
        if ($guard = $this->adminGuard($request)) return $guard;
        $admin = $request->getMeta('auth.user');
        $userId = (int) $id;
        $body = (array) $this->readJson($request);
        $reason = trim((string) ($body['reason'] ?? 'Unbanned by admin'));
        $now = date('Y-m-d H:i:s');
        $db = Database::connect();
        try {
            Database::beginWriteTransaction($db);
            $lockSql = 'SELECT * FROM users WHERE id = :id LIMIT 1';
            if (Database::getDriverName() !== 'sqlite') $lockSql .= ' FOR UPDATE';
            $lock = $db->prepare($lockSql);
            $lock->execute(['id' => $userId]);
            $lockedRow = $lock->fetch(\PDO::FETCH_ASSOC);
            if (!$lockedRow) {
                Database::rollbackWriteTransaction($db);
                return Response::json(['success' => false, 'message' => 'User not found.'], 404);
            }
            $target = new User($lockedRow);
            if (!$target->isBanned()) {
                Database::rollbackWriteTransaction($db);
                return Response::json(['success' => false, 'message' => 'User is not banned.'], 422);
            }
            $updated = $db->prepare(
                'UPDATE users SET is_banned = 0, banned_at = NULL, banned_by = NULL,
                 ban_reason = NULL, updated_at = :updated_at
                 WHERE id = :id AND is_banned = 1'
            );
            $updated->execute(['updated_at' => $now, 'id' => $userId]);
            if ($updated->rowCount() !== 1) {
                throw new \RuntimeException('User is not banned.');
            }
            Fluent::table('user_ban_history')->insert([
                'user_id'       => $userId,
                'admin_id'      => (int) $admin->id,
                'action'        => UserBanHistory::ACTION_UNBAN,
                'reason'        => $reason,
                'user_snapshot' => json_encode(['id' => $userId, 'name' => $target->name, 'email' => $target->email], JSON_UNESCAPED_UNICODE),
                'created_at'    => $now,
            ]);
            Fluent::table('admin_action_logs')->insert([
                'admin_id'    => (int) $admin->id,
                'action'      => 'user.unban',
                'entity_type' => 'user',
                'entity_id'   => $userId,
                'details'     => json_encode(['reason' => $reason], JSON_UNESCAPED_UNICODE),
                'created_at'  => $now,
            ]);
            Database::commitWriteTransaction($db);
        } catch (\Throwable $e) {
            Database::rollbackWriteTransaction($db);
            return Response::json(['success' => false, 'message' => 'Unban failed: ' . $e->getMessage()], 500);
        }

        NotificationService::send(
            $target,
            'Account restored',
            'Your JMJob account has been unbanned. You can use the platform again.',
            'success',
            'bi-unlock',
            '/profile'
        );

        return Response::json([
            'success' => true,
            'message' => 'User unbanned.',
            'data'    => ['id' => $userId, 'is_banned' => false],
        ]);
    }

    public function banHistory(Request $request, string $id): Response
    {
        if ($guard = $this->adminGuard($request)) return $guard;
        $target = User::find((int) $id);
        if ($target === null) return Response::json(['success' => false, 'message' => 'User not found.'], 404);
        $rows = UserBanHistory::forUser((int) $id, 100);
        return Response::json(['success' => true, 'data' => array_map(static function (UserBanHistory $row): array {
            return [
                'id' => (int) $row->id,
                'user_id' => (int) $row->user_id,
                'admin_id' => (int) $row->admin_id,
                'action' => $row->action,
                'reason' => $row->reason,
                'previous_activity' => $row->previous_activity ? json_decode($row->previous_activity, true) : null,
                'created_at' => $row->created_at,
            ];
        }, $rows)]);
    }

    private function userActivitySnapshot(User $user): array
    {
        $count = static function (string $table, string $column, int $userId): int {
            try {
                return Fluent::table($table)->where($column, '=', $userId)->count();
            } catch (\Throwable $e) {
                return 0;
            }
        };
        return [
            'jobs_posted' => $count('jobs', 'poster_id', (int) $user->id),
            'submissions' => $count('job_submissions', 'worker_id', (int) $user->id),
            'withdrawals' => $count('withdrawals', 'user_id', (int) $user->id),
            'transactions' => $count('transactions', 'user_id', (int) $user->id),
        ];
    }

    private function banAccountForFraud(User $admin, User $target, string $note, int $submissionId): bool
    {
        if ((int) $admin->id === (int) $target->id) return false;
        $reason = 'Confirmed fraudulent submission #' . $submissionId . ': ' . trim($note);
        $now = date('Y-m-d H:i:s');
        $db = Database::connect();
        $newlyBanned = false;
        try {
            Database::beginWriteTransaction($db);

            $lockSql = 'SELECT * FROM users WHERE id = :id LIMIT 1';
            if (Database::getDriverName() !== 'sqlite') $lockSql .= ' FOR UPDATE';
            $lock = $db->prepare($lockSql);
            $lock->execute(['id' => (int) $target->id]);
            $lockedRow = $lock->fetch(\PDO::FETCH_ASSOC);
            if (!$lockedRow) {
                Database::rollbackWriteTransaction($db);
                return false;
            }
            $target = new User($lockedRow);
            // A repeated escalation is idempotent and must not create a
            // second ban-history/audit record.
            if ($target->isBanned()) {
                Database::commitWriteTransaction($db);
                return true;
            }
            $snapshot = $this->userActivitySnapshot($target);

            Fluent::table('users')->where('id', '=', (int) $target->id)->where('is_banned', '=', 0)->update([
                'is_banned' => 1,
                'banned_at' => $now,
                'banned_by' => (int) $admin->id,
                'ban_reason' => $reason,
                'updated_at' => $now,
            ]);
            Fluent::table('user_ban_history')->insert([
                'user_id' => (int) $target->id,
                'admin_id' => (int) $admin->id,
                'action' => UserBanHistory::ACTION_BAN,
                'reason' => $reason,
                'user_snapshot' => json_encode(['id' => (int) $target->id, 'name' => $target->name, 'email' => $target->email], JSON_UNESCAPED_UNICODE),
                'previous_activity' => json_encode($snapshot, JSON_UNESCAPED_UNICODE),
                'created_at' => $now,
            ]);
            Fluent::table('admin_action_logs')->insert([
                'admin_id' => (int) $admin->id,
                'action' => 'user.ban.fraud_escalation',
                'entity_type' => 'user',
                'entity_id' => (int) $target->id,
                'details' => json_encode(['submission_id' => $submissionId, 'reason' => $reason], JSON_UNESCAPED_UNICODE),
                'created_at' => $now,
            ]);
            Fluent::table('sessions')->where('user_id', '=', (int) $target->id)->delete();
            $newlyBanned = true;
            Database::commitWriteTransaction($db);
        } catch (\Throwable) {
            Database::rollbackWriteTransaction($db);
            return false;
        }
        if ($newlyBanned) {
            NotificationService::send(
                $target,
                'Account banned',
                'Your account was banned after a confirmed fraudulent submission. ' . $reason,
                'danger',
                'bi-slash-circle',
                '/profile'
            );
        }
        return true;
    }

    private function truthy(mixed $value): bool
    {
        return $value === true || in_array(strtolower(trim((string) $value)), ['1', 'true', 'yes', 'on'], true);
    }

    public function updateRole(Request $request, string $id): Response
    {
        if ($guard = $this->adminGuard($request)) return $guard;
        $userId = (int) $id;
        $admin = $request->getMeta('auth.user');
        if ($admin && (int) $admin->id === $userId) {
            return Response::json([
                'success' => false,
                'message' => 'You cannot change your own admin role.',
            ], 422);
        }

        $body = $this->readJson($request);
        $role = strtolower(trim((string) ($body['role'] ?? '')));
        if (!in_array($role, ['worker', 'poster', 'admin'], true)) {
            return Response::json([
                'success' => false,
                'message' => 'Role must be worker, poster, or admin.',
            ], 422);
        }

        $user = User::find($userId);
        if ($user === null) {
            return Response::json(['success' => false, 'message' => 'User not found.'], 404);
        }

        $isAdmin = $role === 'admin' ? 1 : 0;
        Fluent::table('users')
            ->where('id', '=', $userId)
            ->update([
                'role'       => $role,
                'is_admin'   => $isAdmin,
                'updated_at' => date('Y-m-d H:i:s'),
            ]);
        $this->auditAdminAction($admin, 'user.role_update', 'user', $userId, [
            'role' => $role,
            'is_admin' => (bool) $isAdmin,
        ]);

        return Response::json([
            'success' => true,
            'message' => 'User role updated.',
            'data'    => [
                'id'       => $userId,
                'role'     => $role,
                'is_admin' => (bool) $isAdmin,
            ],
        ]);
    }

    public function jobs(Request $request): Response
    {
        if ($guard = $this->adminGuard($request)) return $guard;
        $status = strtolower(trim((string) ($request->query('status') ?? '')));
        $allowedStatuses = [
            Job::STATUS_PENDING_APPROVAL, Job::STATUS_OPEN, Job::STATUS_DECLINED,
            Job::STATUS_IN_REVIEW, Job::STATUS_ASSIGNED, Job::STATUS_SUBMITTED,
            Job::STATUS_REVISION, Job::STATUS_COMPLETED, Job::STATUS_CANCELLED,
            Job::STATUS_DISPUTED, Job::STATUS_EXPIRED,
        ];
        $limit = max(1, min(200, (int) ($request->query('limit') ?? 100)));

        $sql = "SELECT j.*,
                    p.id AS poster_id, p.name AS poster_name, p.email AS poster_email,
                    w.name AS worker_name, w.email AS worker_email,
                    c.name AS category_name
                FROM jobs j
                LEFT JOIN users p ON p.id = j.poster_id
                LEFT JOIN users w ON w.id = j.assigned_worker_id
                LEFT JOIN categories c ON c.id = j.category_id
                WHERE 1 = 1";
        $params = [];
        if (in_array($status, $allowedStatuses, true)) {
            $sql .= " AND j.status = :status";
            $params[':status'] = $status;
        }
        $sql .= " ORDER BY COALESCE(j.updated_at, j.created_at) DESC, j.id DESC LIMIT :limit";

        $stmt = Database::connect()->prepare($sql);
        foreach ($params as $key => $value) $stmt->bindValue($key, $value);
        $stmt->bindValue(':limit', $limit, \PDO::PARAM_INT);
        $stmt->execute();

        $items = [];
        $now = time();
        $assignmentsAvailable = JobAssignment::isAvailable();
        foreach ($stmt->fetchAll(\PDO::FETCH_ASSOC) as $row) {
            $workerCount = (int) ($row['worker_count'] ?: 1);
            $bidCount    = (int) ($row['bid_count'] ?: 0);
            $progress = $this->jobProgress((int) $row['id'], $workerCount, $bidCount, $assignmentsAvailable);

            $deadlineStr = $row['deadline_at'] ?: $row['bidding_closes_at'];
            $daysRemaining = 'No deadline';
            if ($deadlineStr) {
                $target = strtotime($deadlineStr);
                $diff = $target - $now;
                if ($diff <= 0) {
                    $daysRemaining = 'Expired';
                } else {
                    $days = (int) ceil($diff / 86400);
                    $daysRemaining = $days === 1 ? '1 day remaining' : "{$days} days remaining";
                }
            }

            $items[] = [
                'id'                   => (int) $row['id'],
                'title'                => $row['title'],
                'subtitle'             => $row['subtitle'] ?? null,
                'description'          => $row['description'],
                'customer_name'        => $row['customer_name'] ?? ($row['poster_name'] ?: null),
                'customer_phone'       => $row['customer_phone'] ?? null,
                'customer_email'       => $row['customer_email'] ?? ($row['poster_email'] ?: null),
                'budget'               => (float) $row['budget'],
                'currency'             => $row['currency'],
                'status'               => $row['status'],
                'bid_count'            => $bidCount,
                'view_count'           => (int) $row['view_count'],
                'deadline_at'          => $row['deadline_at'],
                'bidding_closes_at'    => $row['bidding_closes_at'],
                'worker_count'         => $workerCount,
                'cost_per_worker'      => (float) ($row['cost_per_worker'] ?: 0),
                'total_payable_amount' => (float) ($row['total_payable_amount'] ?: $row['budget']),
                'proof_requirements'   => $row['proof_requirements'] ? json_decode($row['proof_requirements'], true) : [],
                'decline_reason'       => $row['decline_reason'],
                'days_remaining'       => $daysRemaining,
                'active_workers_count' => $progress['active_workers_count'],
                'assigned_workers_count' => $progress['assigned_workers_count'],
                'completed_workers'    => $progress['completed_workers'],
                'in_progress_workers'   => $progress['in_progress_workers'],
                'pending_workers'      => $progress['pending_workers'],
                'pending_review_workers' => $progress['pending_review_workers'],
                'revision_workers'      => $progress['revision_workers'],
                'cancelled_workers'    => $progress['cancelled_workers'],
                'rejected_workers'     => $progress['rejected_workers'],
                'remaining_workers'    => $progress['remaining_workers'],
                'remaining_tasks_count'=> $progress['remaining_workers'],
                'completed_amount'     => $progress['completed_amount'],
                'pending_amount'       => $progress['pending_amount'],
                'remaining_amount'     => $progress['remaining_amount'],
                'created_at'           => $row['created_at'],
                'updated_at'           => $row['updated_at'],
                'poster'               => [
                    'id'    => (int) $row['poster_id'],
                    'name'  => $row['poster_name'] ?: '(deleted)',
                    'email' => $row['poster_email'],
                ],
                'worker'               => $row['assigned_worker_id'] ? [
                    'id'    => (int) $row['assigned_worker_id'],
                    'name'  => $row['worker_name'] ?: '(deleted)',
                    'email' => $row['worker_email'],
                ] : null,
                'category_name'        => $row['category_name'],
            ];
        }

        return Response::json(['success' => true, 'data' => $items]);
    }

    private function jobProgress(int $jobId, int $workerCount, int $bidCount, bool $assignmentsAvailable): array
    {
        if (!$assignmentsAvailable) {
            return [
                "active_workers_count" => $bidCount,
                "assigned_workers_count" => $bidCount,
                "in_progress_workers" => $bidCount,
                "pending_review_workers" => 0,
                "revision_workers" => 0,
                "cancelled_workers" => 0,
                "completed_workers" => 0,
                "pending_workers" => 0,
                "rejected_workers" => 0,
                "remaining_workers" => max(0, $workerCount - $bidCount),
                "completed_amount" => 0.0,
                "pending_amount" => 0.0,
                "remaining_amount" => 0.0,
            ];
        }

        $assignments = JobAssignment::forJob($jobId);
        $assigned = 0; $active = 0; $inProgress = 0; $pendingReview = 0;
        $revision = 0; $cancelled = 0; $completed = 0; $rejected = 0;
        $completedAmount = 0.0; $pendingAmount = 0.0; $remainingAmount = 0.0;

        foreach ($assignments as $assignment) {
            $status = (string) ($assignment->status ?? "");
            $paymentStatus = (string) ($assignment->payment_status ?? "");
            $latestSubmission = JobSubmission::latestForAssignment((int) $assignment->id);
            $submissionStatus = (string) ($latestSubmission?->status ?? "");

            if ($status === JobAssignment::STATUS_CANCELLED || $paymentStatus === JobAssignment::PAYMENT_REFUNDED) {
                $cancelled++;
                continue;
            }

            $assigned++;
            $amount = (float) ($assignment->payment_amount ?? 0);
            if ($status === JobAssignment::STATUS_COMPLETED && $paymentStatus === JobAssignment::PAYMENT_RELEASED) {
                $completed++;
                $completedAmount += $amount;
                continue;
            }

            $active++;
            $pendingAmount += $amount;
            if ($paymentStatus === JobAssignment::PAYMENT_HELD) $remainingAmount += $amount;
            if ($submissionStatus === JobSubmission::STATUS_PENDING_REVIEW || $status === JobAssignment::STATUS_SUBMITTED) {
                $pendingReview++;
            } elseif ($submissionStatus === JobSubmission::STATUS_REVISION || $status === JobAssignment::STATUS_REVISION) {
                $revision++;
            } elseif ($submissionStatus === JobSubmission::STATUS_REJECTED) {
                $rejected++;
            } else {
                $inProgress++;
            }
        }

        return [
            "active_workers_count" => $active,
            "assigned_workers_count" => $assigned,
            "in_progress_workers" => $inProgress,
            "pending_review_workers" => $pendingReview,
            "revision_workers" => $revision,
            "cancelled_workers" => $cancelled,
            "completed_workers" => $completed,
            "pending_workers" => $pendingReview,
            "rejected_workers" => $rejected,
            "remaining_workers" => max(0, $workerCount - $assigned),
            "completed_amount" => round($completedAmount, 4),
            "pending_amount" => round($pendingAmount, 4),
            "remaining_amount" => round($remainingAmount, 4),
        ];
    }

    public function jobSubmissions(Request $request, string $id): Response
    {
        if ($guard = $this->adminGuard($request)) return $guard;
        $jobId = (int) $id;
        $job = Job::find($jobId);
        if ($job === null) {
            return Response::json(['success' => false, 'message' => 'Job not found.'], 404);
        }

        $sql = "SELECT s.id, s.job_id, s.worker_id, s.bid_id, s.assignment_id,
                    s.description, s.attachment_path, s.external_link, s.status,
                    s.attempt_number, s.submitted_at, s.reviewed_at,
                    s.reviewer_note, s.rejection_reason, s.risk_score,
                    s.risk_status, s.risk_flags, s.created_at,
                    w.name AS worker_name, w.email AS worker_email, w.username AS worker_username,
                    w.phone AS worker_phone,
                    b.work_proof_data, b.trx_id, b.bkash_number
                FROM job_submissions s
                LEFT JOIN users w ON w.id = s.worker_id
                LEFT JOIN job_bids b ON b.id = s.bid_id
                WHERE s.job_id = :job_id
                ORDER BY s.id DESC";

        $stmt = Database::connect()->prepare($sql);
        $stmt->bindValue(':job_id', $jobId, \PDO::PARAM_INT);
        $stmt->execute();

        $submissions = [];
        foreach ($stmt->fetchAll(\PDO::FETCH_ASSOC) as $row) {
            $proofData = $row['work_proof_data'] ? json_decode($row['work_proof_data'], true) : null;
            $submissions[] = [
                'id'              => (int) $row['id'],
                'job_id'          => (int) $row['job_id'],
                'worker_id'       => (int) $row['worker_id'],
                'assignment_id'   => $row['assignment_id'] !== null ? (int) $row['assignment_id'] : null,
                'worker_name'     => $row['worker_name'] ?: 'Unknown Worker',
                'worker_email'    => $row['worker_email'],
                'worker_username' => $row['worker_username'],
                'worker_phone'    => $row['worker_phone'],
                'description'     => $row['description'],
                'attachment_path' => $row['attachment_path'],
                'attachment_url'  => $row['attachment_path'] ? '/api/jobs/submissions/' . (int) $row['id'] . '/attachment' : null,
                'external_link'   => $row['external_link'],
                'status'          => $row['status'],
                'attempt_number'  => (int) ($row['attempt_number'] ?: 1),
                'submitted_at'    => $row['submitted_at'],
                'reviewed_at'     => $row['reviewed_at'],
                'reviewer_note'   => $row['reviewer_note'],
                'rejection_reason'=> $row['rejection_reason'],
                'risk_score'      => (float) ($row['risk_score'] ?? 0),
                'risk_status'     => $row['risk_status'] ?? 'clear',
                'risk_flags'      => $row['risk_flags'] ? (json_decode($row['risk_flags'], true) ?: []) : [],
                'created_at'      => $row['created_at'],
                'work_proof_data' => $proofData,
                'trx_id'          => $row['trx_id'],
                'bkash_number'    => $row['bkash_number'],
            ];
        }

        return Response::json([
            'success' => true,
            'data'    => [
                'job'         => [
                    'id'            => (int) $job->id,
                    'title'         => $job->title,
                    'status'        => $job->status,
                    'worker_count'  => (int) ($job->worker_count ?: 1),
                    'budget'        => (float) $job->budget,
                    'currency'      => $job->currency,
                ],
                'submissions' => $submissions,
            ],
        ]);
    }

    public function fraudQueue(Request $request): Response
    {
        if ($guard = $this->adminGuard($request)) return $guard;
        $limit = max(1, min(200, (int) ($request->query('limit') ?? 100)));
        try {
            $stmt = Database::connect()->prepare(
                "SELECT s.id, s.job_id, s.worker_id, s.assignment_id, s.status,
                        s.description, s.attachment_path, s.risk_score, s.risk_status,
                        s.risk_flags, s.client_ip, s.created_at,
                        j.title AS job_title, w.name AS worker_name,
                        w.email AS worker_email, w.is_banned
                 FROM job_submissions s
                 LEFT JOIN jobs j ON j.id = s.job_id
                 LEFT JOIN users w ON w.id = s.worker_id
                 WHERE s.risk_status = :risk_status
                 ORDER BY s.id DESC LIMIT :limit"
            );
            $stmt->bindValue(':risk_status', JobSubmission::RISK_FLAGGED);
            $stmt->bindValue(':limit', $limit, \PDO::PARAM_INT);
            $stmt->execute();
        } catch (\Throwable $e) {
            return Response::json(['success' => false, 'message' => 'Fraud review storage is not available yet.'], 503);
        }

        $items = array_map(static function (array $row): array {
            return [
                'id' => (int) $row['id'],
                'job_id' => (int) $row['job_id'],
                'assignment_id' => $row['assignment_id'] !== null ? (int) $row['assignment_id'] : null,
                'worker_id' => (int) $row['worker_id'],
                'worker_name' => $row['worker_name'] ?: 'Unknown worker',
                'worker_email' => $row['worker_email'],
                'worker_banned' => (bool) ($row['is_banned'] ?? false),
                'job_title' => $row['job_title'] ?: 'Unknown job',
                'status' => $row['status'],
                'description' => $row['description'],
                'attachment_url' => $row['attachment_path'] ? '/api/jobs/submissions/' . (int) $row['id'] . '/attachment' : null,
                'risk_score' => (float) ($row['risk_score'] ?? 0),
                'risk_flags' => $row['risk_flags'] ? (json_decode($row['risk_flags'], true) ?: []) : [],
                'client_ip' => $row['client_ip'],
                'created_at' => $row['created_at'],
            ];
        }, $stmt->fetchAll(\PDO::FETCH_ASSOC));

        return Response::json(['success' => true, 'data' => $items]);
    }

    public function reviewFraud(Request $request, string $id): Response
    {
        if ($guard = $this->adminGuard($request)) return $guard;
        $admin = $request->getMeta('auth.user');
        $body = (array) $this->readJson($request);
        $decision = strtolower(trim((string) ($body['decision'] ?? '')));
        $allowed = [JobSubmission::RISK_CLEARED, JobSubmission::RISK_DISMISSED, JobSubmission::RISK_CONFIRMED_FRAUD];
        if (!in_array($decision, $allowed, true)) {
            return Response::json(['success' => false, 'message' => 'Decision must be cleared, dismissed, or confirmed_fraud.'], 422);
        }
        $note = trim((string) ($body['note'] ?? ''));
        if ($decision === JobSubmission::RISK_CONFIRMED_FRAUD && $note === '') {
            return Response::json(['success' => false, 'message' => 'A fraud confirmation reason is required.'], 422);
        }
        $banRequested = $this->truthy($body['ban_user'] ?? false);
        $banRequiresConfirmation = (bool) SettingService::get('fraud_ban_requires_confirmation', true);
        if ($banRequested && $banRequiresConfirmation && $decision !== JobSubmission::RISK_CONFIRMED_FRAUD) {
            return Response::json(['success' => false, 'message' => 'Ban escalation requires a confirmed-fraud decision.'], 422);
        }

        $now = date('Y-m-d H:i:s');
        $alreadyFinalized = false;
        try {
            $db = Database::connect();
            Database::beginWriteTransaction($db);

            $lockSql = 'SELECT * FROM job_submissions WHERE id = :id LIMIT 1';
            if (Database::getDriverName() !== 'sqlite') $lockSql .= ' FOR UPDATE';
            $lock = $db->prepare($lockSql);
            $lock->execute(['id' => (int) $id]);
            $lockedRow = $lock->fetch(\PDO::FETCH_ASSOC);
            if (!$lockedRow) {
                Database::rollbackWriteTransaction($db);
                return Response::json(['success' => false, 'message' => 'Submission not found.'], 404);
            }
            $submission = new JobSubmission($lockedRow);
            $currentRiskStatus = (string) ($submission->risk_status ?? JobSubmission::RISK_CLEAR);
            if ($currentRiskStatus !== JobSubmission::RISK_FLAGGED) {
                if ($currentRiskStatus !== $decision) {
                    Database::rollbackWriteTransaction($db);
                    return Response::json([
                        'success' => false,
                        'message' => 'Fraud review has already been finalized with a different decision.',
                    ], 422);
                }
                $alreadyFinalized = true;
            } else {
                $updated = $db->prepare(
                    'UPDATE job_submissions
                     SET risk_status = :risk_status,
                         fraud_reviewed_at = :reviewed_at,
                         fraud_reviewed_by = :reviewed_by,
                         reviewer_note = :reviewer_note,
                         updated_at = :updated_at
                     WHERE id = :id AND risk_status = :flagged'
                );
                $updated->execute([
                    'risk_status' => $decision,
                    'reviewed_at' => $now,
                    'reviewed_by' => (int) $admin->id,
                    'reviewer_note' => $note !== '' ? $note : $submission->reviewer_note,
                    'updated_at' => $now,
                    'id' => (int) $id,
                    'flagged' => JobSubmission::RISK_FLAGGED,
                ]);
                if ($updated->rowCount() !== 1) {
                    throw new \RuntimeException('Fraud review has already been finalized.');
                }
                $submission->risk_status = $decision;
                $submission->fraud_reviewed_at = $now;
                $submission->fraud_reviewed_by = (int) $admin->id;
                if ($note !== '') $submission->reviewer_note = $note;
            }

            if (!$alreadyFinalized) {
                Fluent::table('admin_action_logs')->insert([
                    'admin_id' => (int) $admin->id,
                    'action' => 'submission.fraud_review',
                    'entity_type' => 'submission',
                    'entity_id' => (int) $submission->id,
                    'details' => json_encode([
                        'decision' => $decision,
                        'note' => $note,
                        'ban_requested' => $banRequested,
                        'policy' => 'signals_advisory_explicit_confirmation_required',
                    ], JSON_UNESCAPED_UNICODE),
                    'created_at' => $now,
                ]);
            }
            Database::commitWriteTransaction($db);
        } catch (\Throwable $e) {
            if (isset($db)) Database::rollbackWriteTransaction($db);
            $message = $e->getMessage();
            $status = str_contains($message, 'already been finalized') ? 422 : 500;
            return Response::json([
                'success' => false,
                'message' => $status === 422 ? $message : 'Fraud review failed.',
            ], $status);
        }

        $userBanned = false;
        if ($decision === JobSubmission::RISK_CONFIRMED_FRAUD) {
            if (!$alreadyFinalized) {
                NotificationService::send(
                    $submission->worker(),
                    'Submission flagged as fraudulent',
                    'An administrator confirmed a fraud concern on your submission. ' . $note,
                    'danger',
                    'bi-shield-exclamation',
                    '/jobs/' . (int) $submission->job_id
                );
            }
            // Risk signals remain advisory by default. A confirmed-fraud
            // decision can explicitly escalate to a ban in the same action.
            if ($banRequested && $submission->worker() !== null) {
                $userBanned = $this->banAccountForFraud($admin, $submission->worker(), $note, (int) $submission->id);
            }
        } elseif (!$alreadyFinalized && ($decision === JobSubmission::RISK_CLEARED || $decision === JobSubmission::RISK_DISMISSED)) {
            NotificationService::send(
                $submission->worker(),
                $decision === JobSubmission::RISK_CLEARED ? 'Submission risk cleared' : 'Submission risk dismissed',
                $decision === JobSubmission::RISK_CLEARED
                    ? 'An administrator reviewed your submission risk signals and cleared them.'
                    : 'An administrator reviewed your submission risk signals and dismissed the concern.',
                'success',
                'bi-shield-check',
                '/jobs/' . (int) $submission->job_id
            );
        }
        return Response::json([
            'success' => true,
            'message' => $alreadyFinalized ? 'Fraud review was already recorded.' : 'Fraud review recorded.',
            'data' => ['id' => (int) $submission->id, 'risk_status' => $decision, 'user_banned' => $userBanned],
        ]);
    }

    public function reviewSubmission(Request $request, string $id): Response
    {
        if ($guard = $this->adminGuard($request)) return $guard;
        $admin = $request->getMeta('auth.user');
        $body = (array) $this->readJson($request);
        $decision = (string) ($body['decision'] ?? '');
        $note = isset($body['note']) ? (string) $body['note'] : null;

        $result = $this->jobService->reviewSubmission((int) $id, (int) $admin->id, $decision, $note);
        if (!$result['success']) {
            return Response::json($result, 422);
        }

        $submission = $result['submission'] ?? JobSubmission::find((int) $id);
        if ($submission === null) {
            return Response::json(['success' => false, 'message' => 'Submission review completed but the submission could not be reloaded.'], 500);
        }
        $this->auditAdminAction($admin, 'submission.review', 'submission', (int) $submission->id, [
            'decision' => $decision,
            'note' => $note,
            'status' => $submission->status,
        ]);
        return Response::json([
            'success' => true,
            'message' => $result['message'],
            'data'    => [
                'id'               => (int) $submission->id,
                'status'           => $submission->status,
                'reviewed_at'      => $submission->reviewed_at,
                'reviewed_by'      => (int) $submission->reviewed_by,
                'reviewer_note'    => $submission->reviewer_note,
                'rejection_reason' => $submission->rejection_reason,
            ],
        ]);
    }

    public function approveJob(Request $request, string $id): Response
    {
        if ($guard = $this->adminGuard($request)) return $guard;
        $admin = $request->getMeta('auth.user');
        $result = $this->jobService->approveJob((int) $id, (int) $admin->id);
        if (!$result['success']) {
            return Response::json($result, 422);
        }
        $this->auditAdminAction($admin, 'job.approve', 'job', (int) $id, [
            'status' => Job::STATUS_OPEN,
        ]);
        return Response::json([
            'success' => true,
            'message' => $result['message'],
            'data'    => ['id' => (int) $id, 'status' => Job::STATUS_OPEN],
        ]);
    }

    public function declineJob(Request $request, string $id): Response
    {
        if ($guard = $this->adminGuard($request)) return $guard;
        $admin = $request->getMeta('auth.user');
        $body = (array) $this->readJson($request);
        $reason = (string) ($body['reason'] ?? '');

        $result = $this->jobService->declineJob((int) $id, $reason, (int) $admin->id);
        if (!$result['success']) {
            return Response::json($result, 422);
        }
        $this->auditAdminAction($admin, 'job.decline', 'job', (int) $id, [
            'status' => Job::STATUS_DECLINED,
            'reason' => $reason,
        ]);
        return Response::json([
            'success' => true,
            'message' => $result['message'],
            'data'    => ['id' => (int) $id, 'status' => Job::STATUS_DECLINED, 'reason' => $reason],
        ]);
    }

    public function approveApplication(Request $request, string $bidId): Response
    {
        if ($guard = $this->adminGuard($request)) return $guard;
        $admin = $request->getMeta('auth.user');
        $result = $this->jobService->approveWorkerApplication((int) $bidId, (int) $admin->id);
        if (!$result['success']) {
            return Response::json($result, 422);
        }
        $this->auditAdminAction($admin, 'application.approve', 'bid', (int) $bidId, [
            'status' => 'accepted',
        ]);
        return Response::json([
            'success' => true,
            'message' => $result['message'],
            'data'    => ['bid_id' => (int) $bidId, 'status' => 'accepted'],
        ]);
    }

    public function flagDispute(Request $request, string $id): Response
    {
        if ($guard = $this->adminGuard($request)) return $guard;
        $admin = $request->getMeta('auth.user');
        $db = Database::connect();
        try {
            Database::beginWriteTransaction($db);
            $jobSql = 'SELECT * FROM jobs WHERE id = :id LIMIT 1';
            if (Database::getDriverName() !== 'sqlite') $jobSql .= ' FOR UPDATE';
            $jobStmt = $db->prepare($jobSql);
            $jobStmt->execute(['id' => (int) $id]);
            $jobRow = $jobStmt->fetch(\PDO::FETCH_ASSOC);
            if (!$jobRow) throw new \RuntimeException('Job not found.');
            $job = new Job($jobRow);
            if (in_array($job->status, [Job::STATUS_COMPLETED, Job::STATUS_CANCELLED], true)) {
                throw new \RuntimeException('Closed jobs cannot be disputed.');
            }
            $changed = $job->status !== Job::STATUS_DISPUTED;
            if ($changed) {
                $updated = $db->prepare(
                    'UPDATE jobs SET status = :disputed, updated_at = :updated_at WHERE id = :id AND status = :current_status'
                );
                $updated->execute([
                    'disputed' => Job::STATUS_DISPUTED,
                    'updated_at' => date('Y-m-d H:i:s'),
                    'id' => (int) $id,
                    'current_status' => $job->status,
                ]);
                if ($updated->rowCount() !== 1) throw new \RuntimeException('Job state changed before dispute review.');
            }
            Database::commitWriteTransaction($db);
        } catch (\Throwable $e) {
            Database::rollbackWriteTransaction($db);
            $message = $e->getMessage();
            $status = $message === 'Job not found.' ? 404 : 422;
            return Response::json(['success' => false, 'message' => $message], $status);
        }
        if ($changed) {
            $message = 'Job “' . $job->title . '” was flagged for administrator dispute review.';
            NotificationService::send($job->poster(), 'Job dispute opened', $message, 'warning', 'bi-flag', '/poster/jobs/' . $job->id);
            foreach (JobAssignment::forJob((int) $job->id) as $assignment) {
                if ($assignment->status === JobAssignment::STATUS_CANCELLED) continue;
                NotificationService::send($assignment->worker(), 'Job dispute opened', $message, 'warning', 'bi-flag', '/jobs/' . $job->id);
            }
            NotificationService::sendToAdmins('Job dispute opened', $message, 'warning', 'bi-flag', '/admin/jobs/' . $job->id);
            try {
                Fluent::table('admin_action_logs')->insert([
                    'admin_id' => (int) $admin->id,
                    'action' => 'job.dispute',
                    'entity_type' => 'job',
                    'entity_id' => (int) $job->id,
                    'details' => json_encode(['status' => Job::STATUS_DISPUTED], JSON_UNESCAPED_UNICODE),
                    'created_at' => date('Y-m-d H:i:s'),
                ]);
            } catch (\Throwable) {}
        }
        return Response::json([
            'success' => true,
            'message' => 'Job flagged for dispute review.',
            'data'    => ['id' => (int) $job->id, 'status' => Job::STATUS_DISPUTED],
        ]);
    }

    public function resolveJob(Request $request, string $id): Response
    {
        if ($guard = $this->adminGuard($request)) return $guard;
        $body = $this->readJson($request);
        $resolution = strtolower(trim((string) ($body['resolution'] ?? '')));
        if (!in_array($resolution, ['release', 'cancel'], true)) {
            return Response::json(['success' => false, 'message' => 'Resolution must be release or cancel.'], 422);
        }

        $job = Job::find((int) $id);
        if ($job === null) return Response::json(['success' => false, 'message' => 'Job not found.'], 404);
        if ($job->status !== Job::STATUS_DISPUTED) {
            return Response::json(['success' => false, 'message' => 'Only disputed jobs can be resolved here.'], 422);
        }
        $poster = User::find((int) $job->poster_id);
        if ($poster === null) return Response::json(['success' => false, 'message' => 'Poster not found.'], 422);

        $result = $resolution === 'release'
            ? $this->jobService->releasePayment($poster, (int) $job->id, null, $request->getMeta('auth.user'))
            : $this->jobService->cancelJob($poster, (int) $job->id, (string) ($body['reason'] ?? 'Resolved by admin'), $request->getMeta('auth.user'));
        if (!$result['success']) return Response::json($result, 422);

        try {
            Fluent::table('admin_action_logs')->insert([
                'admin_id' => (int) ($request->getMeta('auth.user')->id ?? 0),
                'action' => 'job.resolve_dispute',
                'entity_type' => 'job',
                'entity_id' => (int) $job->id,
                'details' => json_encode(['resolution' => $resolution, 'reason' => $body['reason'] ?? null], JSON_UNESCAPED_UNICODE),
                'created_at' => date('Y-m-d H:i:s'),
            ]);
        } catch (\Throwable) {}

        return Response::json([
            'success' => true,
            'message' => $result['message'],
            'data'    => ['id' => (int) $job->id, 'resolution' => $resolution],
        ]);
    }

    public function stats(Request $request): Response
    {
        if ($guard = $this->adminGuard($request)) return $guard;
        $users       = (int) (Fluent::table('users')->select(['COUNT(*) AS c'])->first()['c'] ?? 0);
        $withdrawals = (int) (Fluent::table('withdrawals')->select(['COUNT(*) AS c'])->first()['c'] ?? 0);
        $pending     = (int) (Fluent::table('withdrawals')->where('status', '=', 'pending')->select(['COUNT(*) AS c'])->first()['c'] ?? 0);
        $adViews     = (int) (Fluent::table('ad_views')->select(['COUNT(*) AS c'])->first()['c'] ?? 0);
        $completedAdViews = (int) (Fluent::table('ad_views')->whereNotNull('completed_at')->select(['COUNT(*) AS c'])->first()['c'] ?? 0);
        $totalPaid   = (float) (Fluent::table('users')->select(['COALESCE(SUM(lifetime_earned), 0) AS s'])->first()['s'] ?? 0);
        $bannedUsers = 0;
        $activeUsers = $users;
        $videoAds = 0;
        $videoViews = 0;
        $videoCompleted = 0;
        $videoRewards = 0.0;
        $eligibleRewards = 0;
        $marketplace = [
            'total_jobs' => 0,
            'pending_jobs' => 0,
            'active_jobs' => 0,
            'completed_jobs' => 0,
            'rejected_jobs' => 0,
            'total_workers' => 0,
            'pending_submissions' => 0,
            'approved_submissions' => 0,
            'rejected_submissions' => 0,
            'flagged_submissions' => 0,
            'total_job_budget' => 0.0,
            'completed_payment' => 0.0,
            'pending_payment' => 0.0,
            'remaining_payment' => 0.0,
            'commissions' => 0.0,
            'worker_earnings' => 0.0,
            'ad_earnings' => 0.0,
        ];
        try {
            $pdo = Database::connect();
            $marketplace['total_jobs'] = (int) $pdo->query('SELECT COUNT(*) FROM jobs')->fetchColumn();
            $marketplace['pending_jobs'] = (int) $pdo->query("SELECT COUNT(*) FROM jobs WHERE status = 'pending_approval'")->fetchColumn();
            $marketplace['active_jobs'] = (int) $pdo->query("SELECT COUNT(*) FROM jobs WHERE status IN ('open', 'in_review', 'engaged', 'assigned', 'submitted', 'revision')")->fetchColumn();
            $marketplace['completed_jobs'] = (int) $pdo->query("SELECT COUNT(*) FROM jobs WHERE status = 'completed'")->fetchColumn();
            $marketplace['rejected_jobs'] = (int) $pdo->query("SELECT COUNT(*) FROM jobs WHERE status IN ('declined', 'cancelled')")->fetchColumn();
            $marketplace['pending_submissions'] = (int) $pdo->query("SELECT COUNT(*) FROM job_submissions WHERE status = 'pending_review'")->fetchColumn();
            $marketplace['approved_submissions'] = (int) $pdo->query("SELECT COUNT(*) FROM job_submissions WHERE status = 'approved'")->fetchColumn();
            $marketplace['rejected_submissions'] = (int) $pdo->query("SELECT COUNT(*) FROM job_submissions WHERE status IN ('rejected', 'revision')")->fetchColumn();
            $marketplace['total_job_budget'] = (float) $pdo->query('SELECT COALESCE(SUM(CASE WHEN total_payable_amount > 0 THEN total_payable_amount ELSE budget END), 0) FROM jobs')->fetchColumn();
            $marketplace['completed_payment'] = (float) $pdo->query("SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE type = 'escrow_release'")->fetchColumn();
            $marketplace['commissions'] = (float) $pdo->query("SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE type = 'commission'")->fetchColumn();
            $marketplace['worker_earnings'] = $marketplace['completed_payment'];
            $marketplace['ad_earnings'] = (float) $pdo->query('SELECT COALESCE(SUM(reward), 0) FROM ad_views')->fetchColumn() + $videoRewards;
            $assignmentStats = $pdo->query(
                "SELECT COUNT(DISTINCT worker_id) AS workers,
                        COALESCE(SUM(CASE WHEN payment_status = 'held' THEN payment_amount ELSE 0 END), 0) AS held
                 FROM job_assignments WHERE status <> 'cancelled' AND payment_status <> 'refunded'"
            )->fetch(\PDO::FETCH_ASSOC) ?: [];
            $marketplace['total_workers'] = (int) ($assignmentStats['workers'] ?? 0);
            $marketplace['remaining_payment'] = (float) ($assignmentStats['held'] ?? 0);
            $marketplace['pending_payment'] = $marketplace['remaining_payment'];
            $marketplace['flagged_submissions'] = (int) $pdo->query("SELECT COUNT(*) FROM job_submissions WHERE risk_status = 'flagged'")->fetchColumn();
        } catch (\Throwable $e) {
            // Keep the legacy dashboard usable while optional marketplace
            // tables are being migrated on an older host.
        }
        try {
            $bannedUsers = (int) (Fluent::table('users')->where('is_banned', '=', 1)->select(['COUNT(*) AS c'])->first()['c'] ?? 0);
            $activeUsers = max(0, $users - $bannedUsers);
            $videoAds = (int) (Fluent::table('video_ads')->select(['COUNT(*) AS c'])->first()['c'] ?? 0);
            $videoViews = (int) (Fluent::table('video_ad_views')->select(['COUNT(*) AS c'])->first()['c'] ?? 0);
            $videoCompleted = (int) (Fluent::table('video_ad_views')->whereNotNull('claimed_at')->select(['COUNT(*) AS c'])->first()['c'] ?? 0);
            $videoRewards = (float) (Fluent::table('video_ad_views')->whereNotNull('claimed_at')->select(['COALESCE(SUM(reward_amount), 0) AS s'])->first()['s'] ?? 0);
            $eligibleRewards = (int) (Fluent::table('video_ad_views')
                ->whereNotNull('completed_at')
                ->whereNull('claimed_at')
                ->select(['COUNT(*) AS c'])
                ->first()['c'] ?? 0);
        } catch (\Throwable $e) {
            // These optional counters remain zero until their migrations exist.
        }
        $marketplace['ad_earnings'] = $marketplace['ad_earnings'] + $videoRewards;

        return Response::json([
            'success' => true,
            'data'    => [
                'total_users'        => $users,
                'active_users'       => $activeUsers,
                'total_withdrawals'   => $withdrawals,
                'pending_withdrawals' => $pending,
                'total_ad_views'      => $adViews + $videoViews,
                'completed_ad_views'  => $completedAdViews + $videoCompleted,
                'eligible_rewards'    => $eligibleRewards,
                'user_ad_rewards'     => (float) ($marketplace['ad_earnings'] ?? 0),
                'total_lifetime_paid' => $totalPaid,
                'banned_users'        => $bannedUsers,
                'video_ads'           => $videoAds,
                'video_ad_views'      => $videoViews,
                'video_completed_views' => $videoCompleted,
                'video_rewards_paid'  => $videoRewards,
                'marketplace'         => $marketplace,
            ],
        ]);
    }

    public function adProviders(Request $request): Response
    {
        if ($guard = $this->adminGuard($request)) return $guard;
        $rows = Fluent::table('ad_providers')->orderBy('id', 'asc')->get();
        return Response::json([
            'success' => true,
            'data'    => $rows,
        ]);
    }

    public function updateAdProvider(Request $request, string $id): Response
    {
        if ($guard = $this->adminGuard($request)) return $guard;
        $admin = $request->getMeta('auth.user');
        $body = $this->readJson($request);
        $provider = AdProvider::find((int) $id);
        if ($provider === null) {
            return Response::json(['success' => false, 'message' => 'Provider not found.'], 404);
        }
        $update = [];
        foreach (['name', 'block_id', 'weight', 'reward_per_view', 'min_duration_seconds'] as $field) {
            if (array_key_exists($field, $body)) {
                $update[$field] = $body[$field];
            }
        }
        if (array_key_exists('enabled', $body)) {
            $update['enabled'] = (int) (bool) $body['enabled'];
        }
        if ($update) {
            $update['updated_at'] = date('Y-m-d H:i:s');
            Fluent::table('ad_providers')
                ->where('id', '=', $provider->id)
                ->update($update);
            $this->auditAdminAction($admin, 'ad_provider.update', 'ad_provider', (int) $provider->id, [
                'fields' => array_keys($update),
            ]);
        }
        return Response::json([
            'success' => true,
            'data'    => AdProvider::find((int) $id)->toArray(),
            'message' => 'Provider updated.',
        ]);
    }

    private function auditAdminAction(?User $admin, string $action, string $entityType, int $entityId, array $details = []): void
    {
        if ($admin === null || !(int) ($admin->id ?? 0)) return;
        try {
            Fluent::table('admin_action_logs')->insert([
                'admin_id' => (int) $admin->id,
                'action' => $action,
                'entity_type' => $entityType,
                'entity_id' => $entityId,
                'details' => json_encode($details, JSON_UNESCAPED_UNICODE),
                'created_at' => date('Y-m-d H:i:s'),
            ]);
        } catch (\Throwable) {
            // Audit storage is additive and must not break the admin action.
        }
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

    private function adminGuard(Request $request): ?Response
    {
        $admin = $request->getMeta('auth.user');
        if ($admin === null) {
            return Response::json([
                'success' => false,
                'message' => 'Authentication required.',
            ], 401);
        }
        if (method_exists($admin, 'isBanned') && $admin->isBanned()) {
            return Response::json([
                'success' => false,
                'message' => 'This account is banned.',
                'error' => 'banned',
            ], 403);
        }
        if (!$admin->isAdmin()) {
            return Response::json([
                'success' => false,
                'message' => 'Administrator access required.',
                'error' => 'forbidden',
            ], 403);
        }
        return null;
    }
}
