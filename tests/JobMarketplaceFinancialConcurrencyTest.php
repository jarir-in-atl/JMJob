<?php
declare(strict_types=1);

/**
 * Disposable two-process race checks for withdrawal and rewarded-video money
 * boundaries.
 *
 * Safety: this script refuses to run unless JOB_MARKETPLACE_TEST_DB points to
 * a SQLite file under /tmp. Apply migrations first, then run:
 *   JOB_MARKETPLACE_TEST_DB=/tmp/jmjob-fraud-policy-20260919.sqlite \
 *   php tests/JobMarketplaceFinancialConcurrencyTest.php
 */

$databasePath = (string) (getenv('JOB_MARKETPLACE_TEST_DB') ?: '');
if ($databasePath === '' || !str_starts_with($databasePath, '/tmp/') || !str_ends_with($databasePath, '.sqlite')) {
    fwrite(STDERR, "Refusing to run: JOB_MARKETPLACE_TEST_DB must be a /tmp/*.sqlite path.\n");
    exit(2);
}

putenv('DB_DRIVER=sqlite');
putenv('DB_DATABASE=' . $databasePath);
putenv('NOTIFICATIONS_EMAIL_ENABLED=0');
putenv('WITHDRAW_MIN_REFERRALS=0');
$_ENV['DB_DRIVER'] = 'sqlite';
$_SERVER['DB_DRIVER'] = 'sqlite';
$_ENV['DB_DATABASE'] = $databasePath;
$_SERVER['DB_DATABASE'] = $databasePath;
$_ENV['NOTIFICATIONS_EMAIL_ENABLED'] = '0';
$_SERVER['NOTIFICATIONS_EMAIL_ENABLED'] = '0';
$_ENV['WITHDRAW_MIN_REFERRALS'] = '0';
$_SERVER['WITHDRAW_MIN_REFERRALS'] = '0';

require_once __DIR__ . '/../vendor/autoload.php';

use App\Http\Controllers\Api\VideoAdController;
use App\Models\User;
use App\Services\PaymentService;
use App\Services\WithdrawalService;
use Nemesis\Core\Config;
use Nemesis\Core\Database;
use Nemesis\Http\Request;

Config::load(dirname(__DIR__));
Database::connect((require dirname(__DIR__) . '/config/config.php')['database']);
$db = Database::connect();

foreach (['users', 'withdrawals', 'payment_submissions', 'transactions', 'video_ads', 'video_ad_views', 'ad_views', 'notifications'] as $table) {
    $check = $db->prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?");
    $check->execute([$table]);
    if (!$check->fetchColumn()) {
        fwrite(STDERR, "Missing table {$table}; run migrations first.\n");
        exit(3);
    }
}
unset($check);

$suffix = bin2hex(random_bytes(4));
$userId = 0;
$adminId = 0;
$paymentSubmissionId = 0;
$videoAdId = 0;
$videoViewId = 0;
$exitCode = 0;

$assert = static function (bool $condition, string $message): void {
    if (!$condition) throw new RuntimeException($message);
};

$env = array_merge($_ENV, [
    'DB_DRIVER' => 'sqlite',
    'DB_DATABASE' => $databasePath,
    'NOTIFICATIONS_EMAIL_ENABLED' => '0',
    'WITHDRAW_MIN_REFERRALS' => '0',
]);
$spec = [1 => ['pipe', 'w'], 2 => ['pipe', 'w']];

$runChildren = static function (array $commands) use ($env, $spec): array {
    $processes = [];
    foreach ($commands as $command) {
        $pipes = [];
        $process = proc_open($command, $spec, $pipes, dirname(__DIR__), $env);
        if (!is_resource($process)) throw new RuntimeException('Could not start financial race child process.');
        $processes[] = [$process, $pipes];
    }

    $results = [];
    foreach ($processes as [$process, $pipes]) {
        $stdout = stream_get_contents($pipes[1]);
        $stderr = stream_get_contents($pipes[2]);
        fclose($pipes[1]);
        fclose($pipes[2]);
        $status = proc_close($process);
        $decoded = json_decode(trim((string) $stdout), true);
        if (!is_array($decoded)) {
            throw new RuntimeException('Financial race child returned invalid output: ' . trim((string) $stdout) . ' ' . trim((string) $stderr));
        }
        $results[] = $decoded + ['process_status' => $status, 'stderr' => trim((string) $stderr)];
    }
    return $results;
};

if (($argv[1] ?? '') === '--withdraw-child') {
    $worker = User::find((int) ($argv[2] ?? 0));
    $result = $worker === null
        ? ['success' => false, 'message' => 'Withdrawal race user not found.']
        : (new WithdrawalService())->request($worker, 80, 'bkash', '01900000000');
    echo json_encode([
        'success' => (bool) ($result['success'] ?? false),
        'message' => (string) ($result['message'] ?? ''),
    ], JSON_UNESCAPED_UNICODE) . "\n";
    exit(0);
}

