<?php

use Nemesis\Database\Migration;
use Nemesis\Core\Database;

class AddDailyBonusClaimToUsers extends Migration {
    public function up() {
        $db = Database::connect();
        // Check if column already exists
        $result = $db->query("SHOW COLUMNS FROM `users` LIKE 'last_daily_bonus_claim'");
        if (!$result->fetch()) {
            $db->exec("ALTER TABLE users ADD COLUMN last_daily_bonus_claim DATE NULL AFTER last_ad_reset_at");
            echo "  ✓ Added last_daily_bonus_claim column\n";
        } else {
            echo "  • Column last_daily_bonus_claim already exists\n";
        }
    }

    public function down() {
        $db = Database::connect();
        try { $db->exec("ALTER TABLE users DROP COLUMN last_daily_bonus_claim"); } catch (Throwable $e) {}
    }
}
