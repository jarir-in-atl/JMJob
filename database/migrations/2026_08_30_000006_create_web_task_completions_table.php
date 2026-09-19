<?php

use Nemesis\Database\Migration;
use Nemesis\Core\Database;

class CreateWebTaskCompletionsTable extends Migration {
    public function up() {
        $db = Database::connect();
        if (Database::getDriverName() === 'sqlite') {
            $db->exec("CREATE TABLE IF NOT EXISTS web_task_completions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                task_id INTEGER NOT NULL,
                started_at TEXT DEFAULT CURRENT_TIMESTAMP,
                completed_at TEXT NULL,
                claimed_at TEXT NULL,
                reward NUMERIC NOT NULL DEFAULT 0.0000,
                UNIQUE (user_id, task_id, started_at)
            )");
            $db->exec('CREATE INDEX IF NOT EXISTS idx_wtc_user_task ON web_task_completions (user_id, task_id)');
            return;
        }
        $db->exec("CREATE TABLE IF NOT EXISTS web_task_completions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            task_id INT NOT NULL,
            started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            completed_at TIMESTAMP NULL,
            claimed_at TIMESTAMP NULL,
            reward DECIMAL(10,4) NOT NULL DEFAULT 0.0000,
            INDEX idx_wtc_user_task (user_id, task_id),
            UNIQUE KEY uq_wtc_user_task_day (user_id, task_id, started_at)
        ) ENGINE=INNODB;");
    }

    public function down() {
        Database::connect()->exec("DROP TABLE IF EXISTS web_task_completions;");
    }
}
