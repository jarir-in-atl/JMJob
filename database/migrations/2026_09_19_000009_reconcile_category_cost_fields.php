<?php

use Nemesis\Database\Migration;
use Nemesis\Core\Database;

/**
 * Reconcile category cost fields for installations created before the
 * category JSON seeder introduced min_cost. The admin CRUD and worker-facing
 * category serializers already expose this field, so the schema must provide
 * it on both fresh and upgraded databases.
 */
class ReconcileCategoryCostFields extends Migration
{
    public function up()
    {
        $db = Database::connect();
        $driver = Database::getDriverName();

        foreach (['categories', 'subcategories'] as $table) {
            if (!$this->hasTable($db, $driver, $table)) continue;
            $columns = $this->columns($db, $driver, $table);
            if (in_array('min_cost', $columns, true)) continue;

            $definition = $driver === 'mysql'
                ? 'DECIMAL(10,2) NOT NULL DEFAULT 1.00'
                : 'NUMERIC NOT NULL DEFAULT 1.00';
            $db->exec("ALTER TABLE {$table} ADD COLUMN min_cost {$definition}");
        }
    }

    public function down()
    {
        // Keep the additive cost field on rollback; older data may already
        // depend on it and SQLite cannot safely drop columns on all hosts.
    }

    private function hasTable(\PDO $db, string $driver, string $table): bool
    {
        if ($driver === 'sqlite') {
            $stmt = $db->prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = :table LIMIT 1");
            $stmt->execute(['table' => $table]);
            return (bool) $stmt->fetchColumn();
        }
        if ($driver === 'pgsql') {
            $stmt = $db->prepare("SELECT 1 FROM information_schema.tables WHERE table_schema = current_schema() AND table_name = :table LIMIT 1");
            $stmt->execute(['table' => $table]);
            return (bool) $stmt->fetchColumn();
        }
        $stmt = $db->prepare("SELECT 1 FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = :table LIMIT 1");
        $stmt->execute(['table' => $table]);
        return (bool) $stmt->fetchColumn();
    }

    private function columns(\PDO $db, string $driver, string $table): array
    {
        if ($driver === 'sqlite') {
            $rows = $db->query("PRAGMA table_info(\"{$table}\")")->fetchAll(\PDO::FETCH_ASSOC);
            return array_values(array_filter(array_map(static fn(array $row): string => (string) ($row['name'] ?? ''), $rows)));
        }
        if ($driver === 'pgsql') {
            $stmt = $db->prepare("SELECT column_name FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = :table");
            $stmt->execute(['table' => $table]);
            return array_map('strval', $stmt->fetchAll(\PDO::FETCH_COLUMN));
        }
        $stmt = $db->prepare("SELECT COLUMN_NAME FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = :table");
        $stmt->execute(['table' => $table]);
        return array_map('strval', $stmt->fetchAll(\PDO::FETCH_COLUMN));
    }
}
