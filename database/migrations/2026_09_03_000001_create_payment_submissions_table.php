<?php

use Nemesis\Database\Migration;
use Nemesis\Core\Database;

/**
 * Payment submissions — TRXID-based deposits (bKash / Nagad / Rocket / Upay).
 *
 * Created as part of Phase 2 (payment system). Each row represents one
 * user-initiated deposit awaiting admin verification. The unique constraint
 * on `trxid` prevents double-submission of the same transaction ID.
 */
class CreatePaymentSubmissionsTable extends Migration {
    public function up() {
        Database::connect()->exec("CREATE TABLE IF NOT EXISTS payment_submissions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            gateway VARCHAR(20) NOT NULL,
            sender_number VARCHAR(20) NOT NULL,
            amount DECIMAL(10,4) NOT NULL,
            trxid VARCHAR(100) NOT NULL,
            status VARCHAR(20) NOT NULL DEFAULT 'pending',
            admin_id INT NULL,
            admin_note TEXT NULL,
            verified_at TIMESTAMP NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NULL,
            UNIQUE KEY uq_payment_trxid (trxid),
            INDEX idx_payment_user (user_id),
            INDEX idx_payment_status (status),
            INDEX idx_payment_gateway (gateway)
        ) ENGINE=INNODB;");
    }

    public function down() {
        Database::connect()->exec("DROP TABLE IF EXISTS payment_submissions;");
    }
}
