<?php

use Nemesis\Database\Migration;
use Nemesis\Core\Database;

class CreateJobsTable extends Migration {
    public function up() {
        $driver = Database::getDriverName();
        $sql = match ($driver) {
            'sqlite' => "CREATE TABLE IF NOT EXISTS queue_jobs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                queue TEXT NOT NULL DEFAULT 'default',
                payload TEXT NOT NULL,
                attempts INTEGER NOT NULL DEFAULT 0,
                reserved_at INTEGER NULL,
                available_at INTEGER NOT NULL,
                created_at INTEGER NOT NULL
            )",
            'pgsql' => "CREATE TABLE IF NOT EXISTS queue_jobs (
                id BIGSERIAL PRIMARY KEY,
                queue VARCHAR(191) NOT NULL DEFAULT 'default',
                payload TEXT NOT NULL,
                attempts INTEGER NOT NULL DEFAULT 0,
                reserved_at INTEGER NULL,
                available_at INTEGER NOT NULL,
                created_at INTEGER NOT NULL
            )",
            default => "CREATE TABLE IF NOT EXISTS queue_jobs (
                id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                queue VARCHAR(191) NOT NULL DEFAULT 'default',
                payload LONGTEXT NOT NULL,
                attempts TINYINT UNSIGNED NOT NULL DEFAULT 0,
                reserved_at INT UNSIGNED NULL,
                available_at INT UNSIGNED NOT NULL,
                created_at INT UNSIGNED NOT NULL,
                INDEX idx_queue_jobs_reserved_at (reserved_at),
                INDEX idx_queue_jobs_available_at (available_at)
            ) ENGINE=INNODB;
            ",
        };
        Database::connect()->exec($sql);
    }

    public function down() {
        Database::connect()->exec("DROP TABLE IF EXISTS queue_jobs;");
    }
}
