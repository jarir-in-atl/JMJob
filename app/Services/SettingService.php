<?php
declare(strict_types=1);

namespace App\Services;

use App\Models\PlatformSetting;
use Nemesis\Core\Fluent;
use RuntimeException;

/**
 * SettingService — typed, cached accessor for platform_settings.
 *
 *   SettingService::get('commission_rate', 0.10)      // 0.10 (float)
 *   SettingService::get('default_currency', 'BDT')     // 'BDT' (string)
 *   SettingService::get('escrow_mode', 'full_bid')     // 'full_bid' (string)
 *
 *   SettingService::set('commission_rate', 0.15, PlatformSetting::TYPE_DECIMAL, 'commission')
 *   SettingService::set('new_key', 'value', PlatformSetting::TYPE_STRING, 'general')
 *
 * Cache is request-scoped (in-memory). To force a re-read from DB, use
 * `SettingService::clearCache()` (or just call `get` again after `set` —
 * `set` invalidates the entry automatically).
 */
class SettingService
{
    /** @var array<string,mixed> in-memory cache: key => cast value */
    private static array $cache = [];

    /**
     * Read a setting by key. Returns the cast value, or $default if
     * the key is not set. Caches the result for subsequent reads.
     */
    public static function get(string $key, $default = null)
    {
        if (array_key_exists($key, self::$cache)) {
            return self::$cache[$key];
        }

        $row = Fluent::table('platform_settings')
            ->where('setting_key', '=', $key)
            ->first();
        if ($row === null) {
            return $default;
        }

        $setting = new PlatformSetting((array) $row);
        $value = $setting->castValue();
        self::$cache[$key] = $value;
        return $value;
    }

    /**
     * Insert or update a setting. Validates that $value can be cast
     * to the requested $type. Returns the row id.
     */
    public static function set(string $key, $value, string $type = PlatformSetting::TYPE_STRING, string $category = 'general', ?string $description = null): int
    {
        $stored = self::encodeForType($value, $type);
        $existing = PlatformSetting::findByKey($key);

        if ($existing) {
            Fluent::table('platform_settings')
                ->where('id', '=', $existing->id)
                ->update([
                    'value'      => $stored,
                    'value_type' => $type,
                    'category'   => $category,
                    'description' => $description ?? $existing->description,
                    'updated_at' => date('Y-m-d H:i:s'),
                ]);
            $id = (int) $existing->id;
        } else {
            $id = (int) Fluent::table('platform_settings')->insert([
                'setting_key' => $key,
                'value'       => $stored,
                'value_type'  => $type,
                'category'    => $category,
                'description' => $description,
                'created_at'  => date('Y-m-d H:i:s'),
            ]);
        }

        // Invalidate the cache entry
        self::$cache[$key] = self::castRaw($stored, $type);
        return $id;
    }

    /**
     * Delete a setting. Useful for tests and admin cleanup.
     */
    public static function delete(string $key): bool
    {
        $existing = PlatformSetting::findByKey($key);
        if ($existing === null) return false;
        Fluent::table('platform_settings')
            ->where('id', '=', $existing->id)
            ->delete();
        unset(self::$cache[$key]);
        return true;
    }

    /**
     * Wipe the in-memory cache. Useful in tests; rarely needed in app code
     * because `set()` invalidates the relevant entry automatically.
     */
    public static function clearCache(): void
    {
        self::$cache = [];
    }

    /**
     * Read multiple keys at once. Returns [key => value] map.
     */
    public static function getMany(array $keys, array $defaults = []): array
    {
        $out = [];
        foreach ($keys as $k) {
            $out[$k] = self::get($k, $defaults[$k] ?? null);
        }
        return $out;
    }

    /**
     * Convenience: returns the platform commission rate as a float in [0, 1].
     */
    public static function commissionRate(): float
    {
        return (float) self::get('commission_rate', 0.10);
    }

    /**
     * Convenience: returns the default currency code (e.g. 'BDT').
     */
    public static function currencyCode(): string
    {
        return (string) self::get('default_currency', 'BDT');
    }

    public static function currencySymbol(): string
    {
        return (string) self::get('currency_symbol', '৳');
    }

    /**
     * Returns the effective escrow amount to hold for a bid of $amount,
     * given the current escrow_mode and (if relevant) escrow_percent.
     */
    public static function escrowAmount(float $amount): float
    {
        $mode = (string) self::get('escrow_mode', 'full_bid');
        if ($mode === 'full_bid') {
            return round($amount, 4);
        }
        if ($mode === 'flat_percent') {
            $pct = (int) self::get('escrow_percent', 100);
            return round($amount * max(0, min(100, $pct)) / 100, 4);
        }
        // Unknown mode — fall back to safe default of zero
        return 0.0;
    }

    /**
     * Encode $value to a storable string for $type.
     */
    private static function encodeForType($value, string $type): string
    {
        return match ($type) {
            PlatformSetting::TYPE_BOOLEAN => ($value ? '1' : '0'),
            PlatformSetting::TYPE_INTEGER, PlatformSetting::TYPE_PERCENT => (string) (int) $value,
            PlatformSetting::TYPE_DECIMAL => (string) (float) $value,
            PlatformSetting::TYPE_JSON => json_encode($value, JSON_UNESCAPED_UNICODE),
            default => (string) $value,
        };
    }

    /**
     * Inverse of encode — used after a `set` to populate the cache.
     */
    private static function castRaw(string $raw, string $type)
    {
        return match ($type) {
            PlatformSetting::TYPE_BOOLEAN => in_array(strtolower($raw), ['1', 'true', 'yes', 'on'], true),
            PlatformSetting::TYPE_INTEGER, PlatformSetting::TYPE_PERCENT => (int) $raw,
            PlatformSetting::TYPE_DECIMAL => (float) $raw,
            PlatformSetting::TYPE_JSON => json_decode($raw, true),
            default => $raw,
        };
    }
}
