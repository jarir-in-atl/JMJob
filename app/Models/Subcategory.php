<?php
declare(strict_types=1);

namespace App\Models;

use Nemesis\Core\Model;
use Nemesis\Core\Fluent;

/**
 * Subcategory — admin-managed job subcategory belonging to a category.
 */
class Subcategory extends Model
{
    public function __construct(array $attributes = [])
    {
        $this->table = 'subcategories';
        parent::__construct($attributes);
    }

    protected $fillable = ['category_id', 'name', 'slug', 'description', 'is_active', 'display_order'];

    public function category(): ?Category
    {
        return $this->category_id ? Category::find((int) $this->category_id) : null;
    }

    public static function forCategory(int $categoryId): array
    {
        $rows = Fluent::table('subcategories')
            ->where('category_id', '=', $categoryId)
            ->where('is_active', '=', 1)
            ->orderBy('display_order', 'asc')
            ->orderBy('name', 'asc')
            ->get()->all();
        return array_map(fn($r) => new self((array) $r), $rows);
    }
}

