<?php
declare(strict_types=1);

namespace App\Models;

use Nemesis\Core\Model;
use Nemesis\Core\Fluent;

class TgTask extends Model
{
    public function __construct(array $attributes = [])
    {
        $this->table = 'telegram_tasks';
        parent::__construct($attributes);
    }


    protected $fillable = ['channel_username', 'channel_name', 'description', 'reward', 'active'];

    public function isActive(): bool
    {
        return (bool) $this->active;
    }

    public function hasCompletedBy(int $userId): bool
    {
        $row = Fluent::table('telegram_task_completions')
            ->select(['COUNT(*) AS c'])
            ->where('user_id', '=', $userId)
            ->where('task_id', '=', $this->id)
            ->first();
        return (int) ($row['c'] ?? 0) > 0;
    }
}
