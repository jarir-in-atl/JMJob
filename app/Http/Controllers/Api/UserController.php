<?php
declare(strict_types=1);

namespace App\Http\Controllers\Api;

use Nemesis\Core\Controller;
use Nemesis\Http\Request;
use Nemesis\Http\Response;
use App\Models\User;
use App\Models\Withdrawal;
use App\Models\ReferralCommission;
use App\Models\AdView;
use Nemesis\Core\Fluent;
use Nemesis\Core\Validator;
use App\Services\RewardService;
use App\Services\WithdrawalService;

/**
 * UserController — read/update the current user, referral network,
 * withdrawal request/history, ad reward credit endpoint.
 */
class UserController extends Controller
{
    public function __construct(
        private RewardService $rewardService = new RewardService(),
        private WithdrawalService $withdrawalService = new WithdrawalService()
    ) {}

    /**
     * GET /api/user (auth.api) — return the current user (full record).
     */
    public function show(Request $request): Response
    {
        $user = $request->getMeta('auth.user');
        return Response::json([
            'success' => true,
            'data'    => $this->serializeUser($user),
        ]);
    }

    /**
     * POST /api/user/reward (auth.api)
     * Body: { provider, started_at, ad_view_id? }
     *
     * Called by the frontend when an ad finishes playing.
     * Server-side enforcement of the 12s minimum duration.
     */
    public function reward(Request $request): Response
    {
        $user = $request->getMeta('auth.user');
        $body = $this->readJson($request);

        $validator = new Validator();
        if (!$validator->validate($body, [
            'provider'    => 'required|string|in:simulated,gigapub,tgads',
            'started_at' => 'required|string',
        ])) {
            return Response::json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $startedAt = strtotime($body['started_at']);
        if ($startedAt === false) {
            return Response::json([
                'success' => false,
                'message' => 'Invalid started_at timestamp.',
            ], 422);
        }

        $elapsed = time() - $startedAt;
        $provider = \App\Models\AdProvider::where('slug', '=', $body['provider'])->first();
        $minDuration = $provider ? (int) $provider->min_duration_seconds : 12;
        if ($elapsed < $minDuration) {
            return Response::json([
                'success' => false,
                'message' => "Ad was watched for only {$elapsed}s; minimum is {$minDuration}s.",
            ], 422);
        }

        $result = $this->rewardService->creditAdReward(
            $user,
            $body['provider'],
            (float) ($provider ? $provider->reward_per_view : 0.005),
            $_SERVER['REMOTE_ADDR'] ?? null,
            substr((string) ($_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 250)
        );

        if (!$result['success']) {
            return Response::json($result, 422);
        }

        // Refresh user for response
        $user = User::find($user->id);
        return Response::json([
            'success' => true,
            'data'    => [
                'reward'  => $result['reward'],
                'user'    => $this->serializeUser($user),
            ],
            'message' => 'Reward credited successfully!',
        ]);
    }

    /**
     * POST /api/user/withdraw (auth.api)
     * Body: { amount, gateway, wallet_address }
     */
    public function withdraw(Request $request): Response
    {
        $user = $request->getMeta('auth.user');
        $body = $this->readJson($request);

        $validator = new Validator();
        if (!$validator->validate($body, [
            'amount'         => 'required|numeric|min:1',
            'gateway'        => 'required|in:bkash,nagad',
            'wallet_address' => 'required|digits_between:8,20',
        ])) {
            return Response::json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $result = $this->withdrawalService->request(
            $user,
            (float) $body['amount'],
            $body['gateway'],
            $body['wallet_address']
        );

        if (!$result['success']) {
            return Response::json($result, 422);
        }

        $user = User::find($user->id);
        return Response::json([
            'success' => true,
            'data'    => [
                'withdrawal' => $this->serializeWithdrawal($result['withdrawal']),
                'user'       => $this->serializeUser($user),
            ],
            'message' => 'Withdrawal requested. Wait for admin approval.',
        ], 201);
    }

    /**
     * GET /api/user/withdrawals (auth.api) — list the user's withdrawal history.
     */
    public function withdrawals(Request $request): Response
    {
        $user = $request->getMeta('auth.user');
        $rows = Withdrawal::where('user_id', '=', $user->id)
            ->orderBy('id', 'desc')
            ->get();
        $items = [];
        foreach ($rows as $w) {
            $items[] = $this->serializeWithdrawal($w);
        }
        return Response::json([
            'success' => true,
            'data'    => $items,
        ]);
    }

    /**
     * GET /api/user/referrals (auth.api) — referral network.
     */
    public function referrals(Request $request): Response
    {
        $user = $request->getMeta('auth.user');
        $rows = \App\Models\User::where('referred_by', '=', $user->id)
            ->orderBy('id', 'desc')
            ->get();

        $items = [];
        foreach ($rows as $ref) {
            $items[] = [
                'id'              => $ref->id,
                'name'            => $ref->name,
                'username'        => $ref->username,
                'avatar_url'      => $ref->getAvatarUrlAttribute(),
                'lifetime_earned' => (float) $ref->lifetime_earned,
                'created_at'      => $ref->created_at,
            ];
        }

        $totalCommission = ReferralCommission::totalForReferrer((int) $user->id);

        return Response::json([
            'success' => true,
            'data'    => [
                'referrals'         => $items,
                'total_commission'  => $totalCommission,
                'commission_rate'   => (float) (getenv('REFERRAL_COMMISSION_RATE') ?: 0.5),
                'referral_code'     => $user->referral_code,
                'referral_link'     => $this->buildReferralLink($user->referral_code),
            ],
        ]);
    }

    /**
     * GET /api/user/ads (auth.api) — full ad view history.
     */
    public function ads(Request $request): Response
    {
        $user = $request->getMeta('auth.user');
        $rows = AdView::where('user_id', '=', $user->id)
            ->orderBy('id', 'desc')
            ->limit(100)
            ->get();

        $items = [];
        foreach ($rows as $ad) {
            $items[] = [
                'id'           => $ad->id,
                'provider'     => $ad->provider,
                'reward'       => (float) $ad->reward,
                'started_at'   => $ad->started_at,
                'completed_at' => $ad->completed_at,
            ];
        }
        return Response::json([
            'success' => true,
            'data'    => $items,
        ]);
    }

    private function buildReferralLink(string $code): string
    {
        $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
        $proto = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
        return $proto . '://' . $host . '/?ref=' . urlencode($code);
    }

    private function serializeUser(?User $user): array
    {
        if ($user === null) return [];
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

    private function serializeWithdrawal(Withdrawal $w): array
    {
        return [
            'id'              => $w->id,
            'amount'          => (float) $w->amount,
            'gateway'         => $w->gateway,
            'wallet_address'  => $w->wallet_address,
            'status'          => $w->status,
            'admin_note'      => $w->admin_note,
            'requested_at'    => $w->requested_at,
            'processed_at'    => $w->processed_at,
        ];
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
