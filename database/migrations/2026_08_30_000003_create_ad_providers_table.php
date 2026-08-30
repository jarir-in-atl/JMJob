<?php

use Nemesis\Database\Migration;
use Nemesis\Core\Database;

class CreateAdProvidersTable extends Migration {
    public function up() {
        Database::connect()->exec("CREATE TABLE IF NOT EXISTS ad_providers (
            id INT AUTO_INCREMENT PRIMARY KEY,
            slug VARCHAR(20) NOT NULL UNIQUE,
            name VARCHAR(50) NOT NULL,
            block_id VARCHAR(50) NULL,
            enabled TINYINT(1) NOT NULL DEFAULT 1,
            weight INT NOT NULL DEFAULT 100,
            reward_per_view DECIMAL(10,4) NOT NULL DEFAULT 0.0050,
            min_duration_seconds INT NOT NULL DEFAULT 12,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NULL
        ) ENGINE=INNODB;");
    }

    public function down() {
        Database::connect()->exec("DROP TABLE IF EXISTS ad_providers;");
    }
}
