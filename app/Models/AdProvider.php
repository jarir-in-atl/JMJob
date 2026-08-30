<?php
declare(strict_types=1);

namespace App\Models;

use Nemesis\Core\Model;
use Nemesis\Core\Fluent;

class AdProvider extends Model
{
    public function __construct(array $attributes = [])
    {
        $this->table = 'ad_providers';
        parent::__construct($attributes);
    }


    protected $fillable = ['slug', 'name', 'block_id', 'enabled', 'weight', 'reward_per_view', 'min_duration_seconds'];

    /**
     * Pick a provider by weight. Returns null if none enabled.
     */
    public static function pickRandom(): ?self
    {
        $rows = Fluent::table('ad_providers')
            ->where('enabled', '=', 1)
            ->get();
        if (!$rows) {
            return null;
        }
        $totalWeight = 0;
        foreach ($rows as $row) {
            $totalWeight += (int) ($row['weight'] ?? 0);
        }
        if ($totalWeight <= 0) {
            return self::find((int) $rows[0]['id']);
        }
        $pick = random_int(1, $totalWeight);
        $cum = 0;
        foreach ($rows as $row) {
            $cum += (int) ($row['weight'] ?? 0);
            if ($pick <= $cum) {
                return self::find((int) $row['id']);
            }
        }
        return self::find((int) $rows[count($rows) - 1]['id']);
    }

    public function hasBlockId(): bool
    {
        return !empty($this->block_id);
    }
}
