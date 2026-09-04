<?php
declare(strict_types=1);

namespace App\Models;

use Nemesis\Core\Model;
use Nemesis\Core\Fluent;

/**
 * PlatformSetting — single row from platform_settings table.
 *
 * Reads go through App\Services\SettingService (which caches by key for
 * the request lifecycle). Writes also go through SettingService so
 * type-casting and cache invalidation happen in one place.
 */
class PlatformSetting extends Model
{
    public const TYPE_STRING   = 'string';
    public const TYPE_INTEGER  = 'integer';
    public const TYPE_DECIMAL  = 'decimal';
    public const TYPE_PERCENT  = 'percent';
    public const TYPE_BOOLEAN  = 'boolean';
    public const TYPE_JSON     = 'json';

    public function __construct(array $attributes = [])
    {
        $this->table = 'platform_settings';
        parent::__construct($attributes);
    }

    protected $fillable = ['setting_key', 'value', 'value_type', 'category', 'description'];

    public function castValue()
    {
        switch ($this->value_type) {
            case self::TYPE_INTEGER:
            case self::TYPE_PERCENT:
                return (int) $this->value;
            case self::TYPE_DECIMAL:
                return (float) $this->value;
            case self::TYPE_BOOLEAN:
                return in_array(strtolower((string) $this->value), ['1', 'true', 'yes', 'on'], true);
            case self::TYPE_JSON:
                return json_decode((string) $this->value, true);
            default:
                return (string) $this->value;
        }
    }

    /**
     * Convenience accessor: the DB column is `setting_key` (because
     * `key` is a MySQL reserved word) but the rest of the app talks
     * about "key" so expose a magic getter.
     */
    public function __get($name)
    {
        if ($name === 'key') return $this->attributes['setting_key'] ?? null;
        return parent::__get($name);
    }

    public static function findByKey(string $key): ?self
    {
        $row = Fluent::table('platform_settings')
            ->where('setting_key', '=', $key)
            ->first();
        return $row ? new self((array) $row) : null;
    }

    public static function allByCategory(?string $category = null): array
    {
        $q = Fluent::table('platform_settings')->orderBy('category')->orderBy('setting_key');
        if ($category !== null) $q->where('category', '=', $category);
        return array_map(fn($r) => new self((array) $r), $q->get()->all());
    }

    public static function listAll(): array
    {
        return self::allByCategory(null);
    }
}
