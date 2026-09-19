<?php
declare(strict_types=1);

namespace App\Models;

use Nemesis\Core\Fluent;
use Nemesis\Core\Model;

class VideoAd extends Model
{
    public const STATUS_ACTIVE = 'active';
    public const STATUS_PAUSED = 'paused';

    protected $fillable = [
        'title', 'video_path', 'duration_seconds', 'status', 'reward_amount',
        'starts_at', 'ends_at', 'daily_limit', 'total_limit', 'total_views',
        'completed_views', 'created_by',
    ];

    public function __construct(array $attributes = [])
    {
        $this->table = 'video_ads';
        parent::__construct($attributes);
    }

    public function isActive(?string $now = null): bool
    {
        if ($this->status !== self::STATUS_ACTIVE) return false;
        $now = $now ?: date('Y-m-d H:i:s');
        if ($this->starts_at && (string) $this->starts_at > $now) return false;
        if ($this->ends_at && (string) $this->ends_at < $now) return false;
        if ((int) ($this->total_limit ?? 0) > 0 && (int) ($this->total_views ?? 0) >= (int) $this->total_limit) return false;
        return true;
    }

    public static function active(): array
    {
        $rows = Fluent::table('video_ads')
            ->where('status', '=', self::STATUS_ACTIVE)
            ->orderBy('id', 'asc')
            ->get()->all();
        return array_values(array_filter(
            array_map(fn($row) => new self((array) $row), $rows),
            fn(self $ad) => $ad->isActive()
        ));
    }
}
