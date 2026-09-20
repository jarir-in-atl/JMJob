<?php
declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Models\User;
use Nemesis\Core\Controller;
use Nemesis\Core\Database;
use Nemesis\Http\Request;
use Nemesis\Http\Response;
use Nemesis\Core\Fluent;
use App\Services\SettingService;

/**
 * DailyBonusController — handles daily bonus claims and counter resets.
 *
 * The daily bonus allows users to claim a reward after watching all their
 * daily ads (or a minimum threshold). This controller also provides an
 * endpoint to reset all users' daily counters (for cron jobs).
 */
class DailyBonusController extends Controller
{
    /**
     * POST /api/user/claim-daily-bonus
     * Claims the daily bonus if eligible.
     */
    public function claim(Request $request): Response
    {
        $user = $request->getMeta('auth.user');
        if (!$user) {
            return Response::json([
                'success' => false,
                'message' => 'Unauthorized.',
            ], 401);
        }
        if ($user->isBanned()) {
            return Response::json([
                'success' => false,
                'error' => 'banned',
                'message' => 'Banned accounts cannot claim rewards.',
            ], 403);
        }
        if (!SettingService::rewardSystemEnabled()) {
            return Response::json([
                'success' => false,
                'message' => 'The reward system is currently disabled.',
            ], 403);
        }

        $today = date('Y-m-d');
        $db = Database::connect();
        $todayAds = 0;
        $bonus = 0.0;
        $newBalance = 0.0;

        try {
            // Serialize the eligibility check and both writes so two
            // simultaneous claims cannot credit the same daily bonus.
            Database::beginWriteTransaction($db);
            $lockSql = 'SELECT * FROM users WHERE id = :id LIMIT 1';
            if (Database::getDriverName() !== 'sqlite') $lockSql .= ' FOR UPDATE';
            $lock = $db->prepare($lockSql);
            $lock->execute(['id' => (int) $user->id]);
            $lockedRow = $lock->fetch(\PDO::FETCH_ASSOC);
            $currentUser = $lockedRow ? new User($lockedRow) : null;
            if ($currentUser === null) {
                throw new \RuntimeException('User not found.');
            }
            if ($currentUser->isBanned()) {
                Database::rollbackWriteTransaction($db);
                return Response::json([
                    'success' => false,
                    'error' => 'banned',
                    'message' => 'Banned accounts cannot claim rewards.',
                ], 403);
            }

            if (($currentUser->last_daily_bonus_claim ?? null) === $today) {
                Database::rollbackWriteTransaction($db);
                return Response::json([
                    'success' => false,
                    'message' => 'Daily bonus already claimed today.',
                ], 400);
            }

            $todayAds = (int) ($currentUser->today_ads ?? 0);
            $minAdsRequired = 10;
            if ($todayAds < $minAdsRequired) {
                Database::rollbackWriteTransaction($db);
                return Response::json([
                    'success' => false,
                    'message' => "Watch at least {$minAdsRequired} ads to claim daily bonus.",
                    'data' => [
                        'today_ads' => $todayAds,
                        'required' => $minAdsRequired,
                    ],
                ], 400);
            }

            // Base bonus: $0.05, +$0.01 for every 5 ads beyond 10.
            $baseBonus = 0.05;
            $extraAds = max(0, $todayAds - 10);
            $bonus = round($baseBonus + floor($extraAds / 5) * 0.01, 4);
            $newBalance = round(((float) $currentUser->balance) + $bonus, 4);
            $newLifetime = round(((float) $currentUser->lifetime_earned) + $bonus, 4);
            $newTodayEarned = round(((float) $currentUser->today_earned) + $bonus, 4);
            $now = date('Y-m-d H:i:s');

            Fluent::table('users')
                ->where('id', '=', $currentUser->id)
                ->update([
                    'balance' => $newBalance,
                    'lifetime_earned' => $newLifetime,
                    'today_earned' => $newTodayEarned,
                    'last_daily_bonus_claim' => $today,
                    'updated_at' => $now,
                ]);

            Fluent::table('ad_views')->insert([
                'user_id' => $currentUser->id,
                'provider' => 'daily_bonus',
                'reward' => $bonus,
                'completed_at' => $now,
                'ip_address' => $_SERVER['REMOTE_ADDR'] ?? null,
                'user_agent' => substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 250),
            ]);
            Database::commitWriteTransaction($db);
        } catch (\Throwable $e) {
            Database::rollbackWriteTransaction($db);
            return Response::json([
                'success' => false,
                'message' => 'Unable to claim daily bonus right now.',
            ], 500);
        }

        return Response::json([
            'success' => true,
            'message' => 'Daily bonus claimed!',
            'data' => [
                'bonus' => $bonus,
                'balance' => $newBalance,
                'today_ads' => $todayAds,
            ],
        ]);
    }

    /**
     * GET /api/user/daily-bonus-status
     * Returns the current daily bonus status.
     */
    public function status(Request $request): Response
    {
        $user = $request->getMeta('auth.user');
        if (!$user) {
            return Response::json([
                'success' => false,
                'message' => 'Unauthorized.',
            ], 401);
        }
        if ($user->isBanned()) {
            return Response::json([
                'success' => false,
                'error' => 'banned',
                'message' => 'Banned accounts cannot access rewards.',
            ], 403);
        }
        if (!SettingService::rewardSystemEnabled()) {
            return Response::json([
                'success' => true,
                'data' => [
                    'enabled' => false,
                    'claimed_today' => false,
                    'today_ads' => (int) ($user->today_ads ?? 0),
                    'min_ads_required' => 10,
                    'can_claim' => false,
                    'potential_bonus' => 0,
                ],
            ]);
        }

        $today = date('Y-m-d');
        $lastClaim = $user->last_daily_bonus_claim ?? null;
        $claimedToday = ($lastClaim === $today);
        $todayAds = (int) ($user->today_ads ?? 0);
        $minAdsRequired = 10;

        // Calculate potential bonus
        $baseBonus = 0.05;
        $extraAds = max(0, $todayAds - 10);
        $potentialBonus = $baseBonus + floor($extraAds / 5) * 0.01;
        $potentialBonus = round($potentialBonus, 4);

        return Response::json([
            'success' => true,
            'data' => [
                'claimed_today' => $claimedToday,
                'today_ads' => $todayAds,
                'min_ads_required' => $minAdsRequired,
                'can_claim' => !$claimedToday && $todayAds >= $minAdsRequired,
                'potential_bonus' => $claimedToday ? 0 : $potentialBonus,
            ],
        ]);
    }

    /**
     * POST /api/admin/reset-daily-counters
     * Resets all users' daily counters. Run this via cron at midnight.
     *
     * Cron example: 0 0 * * * curl -X POST https://jmjob.xyz/api/admin/reset-daily-counters
     */
    public function resetCounters(Request $request): Response
    {
        if ($guard = $this->adminGuard($request)) return $guard;
        $today = date('Y-m-d');

        // Reset all users' daily counters
        $affected = Fluent::table('users')
            ->where('last_ad_reset_at', '!=', $today)
            ->update([
                'today_ads' => 0,
                'today_earned' => 0,
                'last_ad_reset_at' => $today,
                'updated_at' => date('Y-m-d H:i:s'),
            ]);

        return Response::json([
            'success' => true,
            'message' => "Reset daily counters for {$affected} users.",
            'data' => [
                'users_reset' => $affected,
                'date' => $today,
            ],
        ]);
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
