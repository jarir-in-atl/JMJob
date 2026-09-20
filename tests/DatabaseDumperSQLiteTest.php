<?php
declare(strict_types=1);

/**
 * Verifies that the database backup command works with the disposable SQLite
 * database used by the marketplace gates and that its output can be restored.
 */

$databasePath = (string) (getenv('JOB_MARKETPLACE_TEST_DB') ?: '');
if ($databasePath === '' || !str_starts_with($databasePath, '/tmp/') || !str_ends_with($databasePath, '.sqlite')) {
    fwrite(STDERR, "Refusing to run: JOB_MARKETPLACE_TEST_DB must be a /tmp/*.sqlite path.\n");
    exit(2);
}

putenv('DB_DRIVER=sqlite');
putenv('DB_DATABASE=' . $databasePath);

require_once __DIR__ . '/../vendor/autoload.php';

use Nemesis\Core\Config;
use Nemesis\Core\Database;
use Nemesis\Database\DatabaseDumper;
use Nemesis\Database\DatabaseRestorer;

Config::load(dirname(__DIR__));
$config = require dirname(__DIR__) . '/config/config.php';
Database::connect($config['database']);

$suffix = bin2hex(random_bytes(4));
$dumpPath = '/tmp/jmjob-database-dump-' . $suffix . '.sql';
$restoredPath = '/tmp/jmjob-database-restore-' . $suffix . '.sqlite';

try {
    $bytes = (new DatabaseDumper())->dump($dumpPath);
    if ($bytes === false || $bytes < 1) {
        throw new RuntimeException('Database dumper did not write a backup file.');
    }

    $sql = file_get_contents($dumpPath);
    if ($sql === false) {
        throw new RuntimeException('Database backup file could not be read.');
    }

    foreach (['PRAGMA foreign_keys=OFF;', 'DROP TABLE IF EXISTS "jobs";', 'CREATE TABLE', 'INSERT INTO "migrations"'] as $fragment) {
        if (!str_contains($sql, $fragment)) {
            throw new RuntimeException("Database backup is missing expected SQLite fragment: {$fragment}");
        }
    }

    if (str_contains($sql, 'SET FOREIGN_KEY_CHECKS=')) {
        throw new RuntimeException('SQLite backup unexpectedly contains MySQL foreign-key syntax.');
    }

    $restoreConfig = $config['database'];
    $restoreConfig['database'] = $restoredPath;
    Database::connect($restoreConfig);
    if (!(new DatabaseRestorer())->restore($dumpPath)) {
        throw new RuntimeException('Database restorer did not report success.');
    }
    $restored = Database::connect();

    foreach (['jobs', 'migrations', 'queue_jobs'] as $table) {
        $check = $restored->prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?");
        $check->execute([$table]);
        if (!$check->fetchColumn()) {
            throw new RuntimeException("Restored SQLite backup is missing table {$table}.");
        }
    }

    $migrationCount = (int) $restored->query('SELECT COUNT(*) FROM migrations')->fetchColumn();
    if ($migrationCount < 1) {
        throw new RuntimeException('Restored SQLite backup did not preserve migration records.');
    }

    echo "SQLite database dump and restore checks passed.\n";
} catch (Throwable $e) {
    fwrite(STDERR, "SQLite database dump checks failed: {$e->getMessage()}\n");
    exit(1);
} finally {
    @unlink($dumpPath);
    @unlink($restoredPath);
    @unlink($restoredPath . '-shm');
    @unlink($restoredPath . '-wal');
}
