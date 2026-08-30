<?php
declare(strict_types=1);

/**
 * migration_runner.php
 *
 * One-time (and idempotent) migration runner. Drop this at the web root
 * (e.g. /public_html/migration_runner.php) and visit
 *   https://yourdomain.com/migration_runner.php
 * to apply all pending migrations.
 *
 * SECURITY: Once migrations are done, DELETE this file from the server
 * (or rename it). Anyone with the URL can re-run this — it does not
 * modify data, but it does talk to the database.
 *
 * After running, this file can be safely deleted from the server.
 *
 * Usage:
 *   - Visit https://yourdomain.com/migration_runner.php in a browser, OR
 *   - curl -X POST https://yourdomain.com/migration_runner.php
 *
 * Optional: provide ?token=YOUR_SECRET in the URL to require auth.
 *           Set the secret via the MIGRATION_TOKEN environment variable.
 */

error_reporting(E_ALL);
ini_set('display_errors', '1');

$ROOT = __DIR__;

// Detect the project root. If this file is in /public_html, the
// framework is one level up. We try a few locations.
$candidateRoots = [
    $ROOT,                                  // at project root
    $ROOT . '/public',                      // at public/
    dirname($ROOT),                         // one level up
    dirname($ROOT) . '/public',             // at sibling of public/
];

$projectRoot = null;
foreach ($candidateRoots as $c) {
    if (is_file($c . '/vendor/autoload.php') && is_dir($c . '/database/migrations')) {
        $projectRoot = $c;
        break;
    }
}

if ($projectRoot === null) {
    http_response_code(500);
    die("❌ Could not find project root. Make sure vendor/autoload.php and database/migrations exist.");
}

// ---------------------------------------------------------------------------
// Optional token gate
// ---------------------------------------------------------------------------
$requiredToken = getenv('MIGRATION_TOKEN') ?: '';
if ($requiredToken !== '') {
    $provided = $_GET['token'] ?? $_POST['token'] ?? '';
    if (!hash_equals($requiredToken, (string) $provided)) {
        http_response_code(403);
        die("❌ Forbidden. Provide ?token=YOUR_SECRET to run migrations.");
    }
}

chdir($projectRoot);

require $projectRoot . '/vendor/autoload.php';

use Nemesis\Core\Config;
use Nemesis\Core\Database;
use Nemesis\Database\MigrationManager;

// ---------------------------------------------------------------------------
// Load .env (best-effort). If the framework already has Config loaded, this
// is a no-op.
// ---------------------------------------------------------------------------
if (is_file($projectRoot . '/.env')) {
    foreach (file($projectRoot . '/.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        if (str_starts_with($line, '#')) continue;
        if (!str_contains($line, '=')) continue;
        [$key, $value] = explode('=', $line, 2);
        $key = trim($key); $value = trim($value, " \t\"'");
        if (getenv($key) === false || getenv($key) === '') {
            putenv("$key=$value");
            $_ENV[$key] = $value;
            $_SERVER[$key] = $value;
        }
    }
}

Config::load($projectRoot);
$config = require $projectRoot . '/config/config.php';
Database::connect($config['database']);

header('Content-Type: text/plain; charset=utf-8');

echo "============================================================\n";
echo "  JMJob / EarnApp — Migration Runner\n";
echo "============================================================\n\n";
echo "Project root:  $projectRoot\n";
echo "DB driver:     " . Database::getDriverName() . "\n";
echo "Timestamp:     " . date('Y-m-d H:i:s T') . "\n\n";

$action = $_GET['action'] ?? $_POST['action'] ?? 'migrate';

// Also support ?rollback=1 for safety
if (isset($_GET['rollback']) && $_GET['rollback'] === '1') {
    $action = 'rollback';
}

$migrationsDir = $projectRoot . '/database/migrations';
$manager = new MigrationManager($migrationsDir);

try {
    switch ($action) {
        case 'migrate':
            echo "▶ Running migrations...\n\n";
            $manager->migrate();
            break;
        case 'rollback':
            echo "◀ Rolling back last batch...\n\n";
            $manager->rollback();
            break;
        case 'status':
            echo "ℹ Migration status:\n\n";
            // Walk the migrations dir and print applied + pending
            $applied = method_exists($manager, 'getAppliedMigrations')
                ? $manager->getAppliedMigrations()
                : [];
            echo "Applied migrations: " . count($applied) . "\n";
            $files = scandir($migrationsDir);
            $pending = 0;
            foreach ($files as $f) {
                if ($f === '.' || $f === '..') continue;
                if (!in_array($f, $applied, true)) {
                    $pending++;
                    echo "  ⏳ pending: $f\n";
                } else {
                    echo "  ✅ applied: $f\n";
                }
            }
            echo "\nPending: $pending\n";
            break;
        default:
            die("❌ Unknown action: " . htmlspecialchars($action));
    }
} catch (\Throwable $e) {
    echo "\n❌ Migration failed: " . $e->getMessage() . "\n";
    echo "  in " . $e->getFile() . ":" . $e->getLine() . "\n";
    exit(1);
}

echo "\n✅ Done.\n";
echo "\nIMPORTANT: For security, DELETE this file from the server now:\n";
echo "  rm " . realpath(__FILE__) . "\n";
echo "\nOr keep it but set MIGRATION_TOKEN in .env to require ?token=...\n";
