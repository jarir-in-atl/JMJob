<?php

use Nemesis\Database\Migration;
use Nemesis\Core\Database;

/**
 * Connect submissions to multi-worker assignments and preserve review
 * history for repeated submissions and rejection decisions.
 */
class AddJobSubmissionReviewFields extends Migration
{
    public function up()
    {
        $db = Database::connect();
        $driver = Database::getDriverName();

        $columnExists = function (string $column) use ($db, $driver): bool {
            if ($driver === 'sqlite') {
                $rows = $db->query('PRAGMA table_info(job_submissions)')->fetchAll(\PDO::FETCH_ASSOC);
                foreach ($rows as $row) {
                    if (($row['name'] ?? null) === $column) return true;
                }
                return false;
            }

            $stmt = $db->prepare(
                "SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE()
                   AND TABLE_NAME = 'job_submissions'
                   AND COLUMN_NAME = :column
                 LIMIT 1"
            );
            $stmt->execute(['column' => $column]);
            return $stmt->fetch(\PDO::FETCH_ASSOC) !== false;
        };

        $addColumn = function (string $sql) use ($db): void {
            try {
                $db->exec($sql);
            } catch (\Throwable $e) {
                // Keep the migration idempotent for partially upgraded hosts.
            }
        };

        if (!$columnExists('assignment_id')) {
            $addColumn($driver === 'sqlite'
                ? 'ALTER TABLE job_submissions ADD COLUMN assignment_id INTEGER NULL'
                : 'ALTER TABLE job_submissions ADD COLUMN assignment_id INT NULL AFTER bid_id');
        }
        if (!$columnExists('attempt_number')) {
            $addColumn($driver === 'sqlite'
                ? "ALTER TABLE job_submissions ADD COLUMN attempt_number INTEGER NOT NULL DEFAULT 1"
                : 'ALTER TABLE job_submissions ADD COLUMN attempt_number INT NOT NULL DEFAULT 1 AFTER assignment_id');
        }
        if (!$columnExists('submitted_at')) {
            $addColumn($driver === 'sqlite'
                ? 'ALTER TABLE job_submissions ADD COLUMN submitted_at DATETIME NULL'
                : 'ALTER TABLE job_submissions ADD COLUMN submitted_at TIMESTAMP NULL AFTER status');
        }
        if (!$columnExists('rejection_reason')) {
            $addColumn($driver === 'sqlite'
                ? 'ALTER TABLE job_submissions ADD COLUMN rejection_reason TEXT NULL'
                : 'ALTER TABLE job_submissions ADD COLUMN rejection_reason TEXT NULL AFTER reviewer_note');
        }

        if ($driver === 'sqlite') {
            $db->exec('CREATE INDEX IF NOT EXISTS idx_submissions_assignment ON job_submissions (assignment_id)');
            return;
        }

        try {
            $db->exec('CREATE INDEX idx_submissions_assignment ON job_submissions (assignment_id)');
        } catch (\Throwable $e) {
            // The index may already exist after a retried deployment.
        }
    }

    public function down()
    {
        // Keep user submissions intact on rollback; these fields are additive.
    }
}
