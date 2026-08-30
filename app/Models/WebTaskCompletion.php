<?php
declare(strict_types=1);

namespace App\Models;

use Nemesis\Core\Model;
use Nemesis\Core\Fluent;

class WebTaskCompletion extends Model
{
    public function __construct(array $attributes = [])
    {
        $this->table = 'web_task_completions';
        parent::__construct($attributes);
    }


    protected $fillable = ['user_id', 'task_id', 'started_at', 'completed_at', 'claimed_at', 'reward'];

    public function task(): ?WebTask
    {
        return WebTask::find((int) $this->task_id);
    }

    public function user(): ?User
    {
        return User::find((int) $this->user_id);
    }

    public function isComplete(): bool
    {
        return !empty($this->completed_at);
    }

    public function isClaimed(): bool
    {
        return !empty($this->claimed_at);
    }

    public static function findActive(int $userId, int $taskId): ?self
    {
        $row = Fluent::table('web_task_completions')
            ->where('user_id', '=', $userId)
            ->where('task_id', '=', $taskId)
            ->where('claimed_at', 'IS', null)
            ->first();
        return $row ? self::find((int) $row['id']) : null;
    }
}
