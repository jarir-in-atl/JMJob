<?php
declare(strict_types=1);

namespace App\Services;

/**
 * AdConfigurationService — the provider-neutral contract shared by the API
 * and admin settings paths.
 *
 * The platform stores publisher and placement identifiers without assuming a
 * particular ad network SDK. This keeps the website and Android clients free
 * to use their approved provider integration while ensuring the values sent
 * through the admin API are bounded and JSON-safe.
 */
class AdConfigurationService
{
    private const PUBLISHER_MAX_LENGTH = 128;
    private const PLACEMENT_MAX_LENGTH = 64;
    private const UNIT_MAX_LENGTH = 256;
    private const MAX_PLACEMENTS = 32;

    /** @var array<string,true> */
    private const PUBLISHER_KEYS = [
        'website_publisher_id' => true,
        'app_publisher_id' => true,
    ];

    /** @var array<string,true> */
    private const UNIT_KEYS = [
        'website_ad_units' => true,
        'app_ad_units' => true,
    ];

    /**
     * Validate one provider setting before it is persisted.
     *
     * Empty publisher IDs are allowed while an external network application
     * is pending. Unit configuration intentionally remains provider-neutral,
     * but must be a shallow placement => unit/config map with bounded keys and
     * scalar or object values.
     */
    public static function validate(string $key, mixed $value): ?string
    {
        if (isset(self::PUBLISHER_KEYS[$key])) {
            $publisher = trim((string) $value);
            if ($publisher !== '' && (strlen($publisher) > self::PUBLISHER_MAX_LENGTH || !preg_match('/^[A-Za-z0-9._:-]+$/', $publisher))) {
                return $key . ' must contain only provider-safe identifier characters and be 128 characters or fewer.';
            }
            return null;
        }

        if (isset(self::UNIT_KEYS[$key])) {
            if (!is_array($value)) return $key . ' must be a JSON object keyed by placement.';
            if (count($value) > self::MAX_PLACEMENTS) return $key . ' cannot contain more than ' . self::MAX_PLACEMENTS . ' placements.';

            foreach ($value as $placement => $unit) {
                if (!is_string($placement) || !preg_match('/^[A-Za-z0-9_.:-]{1,' . self::PLACEMENT_MAX_LENGTH . '}$/', $placement)) {
                    return $key . ' contains an invalid placement name.';
                }
                if (!self::isValidUnitValue($unit)) {
                    return $key . '[' . $placement . '] must be a bounded string or JSON object.';
                }
            }
        }

        return null;
    }

    /**
     * Public, provider-neutral configuration consumed by website/app clients.
     * The legacy flat keys remain in the response for compatibility.
     */
    public static function publicConfig(): array
    {
        $systemEnabled = (bool) SettingService::get('advertisement_system_enabled', true);
        $networkEnabled = SettingService::adNetworkEnabled();
        $websiteEnabled = (bool) SettingService::get('website_ads_enabled', true);
        $appEnabled = (bool) SettingService::get('app_ads_enabled', true);
        $websitePublisher = (string) SettingService::get('website_publisher_id', '');
        $appPublisher = (string) SettingService::get('app_publisher_id', '');
        $websiteUnits = self::asArray(SettingService::get('website_ad_units', []));
        $appUnits = self::asArray(SettingService::get('app_ad_units', []));

        return [
            'website' => [
                'enabled' => $systemEnabled && $networkEnabled && $websiteEnabled,
                'publisher_id' => $websitePublisher,
                'ad_units' => $websiteUnits,
                'configured' => $systemEnabled && $networkEnabled && $websiteEnabled && $websitePublisher !== '' && $websiteUnits !== [],
            ],
            'app' => [
                'enabled' => $systemEnabled && $networkEnabled && $appEnabled,
                'publisher_id' => $appPublisher,
                'ad_units' => $appUnits,
                'configured' => $systemEnabled && $networkEnabled && $appEnabled && $appPublisher !== '' && $appUnits !== [],
            ],
        ];
    }

    private static function isValidUnitValue(mixed $value): bool
    {
        if (is_string($value)) return strlen($value) <= self::UNIT_MAX_LENGTH;
        if (!is_array($value)) return is_int($value) || is_float($value) || is_bool($value) || $value === null;
        if (count($value) > 32) return false;

        foreach ($value as $nestedKey => $nestedValue) {
            if (!is_string($nestedKey) || strlen($nestedKey) > self::PLACEMENT_MAX_LENGTH || !preg_match('/^[A-Za-z0-9_.:-]+$/', $nestedKey)) return false;
            if (is_array($nestedValue)) {
                if (!self::isValidUnitValue($nestedValue)) return false;
            } elseif (is_string($nestedValue)) {
                if (strlen($nestedValue) > self::UNIT_MAX_LENGTH) return false;
            } elseif (!is_int($nestedValue) && !is_float($nestedValue) && !is_bool($nestedValue) && $nestedValue !== null) {
                return false;
            }
        }
        return true;
    }

    private static function asArray(mixed $value): array
    {
        return is_array($value) ? $value : [];
    }
}
