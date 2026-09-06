<?php

use Nemesis\Database\Migration;
use Nemesis\Core\Database;

/** Stores short-lived, hashed registration OTP attempts before user creation. */
class CreateRegistrationOtpsTable extends Migration
{
    public function up(): void
    {
        if (Database::getDriverName() === 'sqlite') {
            Database::connect()->exec("CREATE TABLE IF NOT EXISTS registration_otps (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                referral_code VARCHAR(20) NULL,
                otp_hash VARCHAR(255) NOT NULL,
                expires_at DATETIME NOT NULL,
                attempts INTEGER NOT NULL DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )");
            return;
        }

        Database::connect()->exec("CREATE TABLE IF NOT EXISTS registration_otps (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            referral_code VARCHAR(20) NULL,
            otp_hash VARCHAR(255) NOT NULL,
            expires_at DATETIME NOT NULL,
            attempts TINYINT UNSIGNED NOT NULL DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_registration_otps_expires (expires_at)
        ) ENGINE=INNODB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    }

    public function down(): void
    {
        Database::connect()->exec('DROP TABLE IF EXISTS registration_otps');
    }
}
