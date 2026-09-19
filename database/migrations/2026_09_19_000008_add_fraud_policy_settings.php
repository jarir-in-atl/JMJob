<?php

use Nemesis\Database\Migration;
use Nemesis\Core\Database;
use Nemesis\Core\Fluent;

/**
 * Runtime fraud-policy thresholds. Signals remain advisory; only an explicit
 * administrator confirmed-fraud decision can block payment or request a ban.
 */
class AddFraudPolicySettings extends Migration
{
    public function up()
    {
        Database::connect();
        $defaults = [
            [
                'fraud_min_description_chars',
                '20',
                'integer',
                'fraud',
                'Minimum description length that adds a short-description risk signal.',
            ],
            [
                'fraud_daily_submission_velocity_limit',
                '10',
                'integer',
                'fraud',
                'Submissions in 24 hours at or above this count add a velocity risk signal.',
            ],
            [
                'fraud_shared_identity_worker_threshold',
                '2',
                'integer',
                'fraud',
                'Distinct workers sharing an IP or client fingerprint at or above this count add a risk signal.',
            ],
            [
                'fraud_review_threshold',
                '20',
                'integer',
                'fraud',
                'Risk score at or above this value enters the administrator fraud-review queue.',
            ],
            [
                'fraud_ban_requires_confirmation',
                '1',
                'boolean',
                'fraud',
                'Require an explicit confirmed-fraud administrator decision before ban escalation.',
            ],
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
            } catch (\Throwable) {
                // Existing values are administrator-owned and remain unchanged.
            }
        }
    }

    public function down()
    {
        // Keep policy history and administrator overrides on rollback.
    }
}
