<?php
declare(strict_types=1);

/**
 * Two-process capacity-race regression check.
 *
 * Safety: this script refuses to run unless JOB_MARKETPLACE_TEST_DB points to
 * a SQLite file under /tmp. Apply the migrations first, then run:
 *   JOB_MARKETPLACE_TEST_DB=/tmp/jmjob-fraud-policy-20260919.sqlite \
 *   php tests/JobMarketplaceConcurrencyTest.php
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

require_once __DIR__ . '/../vendor/autoload.php';

use App\Models\Job;
use App\Models\JobAssignment;
use App\Models\JobBid;
use App\Models\User;
use App\Services\JobService;
use Nemesis\Core\Config;
use Nemesis\Core\Database;

Config::load(dirname(__DIR__));
Database::connect((require dirname(__DIR__) . '/config/config.php')['database']);
$db = Database::connect();

if (($argv[1] ?? '') === '--child') {
    $bidId = (int) ($argv[2] ?? 0);
    $adminId = (int) ($argv[3] ?? 0);
    $result = (new JobService())->approveWorkerApplication($bidId, $adminId);
    echo json_encode([
        'success' => (bool) ($result['success'] ?? false),
        'message' => (string) ($result['message'] ?? ''),
    ], JSON_UNESCAPED_UNICODE) . "\n";
    exit(0);
}

if (($argv[1] ?? '') === '--submit-child') {
    $jobId = (int) ($argv[2] ?? 0);
    $workerId = (int) ($argv[3] ?? 0);
    $description = (string) ($argv[4] ?? 'This is a sufficiently detailed concurrent submission proof.');
    $clientIp = (string) ($argv[5] ?? '127.0.0.1');
    $userAgent = (string) ($argv[6] ?? 'JMJobConcurrency/1.0');
    $worker = User::find($workerId);
    $result = $worker === null
        ? ['success' => false, 'message' => 'Submission race worker not found.']
        : (new JobService())->submitWork(
            $worker,
            $jobId,
            $description,
            null,
            null,
            $clientIp,
            $userAgent
        );
    echo json_encode([
        'success' => (bool) ($result['success'] ?? false),
        'message' => (string) ($result['message'] ?? ''),
    ], JSON_UNESCAPED_UNICODE) . "\n";
    exit(0);
}

$requiredTables = ['users', 'jobs', 'job_bids', 'job_assignments', 'job_submissions', 'transactions', 'notifications'];
foreach ($requiredTables as $table) {
    $check = $db->prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?");
    $check->execute([$table]);
    if (!$check->fetchColumn()) {
        fwrite(STDERR, "Missing table {$table}; run migrations first.\n");
        exit(3);
    }
}

$suffix = bin2hex(random_bytes(4));
$userIds = [];
$jobId = 0;
$bidIds = [];
$assignmentIds = [];
$submissionJobId = 0;
$submissionBidId = 0;
$submissionAssignmentId = 0;
$fraudJobId = 0;
$exitCode = 0;

$assert = static function (bool $condition, string $message): void {
    if (!$condition) throw new RuntimeException($message);
};

try {
    $insertUser = $db->prepare(
        'INSERT INTO users (username,email,password,name,is_admin,role,wallet_balance,frozen_balance,is_banned) VALUES (?,?,?,?,?,?,?,?,?)'
    );
    $insertUser->execute(["race-poster-{$suffix}", "race-poster-{$suffix}@example.test", 'x', 'Race Poster', 0, 'poster', 1000, 0, 0]);
    $userIds['poster'] = (int) $db->lastInsertId();
    $insertUser->execute(["race-worker-a-{$suffix}", "race-worker-a-{$suffix}@example.test", 'x', 'Race Worker A', 0, 'worker', 0, 0, 0]);
    $userIds['worker_a'] = (int) $db->lastInsertId();
    $insertUser->execute(["race-worker-b-{$suffix}", "race-worker-b-{$suffix}@example.test", 'x', 'Race Worker B', 0, 'worker', 0, 0, 0]);
    $userIds['worker_b'] = (int) $db->lastInsertId();
    $insertUser->execute(["race-admin-{$suffix}", "race-admin-{$suffix}@example.test", 'x', 'Race Admin', 1, 'admin', 0, 0, 0]);
    $userIds['admin'] = (int) $db->lastInsertId();

    $insertJob = $db->prepare(
        'INSERT INTO jobs (poster_id,title,slug,description,budget,currency,status,worker_count,cost_per_worker,created_at) VALUES (?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP)'
    );
    $insertJob->execute([$userIds['poster'], "Capacity race {$suffix}", "capacity-race-{$suffix}", 'Concurrent capacity check', 100, 'BDT', Job::STATUS_OPEN, 1, 100]);
    $jobId = (int) $db->lastInsertId();

    $insertBid = $db->prepare(
        'INSERT INTO job_bids (job_id,worker_id,amount,currency,delivery_days,proposal,status,created_at) VALUES (?,?,?,?,?,?,?,CURRENT_TIMESTAMP)'
    );
    $insertBid->execute([$jobId, $userIds['worker_a'], 100, 'BDT', 1, 'race bid A', JobBid::STATUS_PENDING]);
    $bidIds[] = (int) $db->lastInsertId();
    $insertBid->execute([$jobId, $userIds['worker_b'], 100, 'BDT', 1, 'race bid B', JobBid::STATUS_PENDING]);
    $bidIds[] = (int) $db->lastInsertId();

    $env = array_merge($_ENV, [
        'DB_DRIVER' => 'sqlite',
        'DB_DATABASE' => $databasePath,
        'NOTIFICATIONS_EMAIL_ENABLED' => '0',
        'WITHDRAW_MIN_REFERRALS' => '0',
    ]);
    $spec = [1 => ['pipe', 'w'], 2 => ['pipe', 'w']];
    $processes = [];
    foreach ($bidIds as $bidId) {
        $command = escapeshellarg(PHP_BINARY) . ' ' . escapeshellarg(__FILE__)
            . ' --child ' . escapeshellarg((string) $bidId) . ' ' . escapeshellarg((string) $userIds['admin']);
        $pipes = [];
        $process = proc_open($command, $spec, $pipes, dirname(__DIR__), $env);
        if (!is_resource($process)) throw new RuntimeException('Could not start concurrency child process.');
        $processes[] = [$process, $pipes];
    }

    // Do not let the parent's open PDO handle retain a read lock while the
    // child processes exercise the real multi-process write boundary.
    Database::disconnect();
    unset($db, $insertUser, $insertJob, $insertBid, $check);

    $results = [];
    foreach ($processes as [$process, $pipes]) {
        $stdout = stream_get_contents($pipes[1]);
        $stderr = stream_get_contents($pipes[2]);
        fclose($pipes[1]);
        fclose($pipes[2]);
        $status = proc_close($process);
        $decoded = json_decode(trim((string) $stdout), true);
        if (!is_array($decoded)) {
            throw new RuntimeException('Concurrency child returned invalid output: ' . trim((string) $stdout) . ' ' . trim((string) $stderr));
        }
        $results[] = $decoded + ['process_status' => $status, 'stderr' => trim((string) $stderr)];
    }

    $db = Database::connect();

    $successes = count(array_filter($results, static fn(array $result): bool => ($result['success'] ?? false) === true));
    $failures = count($results) - $successes;
    $assert($successes === 1 && $failures === 1, 'Capacity race did not produce exactly one successful assignment and one rejected approval: ' . json_encode($results));

    $count = $db->prepare('SELECT COUNT(*) FROM job_assignments WHERE job_id = ? AND payment_status = ?');
    $count->execute([$jobId, JobAssignment::PAYMENT_HELD]);
    $assert((int) $count->fetchColumn() === 1, 'Capacity race created more than one held assignment.');
    $count->execute([$jobId, JobAssignment::PAYMENT_HELD]);
    $assert((int) $count->fetchColumn() === 1, 'Capacity race escrow count is not idempotent.');

    $accepted = $db->prepare('SELECT COUNT(*) FROM job_bids WHERE job_id = ? AND status = ?');
    $accepted->execute([$jobId, JobBid::STATUS_ACCEPTED]);
    $assert((int) $accepted->fetchColumn() === 1, 'Capacity race accepted more than one bid.');

    $jobState = $db->prepare('SELECT status FROM jobs WHERE id = ?');
    $jobState->execute([$jobId]);
    $assert($jobState->fetchColumn() === Job::STATUS_ENGAGED, 'Capacity race left the job in an inconsistent status.');

    $assignmentQuery = $db->prepare('SELECT id FROM job_assignments WHERE job_id = ?');
    $assignmentQuery->execute([$jobId]);
    while ($id = $assignmentQuery->fetchColumn()) $assignmentIds[] = (int) $id;

    // Run the same write-boundary check for two concurrent submissions to one
    // assignment. Exactly one request may claim the assignment for review.
    $db = Database::connect();
    $insertSubmissionJob = $db->prepare(
        'INSERT INTO jobs (poster_id,title,slug,description,budget,currency,status,worker_count,cost_per_worker,created_at) VALUES (?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP)'
    );
    $insertSubmissionJob->execute([$userIds['poster'], "Submission race {$suffix}", "submission-race-{$suffix}", 'Concurrent submission check', 100, 'BDT', Job::STATUS_ENGAGED, 1, 100]);
    $submissionJobId = (int) $db->lastInsertId();
    $insertSubmissionBid = $db->prepare(
        'INSERT INTO job_bids (job_id,worker_id,amount,currency,delivery_days,proposal,status,created_at) VALUES (?,?,?,?,?,?,?,CURRENT_TIMESTAMP)'
    );
    $insertSubmissionBid->execute([$submissionJobId, $userIds['worker_a'], 100, 'BDT', 1, 'submission race bid', JobBid::STATUS_ACCEPTED]);
    $submissionBidId = (int) $db->lastInsertId();
    $insertSubmissionAssignment = $db->prepare(
        'INSERT INTO job_assignments (job_id,bid_id,worker_id,status,payment_status,payment_amount,assigned_by,created_at) VALUES (?,?,?,?,?,?,?,CURRENT_TIMESTAMP)'
    );
    $insertSubmissionAssignment->execute([
        $submissionJobId,
        $submissionBidId,
        $userIds['worker_a'],
        JobAssignment::STATUS_ASSIGNED,
        JobAssignment::PAYMENT_HELD,
        100,
        $userIds['admin'],
    ]);
    $submissionAssignmentId = (int) $db->lastInsertId();

    unset(
        $insertSubmissionJob,
        $insertSubmissionBid,
        $insertSubmissionAssignment,
        $count,
        $accepted,
        $jobState,
        $assignmentQuery
    );
    $db = null;
    Database::disconnect();
    $submitProcesses = [];
    foreach ([1, 2] as $_submitAttempt) {
        $command = escapeshellarg(PHP_BINARY) . ' ' . escapeshellarg(__FILE__)
            . ' --submit-child ' . escapeshellarg((string) $submissionJobId) . ' ' . escapeshellarg((string) $userIds['worker_a']);
        $pipes = [];
        $process = proc_open($command, $spec, $pipes, dirname(__DIR__), $env);
        if (!is_resource($process)) throw new RuntimeException('Could not start submission-race child process.');
        $submitProcesses[] = [$process, $pipes];
    }

    $submissionResults = [];
    foreach ($submitProcesses as [$process, $pipes]) {
        $stdout = stream_get_contents($pipes[1]);
        $stderr = stream_get_contents($pipes[2]);
        fclose($pipes[1]);
        fclose($pipes[2]);
        $status = proc_close($process);
        $decoded = json_decode(trim((string) $stdout), true);
        if (!is_array($decoded)) {
            throw new RuntimeException('Submission-race child returned invalid output: ' . trim((string) $stdout) . ' ' . trim((string) $stderr));
        }
        $submissionResults[] = $decoded + ['process_status' => $status, 'stderr' => trim((string) $stderr)];
    }

    $db = Database::connect();
    $submissionSuccesses = count(array_filter($submissionResults, static fn(array $result): bool => ($result['success'] ?? false) === true));
    $submissionFailures = count($submissionResults) - $submissionSuccesses;
    $assert($submissionSuccesses === 1 && $submissionFailures === 1, 'Submission race did not produce exactly one successful submission and one rejection: ' . json_encode($submissionResults));

    $submissionCount = $db->prepare('SELECT COUNT(*) FROM job_submissions WHERE job_id = ? AND assignment_id = ?');
    $submissionCount->execute([$submissionJobId, $submissionAssignmentId]);
    $assert((int) $submissionCount->fetchColumn() === 1, 'Submission race created more than one pending submission.');
    $submissionState = $db->prepare('SELECT status FROM job_assignments WHERE id = ?');
    $submissionState->execute([$submissionAssignmentId]);
    $assert($submissionState->fetchColumn() === JobAssignment::STATUS_SUBMITTED, 'Submission race left the assignment in an inconsistent state.');

    // Two different workers may submit the same proof to one multi-worker
    // job. Both submissions remain valid for moderation, but the later one
    // must carry the duplicate-content risk signal even when both requests
    // performed their preflight reads before either transaction committed.
    $fraudJob = $db->prepare(
        'INSERT INTO jobs (poster_id,title,slug,description,budget,currency,status,worker_count,cost_per_worker,created_at) VALUES (?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP)'
    );
    $fraudJob->execute([$userIds['poster'], "Fraud race {$suffix}", "fraud-race-{$suffix}", 'Concurrent duplicate-content check', 200, 'BDT', Job::STATUS_ENGAGED, 2, 100]);
    $fraudJobId = (int) $db->lastInsertId();
    $fraudBid = $db->prepare(
        'INSERT INTO job_bids (job_id,worker_id,amount,currency,delivery_days,proposal,status,created_at) VALUES (?,?,?,?,?,?,?,CURRENT_TIMESTAMP)'
    );
    $fraudBid->execute([$fraudJobId, $userIds['worker_a'], 100, 'BDT', 1, 'duplicate proof bid A', JobBid::STATUS_ACCEPTED]);
    $fraudBidA = (int) $db->lastInsertId();
    $fraudBid->execute([$fraudJobId, $userIds['worker_b'], 100, 'BDT', 1, 'duplicate proof bid B', JobBid::STATUS_ACCEPTED]);
    $fraudBidB = (int) $db->lastInsertId();
    $fraudAssignment = $db->prepare(
        'INSERT INTO job_assignments (job_id,bid_id,worker_id,status,payment_status,payment_amount,assigned_by,created_at) VALUES (?,?,?,?,?,?,?,CURRENT_TIMESTAMP)'
    );
    $fraudAssignment->execute([$fraudJobId, $fraudBidA, $userIds['worker_a'], JobAssignment::STATUS_ASSIGNED, JobAssignment::PAYMENT_HELD, 100, $userIds['admin']]);
    $assignmentIds[] = (int) $db->lastInsertId();
    $fraudAssignment->execute([$fraudJobId, $fraudBidB, $userIds['worker_b'], JobAssignment::STATUS_ASSIGNED, JobAssignment::PAYMENT_HELD, 100, $userIds['admin']]);
    $assignmentIds[] = (int) $db->lastInsertId();

    unset(
        $fraudJob,
        $fraudBid,
        $fraudAssignment,
        $submissionCount,
        $submissionState
    );
    $db = null;
    Database::disconnect();
    $duplicateDescription = 'This is the same detailed proof content submitted by two workers for risk analysis.';
    $duplicateIp = '127.0.0.88';
    $duplicateAgent = 'JMJobFraudRace/1.0';
    $duplicateProcesses = [];
    foreach ([$userIds['worker_a'], $userIds['worker_b']] as $workerId) {
        $command = escapeshellarg(PHP_BINARY) . ' ' . escapeshellarg(__FILE__)
            . ' --submit-child ' . escapeshellarg((string) $fraudJobId) . ' ' . escapeshellarg((string) $workerId)
            . ' ' . escapeshellarg($duplicateDescription) . ' ' . escapeshellarg($duplicateIp) . ' ' . escapeshellarg($duplicateAgent);
        $pipes = [];
        $process = proc_open($command, $spec, $pipes, dirname(__DIR__), $env);
        if (!is_resource($process)) throw new RuntimeException('Could not start duplicate-content race child process.');
        $duplicateProcesses[] = [$process, $pipes];
    }

    $duplicateResults = [];
    foreach ($duplicateProcesses as [$process, $pipes]) {
        $stdout = stream_get_contents($pipes[1]);
        $stderr = stream_get_contents($pipes[2]);
        fclose($pipes[1]);
        fclose($pipes[2]);
        $status = proc_close($process);
        $decoded = json_decode(trim((string) $stdout), true);
        if (!is_array($decoded)) {
            throw new RuntimeException('Duplicate-content child returned invalid output: ' . trim((string) $stdout) . ' ' . trim((string) $stderr));
        }
        $duplicateResults[] = $decoded + ['process_status' => $status, 'stderr' => trim((string) $stderr)];
    }

    $db = Database::connect();
    $duplicateSuccesses = count(array_filter($duplicateResults, static fn(array $result): bool => ($result['success'] ?? false) === true));
    $assert($duplicateSuccesses === 2, 'Duplicate-content race rejected a valid worker submission: ' . json_encode($duplicateResults));
    $duplicateSubmissionCount = $db->prepare('SELECT COUNT(*) FROM job_submissions WHERE job_id = ?');
    $duplicateSubmissionCount->execute([$fraudJobId]);
    $assert((int) $duplicateSubmissionCount->fetchColumn() === 2, 'Duplicate-content race did not create one submission per assignment.');
    $duplicateFlagCount = $db->prepare("SELECT COUNT(*) FROM job_submissions WHERE job_id = ? AND risk_flags LIKE '%duplicate_content_on_job%'");
    $duplicateFlagCount->execute([$fraudJobId]);
    $assert((int) $duplicateFlagCount->fetchColumn() >= 1, 'Concurrent duplicate content did not enter the fraud-review signal.');

    echo "Job marketplace capacity, submission, and fraud race checks passed.\n";
} catch (Throwable $e) {
    fwrite(STDERR, "Job marketplace capacity/submission race checks failed: {$e->getMessage()}\n");
    $exitCode = 1;
} finally {
    if (!isset($db) || !($db instanceof \PDO)) {
        $db = Database::connect();
    }
    if ($assignmentIds) {
        $placeholders = implode(',', array_fill(0, count($assignmentIds), '?'));
        $db->prepare("DELETE FROM job_assignments WHERE id IN ({$placeholders})")->execute($assignmentIds);
    }
    if ($jobId > 0) {
        $db->prepare('DELETE FROM transactions WHERE job_id = ?')->execute([$jobId]);
        $db->prepare('DELETE FROM notifications WHERE data LIKE ?')->execute(['%' . $suffix . '%']);
        $db->prepare('DELETE FROM job_bids WHERE job_id = ?')->execute([$jobId]);
        $db->prepare('DELETE FROM jobs WHERE id = ?')->execute([$jobId]);
    }
    if ($submissionJobId > 0) {
        $db->prepare('DELETE FROM job_submissions WHERE job_id = ?')->execute([$submissionJobId]);
        $db->prepare('DELETE FROM job_assignments WHERE job_id = ?')->execute([$submissionJobId]);
        $db->prepare('DELETE FROM transactions WHERE job_id = ?')->execute([$submissionJobId]);
        $db->prepare('DELETE FROM job_bids WHERE job_id = ?')->execute([$submissionJobId]);
        $db->prepare('DELETE FROM jobs WHERE id = ?')->execute([$submissionJobId]);
    }
    if ($fraudJobId > 0) {
        $db->prepare('DELETE FROM job_submissions WHERE job_id = ?')->execute([$fraudJobId]);
        $db->prepare('DELETE FROM job_assignments WHERE job_id = ?')->execute([$fraudJobId]);
        $db->prepare('DELETE FROM transactions WHERE job_id = ?')->execute([$fraudJobId]);
        $db->prepare('DELETE FROM job_bids WHERE job_id = ?')->execute([$fraudJobId]);
        $db->prepare('DELETE FROM jobs WHERE id = ?')->execute([$fraudJobId]);
    }
    if ($userIds) {
        $placeholders = implode(',', array_fill(0, count($userIds), '?'));
        $db->prepare("DELETE FROM sessions WHERE user_id IN ({$placeholders})")->execute(array_values($userIds));
        $db->prepare("DELETE FROM notifications WHERE notifiable_id IN ({$placeholders})")->execute(array_values($userIds));
        $db->prepare("DELETE FROM users WHERE id IN ({$placeholders})")->execute(array_values($userIds));
    }
}

exit($exitCode);
