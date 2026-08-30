<?php

use Nemesis\Database\Migration;
use Nemesis\Core\Database;

class CreateRbacTables extends Migration {
    public function up() {
        $db = Database::connect();
        
        $db->exec("CREATE TABLE IF NOT EXISTS roles (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(50) NOT NULL,
            slug VARCHAR(50) NOT NULL UNIQUE,
            description TEXT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )");

        $db->exec("CREATE TABLE IF NOT EXISTS permissions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(50) NOT NULL,
            slug VARCHAR(50) NOT NULL UNIQUE,
            description TEXT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )");

        $db->exec("CREATE TABLE IF NOT EXISTS role_permissions (
            role_id INT NOT NULL,
            permission_id INT NOT NULL,
            PRIMARY KEY (role_id, permission_id)
        )");

        $db->exec("CREATE TABLE IF NOT EXISTS user_roles (
            user_id INT NOT NULL,
            role_id INT NOT NULL,
            PRIMARY KEY (user_id, role_id)
        )");
    }

    public function down() {
        $db = Database::connect();
        $db->exec("SET FOREIGN_KEY_CHECKS=0;");
        $db->exec("DROP TABLE IF EXISTS user_roles;");
        $db->exec("DROP TABLE IF EXISTS role_permissions;");
        $db->exec("DROP TABLE IF EXISTS permissions;");
        $db->exec("DROP TABLE IF EXISTS roles;");
        $db->exec("SET FOREIGN_KEY_CHECKS=1;");
    }
}
