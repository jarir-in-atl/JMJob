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

use App\Http\Controllers\Api\DailyBonusController;
use App\Http\Controllers\Api\TgTaskController;
use App\Http\Controllers\Api\VideoAdController;
use App\Http\Controllers\Api\WebTaskController;
use App\Models\User;
use App\Services\PaymentService;
use App\Services\RewardService;
use App\Services\WithdrawalService;
use Nemesis\Core\Config;
use Nemesis\Core\Database;
use Nemesis\Http\Request;

Config::load(dirname(__DIR__));
Database::connect((require dirname(__DIR__) . '/config/config.php')['database']);
$db = Database::connect();

foreach (['users', 'withdrawals', 'payment_submissions', 'transactions', 'video_ads', 'video_ad_views', 'ad_views', 'notifications', 'web_tasks', 'web_task_completions', 'telegram_tasks', 'telegram_task_completions'] as $table) {
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
$bonusUserId = 0;
$webTaskId = 0;
$webCompletionId = 0;
$secondWebCompletionId = 0;
$tgTaskId = 0;
$paymentSubmissionId = 0;
$videoAdId = 0;
$videoViewId = 0;
$exitCode = 0;

$assert = static function (bool $condition, string $message): void {
    if (!$condition) throw new RuntimeException($message);
};

$env = array_merge($_ENV, [
    'JOB_MARKETPLACE_TEST_DB' => $databasePath,
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

if (($argv[1] ?? '') === '--daily-bonus-child') {
    $request = new Request();
    $request->setMeta('auth.user', User::find((int) ($argv[2] ?? 0)));
    $response = (new DailyBonusController())->claim($request);
    $body = json_decode($response->getContent(), true);
    echo json_encode([
        'success' => (bool) ($body['success'] ?? false),
        'status' => $response->getStatus(),
        'message' => (string) ($body['message'] ?? ''),
    ], JSON_UNESCAPED_UNICODE) . "\n";
    exit(0);
}

if (($argv[1] ?? '') === '--web-claim-child') {
    $_POST = ['completion_id' => (int) ($argv[2] ?? 0)];
    $request = new Request();
    $request->setMeta('auth.user', User::find((int) ($argv[3] ?? 0)));
    $response = (new WebTaskController())->claim($request);
    $body = json_decode($response->getContent(), true);
    echo json_encode([
        'success' => (bool) ($body['success'] ?? false),
        'status' => $response->getStatus(),
        'message' => (string) ($body['message'] ?? ''),
    ], JSON_UNESCAPED_UNICODE) . "\n";
    exit(0);
}

if (($argv[1] ?? '') === '--tg-verify-child') {
    $_POST = ['task_id' => (int) ($argv[2] ?? 0)];
    $request = new Request();
    $request->setMeta('auth.user', User::find((int) ($argv[3] ?? 0)));
    $response = (new TgTaskController())->verify($request);
    $body = json_decode($response->getContent(), true);
    echo json_encode([
        'success' => (bool) ($body['success'] ?? false),
        'status' => $response->getStatus(),
        'message' => (string) ($body['message'] ?? ''),
    ], JSON_UNESCAPED_UNICODE) . "\n";
    exit(0);
}

if (($argv[1] ?? '') === '--legacy-ad-child') {
    $worker = User::find((int) ($argv[2] ?? 0));
    $result = $worker === null
        ? ['success' => false, 'message' => 'Legacy ad race user not found.']
        : (new RewardService())->creditAdReward($worker, 'simulated', 1);
    echo json_encode([
        'success' => (bool) ($result['success'] ?? false),
        'message' => (string) ($result['message'] ?? ''),
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
    $insertUser->execute([
        "financial-race-bonus-{$suffix}",
        "financial-race-bonus-{$suffix}@example.test",
        'x',
        'Financial Race Bonus User',
        0,
        'worker',
        0,
        50,
        10,
    ]);
    $bonusUserId = (int) $db->lastInsertId();
    $db->prepare('UPDATE users SET last_ad_reset_at = ? WHERE id = ?')->execute([date('Y-m-d'), $bonusUserId]);

    // Two simultaneous daily-bonus claims may credit the reward only once.
    unset($insertUser);
    $db = null;
    Database::disconnect();
    $bonusCommand = escapeshellarg(PHP_BINARY) . ' ' . escapeshellarg(__FILE__)
        . ' --daily-bonus-child ' . escapeshellarg((string) $bonusUserId);
    $bonusResults = $runChildren([$bonusCommand, $bonusCommand]);
    $db = Database::connect();
    $bonusSuccesses = count(array_filter($bonusResults, static fn(array $result): bool => ($result['success'] ?? false) === true));
    $assert($bonusSuccesses === 1, 'Daily-bonus race credited more than once or failed entirely: ' . json_encode($bonusResults));
    $bonusUser = $db->prepare('SELECT balance,last_daily_bonus_claim FROM users WHERE id = ?');
    $bonusUser->execute([$bonusUserId]);
    $bonusState = $bonusUser->fetch(\PDO::FETCH_ASSOC);
    $assert(abs((float) ($bonusState['balance'] ?? 0) - 0.05) < 0.0001
        && ($bonusState['last_daily_bonus_claim'] ?? '') === date('Y-m-d'), 'Daily-bonus race left the user balance or claim date incorrect.');
    $bonusLedger = $db->prepare("SELECT COUNT(*) FROM ad_views WHERE user_id = ? AND provider = 'daily_bonus'");
    $bonusLedger->execute([$bonusUserId]);
    $assert((int) $bonusLedger->fetchColumn() === 1, 'Daily-bonus race wrote more than one reward ledger row.');
    unset($bonusUser, $bonusLedger, $bonusState);

    $insertWebTask = $db->prepare(
        'INSERT INTO web_tasks (title,description,target_url,reward,duration_seconds,verification_type,active,daily_limit_per_user,created_at) VALUES (?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP)'
    );
    $insertWebTask->execute(["Financial race web task {$suffix}", 'Web task race', 'https://example.test', 1, 1, 'duration', 1, 1]);
    $webTaskId = (int) $db->lastInsertId();
    $insertWebCompletion = $db->prepare(
        "INSERT INTO web_task_completions (user_id,task_id,started_at,reward) VALUES (?,?,datetime('now','-3600 seconds'),?)"
    );
    $insertWebCompletion->execute([$bonusUserId, $webTaskId, 1]);
    $webCompletionId = (int) $db->lastInsertId();
    $insertTgTask = $db->prepare(
        'INSERT INTO telegram_tasks (channel_username,channel_name,description,reward,active,created_at) VALUES (?,?,?,?,?,CURRENT_TIMESTAMP)'
    );
    $insertTgTask->execute(["@financial_race_{$suffix}", 'Financial race channel', 'Telegram task race', 1, 1]);
    $tgTaskId = (int) $db->lastInsertId();
    unset($insertWebTask, $insertWebCompletion, $insertTgTask);

    // Web-task claims must credit one reward even when two eligible requests
    // race after the completion has become claimable.
    $db = null;
    Database::disconnect();
    $webClaimCommand = escapeshellarg(PHP_BINARY) . ' ' . escapeshellarg(__FILE__)
        . ' --web-claim-child ' . escapeshellarg((string) $webCompletionId) . ' ' . escapeshellarg((string) $bonusUserId);
    $webClaimResults = $runChildren([$webClaimCommand, $webClaimCommand]);
    $db = Database::connect();
    $webClaimSuccesses = count(array_filter($webClaimResults, static fn(array $result): bool => ($result['success'] ?? false) === true));
    $assert($webClaimSuccesses === 1, 'Web-task claim race credited more than once or failed entirely: ' . json_encode($webClaimResults));
    $webClaimed = $db->prepare('SELECT COUNT(*) FROM web_task_completions WHERE id = ? AND claimed_at IS NOT NULL');
    $webClaimed->execute([$webCompletionId]);
    $assert((int) $webClaimed->fetchColumn() === 1, 'Web-task claim race did not leave exactly one claimed completion.');
    $webBalance = $db->prepare('SELECT balance FROM users WHERE id = ?');
    $webBalance->execute([$bonusUserId]);
    $assert(abs((float) $webBalance->fetchColumn() - 1.05) < 0.0001, 'Web-task claim race credited the worker balance incorrectly.');
    unset($webClaimed, $webBalance);

    $insertSecondWebCompletion = $db->prepare(
        "INSERT INTO web_task_completions (user_id,task_id,started_at,reward) VALUES (?,?,datetime('now','-7200 seconds'),?)"
    );
    $insertSecondWebCompletion->execute([$bonusUserId, $webTaskId, 1]);
    $secondWebCompletionId = (int) $db->lastInsertId();
    unset($insertSecondWebCompletion);
    $webLimitCommand = escapeshellarg(PHP_BINARY) . ' ' . escapeshellarg(__FILE__)
        . ' --web-claim-child ' . escapeshellarg((string) $secondWebCompletionId) . ' ' . escapeshellarg((string) $bonusUserId);
    $webLimitResults = $runChildren([$webLimitCommand]);
    $assert(($webLimitResults[0]['success'] ?? true) === false
        && str_contains((string) ($webLimitResults[0]['message'] ?? ''), 'Daily task limit'),
        'Web-task claim bypassed the configured daily task limit.');

    // Telegram-task verification has the same one-time reward boundary.
    $db = null;
    Database::disconnect();
    $tgVerifyCommand = escapeshellarg(PHP_BINARY) . ' ' . escapeshellarg(__FILE__)
        . ' --tg-verify-child ' . escapeshellarg((string) $tgTaskId) . ' ' . escapeshellarg((string) $bonusUserId);
    $tgVerifyResults = $runChildren([$tgVerifyCommand, $tgVerifyCommand]);
    $db = Database::connect();
    $tgVerifySuccesses = count(array_filter($tgVerifyResults, static fn(array $result): bool => ($result['success'] ?? false) === true));
    $assert($tgVerifySuccesses === 1, 'Telegram-task verification race credited more than once or failed entirely: ' . json_encode($tgVerifyResults));
    $tgCompleted = $db->prepare('SELECT COUNT(*) FROM telegram_task_completions WHERE user_id = ? AND task_id = ?');
    $tgCompleted->execute([$bonusUserId, $tgTaskId]);
    $assert((int) $tgCompleted->fetchColumn() === 1, 'Telegram-task verification race created more than one completion.');
    $tgBalance = $db->prepare('SELECT balance FROM users WHERE id = ?');
    $tgBalance->execute([$bonusUserId]);
    $assert(abs((float) $tgBalance->fetchColumn() - 2.05) < 0.0001, 'Telegram-task verification race credited the worker balance incorrectly.');
    unset($tgCompleted, $tgBalance);

    // The legacy provider reward path must serialize the user balance and
    // daily-ad counter just like the first-party video path.
    $db = null;
    Database::disconnect();
    $legacyAdCommand = escapeshellarg(PHP_BINARY) . ' ' . escapeshellarg(__FILE__)
        . ' --legacy-ad-child ' . escapeshellarg((string) $bonusUserId);
    $legacyAdResults = $runChildren([$legacyAdCommand, $legacyAdCommand]);
    $db = Database::connect();
    $legacyAdSuccesses = count(array_filter($legacyAdResults, static fn(array $result): bool => ($result['success'] ?? false) === true));
    $assert($legacyAdSuccesses === 2, 'Legacy provider reward race did not accept both independent ad views: ' . json_encode($legacyAdResults));
    $legacyBalance = $db->prepare('SELECT balance,today_ads FROM users WHERE id = ?');
    $legacyBalance->execute([$bonusUserId]);
    $legacyState = $legacyBalance->fetch(\PDO::FETCH_ASSOC);
    $assert(abs((float) ($legacyState['balance'] ?? 0) - 4.05) < 0.0001
        && (int) ($legacyState['today_ads'] ?? 0) === 12, 'Legacy provider reward race lost a balance credit or daily-ad count.');
    $legacyLedger = $db->prepare("SELECT COUNT(*) FROM ad_views WHERE user_id = ? AND provider = 'simulated'");
    $legacyLedger->execute([$bonusUserId]);
    $assert((int) $legacyLedger->fetchColumn() === 2, 'Legacy provider reward race wrote the wrong number of audit rows.');
    unset($legacyBalance, $legacyLedger, $legacyState);

    // Two withdrawals of 80 must not both pass against the same balance.
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

    echo "Job marketplace payment, withdrawal, daily-bonus, legacy-ad, web-task, Telegram-task, and video-claim race checks passed.\n";
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
    if ($bonusUserId > 0) {
        $db->prepare('DELETE FROM ad_views WHERE user_id = ?')->execute([$bonusUserId]);
        $db->prepare('DELETE FROM notifications WHERE notifiable_id = ?')->execute([$bonusUserId]);
        $db->prepare('DELETE FROM users WHERE id = ?')->execute([$bonusUserId]);
    }
    if ($webCompletionId > 0) {
        $db->prepare('DELETE FROM web_task_completions WHERE id = ?')->execute([$webCompletionId]);
    }
    if ($secondWebCompletionId > 0) {
        $db->prepare('DELETE FROM web_task_completions WHERE id = ?')->execute([$secondWebCompletionId]);
    }
    if ($webTaskId > 0) {
        $db->prepare('DELETE FROM web_task_completions WHERE task_id = ?')->execute([$webTaskId]);
        $db->prepare('DELETE FROM web_tasks WHERE id = ?')->execute([$webTaskId]);
    }
    if ($tgTaskId > 0) {
        $db->prepare('DELETE FROM telegram_task_completions WHERE task_id = ?')->execute([$tgTaskId]);
        $db->prepare('DELETE FROM telegram_tasks WHERE id = ?')->execute([$tgTaskId]);
    }
    if ($adminId > 0) {
        $db->prepare('DELETE FROM notifications WHERE notifiable_id = ?')->execute([$adminId]);
        $db->prepare('DELETE FROM users WHERE id = ?')->execute([$adminId]);
    }
}

exit($exitCode);
