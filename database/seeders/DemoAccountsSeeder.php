<?php
declare(strict_types=1);

use Nemesis\Database\Seeder;
use Nemesis\Core\Database;
use Nemesis\Core\Fluent;

/**
 * DemoAccountsSeeder — idempotent accounts for manual marketplace testing.
 *
 * Intended for local or staging environments. Run after migrations with:
 *   php nemesis db:seed DemoAccountsSeeder
 *
 * Existing accounts are role-reconciled but their passwords and balances are
 * not reset. New accounts use the documented demo password.
 */
class DemoAccountsSeeder extends Seeder
{
    public function run(): void
    {
        $db = Database::connect();
        $columns = $this->userColumns($db);
        if (!isset($columns['role'])) {
            throw new RuntimeException('Run the Phase 3 user-role migration before DemoAccountsSeeder.');
        }

        $now = date('Y-m-d H:i:s');
        $today = date('Y-m-d');
        $password = 'JMJobDemo!2026';
        $accounts = [
            [
                'name' => 'JMJob Admin Demo', 'email' => 'admin-demo@example.com', 'username' => 'admin_demo',
                'referral_code' => 'ADMINDEMO1', 'role' => 'admin', 'is_admin' => 1,
                'balance' => 0.0, 'wallet_balance' => 0.0,
            ],
            [
                'name' => 'Worker Demo A', 'email' => 'worker@example.com', 'username' => 'worker_demo',
                'referral_code' => 'WORKER001', 'role' => 'worker', 'is_admin' => 0,
                'balance' => 100.0, 'wallet_balance' => 0.0,
            ],
            [
                'name' => 'Worker Demo B', 'email' => 'worker2@example.com', 'username' => 'worker_demo_2',
                'referral_code' => 'WORKER002', 'role' => 'worker', 'is_admin' => 0,
                'balance' => 100.0, 'wallet_balance' => 0.0,
            ],
            [
                'name' => 'Poster Demo A', 'email' => 'poster@example.com', 'username' => 'poster_demo',
                'referral_code' => 'POSTER001', 'role' => 'poster', 'is_admin' => 0,
                'balance' => 0.0, 'wallet_balance' => 1000.0,
            ],
            [
                'name' => 'Poster Demo B', 'email' => 'poster2@example.com', 'username' => 'poster_demo_2',
                'referral_code' => 'POSTER002', 'role' => 'poster', 'is_admin' => 0,
                'balance' => 0.0, 'wallet_balance' => 1000.0,
            ],
        ];

        foreach ($accounts as $account) {
            $existing = Fluent::table('users')->where('email', '=', $account['email'])->first();
            if ($existing) {
                Fluent::table('users')->where('id', '=', (int) $existing['id'])->update([
                    'role' => $account['role'],
                    'is_admin' => $account['is_admin'],
                    'updated_at' => $now,
                ]);
                echo "DemoAccountsSeeder: kept {$account['email']} ({$account['role']}).\n";
                continue;
            }

            $data = [
                'name' => $account['name'],
                'email' => $account['email'],
                'username' => $account['username'],
                'password' => password_hash($password, PASSWORD_BCRYPT),
                'referral_code' => $account['referral_code'],
                'referred_by' => null,
                'balance' => $account['balance'],
                'wallet_balance' => $account['wallet_balance'],
                'frozen_balance' => 0.0,
                'total_spent' => 0.0,
                'total_posted_earned' => 0.0,
                'rating' => 0.0,
                'rating_count' => 0,
                'lifetime_earned' => 0.0,
                'today_earned' => 0.0,
                'ads_limit' => 50,
                'today_ads' => 0,
                'last_ad_reset_at' => $today,
                'is_admin' => $account['is_admin'],
                'role' => $account['role'],
                'created_at' => $now,
                'updated_at' => $now,
            ];
            Fluent::table('users')->insert(array_intersect_key($data, $columns));
            echo "DemoAccountsSeeder: created {$account['email']} ({$account['role']}).\n";
        }

        echo "DemoAccountsSeeder: done. Demo password: {$password}\n";
    }

    /** @return array<string, bool> */
    private function userColumns(\PDO $db): array
    {
        $isSqlite = Database::getDriverName() === 'sqlite';
        $rows = $isSqlite
            ? $db->query('PRAGMA table_info(users)')->fetchAll(\PDO::FETCH_ASSOC)
            : $db->query('SHOW COLUMNS FROM users')->fetchAll(\PDO::FETCH_ASSOC);
        $columns = [];
        foreach ($rows as $row) {
            $name = $isSqlite ? ($row['name'] ?? null) : ($row['Field'] ?? null);
            if (is_string($name) && $name !== '') $columns[$name] = true;
        }
        return $columns;
    }
}
