<?php

use Nemesis\Database\Migration;
use Nemesis\Core\Database;

class CreateReferralCommissionsTable extends Migration {
    public function up() {
        $db = Database::connect();
        if (Database::getDriverName() === 'sqlite') {
            $db->exec("CREATE TABLE IF NOT EXISTS referral_commissions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                referrer_id INTEGER NOT NULL,
                referred_id INTEGER NOT NULL,
                source_type TEXT NOT NULL,
                source_id INTEGER NOT NULL,
                commission_rate NUMERIC NOT NULL DEFAULT 0.5000,
                commission_amount NUMERIC NOT NULL DEFAULT 0.0000,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )");
            $db->exec('CREATE INDEX IF NOT EXISTS idx_rc_referrer ON referral_commissions (referrer_id)');
            $db->exec('CREATE INDEX IF NOT EXISTS idx_rc_referred ON referral_commissions (referred_id)');
            return;
        }
        $db->exec("CREATE TABLE IF NOT EXISTS referral_commissions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            referrer_id INT NOT NULL,
            referred_id INT NOT NULL,
            source_type VARCHAR(20) NOT NULL,
            source_id INT NOT NULL,
            commission_rate DECIMAL(5,4) NOT NULL DEFAULT 0.5000,
            commission_amount DECIMAL(10,4) NOT NULL DEFAULT 0.0000,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_rc_referrer (referrer_id),
            INDEX idx_rc_referred (referred_id)
        ) ENGINE=INNODB;");
    }

    public function down() {
        Database::connect()->exec("DROP TABLE IF EXISTS referral_commissions;");
    }
}
