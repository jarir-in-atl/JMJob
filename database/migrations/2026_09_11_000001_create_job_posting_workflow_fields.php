<?php

use Nemesis\Database\Migration;
use Nemesis\Core\Database;

/**
 * Migration — Enhanced Job Posting Workflow, Subcategories, bKash TrxID, Deadline Extensions & Anti-Spam index.
 */
class CreateJobPostingWorkflowFields extends Migration {
    public function up() {
        $db = Database::connect();

        // 0. Ensure jobs table exists with status column
        $db->exec("CREATE TABLE IF NOT EXISTS jobs (
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

        // 1. Create subcategories table
        $db->exec("CREATE TABLE IF NOT EXISTS subcategories (
            id INT AUTO_INCREMENT PRIMARY KEY,
            category_id INT NOT NULL,
            name VARCHAR(100) NOT NULL,
            slug VARCHAR(120) NOT NULL,
            description TEXT NULL,
            is_active TINYINT(1) NOT NULL DEFAULT 1,
            display_order INT NOT NULL DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NULL,
            INDEX idx_subcat_category (category_id),
            INDEX idx_subcat_active (is_active)
        ) ENGINE=INNODB;");

        // 2. Safely add missing status or workflow columns if table was created in an incomplete state
        $hasStatus = !empty($db->query("SHOW COLUMNS FROM jobs LIKE 'status'")->fetchAll());
        if (!$hasStatus) {
            $db->exec("ALTER TABLE jobs ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'open' AFTER bidding_closes_at, ADD INDEX idx_jobs_status (status);");
        }

        $hasSubcat = !empty($db->query("SHOW COLUMNS FROM jobs LIKE 'subcategory_id'")->fetchAll());
        if (!$hasSubcat) {
            $db->exec("ALTER TABLE jobs
                ADD COLUMN subcategory_id INT NULL AFTER category_id,
                ADD COLUMN worker_count INT NOT NULL DEFAULT 1 AFTER budget,
                ADD COLUMN cost_per_worker DECIMAL(12,4) NOT NULL DEFAULT 0.0000 AFTER worker_count,
                ADD COLUMN system_fee_percent DECIMAL(5,2) NOT NULL DEFAULT 30.00 AFTER cost_per_worker,
                ADD COLUMN system_fee_amount DECIMAL(12,4) NOT NULL DEFAULT 0.0000 AFTER system_fee_percent,
                ADD COLUMN total_payable_amount DECIMAL(12,4) NOT NULL DEFAULT 0.0000 AFTER system_fee_amount,
                ADD COLUMN proof_requirements JSON NULL AFTER description,
                ADD COLUMN decline_reason TEXT NULL AFTER status,
                ADD INDEX idx_jobs_subcategory (subcategory_id);");
        }

        // 3. Alter job_bids table for application workflow & bKash payouts
        $hasBkash = !empty($db->query("SHOW COLUMNS FROM job_bids LIKE 'bkash_number'")->fetchAll());
        if (!$hasBkash) {
            $db->exec("ALTER TABLE job_bids
                ADD COLUMN bkash_number VARCHAR(20) NULL AFTER proposal,
                ADD COLUMN trx_id VARCHAR(100) NULL AFTER bkash_number,
                ADD COLUMN work_proof_data JSON NULL AFTER trx_id,
                ADD INDEX idx_bids_trx_id (trx_id);");
        }

        // 4. Ensure platform setting defaults exist
        $db->exec("INSERT INTO platform_settings (`setting_key`, `value`, `description`, `created_at`) VALUES
            ('job_system_fee_percentage', '30.00', 'Default system fee percentage for job postings', NOW()),
            ('admin_contact_whatsapp', 'https://wa.me/8801700000000', 'WhatsApp contact link for admin support', NOW()),
            ('bkash_merchant_number', '01700000000', 'Admin bKash merchant account number for receiving job payments', NOW())
            ON DUPLICATE KEY UPDATE `setting_key`=`setting_key`;");
    }

    public function down() {
        $db = Database::connect();
        $db->exec("DROP TABLE IF EXISTS subcategories;");

        try {
            $db->exec("ALTER TABLE jobs
                DROP COLUMN subcategory_id,
                DROP COLUMN worker_count,
                DROP COLUMN cost_per_worker,
                DROP COLUMN system_fee_percent,
                DROP COLUMN system_fee_amount,
                DROP COLUMN total_payable_amount,
                DROP COLUMN proof_requirements,
                DROP COLUMN decline_reason;");
        } catch (\Throwable $e) {}

        try {
            $db->exec("ALTER TABLE job_bids
                DROP COLUMN bkash_number,
                DROP COLUMN trx_id,
                DROP COLUMN work_proof_data;");
        } catch (\Throwable $e) {}
    }
}

