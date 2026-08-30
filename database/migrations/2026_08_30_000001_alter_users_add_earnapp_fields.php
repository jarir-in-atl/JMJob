<?php

use Nemesis\Database\Migration;
use Nemesis\Core\Database;

class AlterUsersAddEarnappFields extends Migration {
    public function up() {
        $db = Database::connect();
        // Add earnapp-specific columns to the existing users table.
        $db->exec("ALTER TABLE users ADD COLUMN name VARCHAR(100) NULL AFTER email");
        $db->exec("ALTER TABLE users ADD COLUMN referral_code VARCHAR(20) NULL UNIQUE AFTER name");
        $db->exec("ALTER TABLE users ADD COLUMN referred_by INT NULL AFTER referral_code");
        $db->exec("ALTER TABLE users ADD COLUMN balance DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER referred_by");
        $db->exec("ALTER TABLE users ADD COLUMN lifetime_earned DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER balance");
        $db->exec("ALTER TABLE users ADD COLUMN today_earned DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER lifetime_earned");
        $db->exec("ALTER TABLE users ADD COLUMN ads_limit INT NOT NULL DEFAULT 50 AFTER today_earned");
        $db->exec("ALTER TABLE users ADD COLUMN today_ads INT NOT NULL DEFAULT 0 AFTER ads_limit");
        $db->exec("ALTER TABLE users ADD COLUMN last_ad_reset_at DATE NULL AFTER today_ads");
        $db->exec("ALTER TABLE users ADD COLUMN is_admin TINYINT(1) NOT NULL DEFAULT 0 AFTER last_ad_reset_at");
        $db->exec("ALTER TABLE users ADD COLUMN updated_at TIMESTAMP NULL AFTER created_at");
    }

    public function down() {
        $db = Database::connect();
        foreach ([
            'name', 'referral_code', 'referred_by', 'balance', 'lifetime_earned',
            'today_earned', 'ads_limit', 'today_ads', 'last_ad_reset_at',
            'is_admin', 'updated_at'
        ] as $col) {
            try { $db->exec("ALTER TABLE users DROP COLUMN {$col}"); } catch (Throwable $e) {}
        }
    }
}
