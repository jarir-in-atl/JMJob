<?php

use Nemesis\Database\Migration;
use Nemesis\Core\Database;

class CreateTelegramTasksTable extends Migration {
    public function up() {
        Database::connect()->exec("CREATE TABLE IF NOT EXISTS telegram_tasks (
            id INT AUTO_INCREMENT PRIMARY KEY,
            channel_username VARCHAR(100) NOT NULL,
            channel_name VARCHAR(255) NOT NULL,
            description TEXT NULL,
            reward DECIMAL(10,4) NOT NULL DEFAULT 0.0200,
            active TINYINT(1) NOT NULL DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NULL
        ) ENGINE=INNODB;");
    }

    public function down() {
        Database::connect()->exec("DROP TABLE IF EXISTS telegram_tasks;");
    }
}
