<?php
declare(strict_types=1);

namespace App\Models;

use Nemesis\Core\Model;
use Nemesis\Core\Fluent;
use Nemesis\Core\Database;

/**
 * User model — EarnApp clone.
 *
 * Extends the Nemesis ActiveRecord base class and adds:
 *   - bcrypt password hashing
 *   - 8-char referral_code auto-generation
 *   - daily ad reset logic
 *   - balance / earning helpers
 *   - canWithdraw() / adsRemainingToday() checks
 */
class User extends Model
{
    public function __construct(array $attributes = [])
    {
        $this->table = 'users';
        parent::__construct($attributes);
    }



    protected $fillable = [
        'name', 'email', 'username', 'password', 'referral_code',
        'referred_by', 'balance', 'lifetime_earned', 'today_earned',
        'ads_limit', 'today_ads', 'last_ad_reset_at', 'is_admin',
    ];
    protected $hidden = ['password'];

    /**
     * Mutator: hashes the password before saving it to the attributes array.
     */
    public function setPasswordAttribute(string $value): void
    {
        $this->attributes['password'] = password_hash($value, PASSWORD_BCRYPT);
    }

    public function getAvatarUrlAttribute(): string
    {
        return 'https://placehold.co/100x100/e8e8e8/a9a9a9?text=' . urlencode(substr((string) $this->name, 0, 1));
    }

    public function isAdmin(): bool
    {
        return (bool) ($this->is_admin ?? 0);
    }

    public function adsRemainingToday(): int
    {
        $this->resetDailyCountersIfNeeded();
        return max(0, (int) $this->ads_limit - (int) $this->today_ads);
    }

    public function resetDailyCountersIfNeeded(): void
    {
        $today = date('Y-m-d');
        if (($this->last_ad_reset_at ?? '') !== $today) {
            Fluent::table($this->table)
                ->where('id', '=', $this->id)
                ->update([
                    'today_ads' => 0,
                    'today_earned' => 0,
                    'last_ad_reset_at' => $today,
                ]);
            $this->today_ads = 0;
            $this->today_earned = 0;
            $this->last_ad_reset_at = $today;
        }
    }

    public function canWithdraw(): bool
    {
        // EarnApp: must have at least the configured number of referrals.
        $minReferrals = (int) (getenv('WITHDRAW_MIN_REFERRALS') ?: 0);
        $count = $this->referralCount();
        return $count >= $minReferrals;
    }

    public function referralCount(): int
    {
        $row = Fluent::table('users')
            ->select(['COUNT(*) AS c'])
            ->where('referred_by', '=', $this->id)
            ->first();
        return (int) ($row['c'] ?? 0);
    }

    /**
     * Credit a reward to this user. Updates balance + lifetime_earned +
     * today_earned + today_ads. Inserts an AdView record for audit.
     */
    public function recordAdReward(string $provider, float $reward, ?string $ip = null, ?string $ua = null): int
    {
        $this->resetDailyCountersIfNeeded();
        $newBalance       = round(((float) $this->balance) + $reward, 4);
        $newLifetime      = round(((float) $this->lifetime_earned) + $reward, 4);
        $newTodayEarned   = round(((float) $this->today_earned) + $reward, 4);
        $newTodayAds      = (int) $this->today_ads + 1;

        Fluent::table($this->table)
            ->where('id', '=', $this->id)
            ->update([
                'balance'          => $newBalance,
                'lifetime_earned'  => $newLifetime,
                'today_earned'     => $newTodayEarned,
                'today_ads'        => $newTodayAds,
                'updated_at'       => date('Y-m-d H:i:s'),
            ]);

        $this->balance         = $newBalance;
        $this->lifetime_earned = $newLifetime;
        $this->today_earned    = $newTodayEarned;
        $this->today_ads       = $newTodayAds;

        $adViewId = (int) Fluent::table('ad_views')->insert([
            'user_id'      => $this->id,
            'provider'     => $provider,
            'reward'       => $reward,
            'completed_at' => date('Y-m-d H:i:s'),
            'ip_address'   => $ip,
            'user_agent'   => $ua !== null ? substr($ua, 0, 250) : null,
        ]);

        return $adViewId;
    }

    /**
     * Generate a unique 8-character referral code.
     */
    public static function generateReferralCode(): string
    {
        $alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // omit ambiguous chars
        do {
            $code = '';
            for ($i = 0; $i < 8; $i++) {
                $code .= $alphabet[random_int(0, strlen($alphabet) - 1)];
            }
            $exists = Fluent::table('users')
                ->select(['COUNT(*) AS c'])
                ->where('referral_code', '=', $code)
                ->first();
        } while ((int) ($exists['c'] ?? 0) > 0);
        return $code;
    }

    /**
     * Generate a unique username from a base name.
     */
    public static function generateUsername(string $name): string
    {
        $base = strtolower(preg_replace('/[^a-z0-9]+/i', '', $name) ?: 'user');
        $base = substr($base, 0, 20) ?: 'user';
        do {
            $suffix = (string) random_int(100, 9999);
            $candidate = $base . $suffix;
            $exists = Fluent::table('users')
                ->select(['COUNT(*) AS c'])
                ->where('username', '=', $candidate)
                ->first();
        } while ((int) ($exists['c'] ?? 0) > 0);
        return $candidate;
    }

    public function referrer(): ?User
    {
        if (!($this->referred_by ?? null)) {
            return null;
        }
        return static::find((int) $this->referred_by);
    }

    public function withdrawals()
    {
        return \App\Models\Withdrawal::where('user_id', '=', $this->id);
    }

    public function adViews()
    {
        return \App\Models\AdView::where('user_id', '=', $this->id);
    }
}
