<?php
declare(strict_types=1);

namespace App\Models;

use Nemesis\Core\Model;

class AdView extends Model
{
    public function __construct(array $attributes = [])
    {
        $this->table = 'ad_views';
        parent::__construct($attributes);
    }


    protected $fillable = ['user_id', 'provider', 'reward', 'started_at', 'completed_at', 'ip_address', 'user_agent'];

    public function user(): ?User
    {
        return User::find((int) $this->user_id);
    }
}
