<?php

use Nemesis\Database\Migration;
use Nemesis\Core\Fluent;

/**
 * Add the separate advertisement controls required by the admin panel.
 *
 * The defaults preserve the behavior of installations created before these
 * switches existed. Existing values are never overwritten on retry.
 */
class AddAdControlSwitches extends Migration
{
    public function up()
    {
        $defaults = [
            ['video_ads_enabled', '1', 'boolean', 'advertisement', 'Enable first-party video advertisement campaigns.'],
            ['reward_system_enabled', '1', 'boolean', 'advertisement', 'Master switch for all user reward credits.'],
            ['ad_network_enabled', '1', 'boolean', 'advertisement', 'Enable external ad-network provider rotation and rewards.'],
        ];

        foreach ($defaults as [$key, $value, $type, $category, $description]) {
            $existing = Fluent::table('platform_settings')
                ->where('setting_key', '=', $key)
                ->first();
            if ($existing !== null) {
                continue;
            }

            Fluent::table('platform_settings')->insert([
                'setting_key' => $key,
                'value' => $value,
                'value_type' => $type,
                'category' => $category,
                'description' => $description,
                'created_at' => date('Y-m-d H:i:s'),
            ]);
        }
    }

    public function down()
    {
        foreach (['video_ads_enabled', 'reward_system_enabled', 'ad_network_enabled'] as $key) {
            Fluent::table('platform_settings')->where('setting_key', '=', $key)->delete();
        }
    }
}