if (($argv[1] ?? '') === '--approve-payment-child') {
    $payment = new PaymentService();
    $admin = User::find((int) ($argv[3] ?? 0));
    $result = $admin === null
        ? ['success' => false, 'message' => 'Payment race admin not found.']
        : $payment->approve((int) ($argv[2] ?? 0), $admin, 'Concurrent payment approval check.');
    echo json_encode([
        'success' => (bool) ($result['success'] ?? false),
        'message' => (string) ($result['message'] ?? ''),
    ], JSON_UNESCAPED_UNICODE) . "\n";
    exit(0);
}

if (($argv[1] ?? '') === '--claim-child') {
    $_POST = ['view_id' => (int) ($argv[2] ?? 0)];
    $request = new Request();
    $request->setMeta('auth.user', User::find((int) ($argv[3] ?? 0)));
    $response = (new VideoAdController())->claim($request);
    $body = json_decode($response->getContent(), true);
    echo json_encode([
        'success' => (bool) ($body['success'] ?? false),
        'already_claimed' => (bool) ($body['data']['already_claimed'] ?? false),
        'status' => $response->getStatus(),
        'message' => (string) ($body['message'] ?? ''),
    ], JSON_UNESCAPED_UNICODE) . "\n";
    exit(0);
}

try {
    $insertUser = $db->prepare(
        'INSERT INTO users (username,email,password,name,is_admin,role,balance,ads_limit,today_ads) VALUES (?,?,?,?,?,?,?,?,?)'
    );
    $insertUser->execute([
        "financial-race-{$suffix}",
        "financial-race-{$suffix}@example.test",
        'x',
        'Financial Race User',
        0,
        'worker',
        100,
        50,
        0,
    ]);
    $userId = (int) $db->lastInsertId();
    $insertUser->execute([
        "financial-race-admin-{$suffix}",
        "financial-race-admin-{$suffix}@example.test",
        'x',
        'Financial Race Admin',
        1,
        'admin',
        0,
        0,
        0,
    ]);
    $adminId = (int) $db->lastInsertId();

    // Two withdrawals of 80 must not both pass against the same balance.
    unset($insertUser);
    $db = null;
    Database::disconnect();
    $withdrawCommand = escapeshellarg(PHP_BINARY) . ' ' . escapeshellarg(__FILE__)
        . ' --withdraw-child ' . escapeshellarg((string) $userId);
    $withdrawResults = $runChildren([$withdrawCommand, $withdrawCommand]);
    $db = Database::connect();
    $withdrawSuccesses = count(array_filter($withdrawResults, static fn(array $result): bool => ($result['success'] ?? false) === true));
    $assert($withdrawSuccesses === 1, 'Withdrawal race did not produce exactly one accepted request: ' . json_encode($withdrawResults));
    $withdrawCount = $db->prepare('SELECT COUNT(*) FROM withdrawals WHERE user_id = ? AND status = ?');
    $withdrawCount->execute([$userId, 'pending']);
    $assert((int) $withdrawCount->fetchColumn() === 1, 'Withdrawal race created more than one pending request.');
    $balance = $db->prepare('SELECT balance FROM users WHERE id = ?');
    $balance->execute([$userId]);
    $assert(abs((float) $balance->fetchColumn() - 20.0) < 0.0001, 'Withdrawal race debited the balance more than once.');

    // Two administrators approving one pending deposit may credit the worker
    // only once, even when both loaded the pending row before the race.
    $insertPayment = $db->prepare(
        'INSERT INTO payment_submissions (user_id,gateway,sender_number,amount,trxid,status,created_at) VALUES (?,?,?,?,?,?,CURRENT_TIMESTAMP)'
    );
    $insertPayment->execute([$userId, 'bkash', '01900000000', 10, "FINRACE{$suffix}", 'pending']);
    $paymentSubmissionId = (int) $db->lastInsertId();
    unset($insertPayment, $withdrawCount, $balance);
    $db = null;
    Database::disconnect();
    $paymentCommand = escapeshellarg(PHP_BINARY) . ' ' . escapeshellarg(__FILE__)
        . ' --approve-payment-child ' . escapeshellarg((string) $paymentSubmissionId) . ' ' . escapeshellarg((string) $adminId);
    $paymentResults = $runChildren([$paymentCommand, $paymentCommand]);
    $db = Database::connect();
    $paymentSuccesses = count(array_filter($paymentResults, static fn(array $result): bool => ($result['success'] ?? false) === true));
    $assert($paymentSuccesses === 1, 'Payment approval race did not produce exactly one accepted approval: ' . json_encode($paymentResults));
    $paymentState = $db->prepare('SELECT status FROM payment_submissions WHERE id = ?');
    $paymentState->execute([$paymentSubmissionId]);
    $assert($paymentState->fetchColumn() === 'approved', 'Payment approval race left the deposit in the wrong state.');
    $paymentLedger = $db->prepare("SELECT COUNT(*) FROM transactions WHERE user_id = ? AND reference = ? AND type = 'deposit'");
    $paymentLedger->execute([$userId, 'payment:' . $paymentSubmissionId]);
    $assert((int) $paymentLedger->fetchColumn() === 1, 'Payment approval race wrote more than one deposit ledger row.');
    $postPaymentBalance = $db->prepare('SELECT balance FROM users WHERE id = ?');
    $postPaymentBalance->execute([$userId]);
    $assert(abs((float) $postPaymentBalance->fetchColumn() - 30.0) < 0.0001, 'Payment approval race credited the balance more than once.');
    unset($postPaymentBalance, $paymentState, $paymentLedger);

    // One old-enough view may be claimed by two processes, but only one
    // reward ledger entry and one claimed view are allowed.
    $insertAd = $db->prepare(
        'INSERT INTO video_ads (title,video_path,duration_seconds,status,reward_amount,created_at) VALUES (?,?,?,?,?,CURRENT_TIMESTAMP)'
    );
    $insertAd->execute(["Financial race ad {$suffix}", 'video-ads/financial-race.mp4', 1, 'active', 1]);
    $videoAdId = (int) $db->lastInsertId();
    $insertView = $db->prepare(
        "INSERT INTO video_ad_views (video_ad_id,user_id,reward_amount,started_at,created_at) VALUES (?,?,?,datetime('now','-3600 seconds'),CURRENT_TIMESTAMP)"
    );
    $insertView->execute([$videoAdId, $userId, 1]);
    $videoViewId = (int) $db->lastInsertId();

    unset($insertAd, $insertView, $withdrawCount, $balance);
    $db = null;
    Database::disconnect();
    $claimCommand = escapeshellarg(PHP_BINARY) . ' ' . escapeshellarg(__FILE__)
        . ' --claim-child ' . escapeshellarg((string) $videoViewId) . ' ' . escapeshellarg((string) $userId);
    $claimResults = $runChildren([$claimCommand, $claimCommand]);
    $db = Database::connect();
    $claimSuccesses = count(array_filter($claimResults, static fn(array $result): bool => ($result['success'] ?? false) === true));
    $alreadyClaimed = count(array_filter($claimResults, static fn(array $result): bool => ($result['already_claimed'] ?? false) === true));
    $assert($claimSuccesses === 2 && $alreadyClaimed === 1, 'Video claim race did not return one credit and one idempotent response: ' . json_encode($claimResults));
    $claimed = $db->prepare('SELECT COUNT(*) FROM video_ad_views WHERE id = ? AND claimed_at IS NOT NULL');
    $claimed->execute([$videoViewId]);
    $assert((int) $claimed->fetchColumn() === 1, 'Video claim race did not leave exactly one claimed view.');
    $rewardRows = $db->prepare("SELECT COUNT(*) FROM ad_views WHERE user_id = ? AND provider = 'video_ad'");
    $rewardRows->execute([$userId]);
    $assert((int) $rewardRows->fetchColumn() === 1, 'Video claim race credited more than one reward ledger row.');

    echo "Job marketplace payment, withdrawal, and video-claim race checks passed.\n";
} catch (Throwable $e) {
    fwrite(STDERR, "Job marketplace financial race checks failed: {$e->getMessage()}\n");
    $exitCode = 1;
} finally {
    if (!isset($db) || !($db instanceof \PDO)) {
        $db = Database::connect();
    }
    if ($videoViewId > 0) {
        $db->prepare('DELETE FROM video_ad_views WHERE id = ?')->execute([$videoViewId]);
    }
    if ($videoAdId > 0) {
        $db->prepare('DELETE FROM video_ad_views WHERE video_ad_id = ?')->execute([$videoAdId]);
        $db->prepare('DELETE FROM video_ads WHERE id = ?')->execute([$videoAdId]);
    }
    if ($userId > 0) {
        if ($paymentSubmissionId > 0) {
            $db->prepare('DELETE FROM payment_submissions WHERE id = ?')->execute([$paymentSubmissionId]);
        }
        $db->prepare('DELETE FROM transactions WHERE user_id IN (?, ?)')->execute([$userId, $adminId]);
        $db->prepare('DELETE FROM ad_views WHERE user_id = ?')->execute([$userId]);
        $db->prepare('DELETE FROM withdrawals WHERE user_id = ?')->execute([$userId]);
        $db->prepare('DELETE FROM notifications WHERE notifiable_id = ?')->execute([$userId]);
        $db->prepare('DELETE FROM users WHERE id = ?')->execute([$userId]);
    }
    if ($adminId > 0) {
        $db->prepare('DELETE FROM notifications WHERE notifiable_id = ?')->execute([$adminId]);
        $db->prepare('DELETE FROM users WHERE id = ?')->execute([$adminId]);
    }
}

exit($exitCode);
