<?php
declare(strict_types=1);

namespace App\Models;

use Nemesis\Core\Model;
use Nemesis\Core\Fluent;

/**
 * Category — admin-managed job category.
 */
class Category extends Model
{
    public function __construct(array $attributes = [])
    {
        $this->table = 'categories';
        parent::__construct($attributes);
    }

    protected $fillable = ['name', 'slug', 'description', 'icon_class', 'is_active', 'display_order'];

    public function isActive(): bool
    {
        return (bool) ($this->is_active ?? 0);
    }

    /** Active categories, ordered for display. */
    public static function activeOrdered(): array
    {
        $rows = Fluent::table('categories')
            ->where('is_active', '=', 1)
            ->orderBy('display_order', 'asc')
            ->orderBy('name', 'asc')
            ->get()->all();
        return array_map(fn($r) => new self((array) $r), $rows);
    }

    public static function allOrdered(): array
    {
        $rows = Fluent::table('categories')
            ->orderBy('display_order', 'asc')
            ->orderBy('name', 'asc')
            ->get()->all();
        return array_map(fn($r) => new self((array) $r), $rows);
    }

    public static function findBySlug(string $slug): ?self
    {
        $row = Fluent::table('categories')->where('slug', '=', $slug)->first();
        return $row ? new self((array) $row) : null;
    }
}
