<?php

use Nemesis\Database\Migration;
use Nemesis\Core\Database;

class AddVideoUrlToVideoAds extends Migration
{
    public function up()
    {
        $db = Database::connect();
        if (Database::getDriverName() === 'sqlite') {
            $db->exec('ALTER TABLE video_ads ADD COLUMN video_url TEXT NULL');
        } else {
            $db->exec('ALTER TABLE video_ads ADD COLUMN video_url VARCHAR(1000) NULL');
        }
    }

    public function down()
    {
        // The additive column is intentionally retained on rollback-safe hosts.
    }
}
