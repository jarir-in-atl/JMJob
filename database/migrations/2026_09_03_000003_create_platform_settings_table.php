<?php

use Nemesis\Database\Migration;
use Nemesis\Core\Database;
use Nemesis\Core\Fluent;

/**
 * Phase 3 — `platform_settings` (key-value config with type + category).
 *
 * Holds runtime-editable platform configuration (commission rate, currency,
 * escrow mode, withdrawal caps, job-budget limits). Read via SettingService
 * throughout the app; mutated only via /api/admin/settings endpoints.
 *
 * Seeds the defaults from §10.0 of PLAN.md on first create.
 */
class CreatePlatformSettingsTable extends Migration {
    public function up() {
        // NOTE: column is named `setting_key` (not `key`) because `key` is a
        // reserved word in MySQL/MariaDB and our Fluent query builder does
        // not quote column names. The model wraps this so the public API
        // (PlatformSetting::$key) is unchanged.
        Database::connect()->exec("CREATE TABLE IF NOT EXISTS platform_settings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            setting_key VARCHAR(64) NOT NULL,
            value TEXT NULL,
            value_type VARCHAR(16) NOT NULL DEFAULT 'string',
            category VARCHAR(32) NOT NULL DEFAULT 'general',
            description VARCHAR(255) NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NULL,
            UNIQUE KEY uq_platform_settings_key (setting_key),
            INDEX idx_platform_settings_category (category)
        ) ENGINE=INNODB;");

        // Seed defaults — using Fluent::table()->insert() which uses PDO
        // prepared statements correctly (Database::exec() only takes the
        // SQL string, not bind params).
        $defaults = [
            ['commission_rate',    '0.10',     'decimal',  'commission',  'Platform commission as a fraction (0.10 = 10%) applied when poster releases payment to worker.'],
            ['default_currency',   'BDT',      'string',   'currency',    'Default currency code (ISO 4217) shown across the UI.'],
            ['currency_symbol',    '৳',        'string',   'currency',    'Symbol rendered next to amounts.'],
            ['escrow_mode',        'full_bid', 'string',   'escrow',      'How much of a worker bid is moved to frozen_balance when accepted. Allowed: full_bid | flat_percent.'],
            ['escrow_percent',     '100',      'integer',  'escrow',      'When escrow_mode=flat_percent, this percent of the bid is held in escrow (0-100).'],
            ['min_withdrawal',     '50.00',    'decimal',  'withdrawal',  'Minimum withdrawal amount in the default currency.'],
            ['max_job_budget',     '50000.00', 'decimal',  'jobs',        'Maximum budget allowed when a poster posts a new job.'],
            ['min_job_budget',     '100.00',   'decimal',  'jobs',        'Minimum budget allowed when a poster posts a new job.'],
            ['ad_bidding_window_hours', '72',   'integer',  'jobs',        'How long a posted job stays open for bids before auto-closing.'],
        ];

        $now = date('Y-m-d H:i:s');
        $errors = [];
        foreach ($defaults as [$k, $v, $type, $cat, $desc]) {
            try {
                Fluent::table('platform_settings')->insert([
                    'setting_key'  => $k,
                    'value'        => $v,
                    'value_type'   => $type,
                    'category'     => $cat,
                    'description'  => $desc,
                    'created_at'   => $now,
                ]);
            } catch (Throwable $e) {
                $errors[] = "{$k}: " . $e->getMessage();
            }
        }
        if (!empty($errors)) {
            echo "platform_settings seed errors:\n  " . implode("\n  ", $errors) . "\n";
        }
        $count = Fluent::table('platform_settings')->select(['COUNT(*) AS c'])->first()['c'] ?? 0;
        echo "platform_settings row count: {$count}\n";
    }

    public function down() {
        Database::connect()->exec("DROP TABLE IF EXISTS platform_settings;");
    }
}
