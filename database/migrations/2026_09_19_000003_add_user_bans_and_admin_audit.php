<?php

use Nemesis\Database\Migration;
use Nemesis\Core\Database;

/**
 * User ban state, immutable ban history, and admin action audit records.
 */
class AddUserBansAndAdminAudit extends Migration
{
    public function up()
    {
        $db = Database::connect();
        $driver = Database::getDriverName();

        $columnExists = function (string $table, string $column) use ($db, $driver): bool {
            if ($driver === 'sqlite') {
                $rows = $db->query("PRAGMA table_info({$table})")->fetchAll(\PDO::FETCH_ASSOC);
                foreach ($rows as $row) if (($row['name'] ?? null) === $column) return true;
                return false;
            }
            $stmt = $db->prepare(
                "SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE()
                   AND TABLE_NAME = :table
                   AND COLUMN_NAME = :column
                 LIMIT 1"
            );
            $stmt->execute(['table' => $table, 'column' => $column]);
            return $stmt->fetch(\PDO::FETCH_ASSOC) !== false;
        };

        $addColumn = function (string $sql) use ($db): void {
            try { $db->exec($sql); } catch (\Throwable $e) { /* idempotent retry */ }
        };

        $userColumns = [
            'phone'      => $driver === 'sqlite'
                ? 'ALTER TABLE users ADD COLUMN phone TEXT NULL'
                : 'ALTER TABLE users ADD COLUMN phone VARCHAR(30) NULL',
            'is_banned'  => $driver === 'sqlite'
                ? 'ALTER TABLE users ADD COLUMN is_banned INTEGER NOT NULL DEFAULT 0'
                : 'ALTER TABLE users ADD COLUMN is_banned TINYINT(1) NOT NULL DEFAULT 0',
            'banned_at'  => $driver === 'sqlite'
                ? 'ALTER TABLE users ADD COLUMN banned_at DATETIME NULL'
                : 'ALTER TABLE users ADD COLUMN banned_at TIMESTAMP NULL',
            'banned_by'  => $driver === 'sqlite'
                ? 'ALTER TABLE users ADD COLUMN banned_by INTEGER NULL'
                : 'ALTER TABLE users ADD COLUMN banned_by INT NULL',
            'ban_reason' => $driver === 'sqlite'
                ? 'ALTER TABLE users ADD COLUMN ban_reason TEXT NULL'
                : 'ALTER TABLE users ADD COLUMN ban_reason TEXT NULL',
        ];
        foreach ($userColumns as $column => $sql) {
            if (!$columnExists('users', $column)) $addColumn($sql);
        }

        if ($driver === 'sqlite') {
            $db->exec("CREATE TABLE IF NOT EXISTS user_ban_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                admin_id INTEGER NOT NULL,
                action TEXT NOT NULL,
                reason TEXT NULL,
                user_snapshot TEXT NULL,
                previous_activity TEXT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )");
            $db->exec('CREATE INDEX IF NOT EXISTS idx_ban_history_user ON user_ban_history (user_id)');
            $db->exec('CREATE INDEX IF NOT EXISTS idx_ban_history_admin ON user_ban_history (admin_id)');
            $db->exec("CREATE TABLE IF NOT EXISTS admin_action_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                admin_id INTEGER NOT NULL,
                action TEXT NOT NULL,
                entity_type TEXT NOT NULL,
                entity_id INTEGER NULL,
                details TEXT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )");
            $db->exec('CREATE INDEX IF NOT EXISTS idx_admin_logs_admin ON admin_action_logs (admin_id)');
            $db->exec('CREATE INDEX IF NOT EXISTS idx_admin_logs_entity ON admin_action_logs (entity_type, entity_id)');
            return;
        }

        $db->exec("CREATE TABLE IF NOT EXISTS user_ban_history (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            admin_id INT NOT NULL,
            action VARCHAR(16) NOT NULL,
            reason TEXT NULL,
            user_snapshot TEXT NULL,
            previous_activity TEXT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_ban_history_user (user_id),
            INDEX idx_ban_history_admin (admin_id)
        ) ENGINE=INNODB;");
        $db->exec("CREATE TABLE IF NOT EXISTS admin_action_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            admin_id INT NOT NULL,
            action VARCHAR(64) NOT NULL,
            entity_type VARCHAR(64) NOT NULL,
            entity_id INT NULL,
            details TEXT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_admin_logs_admin (admin_id),
            INDEX idx_admin_logs_entity (entity_type, entity_id)
        ) ENGINE=INNODB;");
    }

    public function down()
    {
        // Ban and audit history is intentionally retained on rollback.
    }
}
