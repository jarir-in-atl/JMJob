<?php
declare(strict_types=1);

namespace App\Http\Controllers\Api;

use Nemesis\Core\Controller;
use Nemesis\Http\Request;
use Nemesis\Http\Response;
use App\Models\Withdrawal;
use App\Models\User;
use App\Models\Job;
use App\Services\JobService;
use App\Services\NotificationService;
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
        $admin = $request->getMeta('auth.user');
        $withdrawal = Withdrawal::find((int) $id);
        if ($withdrawal === null) {
            return Response::json(['success' => false, 'message' => 'Withdrawal not found.'], 404);
        }

        $body = $this->readJson($request);
        $note = $body['admin_note'] ?? null;
        $user = User::find((int) $withdrawal->user_id);

        Fluent::table('withdrawals')
            ->where('id', '=', $withdrawal->id)
            ->update([
                'status'       => $newStatus,
                'admin_note'   => $note,
                'processed_at' => date('Y-m-d H:i:s'),
                'processed_by' => $admin->id,
            ]);

        // If rejected, refund the user's balance
        if ($refund) {
            if ($user) {
                $newBalance = round(((float) $user->balance) + (float) $withdrawal->amount, 4);
                Fluent::table('users')
                    ->where('id', '=', $user->id)
                    ->update([
                        'balance'    => $newBalance,
                        'updated_at' => date('Y-m-d H:i:s'),
                    ]);
            }
        }

        $withdrawal = Withdrawal::find((int) $id);
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
                'created_at'      => $row['created_at'],
            ];
        }
        return Response::json([
            'success' => true,
            'data'    => $items,
        ]);
    }

    public function updateRole(Request $request, string $id): Response
    {
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
        $status = strtolower(trim((string) ($request->query('status') ?? '')));
        $allowedStatuses = [
            Job::STATUS_OPEN, Job::STATUS_IN_REVIEW, Job::STATUS_ASSIGNED,
            Job::STATUS_SUBMITTED, Job::STATUS_REVISION, Job::STATUS_COMPLETED,
            Job::STATUS_CANCELLED, Job::STATUS_DISPUTED, Job::STATUS_EXPIRED,
        ];
        $limit = max(1, min(200, (int) ($request->query('limit') ?? 100)));

        $sql = "SELECT j.id, j.title, j.description, j.budget, j.currency, j.status,
                    j.bid_count, j.view_count, j.deadline_at, j.bidding_closes_at,
                    j.assigned_worker_id, j.created_at, j.updated_at,
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
        foreach ($stmt->fetchAll(\PDO::FETCH_ASSOC) as $row) {
            $items[] = [
                'id'                => (int) $row['id'],
                'title'             => $row['title'],
                'description'       => $row['description'],
                'budget'            => (float) $row['budget'],
                'currency'          => $row['currency'],
                'status'            => $row['status'],
                'bid_count'         => (int) $row['bid_count'],
                'view_count'        => (int) $row['view_count'],
                'deadline_at'       => $row['deadline_at'],
                'bidding_closes_at' => $row['bidding_closes_at'],
                'created_at'        => $row['created_at'],
                'updated_at'        => $row['updated_at'],
                'poster'            => [
                    'id'    => (int) $row['poster_id'],
                    'name'  => $row['poster_name'] ?: '(deleted)',
                    'email' => $row['poster_email'],
                ],
                'worker'            => $row['assigned_worker_id'] ? [
                    'id'    => (int) $row['assigned_worker_id'],
                    'name'  => $row['worker_name'] ?: '(deleted)',
                    'email' => $row['worker_email'],
                ] : null,
                'category_name'     => $row['category_name'],
            ];
        }

        return Response::json(['success' => true, 'data' => $items]);
    }

    public function flagDispute(Request $request, string $id): Response
    {
        $job = Job::find((int) $id);
        if ($job === null) return Response::json(['success' => false, 'message' => 'Job not found.'], 404);
        if (in_array($job->status, [Job::STATUS_COMPLETED, Job::STATUS_CANCELLED], true)) {
            return Response::json(['success' => false, 'message' => 'Closed jobs cannot be disputed.'], 422);
        }
        if ($job->status !== Job::STATUS_DISPUTED) {
            Fluent::table('jobs')->where('id', '=', $job->id)->update([
                'status'     => Job::STATUS_DISPUTED,
                'updated_at' => date('Y-m-d H:i:s'),
            ]);
        }
        return Response::json([
            'success' => true,
            'message' => 'Job flagged for dispute review.',
            'data'    => ['id' => (int) $job->id, 'status' => Job::STATUS_DISPUTED],
        ]);
    }

    public function resolveJob(Request $request, string $id): Response
    {
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
            ? $this->jobService->releasePayment($poster, (int) $job->id)
            : $this->jobService->cancelJob($poster, (int) $job->id, (string) ($body['reason'] ?? 'Resolved by admin'));
        if (!$result['success']) return Response::json($result, 422);

        return Response::json([
            'success' => true,
            'message' => $result['message'],
            'data'    => ['id' => (int) $job->id, 'resolution' => $resolution],
        ]);
    }

    public function stats(Request $request): Response
    {
        $users       = (int) (Fluent::table('users')->select(['COUNT(*) AS c'])->first()['c'] ?? 0);
        $withdrawals = (int) (Fluent::table('withdrawals')->select(['COUNT(*) AS c'])->first()['c'] ?? 0);
        $pending     = (int) (Fluent::table('withdrawals')->where('status', '=', 'pending')->select(['COUNT(*) AS c'])->first()['c'] ?? 0);
        $adViews     = (int) (Fluent::table('ad_views')->select(['COUNT(*) AS c'])->first()['c'] ?? 0);
        $totalPaid   = (float) (Fluent::table('users')->select(['COALESCE(SUM(lifetime_earned), 0) AS s'])->first()['s'] ?? 0);

        return Response::json([
            'success' => true,
            'data'    => [
                'total_users'        => $users,
                'total_withdrawals'   => $withdrawals,
                'pending_withdrawals' => $pending,
                'total_ad_views'      => $adViews,
                'total_lifetime_paid' => $totalPaid,
            ],
        ]);
    }

    public function adProviders(Request $request): Response
    {
        $rows = Fluent::table('ad_providers')->orderBy('id', 'asc')->get();
        return Response::json([
            'success' => true,
            'data'    => $rows,
        ]);
    }

    public function updateAdProvider(Request $request, string $id): Response
    {
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
        }
        return Response::json([
            'success' => true,
            'data'    => AdProvider::find((int) $id)->toArray(),
            'message' => 'Provider updated.',
        ]);
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
