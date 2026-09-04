<?php

use Nemesis\Database\Migration;
use Nemesis\Core\Database;

/** Phase 6 — persistent in-app notifications. */
class CreateNotificationsTable extends Migration
{
    public function up()
    {
        $driver = Database::getDriverName();
        if ($driver === 'sqlite') {
            Database::connect()->exec("CREATE TABLE IF NOT EXISTS notifications (
                id VARCHAR(36) PRIMARY KEY,
                type VARCHAR(255) NOT NULL,
                notifiable_type VARCHAR(255) NOT NULL,
                notifiable_id INTEGER NOT NULL,
                data TEXT,
                read_at DATETIME NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )");
            return;
        }

        Database::connect()->exec("CREATE TABLE IF NOT EXISTS notifications (
            id VARCHAR(36) PRIMARY KEY,
            type VARCHAR(255) NOT NULL,
            notifiable_type VARCHAR(255) NOT NULL,
            notifiable_id INT NOT NULL,
            data LONGTEXT,
            read_at DATETIME NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_notifications_notifiable (notifiable_type, notifiable_id),
            INDEX idx_notifications_unread (notifiable_id, read_at),
            INDEX idx_notifications_created (created_at)
        ) ENGINE=INNODB;");
    }

    public function down()
    {
        Database::connect()->exec('DROP TABLE IF EXISTS notifications');
    }
}
