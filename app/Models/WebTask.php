<?php
declare(strict_types=1);

namespace App\Models;

use Nemesis\Core\Model;
use Nemesis\Core\Fluent;

class WebTask extends Model
{
    public function __construct(array $attributes = [])
    {
        $this->table = 'web_tasks';
        parent::__construct($attributes);
    }


    protected $fillable = ['title', 'description', 'target_url', 'reward', 'duration_seconds', 'verification_type', 'active', 'daily_limit_per_user'];

    public function isActive(): bool
    {
        return (bool) $this->active;
    }

    /**
     * Has the given user already completed this task today?
     */
    public function completedByToday(int $userId): int
    {
        // Use raw view() to handle DATE() function — Fluent's where() doesn't
        // support column expressions as a first arg.
        $sql = "SELECT COUNT(*) AS c FROM web_task_completions
                WHERE user_id = :user_id
                  AND task_id = :task_id
                  AND claimed_at IS NOT NULL
                  AND DATE(started_at) = :today";
        $row = \Nemesis\Core\Database::view($sql, [
            'user_id' => $userId,
            'task_id' => $this->id,
            'today'   => date('Y-m-d'),
        ]);
        return (int) ($row[0]['c'] ?? 0);
    }

    public function completions()
    {
        return WebTaskCompletion::where('task_id', '=', $this->id);
    }
}
