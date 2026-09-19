<?php

use Nemesis\Database\Migration;
use Nemesis\Core\Database;

/**
 * Submission fraud/risk metadata. Risk flags are advisory until an admin
 * reviews them; they never grant balance or bypass proof moderation.
 */
class AddSubmissionRiskFields extends Migration
{
    public function up()
    {
        $db = Database::connect();
        $driver = Database::getDriverName();
        $columnExists = function (string $column) use ($db, $driver): bool {
            if ($driver === 'sqlite') {
                $rows = $db->query('PRAGMA table_info(job_submissions)')->fetchAll(\PDO::FETCH_ASSOC);
                return in_array($column, array_column($rows, 'name'), true);
            }
            $stmt = $db->prepare(
                "SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE()
                   AND TABLE_NAME = 'job_submissions'
                   AND COLUMN_NAME = :column
                 LIMIT 1"
            );
            $stmt->execute(['column' => $column]);
            return (bool) $stmt->fetch(\PDO::FETCH_ASSOC);
        };

        $definitions = $driver === 'sqlite' ? [
            'content_hash' => 'TEXT NULL',
            'proof_hash' => 'TEXT NULL',
            'client_ip' => 'TEXT NULL',
            'client_fingerprint' => 'TEXT NULL',
            'risk_score' => 'NUMERIC NOT NULL DEFAULT 0',
            'risk_status' => "TEXT NOT NULL DEFAULT 'clear'",
            'risk_flags' => 'TEXT NULL',
            'fraud_reviewed_at' => 'DATETIME NULL',
            'fraud_reviewed_by' => 'INTEGER NULL',
        ] : [
            'content_hash' => 'CHAR(64) NULL',
            'proof_hash' => 'CHAR(64) NULL',
            'client_ip' => 'VARCHAR(64) NULL',
            'client_fingerprint' => 'CHAR(64) NULL',
            'risk_score' => 'DECIMAL(5,2) NOT NULL DEFAULT 0',
            'risk_status' => "VARCHAR(16) NOT NULL DEFAULT 'clear'",
            'risk_flags' => 'TEXT NULL',
            'fraud_reviewed_at' => 'TIMESTAMP NULL',
            'fraud_reviewed_by' => 'INT NULL',
        ];

        foreach ($definitions as $column => $definition) {
            if (!$columnExists($column)) {
                $db->exec("ALTER TABLE job_submissions ADD COLUMN {$column} {$definition}");
            }
        }

        if ($driver === 'sqlite') {
            $db->exec('CREATE INDEX IF NOT EXISTS idx_submissions_risk_status ON job_submissions (risk_status)');
            $db->exec('CREATE INDEX IF NOT EXISTS idx_submissions_content_hash ON job_submissions (content_hash)');
            $db->exec('CREATE INDEX IF NOT EXISTS idx_submissions_client_ip ON job_submissions (client_ip)');
            return;
        }

        foreach ([
            'CREATE INDEX idx_submissions_risk_status ON job_submissions (risk_status)',
            'CREATE INDEX idx_submissions_content_hash ON job_submissions (content_hash)',
            'CREATE INDEX idx_submissions_client_ip ON job_submissions (client_ip)',
        ] as $sql) {
            try { $db->exec($sql); } catch (\Throwable) {}
        }
    }

    public function down()
    {
        // Risk evidence is retained for moderation history.
    }
}
