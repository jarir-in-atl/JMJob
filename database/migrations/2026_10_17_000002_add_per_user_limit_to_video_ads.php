<?php

use Nemesis\Database\Migration;
use Nemesis\Core\Database;

/** Add a per-worker lifetime view limit to each video campaign. */
class AddPerUserLimitToVideoAds extends Migration
{
    public function up()
    {
        $db = Database::connect();
        $driver = Database::getDriverName();
        if ($driver === 'sqlite') {
            $columns = array_column($db->query('PRAGMA table_info(video_ads)')->fetchAll(\PDO::FETCH_ASSOC), 'name');
            $exists = in_array('per_user_limit', $columns, true);
        } else {
            $stmt = $db->prepare(
                "SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE()
                   AND TABLE_NAME = 'video_ads'
                   AND COLUMN_NAME = 'per_user_limit'
                 LIMIT 1"
            );
            $stmt->execute();
            $exists = $stmt->fetch(\PDO::FETCH_ASSOC) !== false;
        }

        if (!$exists) {
            $db->exec($driver === 'sqlite'
                ? 'ALTER TABLE video_ads ADD COLUMN per_user_limit INTEGER NOT NULL DEFAULT 0'
                : 'ALTER TABLE video_ads ADD COLUMN per_user_limit INT NOT NULL DEFAULT 0');
        }
    }

    public function down()
    {
        // Keep the additive setting in place to avoid damaging campaign data.
    }
}
