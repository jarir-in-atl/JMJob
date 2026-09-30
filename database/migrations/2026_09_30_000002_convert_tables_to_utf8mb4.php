<?php

use Nemesis\Database\Migration;
use Nemesis\Core\Database;

class ConvertTablesToUtf8mb4 extends Migration
{
    public function up()
    {
        $driver = Database::getDriverName();
        if ($driver !== 'mysql') {
            return;
        }

        $db = Database::connect();

        try {
            $db->exec("ALTER DATABASE CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
        } catch (\Throwable $e) {
            // Ignore if DB user lacks global/database alter permissions
        }

        $db->exec("SET FOREIGN_KEY_CHECKS = 0");

        $stmt = $db->query("SHOW TABLES");
        $tables = $stmt->fetchAll(\PDO::FETCH_COLUMN);

        foreach ($tables as $table) {
            try {
                $db->exec("ALTER TABLE `{$table}` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
            } catch (\Throwable $e) {
                error_log("Failed to convert table {$table} to utf8mb4: " . $e->getMessage());
            }
        }

        $db->exec("SET FOREIGN_KEY_CHECKS = 1");
    }

    public function down()
    {
        // Safe no-op on rollback to prevent data loss
    }
}
