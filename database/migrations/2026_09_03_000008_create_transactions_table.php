<?php

use Nemesis\Database\Migration;
use Nemesis\Core\Database;

/**
 * Phase 3 — `transactions` (financial audit ledger).
 *
 * Every money movement is logged here for traceability:
 *   deposit     — user-funded wallet credit (via TRXID approval)
 *   withdrawal  — user-initiated cashout
 *   escrow_hold — poster's balance moved to frozen_balance when bid accepted
 *   escrow_release — frozen → worker balance on payment release
 *   commission  — platform's cut on a released payment
 *   refund      — escrow returned to poster on cancel/dispute
 *   adjustment  — admin manual credit/debit
 */
class CreateTransactionsTable extends Migration {
    public function up() {
        Database::connect()->exec("CREATE TABLE IF NOT EXISTS transactions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NULL,
            job_id INT NULL,
            type VARCHAR(24) NOT NULL,
            amount DECIMAL(12,4) NOT NULL,
            currency VARCHAR(8) NOT NULL DEFAULT 'BDT',
            balance_after DECIMAL(12,4) NULL,
            frozen_after DECIMAL(12,4) NULL,
            reference VARCHAR(64) NULL,
            note VARCHAR(255) NULL,
            admin_id INT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_tx_user (user_id),
            INDEX idx_tx_job (job_id),
            INDEX idx_tx_type (type),
            INDEX idx_tx_created (created_at)
        ) ENGINE=INNODB;");
    }

    public function down() {
        Database::connect()->exec("DROP TABLE IF EXISTS transactions;");
    }
}
