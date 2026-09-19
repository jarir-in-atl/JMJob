<?php

use Nemesis\Database\Migration;
use Nemesis\Core\Database;

/**
 * Separates the legacy database queue table from marketplace job listings.
 *
 * Older installations created the queue as `jobs`, which prevented the later
 * marketplace migration from creating its own `jobs` table. This migration
 * preserves queue rows, creates the intended table names, and is safe to run
 * after a fresh install where the earlier migrations are already corrected.
 */
class ResolveJobsTableCollision extends Migration
{
    public function up()
    {
        $db = Database::connect();
        $driver = Database::getDriverName();
        $hasTable = function (string $table) use ($db, $driver): bool {
            if ($driver === 'sqlite') {
                $stmt = $db->prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = :table LIMIT 1");
                $stmt->execute(['table' => $table]);
                return (bool) $stmt->fetchColumn();
            }
            if ($driver === 'pgsql') {
                $stmt = $db->prepare("SELECT 1 FROM information_schema.tables WHERE table_schema = current_schema() AND table_name = :table LIMIT 1");
                $stmt->execute(['table' => $table]);
                return (bool) $stmt->fetchColumn();
            }
            $stmt = $db->prepare("SELECT 1 FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = :table LIMIT 1");
            $stmt->execute(['table' => $table]);
            return (bool) $stmt->fetchColumn();
        };
        $columns = function (string $table) use ($db, $driver): array {
            if ($driver === 'sqlite') {
                return array_column($db->query("PRAGMA table_info(\"{$table}\")")->fetchAll(), 'name');
            }
            if ($driver === 'pgsql') {
                $stmt = $db->prepare("SELECT column_name FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = :table");
                $stmt->execute(['table' => $table]);
                return $stmt->fetchAll(PDO::FETCH_COLUMN);
            }
            $stmt = $db->prepare("SELECT COLUMN_NAME FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = :table");
            $stmt->execute(['table' => $table]);
            return $stmt->fetchAll(PDO::FETCH_COLUMN);
        };
        $rename = function (string $from, string $to) use ($db, $driver): void {
            if ($driver === 'sqlite') {
                $db->exec("ALTER TABLE \"{$from}\" RENAME TO \"{$to}\"");
                return;
            }
            $db->exec("RENAME TABLE {$from} TO {$to}");
        };

        $jobsExists = $hasTable('jobs');
        $jobsColumns = $jobsExists ? $columns('jobs') : [];
        $legacyQueue = $jobsExists && in_array('payload', $jobsColumns, true) && !in_array('poster_id', $jobsColumns, true);

        if ($legacyQueue && !$hasTable('queue_jobs')) {
            $rename('jobs', 'queue_jobs');
            $jobsExists = false;
        } elseif ($legacyQueue && $hasTable('queue_jobs')) {
            // Preserve the old rows separately when a prior partial repair
            // already created queue_jobs; never discard queue payloads.
            $legacyName = 'queue_jobs_legacy';
            if (!$hasTable($legacyName)) {
                $rename('jobs', $legacyName);
            }
            $jobsExists = false;
        }

        if (!$hasTable('queue_jobs')) {
            $queueSql = match ($driver) {
                'sqlite' => "CREATE TABLE queue_jobs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    queue TEXT NOT NULL DEFAULT 'default',
                    payload TEXT NOT NULL,
                    attempts INTEGER NOT NULL DEFAULT 0,
                    reserved_at INTEGER NULL,
                    available_at INTEGER NOT NULL,
                    created_at INTEGER NOT NULL
                )",
                'pgsql' => "CREATE TABLE queue_jobs (
                    id BIGSERIAL PRIMARY KEY,
                    queue VARCHAR(191) NOT NULL DEFAULT 'default',
                    payload TEXT NOT NULL,
                    attempts INTEGER NOT NULL DEFAULT 0,
                    reserved_at INTEGER NULL,
                    available_at INTEGER NOT NULL,
                    created_at INTEGER NOT NULL
                )",
                default => "CREATE TABLE queue_jobs (
                    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                    queue VARCHAR(191) NOT NULL DEFAULT 'default',
                    payload LONGTEXT NOT NULL,
                    attempts TINYINT UNSIGNED NOT NULL DEFAULT 0,
                    reserved_at INT UNSIGNED NULL,
                    available_at INT UNSIGNED NOT NULL,
                    created_at INT UNSIGNED NOT NULL
                ) ENGINE=INNODB",
            };
            $db->exec($queueSql);
        }

        $queueColumns = $columns('queue_jobs');
        if (!in_array('queue', $queueColumns, true)) {
            $db->exec("ALTER TABLE queue_jobs ADD COLUMN queue VARCHAR(191) NOT NULL DEFAULT 'default'");
        }

        if (!$hasTable('jobs')) {
            if ($driver === 'sqlite') {
                $db->exec("CREATE TABLE jobs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    poster_id INTEGER NOT NULL,
                    category_id INTEGER NULL,
                    title TEXT NOT NULL,
                    slug TEXT NOT NULL,
                    description TEXT NOT NULL,
                    requirements TEXT NULL,
                    budget NUMERIC NOT NULL,
                    currency TEXT NOT NULL DEFAULT 'BDT',
                    deadline_at TEXT NULL,
                    bidding_closes_at TEXT NULL,
                    status TEXT NOT NULL DEFAULT 'open',
                    assigned_bid_id INTEGER NULL,
                    assigned_worker_id INTEGER NULL,
                    bid_count INTEGER NOT NULL DEFAULT 0,
                    view_count INTEGER NOT NULL DEFAULT 0,
                    is_featured INTEGER NOT NULL DEFAULT 0,
                    attachment_path TEXT NULL,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                    updated_at TEXT NULL
                )");
            } else {
                $db->exec("CREATE TABLE jobs (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    poster_id INT NOT NULL,
                    category_id INT NULL,
                    title VARCHAR(160) NOT NULL,
                    slug VARCHAR(180) NOT NULL,
                    description TEXT NOT NULL,
                    requirements TEXT NULL,
                    budget DECIMAL(12,4) NOT NULL,
                    currency VARCHAR(8) NOT NULL DEFAULT 'BDT',
                    deadline_at TIMESTAMP NULL,
                    bidding_closes_at TIMESTAMP NULL,
                    status VARCHAR(20) NOT NULL DEFAULT 'open',
                    assigned_bid_id INT NULL,
                    assigned_worker_id INT NULL,
                    bid_count INT NOT NULL DEFAULT 0,
                    view_count INT NOT NULL DEFAULT 0,
                    is_featured TINYINT(1) NOT NULL DEFAULT 0,
                    attachment_path VARCHAR(255) NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP NULL
                ) ENGINE=INNODB");
            }
        }

        // The old collision could cause the marketplace migration and later
        // ALTER migrations to be recorded as applied against the queue table.
        // Ensure the repaired marketplace table has the complete current
        // contract even when this is an upgrade rather than a fresh install.
        $jobColumns = $columns('jobs');
        $jobDefinitions = [
            'subcategory_id'       => $driver === 'mysql' ? 'INT NULL' : 'INTEGER NULL',
            'worker_count'         => $driver === 'mysql' ? 'INT NOT NULL DEFAULT 1' : 'INTEGER NOT NULL DEFAULT 1',
            'cost_per_worker'      => $driver === 'mysql' ? 'DECIMAL(12,4) NOT NULL DEFAULT 0.0000' : 'NUMERIC NOT NULL DEFAULT 0.0000',
            'system_fee_percent'   => $driver === 'mysql' ? 'DECIMAL(5,2) NOT NULL DEFAULT 30.00' : 'NUMERIC NOT NULL DEFAULT 30.00',
            'system_fee_amount'    => $driver === 'mysql' ? 'DECIMAL(12,4) NOT NULL DEFAULT 0.0000' : 'NUMERIC NOT NULL DEFAULT 0.0000',
            'total_payable_amount' => $driver === 'mysql' ? 'DECIMAL(12,4) NOT NULL DEFAULT 0.0000' : 'NUMERIC NOT NULL DEFAULT 0.0000',
            'proof_requirements'   => $driver === 'mysql' ? 'JSON NULL' : 'TEXT NULL',
            'decline_reason'       => 'TEXT NULL',
            'subtitle'             => $driver === 'mysql' ? 'VARCHAR(255) NULL' : 'TEXT NULL',
            'customer_name'        => $driver === 'mysql' ? 'VARCHAR(120) NULL' : 'TEXT NULL',
            'customer_phone'       => $driver === 'mysql' ? 'VARCHAR(32) NULL' : 'TEXT NULL',
            'customer_email'       => $driver === 'mysql' ? 'VARCHAR(190) NULL' : 'TEXT NULL',
            'admin_notes'          => 'TEXT NULL',
            'created_by_admin_id'  => $driver === 'mysql' ? 'INT NULL' : 'INTEGER NULL',
        ];
        foreach ($jobDefinitions as $column => $definition) {
            if (!in_array($column, $jobColumns, true)) {
                $db->exec("ALTER TABLE jobs ADD COLUMN {$column} {$definition}");
            }
        }
    }

    public function down()
    {
        // Do not reverse this repair automatically: queue rows may have been
        // written after deployment and should not be moved back into `jobs`.
    }
}
