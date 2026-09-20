<?php

use Nemesis\Database\Migration;
use Nemesis\Core\Database;
use Nemesis\Core\Fluent;

/** Adds the admin-controlled registration SMS OTP switch, disabled by default. */
class AddRegistrationOtpSetting extends Migration
{
    public function up(): void
    {
        Database::connect();
        $existing = Fluent::table('platform_settings')
            ->where('setting_key', '=', 'registration_otp_enabled')
            ->first();

        if ($existing === null) {
            Fluent::table('platform_settings')->insert([
                'setting_key' => 'registration_otp_enabled',
                'value' => '0',
                'value_type' => 'boolean',
                'category' => 'authentication',
                'description' => 'Require a phone SMS verification code before completing registration.',
                'created_at' => date('Y-m-d H:i:s'),
            ]);
        }
    }

    public function down(): void
    {
        // Keep the setting on rollback so administrator configuration is not lost.
    }
}
