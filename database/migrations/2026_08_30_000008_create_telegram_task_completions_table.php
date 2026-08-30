<?php

use Nemesis\Database\Migration;
use Nemesis\Core\Database;

class CreateTelegramTaskCompletionsTable extends Migration {
    public function up() {
        Database::connect()->exec("CREATE TABLE IF NOT EXISTS telegram_task_completions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            task_id INT NOT NULL,
            verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            reward DECIMAL(10,4) NOT NULL DEFAULT 0.0000,
            UNIQUE KEY uq_ttc_user_task (user_id, task_id)
        ) ENGINE=INNODB;");
    }

    public function down() {
        Database::connect()->exec("DROP TABLE IF EXISTS telegram_task_completions;");
    }
}
