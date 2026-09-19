<?php

use Nemesis\Database\Migration;
use Nemesis\Core\Database;

class CreateUsersTable extends Migration {
    public function up() {
        if (Database::getDriverName() === 'sqlite') {
            Database::connect()->exec("CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                email TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )");
            return;
        }

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
