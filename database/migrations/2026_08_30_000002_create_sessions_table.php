<?php

use Nemesis\Database\Migration;
use Nemesis\Core\Database;

class CreateSessionsTable extends Migration {
    public function up() {
        $db = Database::connect();
        if (Database::getDriverName() === 'sqlite') {
            $db->exec("CREATE TABLE IF NOT EXISTS sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                token TEXT NOT NULL UNIQUE,
                ip_address TEXT NULL,
                user_agent TEXT NULL,
                expires_at TEXT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )");
            $db->exec('CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions (user_id)');
            $db->exec('CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions (token)');
            return;
        }
        $db->exec("CREATE TABLE IF NOT EXISTS sessions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            token VARCHAR(64) NOT NULL UNIQUE,
            ip_address VARCHAR(45) NULL,
            user_agent VARCHAR(255) NULL,
            expires_at TIMESTAMP NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_sessions_user (user_id),
            INDEX idx_sessions_token (token)
        ) ENGINE=INNODB;");
    }

    public function down() {
        Database::connect()->exec("DROP TABLE IF EXISTS sessions;");
    }
}
