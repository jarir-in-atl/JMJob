<?php

use Nemesis\Database\Seeder;
use Nemesis\Core\Database;
use Nemesis\Core\Fluent;

/**
 * EarnAppSeeder — populate demo data for development.
 *
 * Inserts:
 *   - 1 admin user (admin@example.com / password)
 *   - 3 regular users (alice, bob, carol — all with password "password")
 *   - 3 ad providers (gigapub, tgads, simulated — only simulated enabled by default)
 *   - 8 web tasks
 *   - 5 telegram tasks
 *   - 2 sample withdrawals (1 approved, 1 pending)
 */
class EarnAppSeeder extends Seeder
{
    public function run(): void
    {
        $db = Database::connect();

        // ----- Users -----
        $now = date('Y-m-d H:i:s');
        $today = date('Y-m-d');

        // Admin
        $exists = (int) (Fluent::table('users')->where('email', '=', 'admin@example.com')->select(['COUNT(*) AS c'])->first()['c'] ?? 0);
        if ($exists === 0) {
            Fluent::table('users')->insert([
                'name' => 'Site Admin', 'email' => 'admin@example.com', 'username' => 'admin',
                'password' => password_hash('password', PASSWORD_BCRYPT),
                'referral_code' => 'ADMIN001', 'referred_by' => null,
                'balance' => 0, 'lifetime_earned' => 0, 'today_earned' => 0,
                'ads_limit' => 50, 'today_ads' => 0, 'last_ad_reset_at' => $today,
                'is_admin' => 1, 'created_at' => $now, 'updated_at' => $now,
            ]);
        }

        // Demo users
        $alice = (int) (Fluent::table('users')->where('email', '=', 'alice@example.com')->select(['COUNT(*) AS c'])->first()['c'] ?? 0);
        if ($alice === 0) {
            $aliceId = Fluent::table('users')->insert([
                'name' => 'Alice Demo', 'email' => 'alice@example.com', 'username' => 'alice',
                'password' => password_hash('password', PASSWORD_BCRYPT),
                'referral_code' => 'ALICE001', 'referred_by' => null,
                'balance' => 1.234, 'lifetime_earned' => 2.500, 'today_earned' => 0.05,
                'ads_limit' => 50, 'today_ads' => 10, 'last_ad_reset_at' => $today,
                'is_admin' => 0, 'created_at' => $now, 'updated_at' => $now,
            ]);
            $bobId = Fluent::table('users')->insert([
                'name' => 'Bob Demo', 'email' => 'bob@example.com', 'username' => 'bob',
                'password' => password_hash('password', PASSWORD_BCRYPT),
                'referral_code' => 'BOB00001', 'referred_by' => $aliceId,
                'balance' => 0.42, 'lifetime_earned' => 0.50, 'today_earned' => 0.005,
                'ads_limit' => 50, 'today_ads' => 1, 'last_ad_reset_at' => $today,
                'is_admin' => 0, 'created_at' => $now, 'updated_at' => $now,
            ]);
            $carolId = Fluent::table('users')->insert([
                'name' => 'Carol Demo', 'email' => 'carol@example.com', 'username' => 'carol',
                'password' => password_hash('password', PASSWORD_BCRYPT),
                'referral_code' => 'CAROL001', 'referred_by' => $aliceId,
                'balance' => 0.10, 'lifetime_earned' => 0.10, 'today_earned' => 0.0,
                'ads_limit' => 50, 'today_ads' => 0, 'last_ad_reset_at' => $today,
                'is_admin' => 0, 'created_at' => $now, 'updated_at' => $now,
            ]);
        }

        // ----- Ad Providers -----
        $providers = [
            ['slug' => 'gigapub',   'name' => 'GigaPub',           'block_id' => getenv('AD_PROVIDER_GIGAPUB_ID') ?: '7387', 'enabled' => 0, 'weight' => 100, 'reward_per_view' => 0.0050, 'min_duration_seconds' => 12],
            ['slug' => 'tgads',     'name' => 'TgAds (AdExium)',   'block_id' => getenv('AD_PROVIDER_TGADS_ID')   ?: '',     'enabled' => 0, 'weight' => 100, 'reward_per_view' => 0.0060, 'min_duration_seconds' => 12],
            ['slug' => 'simulated', 'name' => 'Nemesis Simulated', 'block_id' => null,                                                              'enabled' => 1, 'weight' => 100, 'reward_per_view' => 0.0050, 'min_duration_seconds' => 12],
        ];
        foreach ($providers as $p) {
            $exists = (int) (Fluent::table('ad_providers')->where('slug', '=', $p['slug'])->select(['COUNT(*) AS c'])->first()['c'] ?? 0);
            if ($exists === 0) {
                $p['created_at'] = $now;
                $p['updated_at'] = $now;
                Fluent::table('ad_providers')->insert($p);
            }
        }

        // ----- Web Tasks -----
        $webTasks = [
            ['Visit Example.com and Sign Up', 'Create a free account on Example.com to claim the reward.', 'https://example.com/', 0.10, 30, 'duration', 1, 1],
            ['Star the Demo Repo on GitHub',  'Click the star button on our GitHub repository.',               'https://github.com/',   0.05, 15, 'duration', 1, 1],
            ['Subscribe to Newsletter',        'Subscribe to our newsletter for the latest updates.',          'https://example.com/newsletter', 0.08, 20, 'duration', 1, 1],
            ['Try the Demo App',                'Spend 30 seconds on our demo product page.',                    'https://example.com/demo', 0.15, 30, 'duration', 1, 1],
            ['Follow on Twitter',               'Follow our official Twitter/X account.',                        'https://twitter.com/',   0.05, 10, 'duration', 1, 1],
            ['Like our Facebook Page',          'Like our official Facebook page.',                              'https://facebook.com/',  0.05, 10, 'duration', 1, 1],
            ['Join Discord Server',             'Join our community Discord server.',                             'https://discord.com/',   0.12, 20, 'duration', 1, 1],
            ['Download Mobile App',             'Download and install our mobile app.',                          'https://example.com/app', 0.50, 60, 'duration', 1, 1],
        ];
        foreach ($webTasks as $i => $t) {
            $title = $t[0];
            $exists = (int) (Fluent::table('web_tasks')->where('title', '=', $title)->select(['COUNT(*) AS c'])->first()['c'] ?? 0);
            if ($exists === 0) {
                Fluent::table('web_tasks')->insert([
                    'title' => $title, 'description' => $t[1], 'target_url' => $t[2],
                    'reward' => $t[3], 'duration_seconds' => $t[4], 'verification_type' => $t[5],
                    'active' => $t[6], 'daily_limit_per_user' => $t[7],
                    'created_at' => $now, 'updated_at' => $now,
                ]);
            }
        }

        // ----- Telegram Tasks -----
        $tgTasks = [
            ['@crypto_news_daily',  'Crypto News Daily',    'Subscribe to our crypto news channel.',                0.020],
            ['@tech_updates_hub',   'Tech Updates Hub',     'Stay up to date with the latest in tech.',            0.020],
            ['@trading_signals',    'Trading Signals',      'Join our daily trading signals channel.',              0.025],
            ['@airdrop_alerts',     'Airdrop Alerts',       'Get notified of new airdrops and token launches.',     0.030],
            ['@community_chat',     'Community Chat',       'Join the community discussion group.',                 0.015],
        ];
        foreach ($tgTasks as $t) {
            $exists = (int) (Fluent::table('telegram_tasks')->where('channel_username', '=', $t[0])->select(['COUNT(*) AS c'])->first()['c'] ?? 0);
            if ($exists === 0) {
                Fluent::table('telegram_tasks')->insert([
                    'channel_username' => $t[0], 'channel_name' => $t[1], 'description' => $t[2],
                    'reward' => $t[3], 'active' => 1, 'created_at' => $now, 'updated_at' => $now,
                ]);
            }
        }

        // ----- Sample Withdrawals -----
        $wdCount = (int) (Fluent::table('withdrawals')->select(['COUNT(*) AS c'])->first()['c'] ?? 0);
        if ($wdCount === 0) {
            // Find Alice
            $aliceRow = Fluent::table('users')->where('email', '=', 'alice@example.com')->first();
            $bobRow   = Fluent::table('users')->where('email', '=', 'bob@example.com')->first();
            if ($aliceRow) {
                Fluent::table('withdrawals')->insert([
                    'user_id' => $aliceRow['id'], 'amount' => 1.00, 'gateway' => 'bkash',
                    'wallet_address' => '01700000001', 'status' => 'approved',
                    'admin_note' => 'Auto-approved seed data', 'requested_at' => $now,
                    'processed_at' => $now, 'processed_by' => $aliceRow['id'],
                ]);
            }
            if ($bobRow) {
                Fluent::table('withdrawals')->insert([
                    'user_id' => $bobRow['id'], 'amount' => 0.40, 'gateway' => 'nagad',
                    'wallet_address' => '01800000002', 'status' => 'pending',
                    'admin_note' => null, 'requested_at' => $now,
                    'processed_at' => null, 'processed_by' => null,
                ]);
            }
        }

        echo "EarnAppSeeder: done.\n";
    }
}
