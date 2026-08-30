<?php

use Nemesis\Database\Migration;
use Nemesis\Core\Database;

class CreateWithdrawalsTable extends Migration {
    public function up() {
        Database::connect()->exec("CREATE TABLE IF NOT EXISTS withdrawals (
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
