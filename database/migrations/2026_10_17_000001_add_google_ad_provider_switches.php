<?php

use Nemesis\Database\Migration;
use Nemesis\Core\Fluent;

/** Add independent Google AdSense and AdMob provider switches. */
class AddGoogleAdProviderSwitches extends Migration
{
    public function up()
    {
        $defaults = [
            ['google_adsense_enabled', '0', 'boolean', 'advertisement', 'Enable configured Google AdSense website placements.'],
            ['google_admob_enabled', '0', 'boolean', 'advertisement', 'Enable configured Google AdMob app placements.'],
        ];

        foreach ($defaults as [$key, $value, $type, $category, $description]) {
            $existing = Fluent::table('platform_settings')
                ->where('setting_key', '=', $key)
                ->first();
            if ($existing !== null) continue;

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
        foreach (['google_adsense_enabled', 'google_admob_enabled'] as $key) {
            Fluent::table('platform_settings')->where('setting_key', '=', $key)->delete();
        }
    }
}
