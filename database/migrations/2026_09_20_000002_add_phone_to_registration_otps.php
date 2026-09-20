<?php

use Nemesis\Database\Migration;
use Nemesis\Core\Database;

/** Stores the phone number alongside pending SMS registration OTPs. */
class AddPhoneToRegistrationOtps extends Migration
{
    public function up(): void
    {
        $db = Database::connect();
        $driver = Database::getDriverName();
        $exists = false;

        if ($driver === 'sqlite') {
            $columns = $db->query('PRAGMA table_info(registration_otps)')->fetchAll(\PDO::FETCH_ASSOC);
            foreach ($columns as $column) {
                if (($column['name'] ?? '') === 'phone') {
                    $exists = true;
                    break;
                }
            }
        } else {
            $stmt = $db->prepare(
                'SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE()
                   AND TABLE_NAME = :table
                   AND COLUMN_NAME = :column
                 LIMIT 1'
            );
            $stmt->execute(['table' => 'registration_otps', 'column' => 'phone']);
            $exists = $stmt->fetch(\PDO::FETCH_ASSOC) !== false;
        }

        if (!$exists) {
            $db->exec($driver === 'sqlite'
                ? 'ALTER TABLE registration_otps ADD COLUMN phone TEXT NULL'
                : 'ALTER TABLE registration_otps ADD COLUMN phone VARCHAR(30) NULL');
        }
    }

    public function down(): void
    {
        // SQLite does not support a portable drop-column operation here.
    }
}
