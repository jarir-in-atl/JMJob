<?php
declare(strict_types=1);

namespace App\Models;

use Nemesis\Core\Model;

class TgTaskCompletion extends Model
{
    public function __construct(array $attributes = [])
    {
        $this->table = 'telegram_task_completions';
        parent::__construct($attributes);
    }


    protected $fillable = ['user_id', 'task_id', 'verified_at', 'reward'];

    public function task(): ?TgTask
    {
        return TgTask::find((int) $this->task_id);
    }

    public function user(): ?User
    {
        return User::find((int) $this->user_id);
    }
}
