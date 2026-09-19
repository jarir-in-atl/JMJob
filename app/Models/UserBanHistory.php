<?php
declare(strict_types=1);

namespace App\Models;

use Nemesis\Core\Fluent;
use Nemesis\Core\Model;

class UserBanHistory extends Model
{
    public const ACTION_BAN = 'ban';
    public const ACTION_UNBAN = 'unban';

    protected $fillable = [
        'user_id', 'admin_id', 'action', 'reason', 'user_snapshot',
        'previous_activity', 'created_at',
    ];

    public function __construct(array $attributes = [])
    {
        $this->table = 'user_ban_history';
        parent::__construct($attributes);
    }

    public static function forUser(int $userId, int $limit = 50): array
    {
        $rows = Fluent::table('user_ban_history')
            ->where('user_id', '=', $userId)
            ->orderBy('id', 'desc')
            ->limit($limit)
            ->get()->all();
        return array_map(fn($row) => new self((array) $row), $rows);
    }
}
