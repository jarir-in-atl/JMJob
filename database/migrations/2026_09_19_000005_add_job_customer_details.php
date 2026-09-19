<?php

use Nemesis\Database\Migration;
use Nemesis\Core\Database;

/** Add customer-facing metadata required by the admin job-post flows. */
class AddJobCustomerDetails extends Migration
{
    public function up()
    {
        $db = Database::connect();
        $driver = Database::getDriverName();
        $columns = [];

        if ($driver === 'sqlite') {
            foreach ($db->query('PRAGMA table_info(jobs)')->fetchAll(\PDO::FETCH_ASSOC) as $column) {
                $columns[] = (string) ($column['name'] ?? '');
            }
        } else {
            foreach ($db->query('SHOW COLUMNS FROM jobs')->fetchAll(\PDO::FETCH_ASSOC) as $column) {
                $columns[] = (string) ($column['Field'] ?? '');
            }
        }

        $definitions = [
            'subtitle'            => $driver === 'sqlite' ? 'TEXT NULL' : 'VARCHAR(255) NULL',
            'customer_name'       => $driver === 'sqlite' ? 'TEXT NULL' : 'VARCHAR(160) NULL',
            'customer_phone'      => $driver === 'sqlite' ? 'TEXT NULL' : 'VARCHAR(32) NULL',
            'customer_email'      => $driver === 'sqlite' ? 'TEXT NULL' : 'VARCHAR(190) NULL',
            'admin_notes'         => 'TEXT NULL',
            'created_by_admin_id' => $driver === 'sqlite' ? 'INTEGER NULL' : 'INT NULL',
        ];
        foreach ($definitions as $name => $definition) {
            if (!in_array($name, $columns, true)) {
                $db->exec("ALTER TABLE jobs ADD COLUMN {$name} {$definition}");
            }
        }
    }

    public function down()
    {
        // SQLite cannot safely drop columns on all supported versions. These
        // metadata columns are retained on rollback.
    }
}
