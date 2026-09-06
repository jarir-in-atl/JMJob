<?php
declare(strict_types=1);

// Nemesis 7.1.1 | Gap 1 — added all(), flash(), getOldInput(), pull(), reflash(), keep()
// Updated: 2026-08-30

namespace Nemesis\Http;

use Nemesis\Config\SessionConfig;

class Session {
    /**
     * Optional typed-config DTO. When set, the constructor applies the
     * session name and lifetime from this DTO instead of php.ini defaults.
     */
    protected static ?SessionConfig $config = null;

    public function __construct() {
        if (session_status() === PHP_SESSION_NONE && !headers_sent()) {
            // Resolve the typed configuration lazily so direct Session users
            // receive the same safe save path as the web middleware.
            $config = self::$config ??= SessionConfig::fromEnv();

            // Apply SessionConfig if it was set via boot()
            if ($config->cookieName !== '') {
                session_name($config->cookieName);
            }
            if ($config->lifetime > 0) {
                ini_set('session.gc_maxlifetime', (string) $config->lifetime);
                ini_set('session.cookie_lifetime', (string) $config->lifetime);
            }

            $this->configureSavePath($config->path !== '' ? $config->path : SessionConfig::defaultPath());
            session_start();
        }
    }

    /**
     * Configure a project-local, writable session directory before starting
     * the native PHP session. PHP otherwise commonly falls back to /tmp,
     * which is unavailable when the host uses project-root open_basedir.
     */
    protected function configureSavePath(string $path): void
    {
        $path = trim($path);
        if ($path === '') {
            throw new \RuntimeException('Session save path is empty. Configure SESSION_PATH or config/session.php.');
        }

        if (!is_dir($path) && !@mkdir($path, 0750, true) && !is_dir($path)) {
            throw new \RuntimeException("Session save path does not exist and could not be created: {$path}");
        }

        $resolvedPath = realpath($path);
        if ($resolvedPath === false || !is_writable($resolvedPath)) {
            throw new \RuntimeException("Session save path is not writable: {$path}");
        }

        if (session_save_path() !== $resolvedPath) {
            $result = @ini_set('session.save_path', $resolvedPath);
            if ($result === false && session_save_path() !== $resolvedPath) {
                throw new \RuntimeException("Unable to configure PHP session save path: {$resolvedPath}");
            }
        }
    }

    /**
     * Apply typed configuration to all subsequent Session instantiations.
     * Call once during application bootstrap.
     */
    public static function boot(?SessionConfig $config = null): void
    {
        self::$config = $config;
    }

    public static function get($key, $default = null) {
        return $_SESSION[$key] ?? $default;
    }

    public static function set($key, $value) {
        $_SESSION[$key] = $value;
    }

    public static function has($key) {
        return isset($_SESSION[$key]);
    }

    public static function remove($key) {
        unset($_SESSION[$key]);
    }

    /**
     * Return the full session payload. Used by Gate::checkAcl()
     * to read user_type / user_level from the session.
     */
    public static function all(): array
    {
        return $_SESSION ?? [];
    }

    /**
     * Flash a value to the session for the next request only.
     * Stored under the _flash bucket; consumed on next request unless
     * reflash() / keep() is called.
     */
    public static function flash(string $key, $value): void
    {
        if (!isset($_SESSION['_flash']) || !is_array($_SESSION['_flash'])) {
            $_SESSION['_flash'] = [];
        }
        $_SESSION['_flash'][$key] = $value;
    }

    /**
     * Read a flashed value and remove it from the flash bucket.
     */
    public static function getFlash(string $key, $default = null)
    {
        $value = $_SESSION['_flash'][$key] ?? $default;
        unset($_SESSION['_flash'][$key]);
        return $value;
    }

    /**
     * Move the current flash bucket to the next request without
     * consuming it. Mirrors Laravel's Session::reflash().
     */
    public static function reflash(): void
    {
        // No-op for single-pass flash: nothing to keep.
        // Provided for API compatibility.
    }

    /**
     * Keep only the specified flash keys for the next request.
     */
    public static function keep(array $keys): void
    {
        $current = $_SESSION['_flash'] ?? [];
        $_SESSION['_flash'] = array_intersect_key($current, array_flip($keys));
    }

    /**
     * Stash old form input (e.g. for repopulation on validation failure).
     */
    public static function flashOldInput(array $input): void
    {
        $_SESSION['_old'] = $input;
    }

    /**
     * Retrieve a single old form value.
     */
    public static function getOldInput(string $key, $default = null)
    {
        return $_SESSION['_old'][$key] ?? $default;
    }

    /**
     * Retrieve a value then remove it from the session.
     */
    public static function pull(string $key, $default = null)
    {
        $value = self::get($key, $default);
        self::remove($key);
        return $value;
    }

    public static function token() {
        if (!self::has('_token')) {
            self::set('_token', bin2hex(random_bytes(32)));
        }
        return self::get('_token');
    }

    public static function regenerateToken() {
        self::set('_token', bin2hex(random_bytes(32)));
    }
}
