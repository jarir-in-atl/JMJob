<?php

use Nemesis\Database\Migration;
use Nemesis\Core\Database;

/**
 * Phase 3 — `jobs` (job listings posted by posters).
 *
 * Status flow:
 *   open       → bids being accepted
 *   in_review  → poster is reviewing bids (optional, may skip)
 *   assigned   → a bid was accepted, worker is doing the work
 *   submitted  → worker submitted, awaiting poster verification
 *   revision   → poster requested a revision
 *   completed  → poster verified + released payment
 *   cancelled  → poster cancelled (refund frozen_balance)
 *   disputed   → admin review required
 *   expired    → bidding window passed with no accepted bid
 */
class CreateMarketplaceJobsTable extends Migration {
    public function up() {
        $driver = Database::getDriverName();
        if ($driver === 'sqlite') {
            Database::connect()->exec("CREATE TABLE IF NOT EXISTS jobs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                poster_id INTEGER NOT NULL,
                category_id INTEGER NULL,
                title TEXT NOT NULL,
                slug TEXT NOT NULL,
                description TEXT NOT NULL,
                requirements TEXT NULL,
                budget NUMERIC NOT NULL,
                currency TEXT NOT NULL DEFAULT 'BDT',
                deadline_at TEXT NULL,
                bidding_closes_at TEXT NULL,
                status TEXT NOT NULL DEFAULT 'open',
                assigned_bid_id INTEGER NULL,
                assigned_worker_id INTEGER NULL,
                bid_count INTEGER NOT NULL DEFAULT 0,
                view_count INTEGER NOT NULL DEFAULT 0,
                is_featured INTEGER NOT NULL DEFAULT 0,
                attachment_path TEXT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT NULL
            )");
            foreach ([
                'CREATE INDEX IF NOT EXISTS idx_jobs_poster ON jobs (poster_id)',
                'CREATE INDEX IF NOT EXISTS idx_jobs_category ON jobs (category_id)',
                'CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs (status)',
                'CREATE INDEX IF NOT EXISTS idx_jobs_assigned_worker ON jobs (assigned_worker_id)',
                'CREATE INDEX IF NOT EXISTS idx_jobs_bidding_closes ON jobs (bidding_closes_at)',
            ] as $indexSql) {
                Database::connect()->exec($indexSql);
            }
            return;
        }

        Database::connect()->exec("CREATE TABLE IF NOT EXISTS jobs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            poster_id INT NOT NULL,
            category_id INT NULL,
            title VARCHAR(160) NOT NULL,
            slug VARCHAR(180) NOT NULL,
            description TEXT NOT NULL,
            requirements TEXT NULL,
            budget DECIMAL(12,4) NOT NULL,
            currency VARCHAR(8) NOT NULL DEFAULT 'BDT',
            deadline_at TIMESTAMP NULL,
            bidding_closes_at TIMESTAMP NULL,
            status VARCHAR(20) NOT NULL DEFAULT 'open',
            assigned_bid_id INT NULL,
            assigned_worker_id INT NULL,
            bid_count INT NOT NULL DEFAULT 0,
            view_count INT NOT NULL DEFAULT 0,
            is_featured TINYINT(1) NOT NULL DEFAULT 0,
            attachment_path VARCHAR(255) NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NULL,
            INDEX idx_jobs_poster (poster_id),
            INDEX idx_jobs_category (category_id),
            INDEX idx_jobs_status (status),
            INDEX idx_jobs_assigned_worker (assigned_worker_id),
            INDEX idx_jobs_bidding_closes (bidding_closes_at)
        ) ENGINE=INNODB;");
    }

    public function down() {
        Database::connect()->exec("DROP TABLE IF EXISTS jobs;");
    }
}
