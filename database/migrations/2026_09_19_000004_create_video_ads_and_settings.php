<?php

use Nemesis\Database\Migration;
use Nemesis\Core\Database;
use Nemesis\Core\Fluent;

/**
 * First-party video ads, server-timed watch sessions, and ad master switches.
 */
class CreateVideoAdsAndSettings extends Migration
{
    public function up()
    {
        $db = Database::connect();
        if (Database::getDriverName() === 'sqlite') {
            $db->exec("CREATE TABLE IF NOT EXISTS video_ads (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                video_path TEXT NOT NULL,
                duration_seconds INTEGER NOT NULL DEFAULT 10,
                status TEXT NOT NULL DEFAULT 'active',
                reward_amount DECIMAL(12,4) NOT NULL DEFAULT 0.0000,
                starts_at DATETIME NULL,
                ends_at DATETIME NULL,
                daily_limit INTEGER NOT NULL DEFAULT 0,
                total_limit INTEGER NOT NULL DEFAULT 0,
                total_views INTEGER NOT NULL DEFAULT 0,
                completed_views INTEGER NOT NULL DEFAULT 0,
                created_by INTEGER NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NULL
            )");
            $db->exec('CREATE INDEX IF NOT EXISTS idx_video_ads_status ON video_ads (status)');
            $db->exec('CREATE INDEX IF NOT EXISTS idx_video_ads_dates ON video_ads (starts_at, ends_at)');
            $db->exec("CREATE TABLE IF NOT EXISTS video_ad_views (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                video_ad_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                reward_amount DECIMAL(12,4) NOT NULL DEFAULT 0.0000,
                started_at DATETIME NOT NULL,
                completed_at DATETIME NULL,
                claimed_at DATETIME NULL,
                ip_address TEXT NULL,
                user_agent TEXT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )");
            $db->exec('CREATE INDEX IF NOT EXISTS idx_video_views_user ON video_ad_views (user_id)');
            $db->exec('CREATE INDEX IF NOT EXISTS idx_video_views_ad ON video_ad_views (video_ad_id)');
            $db->exec('CREATE INDEX IF NOT EXISTS idx_video_views_started ON video_ad_views (started_at)');
        } else {
            $db->exec("CREATE TABLE IF NOT EXISTS video_ads (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(160) NOT NULL,
                video_path VARCHAR(255) NOT NULL,
                duration_seconds INT NOT NULL DEFAULT 10,
                status VARCHAR(16) NOT NULL DEFAULT 'active',
                reward_amount DECIMAL(12,4) NOT NULL DEFAULT 0.0000,
                starts_at TIMESTAMP NULL,
                ends_at TIMESTAMP NULL,
                daily_limit INT NOT NULL DEFAULT 0,
                total_limit INT NOT NULL DEFAULT 0,
                total_views INT NOT NULL DEFAULT 0,
                completed_views INT NOT NULL DEFAULT 0,
                created_by INT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NULL,
                INDEX idx_video_ads_status (status),
                INDEX idx_video_ads_dates (starts_at, ends_at)
            ) ENGINE=INNODB;");
            $db->exec("CREATE TABLE IF NOT EXISTS video_ad_views (
                id INT AUTO_INCREMENT PRIMARY KEY,
                video_ad_id INT NOT NULL,
                user_id INT NOT NULL,
                reward_amount DECIMAL(12,4) NOT NULL DEFAULT 0.0000,
                started_at TIMESTAMP NOT NULL,
                completed_at TIMESTAMP NULL,
                claimed_at TIMESTAMP NULL,
                ip_address VARCHAR(64) NULL,
                user_agent VARCHAR(250) NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_video_views_user (user_id),
                INDEX idx_video_views_ad (video_ad_id),
                INDEX idx_video_views_started (started_at)
            ) ENGINE=INNODB;");
        }

        $defaults = [
            ['advertisement_system_enabled', '1', 'boolean', 'advertisement', 'Master switch for configured website and app advertisements.'],
            ['watch_earn_enabled', '1', 'boolean', 'advertisement', 'Separate master switch for user watch-and-earn rewards.'],
            ['website_ads_enabled', '1', 'boolean', 'advertisement', 'Enable website ad placements.'],
            ['app_ads_enabled', '1', 'boolean', 'advertisement', 'Enable Android/app ad placements.'],
            ['website_publisher_id', '', 'string', 'advertisement', 'Website ad-network publisher ID.'],
            ['app_publisher_id', '', 'string', 'advertisement', 'App ad-network publisher ID.'],
            ['website_ad_units', '{}', 'json', 'advertisement', 'Website ad-unit configuration by placement.'],
            ['app_ad_units', '{}', 'json', 'advertisement', 'App banner/interstitial/rewarded ad-unit configuration.'],
            ['ad_frequency_seconds', '60', 'integer', 'advertisement', 'Minimum seconds between eligible ad starts per user.'],
        ];
        foreach ($defaults as [$key, $value, $type, $category, $description]) {
            try {
                Fluent::table('platform_settings')->insert([
                    'setting_key' => $key,
                    'value' => $value,
                    'value_type' => $type,
                    'category' => $category,
                    'description' => $description,
                    'created_at' => date('Y-m-d H:i:s'),
                ]);
            } catch (\Throwable $e) {
                // Existing settings are left unchanged on retries.
            }
        }
    }

    public function down()
    {
        Database::connect()->exec('DROP TABLE IF EXISTS video_ad_views');
        Database::connect()->exec('DROP TABLE IF EXISTS video_ads');
    }
}
