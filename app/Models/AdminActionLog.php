<?php
declare(strict_types=1);

namespace App\Models;

use Nemesis\Core\Fluent;
use Nemesis\Core\Model;

class AdminActionLog extends Model
{
    protected $fillable = [
        'admin_id', 'action', 'entity_type', 'entity_id', 'details', 'created_at',
    ];

    public function __construct(array $attributes = [])
    {
        $this->table = 'admin_action_logs';
        parent::__construct($attributes);
    }

    public static function forEntity(string $entityType, int $entityId, int $limit = 50): array
    {
        $rows = Fluent::table('admin_action_logs')
            ->where('entity_type', '=', $entityType)
            ->where('entity_id', '=', $entityId)
            ->orderBy('id', 'desc')
            ->limit($limit)
            ->get()->all();
        return array_map(fn($row) => new self((array) $row), $rows);
    }
}
