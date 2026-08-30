<?php
declare(strict_types=1);

namespace App\Services;

use App\Models\User;
use App\Models\AdView;
use App\Models\AdProvider;
use App\Models\ReferralCommission;
use Nemesis\Core\Fluent;

/**
 * RewardService — central place for crediting any kind of reward.
 *
 * Encapsulates:
 *   - daily ad cap enforcement
 *   - user balance / lifetime_earned / today_earned / today_ads update
 *   - ad_views audit log insert
 *   - 50% referral commission to the direct referrer (if any)
 *
 * Returns a structured result so controllers can format their JSON
 * responses consistently.
 */
class RewardService
{
    public function creditAdReward(
        User $user,
        string $provider,
        float $reward,
        ?string $ip = null,
        ?string $ua = null
    ): array {
        $user->resetDailyCountersIfNeeded();
        if ($user->adsRemainingToday() <= 0) {
            return [
                'success' => false,
                'message' => 'Daily ad limit reached. Try again tomorrow.',
            ];
        }
        if ($reward <= 0) {
            return [
                'success' => false,
                'message' => 'Invalid reward amount.',
            ];
        }

        $adViewId = $user->recordAdReward($provider, $reward, $ip, $ua);

        // 50% commission to the direct referrer (if any)
        $referrer = $user->referrer();
        $commissionAmount = 0.0;
        if ($referrer !== null) {
            $rate = (float) (getenv('REFERRAL_COMMISSION_RATE') ?: 0.5);
            $commissionAmount = round($reward * $rate, 4);
            $newReferrerBalance  = round(((float) $referrer->balance) + $commissionAmount, 4);
            $newReferrerLifetime = round(((float) $referrer->lifetime_earned) + $commissionAmount, 4);

            Fluent::table('users')
                ->where('id', '=', $referrer->id)
                ->update([
                    'balance'         => $newReferrerBalance,
                    'lifetime_earned' => $newReferrerLifetime,
                    'updated_at'      => date('Y-m-d H:i:s'),
                ]);

            Fluent::table('referral_commissions')->insert([
                'referrer_id'       => $referrer->id,
                'referred_id'       => $user->id,
                'source_type'       => 'ad',
                'source_id'         => $adViewId,
                'commission_rate'   => $rate,
                'commission_amount' => $commissionAmount,
                'created_at'        => date('Y-m-d H:i:s'),
            ]);
        }

        return [
            'success'          => true,
            'reward'           => $reward,
            'commission'       => $commissionAmount,
            'ad_view_id'       => $adViewId,
            'new_balance'      => (float) $user->balance,
            'lifetime_earned'  => (float) $user->lifetime_earned,
            'today_earned'     => (float) $user->today_earned,
            'ads_remaining'    => $user->adsRemainingToday(),
        ];
    }

    public function creditWebTaskReward(User $user, float $reward, int $completionId): array
    {
        if ($reward <= 0) {
            return ['success' => false, 'message' => 'Invalid reward amount.'];
        }
        $newBalance      = round(((float) $user->balance) + $reward, 4);
        $newLifetime     = round(((float) $user->lifetime_earned) + $reward, 4);
        $newTodayEarned  = round(((float) $user->today_earned) + $reward, 4);

        Fluent::table('users')
            ->where('id', '=', $user->id)
            ->update([
                'balance'         => $newBalance,
                'lifetime_earned' => $newLifetime,
                'today_earned'    => $newTodayEarned,
                'updated_at'      => date('Y-m-d H:i:s'),
            ]);
        $user->balance         = $newBalance;
        $user->lifetime_earned = $newLifetime;
        $user->today_earned    = $newTodayEarned;

        $commissionAmount = 0.0;
        $referrer = $user->referrer();
        if ($referrer !== null) {
            $rate = (float) (getenv('REFERRAL_COMMISSION_RATE') ?: 0.5);
            $commissionAmount = round($reward * $rate, 4);
            $newRefBalance  = round(((float) $referrer->balance) + $commissionAmount, 4);
            $newRefLifetime = round(((float) $referrer->lifetime_earned) + $commissionAmount, 4);
            Fluent::table('users')
                ->where('id', '=', $referrer->id)
                ->update([
                    'balance'         => $newRefBalance,
                    'lifetime_earned' => $newRefLifetime,
                    'updated_at'      => date('Y-m-d H:i:s'),
                ]);
            Fluent::table('referral_commissions')->insert([
                'referrer_id'       => $referrer->id,
                'referred_id'       => $user->id,
                'source_type'       => 'web_task',
                'source_id'         => $completionId,
                'commission_rate'   => $rate,
                'commission_amount' => $commissionAmount,
                'created_at'        => date('Y-m-d H:i:s'),
            ]);
        }

        return [
            'success'         => true,
            'reward'          => $reward,
            'commission'      => $commissionAmount,
            'new_balance'     => $newBalance,
            'lifetime_earned' => $newLifetime,
            'today_earned'    => $newTodayEarned,
        ];
    }

    public function creditTgTaskReward(User $user, float $reward, int $completionId): array
    {
        // Telegram task rewards are typically smaller and don't reset daily
        // in the original, but we'll credit balance + lifetime only.
        $newBalance  = round(((float) $user->balance) + $reward, 4);
        $newLifetime = round(((float) $user->lifetime_earned) + $reward, 4);
        $newToday    = round(((float) $user->today_earned) + $reward, 4);

        Fluent::table('users')
            ->where('id', '=', $user->id)
            ->update([
                'balance'         => $newBalance,
                'lifetime_earned' => $newLifetime,
                'today_earned'    => $newToday,
                'updated_at'      => date('Y-m-d H:i:s'),
            ]);
        $user->balance         = $newBalance;
        $user->lifetime_earned = $newLifetime;
        $user->today_earned    = $newToday;

        $commissionAmount = 0.0;
        $referrer = $user->referrer();
        if ($referrer !== null) {
            $rate = (float) (getenv('REFERRAL_COMMISSION_RATE') ?: 0.5);
            $commissionAmount = round($reward * $rate, 4);
            $newRefBalance  = round(((float) $referrer->balance) + $commissionAmount, 4);
            $newRefLifetime = round(((float) $referrer->lifetime_earned) + $commissionAmount, 4);
            Fluent::table('users')
                ->where('id', '=', $referrer->id)
                ->update([
                    'balance'         => $newRefBalance,
                    'lifetime_earned' => $newRefLifetime,
                    'updated_at'      => date('Y-m-d H:i:s'),
                ]);
            Fluent::table('referral_commissions')->insert([
                'referrer_id'       => $referrer->id,
                'referred_id'       => $user->id,
                'source_type'       => 'tg_task',
                'source_id'         => $completionId,
                'commission_rate'   => $rate,
                'commission_amount' => $commissionAmount,
                'created_at'        => date('Y-m-d H:i:s'),
            ]);
        }

        return [
            'success'         => true,
            'reward'          => $reward,
            'commission'      => $commissionAmount,
            'new_balance'     => $newBalance,
            'lifetime_earned' => $newLifetime,
            'today_earned'    => $newToday,
        ];
    }
}
