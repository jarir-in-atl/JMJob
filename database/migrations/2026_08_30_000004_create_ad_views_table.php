<?php

use Nemesis\Database\Migration;
use Nemesis\Core\Database;

class CreateAdViewsTable extends Migration {
    public function up() {
        Database::connect()->exec("CREATE TABLE IF NOT EXISTS ad_views (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            provider VARCHAR(20) NOT NULL,
            reward DECIMAL(10,4) NOT NULL DEFAULT 0.0000,
            started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            completed_at TIMESTAMP NULL,
            ip_address VARCHAR(45) NULL,
            user_agent VARCHAR(255) NULL,
            INDEX idx_ad_views_user (user_id),
            INDEX idx_ad_views_user_day (user_id, started_at)
        ) ENGINE=INNODB;");
    }

    public function down() {
        Database::connect()->exec("DROP TABLE IF EXISTS ad_views;");
    }
}
