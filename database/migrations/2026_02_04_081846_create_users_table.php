<?php

use Nemesis\Database\Migration;
use Nemesis\Core\Database;

class CreateUsersTable extends Migration {
    public function up() {
        Database::connect()->exec("CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) NOT NULL UNIQUE,
            email VARCHAR(100) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )");
    }

    public function down() {
        Database::connect()->exec("DROP TABLE IF EXISTS users;");
    }
}
