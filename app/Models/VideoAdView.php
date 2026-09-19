<?php
declare(strict_types=1);

namespace App\Models;

use Nemesis\Core\Fluent;
use Nemesis\Core\Model;

class VideoAdView extends Model
{
    protected $fillable = [
        'video_ad_id', 'user_id', 'reward_amount', 'started_at', 'completed_at',
        'claimed_at', 'ip_address', 'user_agent',
    ];

    public function __construct(array $attributes = [])
    {
        $this->table = 'video_ad_views';
        parent::__construct($attributes);
    }

    public static function countForUserToday(int $videoAdId, int $userId): int
    {
        $start = date('Y-m-d 00:00:00');
        $end = date('Y-m-d 23:59:59');
        return Fluent::table('video_ad_views')
            ->where('video_ad_id', '=', $videoAdId)
            ->where('user_id', '=', $userId)
            ->whereBetween('started_at', $start, $end)
            ->count();
    }
}
