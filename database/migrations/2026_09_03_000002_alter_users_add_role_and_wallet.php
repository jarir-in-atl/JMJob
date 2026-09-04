<?php

use Nemesis\Database\Migration;
use Nemesis\Core\Database;

/**
 * Phase 3 — Adds role + wallet columns to the existing users table.
 *
 *   - role ENUM('worker', 'poster', 'admin') DEFAULT 'worker' — all
 *     existing rows are 'worker' since the column is added with a
 *     default. is_admin=1 implies role='admin' (kept for back-compat).
 *   - wallet_balance DECIMAL — poster's available balance for posting
 *     new jobs (topped up via the existing /api/payment/submit flow).
 *   - frozen_balance DECIMAL — funds in escrow for active jobs
 *     (moved here when a bid is accepted, released when the job is
 *     completed and paid out).
 *   - total_spent / total_earned — accounting counters for stats.
 *   - rating / rating_count — rolling average from reviews.
 *
 * Idempotent: each column is added with a try/catch on duplicate-column
 * errors so re-running the migration is safe.
 */
class AlterUsersAddRoleAndWallet extends Migration {
    public function up() {
        $db = Database::connect();

        // Per-driver check helper
        $columnExists = function (string $table, string $column) use ($db) {
            $driver = Database::getDriverName();
            if ($driver === 'sqlite') {
                $rows = $db->query("PRAGMA table_info($table)")->fetchAll(PDO::FETCH_ASSOC);
                foreach ($rows as $r) if ($r['name'] === $column) return true;
                return false;
            }
            $row = $db->query("SHOW COLUMNS FROM $table LIKE '$column'")->fetch(PDO::FETCH_ASSOC);
            return $row !== false;
        };

        $add = function (string $sql) use ($db) {
            try { $db->exec($sql); } catch (Throwable $e) { /* ignore duplicate column */ }
        };

        if (!$columnExists('users', 'role')) {
            $add("ALTER TABLE users ADD COLUMN role ENUM('worker', 'poster', 'admin') NOT NULL DEFAULT 'worker' AFTER is_admin");
            $add("CREATE INDEX idx_users_role ON users (role)");
        }
        if (!$columnExists('users', 'wallet_balance')) {
            $add("ALTER TABLE users ADD COLUMN wallet_balance DECIMAL(12,4) NOT NULL DEFAULT 0.0000 AFTER balance");
        }
        if (!$columnExists('users', 'frozen_balance')) {
            $add("ALTER TABLE users ADD COLUMN frozen_balance DECIMAL(12,4) NOT NULL DEFAULT 0.0000 AFTER wallet_balance");
        }
        if (!$columnExists('users', 'total_spent')) {
            $add("ALTER TABLE users ADD COLUMN total_spent DECIMAL(12,4) NOT NULL DEFAULT 0.0000 AFTER frozen_balance");
        }
        if (!$columnExists('users', 'total_posted_earned')) {
            $add("ALTER TABLE users ADD COLUMN total_posted_earned DECIMAL(12,4) NOT NULL DEFAULT 0.0000 AFTER total_spent");
        }
        if (!$columnExists('users', 'rating')) {
            $add("ALTER TABLE users ADD COLUMN rating DECIMAL(3,2) NOT NULL DEFAULT 0.00 AFTER total_posted_earned");
        }
        if (!$columnExists('users', 'rating_count')) {
            $add("ALTER TABLE users ADD COLUMN rating_count INT NOT NULL DEFAULT 0 AFTER rating");
        }
    }

    public function down() {
        // SQLite has limited DROP COLUMN support; intentionally a no-op
        // for the down direction — the columns are safe to keep.
    }
}
