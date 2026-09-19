<?php

use Nemesis\Database\Migration;
use Nemesis\Core\Database;

class AddDailyBonusClaimToUsers extends Migration {
    public function up() {
        $db = Database::connect();
        $driver = Database::getDriverName();
        if ($driver === 'sqlite') {
            $columns = array_column($db->query('PRAGMA table_info(users)')->fetchAll(), 'name');
            $exists = in_array('last_daily_bonus_claim', $columns, true);
        } elseif ($driver === 'pgsql') {
            $stmt = $db->prepare("SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = :column LIMIT 1");
            $stmt->execute(['column' => 'last_daily_bonus_claim']);
            $exists = (bool) $stmt->fetchColumn();
        } else {
            $stmt = $db->prepare("SHOW COLUMNS FROM `users` LIKE 'last_daily_bonus_claim'");
            $stmt->execute();
            $exists = (bool) $stmt->fetch();
        }

        if (!$exists) {
            $db->exec("ALTER TABLE users ADD COLUMN last_daily_bonus_claim DATE NULL");
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
