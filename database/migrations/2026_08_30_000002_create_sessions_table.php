<?php

use Nemesis\Database\Migration;
use Nemesis\Core\Database;

class CreateSessionsTable extends Migration {
    public function up() {
        Database::connect()->exec("CREATE TABLE IF NOT EXISTS sessions (
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
