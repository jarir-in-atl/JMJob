<?php

use Nemesis\Database\Migration;
use Nemesis\Core\Database;

class CreateWebTasksTable extends Migration {
    public function up() {
        Database::connect()->exec("CREATE TABLE IF NOT EXISTS web_tasks (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT NULL,
            target_url VARCHAR(500) NOT NULL,
            reward DECIMAL(10,4) NOT NULL DEFAULT 0.0500,
            duration_seconds INT NOT NULL DEFAULT 30,
            verification_type VARCHAR(20) NOT NULL DEFAULT 'duration',
            active TINYINT(1) NOT NULL DEFAULT 1,
            daily_limit_per_user INT NOT NULL DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NULL
        ) ENGINE=INNODB;");
    }

    public function down() {
        Database::connect()->exec("DROP TABLE IF EXISTS web_tasks;");
    }
}
