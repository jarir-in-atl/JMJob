<?php

use Nemesis\Database\Migration;
use Nemesis\Core\Database;

/**
 * Phase 3 — `job_bids` (worker bids on jobs).
 *
 * Status flow:
 *   pending    → bid placed, awaiting poster decision
 *   accepted   → poster accepted; job.status moves to 'assigned',
 *                poster's wallet_balance → frozen_balance
 *   rejected   → poster chose another bid (or rejected all)
 *   withdrawn  → worker withdrew their own bid before decision
 *   expired    → bidding window closed without decision
 */
class CreateJobBidsTable extends Migration {
    public function up() {
        Database::connect()->exec("CREATE TABLE IF NOT EXISTS job_bids (
            id INT AUTO_INCREMENT PRIMARY KEY,
            job_id INT NOT NULL,
            worker_id INT NOT NULL,
            amount DECIMAL(12,4) NOT NULL,
            currency VARCHAR(8) NOT NULL DEFAULT 'BDT',
            delivery_days INT NOT NULL DEFAULT 7,
            proposal TEXT NOT NULL,
            status VARCHAR(20) NOT NULL DEFAULT 'pending',
            decided_at TIMESTAMP NULL,
            decided_by INT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NULL,
            INDEX idx_bids_job (job_id),
            INDEX idx_bids_worker (worker_id),
            INDEX idx_bids_status (status),
            UNIQUE KEY uq_bid_per_worker_per_job (job_id, worker_id)
        ) ENGINE=INNODB;");
    }

    public function down() {
        Database::connect()->exec("DROP TABLE IF EXISTS job_bids;");
    }
}
