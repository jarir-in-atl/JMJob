<?php

use Nemesis\Database\Migration;
use Nemesis\Core\Database;

/**
 * Phase 3 — `job_submissions` (work delivered by the worker).
 *
 * Status flow:
 *   pending_review → worker submitted, awaiting poster verification
 *   approved       → poster accepted; release payment flow begins
 *   revision       → poster requested changes (loops back to pending_review)
 *   rejected       → poster rejected (worker may dispute)
 */
class CreateJobSubmissionsTable extends Migration {
    public function up() {
        Database::connect()->exec("CREATE TABLE IF NOT EXISTS job_submissions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            job_id INT NOT NULL,
            worker_id INT NOT NULL,
            bid_id INT NOT NULL,
            description TEXT NULL,
            attachment_path VARCHAR(255) NULL,
            external_link VARCHAR(500) NULL,
            status VARCHAR(20) NOT NULL DEFAULT 'pending_review',
            reviewed_at TIMESTAMP NULL,
            reviewed_by INT NULL,
            reviewer_note TEXT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NULL,
            INDEX idx_submissions_job (job_id),
            INDEX idx_submissions_worker (worker_id),
            INDEX idx_submissions_status (status)
        ) ENGINE=INNODB;");
    }

    public function down() {
        Database::connect()->exec("DROP TABLE IF EXISTS job_submissions;");
    }
}
