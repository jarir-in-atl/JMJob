<?php
declare(strict_types=1);

/**
 * migration_runner.php
 *
 * Idempotent migration runner. It can be called after each deployment from
 * deploy.sh or GitHub Actions; only unapplied migrations are executed.
 *
 * The runner is intentionally simple and idempotent. Keep or remove this
 * public helper according to the hosting deployment workflow.
 *
 * Usage:
 *   - Visit https://yourdomain.com/migration_runner.php, OR
 *   - curl https://yourdomain.com/migration_runner.php
 */

error_reporting(E_ALL);
ini_set('display_errors', PHP_SAPI === 'cli' ? '1' : '0');

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

// Load the server-side .env before booting the application. The deployment
// scripts exclude .env from FTP uploads, so production keeps its private copy.
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

chdir($projectRoot);

require $projectRoot . '/vendor/autoload.php';

use Nemesis\Core\Config;
use Nemesis\Core\Database;
use Nemesis\Database\MigrationManager;

Config::load($projectRoot);
$config = require $projectRoot . '/config/config.php';
Database::connect($config['database']);

header('Content-Type: text/plain; charset=utf-8');

echo "============================================================\n";
echo "  JMJob — Migration Runner\n";
echo "============================================================\n\n";
echo "Project root:  $projectRoot\n";
echo "DB driver:     " . Database::getDriverName() . "\n";
echo "Timestamp:     " . date('Y-m-d H:i:s T') . "\n\n";

// Web calls remain a simple idempotent migration call. CLI callers may use
// the maintenance actions explicitly.
$action = PHP_SAPI === 'cli'
    ? ($_GET['action'] ?? $_POST['action'] ?? 'migrate')
    : 'migrate';

if (PHP_SAPI === 'cli' && isset($_GET['rollback']) && $_GET['rollback'] === '1') {
    $action = 'rollback';
}

$migrationsDir = $projectRoot . '/database/migrations';
$manager = new MigrationManager($migrationsDir);

try {
    switch ($action) {
        case 'migrate':
            echo "▶ Running migrations...\n\n";
            $manager->migrate();

            if (PHP_SAPI === 'cli' && isset($_GET['seed_categories']) && $_GET['seed_categories'] === '1') {
                echo "\n▶ Running SeedCategoriesFromDataCommand...\n\n";
                $cmd = new \App\Console\Commands\SeedCategoriesFromDataCommand();
                $cmd->handle();
            }

            if (PHP_SAPI === 'cli' && isset($_GET['seed']) && $_GET['seed'] === '1') {
                echo "\n▶ Running EarnAppSeeder...\n\n";
                require_once $projectRoot . '/database/seeders/EarnAppSeeder.php';
                $seeder = new \EarnAppSeeder();
                $seeder->run();
            }
            break;
        case 'seed_categories':
            echo "▶ Running SeedCategoriesFromDataCommand...\n\n";
            $cmd = new \App\Console\Commands\SeedCategoriesFromDataCommand();
            $cmd->handle();
            break;
        case 'seed':
            echo "▶ Running EarnAppSeeder...\n\n";
            require_once $projectRoot . '/database/seeders/EarnAppSeeder.php';
            $seeder = new \EarnAppSeeder();
            $seeder->run();
            break;
        case 'rollback':
            echo "◀ Rolling back last batch...\n\n";
            $manager->rollback();
            break;
        case 'status':
            echo "ℹ Migration status:\n\n";
            // Walk the migrations dir and print applied + pending. The
            // migration manager keeps this helper protected, so read the
            // tracking table here instead of calling it from global scope.
            $appliedStmt = Database::connect()->query('SELECT migration FROM migrations');
            $applied = $appliedStmt->fetchAll(\PDO::FETCH_COLUMN);
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
    if (PHP_SAPI !== 'cli') {
        http_response_code(500);
    }
    echo "\n❌ Migration failed: " . $e->getMessage() . "\n";
    echo "  in " . $e->getFile() . ":" . $e->getLine() . "\n";
    exit(1);
}

echo "\n✅ Done.\n";
echo "\nThe migration runner is idempotent and may be called again after future deployments.\n";
