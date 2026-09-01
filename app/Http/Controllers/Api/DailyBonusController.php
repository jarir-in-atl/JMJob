<?php
declare(strict_types=1);

namespace App\Http\Controllers\Api;

use Nemesis\Core\Controller;
use Nemesis\Http\Request;
use Nemesis\Http\Response;
use Nemesis\Core\Fluent;

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

        // Check if user already claimed today
        $today = date('Y-m-d');
        $lastClaim = $user->last_daily_bonus_claim ?? null;

        if ($lastClaim === $today) {
            return Response::json([
                'success' => false,
                'message' => 'Daily bonus already claimed today.',
            ], 400);
        }

        // Check if user has watched at least some ads today
        $todayAds = (int) ($user->today_ads ?? 0);
        $minAdsRequired = 10; // Require at least 10 ads for daily bonus

        if ($todayAds < $minAdsRequired) {
            return Response::json([
                'success' => false,
                'message' => "Watch at least {$minAdsRequired} ads to claim daily bonus.",
                'data' => [
                    'today_ads' => $todayAds,
                    'required' => $minAdsRequired,
                ],
            ], 400);
        }

        // Calculate bonus based on ads watched
        // Base bonus: $0.05, +$0.01 for every 5 ads beyond 10
        $baseBonus = 0.05;
        $extraAds = max(0, $todayAds - 10);
        $bonus = $baseBonus + floor($extraAds / 5) * 0.01;
        $bonus = round($bonus, 4);

        // Credit the bonus
        $newBalance = round(((float) $user->balance) + $bonus, 4);
        $newLifetime = round(((float) $user->lifetime_earned) + $bonus, 4);
        $newTodayEarned = round(((float) $user->today_earned) + $bonus, 4);

        Fluent::table('users')
            ->where('id', '=', $user->id)
            ->update([
                'balance' => $newBalance,
                'lifetime_earned' => $newLifetime,
                'today_earned' => $newTodayEarned,
                'last_daily_bonus_claim' => $today,
                'updated_at' => date('Y-m-d H:i:s'),
            ]);

        // Record the bonus in ad_views for audit
        Fluent::table('ad_views')->insert([
            'user_id' => $user->id,
            'provider' => 'daily_bonus',
            'reward' => $bonus,
            'completed_at' => date('Y-m-d H:i:s'),
            'ip_address' => $_SERVER['REMOTE_ADDR'] ?? null,
            'user_agent' => substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 250),
        ]);

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
    public function resetCounters(): Response
    {
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
}
