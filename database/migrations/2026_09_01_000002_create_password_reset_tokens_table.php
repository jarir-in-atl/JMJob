<?php

use Nemesis\Database\Migration;
use Nemesis\Core\Database;

class CreatePasswordResetTokensTable extends Migration {
    public function up() {
        $db = Database::connect();
        $db->exec("CREATE TABLE IF NOT EXISTS `password_reset_tokens` (
            `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            `user_id` INT UNSIGNED NOT NULL,
            `token` VARCHAR(255) NOT NULL,
            `expires_at` DATETIME NOT NULL,
            `created_at` DATETIME NOT NULL,
            INDEX `idx_user_id` (`user_id`),
            INDEX `idx_expires_at` (`expires_at`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    }

    public function down() {
        $db = Database::connect();
        try { $db->exec("DROP TABLE IF EXISTS `password_reset_tokens`"); } catch (Throwable $e) {}
    }
}
