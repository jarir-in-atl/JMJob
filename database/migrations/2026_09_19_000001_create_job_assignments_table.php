<?php

use Nemesis\Database\Migration;
use Nemesis\Core\Database;

/**
 * Multi-worker job assignments and per-worker payment state.
 *
 * The existing jobs.assigned_* columns remain a legacy compatibility
 * pointer for the original single-worker flow. This table is the source of
 * truth for new multi-worker assignments.
 */
class CreateJobAssignmentsTable extends Migration
{
    public function up()
    {
        $db = Database::connect();

        if (Database::getDriverName() === 'sqlite') {
            $db->exec("CREATE TABLE IF NOT EXISTS job_assignments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                job_id INTEGER NOT NULL,
                bid_id INTEGER NOT NULL,
                worker_id INTEGER NOT NULL,
                status VARCHAR(20) NOT NULL DEFAULT 'assigned',
                payment_status VARCHAR(20) NOT NULL DEFAULT 'pending',
                payment_amount DECIMAL(12,4) NOT NULL DEFAULT 0.0000,
                assigned_by INTEGER NULL,
                assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                started_at DATETIME NULL,
                submitted_at DATETIME NULL,
                completed_at DATETIME NULL,
                paid_at DATETIME NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NULL,
                UNIQUE (job_id, worker_id),
                UNIQUE (bid_id)
            )");
            $db->exec('CREATE INDEX IF NOT EXISTS idx_assignments_job ON job_assignments (job_id)');
            $db->exec('CREATE INDEX IF NOT EXISTS idx_assignments_worker ON job_assignments (worker_id)');
            $db->exec('CREATE INDEX IF NOT EXISTS idx_assignments_status ON job_assignments (status)');
            $db->exec('CREATE INDEX IF NOT EXISTS idx_assignments_payment_status ON job_assignments (payment_status)');
            return;
        }

        $db->exec("CREATE TABLE IF NOT EXISTS job_assignments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            job_id INT NOT NULL,
            bid_id INT NOT NULL,
            worker_id INT NOT NULL,
            status VARCHAR(20) NOT NULL DEFAULT 'assigned',
            payment_status VARCHAR(20) NOT NULL DEFAULT 'pending',
            payment_amount DECIMAL(12,4) NOT NULL DEFAULT 0.0000,
            assigned_by INT NULL,
            assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            started_at TIMESTAMP NULL,
            submitted_at TIMESTAMP NULL,
            completed_at TIMESTAMP NULL,
            paid_at TIMESTAMP NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NULL,
            INDEX idx_assignments_job (job_id),
            INDEX idx_assignments_worker (worker_id),
            INDEX idx_assignments_status (status),
            INDEX idx_assignments_payment_status (payment_status),
            UNIQUE KEY uq_assignment_job_worker (job_id, worker_id),
            UNIQUE KEY uq_assignment_bid (bid_id)
        ) ENGINE=INNODB;");
    }

    public function down()
    {
        Database::connect()->exec('DROP TABLE IF EXISTS job_assignments');
    }
}
