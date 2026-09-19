<?php

use Nemesis\Database\Migration;
use Nemesis\Core\Database;

class CreateWithdrawalsTable extends Migration {
    public function up() {
        $db = Database::connect();
        if (Database::getDriverName() === 'sqlite') {
            $db->exec("CREATE TABLE IF NOT EXISTS withdrawals (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                amount NUMERIC NOT NULL,
                gateway TEXT NOT NULL,
                wallet_address TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'pending',
                admin_note TEXT NULL,
                requested_at TEXT DEFAULT CURRENT_TIMESTAMP,
                processed_at TEXT NULL,
                processed_by INTEGER NULL
            )");
            $db->exec('CREATE INDEX IF NOT EXISTS idx_wd_user ON withdrawals (user_id)');
            $db->exec('CREATE INDEX IF NOT EXISTS idx_wd_status ON withdrawals (status)');
            return;
        }
        $db->exec("CREATE TABLE IF NOT EXISTS withdrawals (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            amount DECIMAL(10,2) NOT NULL,
            gateway VARCHAR(20) NOT NULL,
            wallet_address VARCHAR(50) NOT NULL,
            status VARCHAR(20) NOT NULL DEFAULT 'pending',
            admin_note TEXT NULL,
            requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            processed_at TIMESTAMP NULL,
            processed_by INT NULL,
            INDEX idx_wd_user (user_id),
            INDEX idx_wd_status (status)
        ) ENGINE=INNODB;");
    }

    public function down() {
        Database::connect()->exec("DROP TABLE IF EXISTS withdrawals;");
    }
}
