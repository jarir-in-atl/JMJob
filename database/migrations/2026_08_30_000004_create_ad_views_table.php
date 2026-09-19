<?php

use Nemesis\Database\Migration;
use Nemesis\Core\Database;

class CreateAdViewsTable extends Migration {
    public function up() {
        $db = Database::connect();
        if (Database::getDriverName() === 'sqlite') {
            $db->exec("CREATE TABLE IF NOT EXISTS ad_views (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                provider TEXT NOT NULL,
                reward NUMERIC NOT NULL DEFAULT 0.0000,
                started_at TEXT DEFAULT CURRENT_TIMESTAMP,
                completed_at TEXT NULL,
                ip_address TEXT NULL,
                user_agent TEXT NULL
            )");
            $db->exec('CREATE INDEX IF NOT EXISTS idx_ad_views_user ON ad_views (user_id)');
            $db->exec('CREATE INDEX IF NOT EXISTS idx_ad_views_user_day ON ad_views (user_id, started_at)');
            return;
        }
        $db->exec("CREATE TABLE IF NOT EXISTS ad_views (
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
