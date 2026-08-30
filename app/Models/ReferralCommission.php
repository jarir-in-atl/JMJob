<?php
declare(strict_types=1);

namespace App\Models;

use Nemesis\Core\Model;
use Nemesis\Core\Fluent;

class ReferralCommission extends Model
{
    public function __construct(array $attributes = [])
    {
        $this->table = 'referral_commissions';
        parent::__construct($attributes);
    }


    protected $fillable = ['referrer_id', 'referred_id', 'source_type', 'source_id', 'commission_rate', 'commission_amount'];

    public function referrer(): ?User
    {
        return User::find((int) $this->referrer_id);
    }

    public function referred(): ?User
    {
        return User::find((int) $this->referred_id);
    }

    public static function totalForReferrer(int $referrerId): float
    {
        $row = Fluent::table('referral_commissions')
            ->select(['COALESCE(SUM(commission_amount), 0) AS total'])
            ->where('referrer_id', '=', $referrerId)
            ->first();
        return (float) ($row['total'] ?? 0);
    }
}
