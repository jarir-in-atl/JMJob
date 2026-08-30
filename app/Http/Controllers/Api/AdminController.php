<?php
declare(strict_types=1);

namespace App\Http\Controllers\Api;

use Nemesis\Core\Controller;
use Nemesis\Http\Request;
use Nemesis\Http\Response;
use App\Models\Withdrawal;
use App\Models\User;
use Nemesis\Core\Fluent;
use App\Models\AdProvider;

/**
 * AdminController — protected by 'admin' middleware.
 *
 *   GET    /api/admin/withdrawals          — list pending withdrawals
 *   POST   /api/admin/withdrawals/{id}/approve
 *   POST   /api/admin/withdrawals/{id}/reject
 *   POST   /api/admin/withdrawals/{id}/pay
 *   GET    /api/admin/users                — list all users
 *   GET    /api/admin/stats                — top-line counts
 *   GET    /api/admin/ad-providers         — list providers
 *   POST   /api/admin/ad-providers         — update a provider
 */
class AdminController extends Controller
{
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
            $user = User::find((int) $withdrawal->user_id);
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
                'is_admin'        => (bool) $row['is_admin'],
                'created_at'      => $row['created_at'],
            ];
        }
        return Response::json([
            'success' => true,
            'data'    => $items,
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
