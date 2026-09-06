<?php
declare(strict_types=1);

// Nemesis 4.0.0 | Phase 9 — Typed Config DTOs | Updated: 2026-04-03

namespace Nemesis\Config;

readonly class SessionConfig
{
    public function __construct(
        public string $driver,
        public int    $lifetime,
        public string $cookieName,
        public bool   $secure,
        public string $sameSite,
        public string $path = '',
    ) {}

    public static function fromEnv(): static
    {
        $defaultPath = self::defaultPath();

        $path = getenv('SESSION_PATH');
        if ($path === false || trim((string) $path) === '') {
            $path = function_exists('config')
                ? config('session.path', $defaultPath)
                : $defaultPath;
        }

        return new static(
            driver:     (string) (getenv('SESSION_DRIVER')  ?: 'file'),
            lifetime:   (int)    (getenv('SESSION_LIFETIME')?: 120),
            cookieName: (string) (getenv('SESSION_COOKIE')  ?: 'nemesis_session'),
            secure:     filter_var(getenv('SESSION_SECURE') ?: false, FILTER_VALIDATE_BOOLEAN),
            sameSite:   (string) (getenv('SESSION_SAME_SITE')?: 'lax'),
            path:       (string) $path,
        );
    }

    public static function defaultPath(): string
    {
        return function_exists('base_path')
            ? base_path('storage/session')
            : dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . 'storage' . DIRECTORY_SEPARATOR . 'session';
    }

    public static function required(): array
    {
        return [];
    }
}
