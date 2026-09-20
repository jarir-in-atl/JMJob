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
use App\Models\JobSubmission;
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

if (($argv[1] ?? '') === '--apply-child' || ($argv[1] ?? '') === '--bid-child') {
    $jobId = (int) ($argv[2] ?? 0);
    $workerId = (int) ($argv[3] ?? 0);
    $worker = User::find($workerId);
    if ($worker === null) {
        $result = ['success' => false, 'message' => 'Duplicate-bid race worker not found.'];
    } elseif (($argv[1] ?? '') === '--apply-child') {
        $result = (new JobService())->applyForJob($worker, $jobId, 'Concurrent application duplicate check.');
    } else {
        $result = (new JobService())->placeBid($worker, $jobId, 100, 1, 'Concurrent bid duplicate check.');
    }
    echo json_encode([
        'success' => (bool) ($result['success'] ?? false),
        'message' => (string) ($result['message'] ?? ''),
    ], JSON_UNESCAPED_UNICODE) . "\n";
    exit(0);
}

if (($argv[1] ?? '') === '--withdraw-child') {
    $bidId = (int) ($argv[2] ?? 0);
    $workerId = (int) ($argv[3] ?? 0);
    $worker = User::find($workerId);
    $result = $worker === null
        ? ['success' => false, 'message' => 'Withdrawal race worker not found.']
        : (new JobService())->withdrawBid($worker, $bidId);
    echo json_encode([
        'success' => (bool) ($result['success'] ?? false),
        'message' => (string) ($result['message'] ?? ''),
    ], JSON_UNESCAPED_UNICODE) . "\n";
    exit(0);
}

if (($argv[1] ?? '') === '--cancel-job-child') {
    $jobId = (int) ($argv[2] ?? 0);
    $posterId = (int) ($argv[3] ?? 0);
    $poster = User::find($posterId);
    $result = $poster === null
        ? ['success' => false, 'message' => 'Cancellation race poster not found.']
        : (new JobService())->cancelJob($poster, $jobId, 'Concurrent cancellation race.');
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

if (($argv[1] ?? '') === '--revision-child') {
    $jobId = (int) ($argv[2] ?? 0);
    $submissionId = (int) ($argv[3] ?? 0);
    $posterId = (int) ($argv[4] ?? 0);
    $poster = User::find($posterId);
    $result = $poster === null
        ? ['success' => false, 'message' => 'Revision race poster not found.']
        : (new JobService())->requestRevision($poster, $jobId, $submissionId, 'Concurrent revision decision.');
    echo json_encode([
        'success' => (bool) ($result['success'] ?? false),
        'message' => (string) ($result['message'] ?? ''),
    ], JSON_UNESCAPED_UNICODE) . "\n";
    exit(0);
}

if (($argv[1] ?? '') === '--review-child') {
    $submissionId = (int) ($argv[2] ?? 0);
    $adminId = (int) ($argv[3] ?? 0);
    $result = (new JobService())->reviewSubmission($submissionId, $adminId, 'approve');
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
$moderationJobId = 0;
$moderationSubmissionId = 0;
$moderationAssignmentId = 0;
$applicationRaceJobId = 0;
$bidRaceJobId = 0;
$withdrawRaceJobId = 0;
$withdrawRaceBidId = 0;
$cancelPaymentRaceJobId = 0;
$cancelPaymentRaceBidId = 0;
$cancelPaymentRaceAssignmentId = 0;
$cancelPaymentRaceSubmissionId = 0;
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

    // The one-row PDO cursors can retain a shared SQLite read lock until the
    // statement is destroyed, even after fetchColumn() has returned.
    unset($count, $accepted, $jobState);

    // The legacy application and current bid endpoints both use the same
    // unique (job, worker) rule. Exercise their real service entry points in
    // separate processes so a concurrent duplicate returns a normal rejection
    // and increments bid_count only once.
    foreach ([
        ['label' => 'Application', 'mode' => '--apply-child', 'property' => 'applicationRaceJobId'],
        ['label' => 'Bid', 'mode' => '--bid-child', 'property' => 'bidRaceJobId'],
    ] as $duplicateCase) {
        $insertDuplicateJob = $db->prepare(
            'INSERT INTO jobs (poster_id,title,slug,description,budget,currency,status,worker_count,cost_per_worker,created_at) VALUES (?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP)'
        );
        $slug = strtolower($duplicateCase['label']) . '-duplicate-race-' . $suffix;
        $insertDuplicateJob->execute([
            $userIds['poster'],
            $duplicateCase['label'] . " duplicate race {$suffix}",
            $slug,
            'Concurrent duplicate worker entry check',
            100,
            'BDT',
            Job::STATUS_OPEN,
            1,
            100,
        ]);
        ${$duplicateCase['property']} = (int) $db->lastInsertId();
        unset($insertDuplicateJob);

        // Release the parent's SQLite handle before the child processes open
        // the same file, otherwise the fixture insert can retain a lock while
        // the first child is still trying to load its worker.
        $db = null;
        Database::disconnect();

        $duplicateProcesses = [];
        for ($duplicateAttempt = 0; $duplicateAttempt < 2; $duplicateAttempt++) {
            $command = escapeshellarg(PHP_BINARY) . ' ' . escapeshellarg(__FILE__)
                . ' ' . escapeshellarg($duplicateCase['mode'])
                . ' ' . escapeshellarg((string) ${$duplicateCase['property']})
                . ' ' . escapeshellarg((string) $userIds['worker_a']);
            $pipes = [];
            $process = proc_open($command, $spec, $pipes, dirname(__DIR__), $env);
            if (!is_resource($process)) throw new RuntimeException('Could not start duplicate ' . strtolower($duplicateCase['label']) . ' race child process.');
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
                throw new RuntimeException($duplicateCase['label'] . ' duplicate child returned invalid output: ' . trim((string) $stdout) . ' ' . trim((string) $stderr));
            }
            $duplicateResults[] = $decoded + ['process_status' => $status, 'stderr' => trim((string) $stderr)];
        }

        $db = Database::connect();

        $duplicateSuccesses = count(array_filter($duplicateResults, static fn(array $result): bool => ($result['success'] ?? false) === true));
        $assert($duplicateSuccesses === 1, $duplicateCase['label'] . ' duplicate race did not produce exactly one successful entry: ' . json_encode($duplicateResults));
        $duplicateBidCount = $db->prepare('SELECT COUNT(*), MAX(status) FROM job_bids WHERE job_id = ?');
        $duplicateBidCount->execute([${$duplicateCase['property']}]);
        $duplicateBidState = $duplicateBidCount->fetch(PDO::FETCH_NUM);
        $assert((int) ($duplicateBidState[0] ?? 0) === 1, $duplicateCase['label'] . ' duplicate race created more than one bid.');
        $duplicateJobState = $db->prepare('SELECT bid_count FROM jobs WHERE id = ?');
        $duplicateJobState->execute([${$duplicateCase['property']}]);
        $assert((int) $duplicateJobState->fetchColumn() === 1, $duplicateCase['label'] . ' duplicate race incremented bid_count more than once.');
        unset($duplicateBidCount, $duplicateJobState);
    }

    // Withdrawal and admin approval must claim the same pending bid exactly
    // once. Whichever request wins determines the final state; the loser must
    // not overwrite an accepted bid or create an orphaned escrow hold.
    $insertWithdrawalRaceJob = $db->prepare(
        'INSERT INTO jobs (poster_id,title,slug,description,budget,currency,status,worker_count,cost_per_worker,created_at) VALUES (?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP)'
    );
    $insertWithdrawalRaceJob->execute([
        $userIds['poster'],
        "Withdrawal race {$suffix}",
        "withdrawal-race-{$suffix}",
        'Concurrent bid withdrawal and approval check',
        100,
        'BDT',
        Job::STATUS_OPEN,
        1,
        100,
    ]);
    $withdrawRaceJobId = (int) $db->lastInsertId();
    $insertWithdrawalRaceBid = $db->prepare(
        'INSERT INTO job_bids (job_id,worker_id,amount,currency,delivery_days,proposal,status,created_at) VALUES (?,?,?,?,?,?,?,CURRENT_TIMESTAMP)'
    );
    $insertWithdrawalRaceBid->execute([
        $withdrawRaceJobId,
        $userIds['worker_a'],
        100,
        'BDT',
        1,
        'Withdrawal race bid',
        JobBid::STATUS_PENDING,
    ]);
    $withdrawRaceBidId = (int) $db->lastInsertId();
    unset($insertWithdrawalRaceJob, $insertWithdrawalRaceBid);
    $db = null;
    Database::disconnect();

    $withdrawalProcesses = [];
    $withdrawalCommands = [
        ['--child', $withdrawRaceBidId, $userIds['admin']],
        ['--withdraw-child', $withdrawRaceBidId, $userIds['worker_a']],
    ];
    foreach ($withdrawalCommands as $arguments) {
        $command = escapeshellarg(PHP_BINARY) . ' ' . escapeshellarg(__FILE__);
        foreach ($arguments as $argument) $command .= ' ' . escapeshellarg((string) $argument);
        $pipes = [];
        $process = proc_open($command, $spec, $pipes, dirname(__DIR__), $env);
        if (!is_resource($process)) throw new RuntimeException('Could not start withdrawal race child process.');
        $withdrawalProcesses[] = [$process, $pipes];
    }

    $withdrawalResults = [];
    foreach ($withdrawalProcesses as [$process, $pipes]) {
        $stdout = stream_get_contents($pipes[1]);
        $stderr = stream_get_contents($pipes[2]);
        fclose($pipes[1]);
        fclose($pipes[2]);
        $status = proc_close($process);
        $decoded = json_decode(trim((string) $stdout), true);
        if (!is_array($decoded)) {
            throw new RuntimeException('Withdrawal race child returned invalid output: ' . trim((string) $stdout) . ' ' . trim((string) $stderr));
        }
        $withdrawalResults[] = $decoded + ['process_status' => $status, 'stderr' => trim((string) $stderr)];
    }
    $db = Database::connect();
    $withdrawalSuccesses = count(array_filter($withdrawalResults, static fn(array $result): bool => ($result['success'] ?? false) === true));
    $assert($withdrawalSuccesses === 1, 'Approval and withdrawal race did not produce exactly one winner: ' . json_encode($withdrawalResults));
    $withdrawalBidState = $db->prepare('SELECT status FROM job_bids WHERE id = ?');
    $withdrawalBidState->execute([$withdrawRaceBidId]);
    $withdrawalStatus = (string) $withdrawalBidState->fetchColumn();
    $withdrawalAssignmentCount = $db->prepare('SELECT COUNT(*) FROM job_assignments WHERE job_id = ? AND payment_status = ?');
    $withdrawalAssignmentCount->execute([$withdrawRaceJobId, JobAssignment::PAYMENT_HELD]);
    $heldWithdrawalAssignments = (int) $withdrawalAssignmentCount->fetchColumn();
    if ($withdrawalStatus === JobBid::STATUS_ACCEPTED) {
        $assert($heldWithdrawalAssignments === 1, 'Accepted bid did not retain exactly one held assignment after the withdrawal race.');
    } else {
        $assert($withdrawalStatus === JobBid::STATUS_WITHDRAWN && $heldWithdrawalAssignments === 0,
            'Withdrawn bid race left an accepted/escrowed assignment behind.');
    }
    unset($withdrawalBidState, $withdrawalAssignmentCount);

    // Cancellation and payment release must claim the same held assignment
    // exactly once. The winner determines whether the final state is refunded
    // and cancelled or released and completed; both financial outcomes must
    // never be committed together.
    $insertCancelPaymentJob = $db->prepare(
        'INSERT INTO jobs (poster_id,title,slug,description,budget,currency,status,worker_count,cost_per_worker,created_at) VALUES (?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP)'
    );
    $insertCancelPaymentJob->execute([
        $userIds['poster'],
        "Cancel payment race {$suffix}",
        "cancel-payment-race-{$suffix}",
        'Concurrent cancellation and payment release check',
        100,
        'BDT',
        Job::STATUS_ENGAGED,
        1,
        100,
    ]);
    $cancelPaymentRaceJobId = (int) $db->lastInsertId();
    $insertCancelPaymentBid = $db->prepare(
        'INSERT INTO job_bids (job_id,worker_id,amount,currency,delivery_days,proposal,status,created_at) VALUES (?,?,?,?,?,?,?,CURRENT_TIMESTAMP)'
    );
    $insertCancelPaymentBid->execute([
        $cancelPaymentRaceJobId,
        $userIds['worker_a'],
        100,
        'BDT',
        1,
        'Cancel/payment race bid',
        JobBid::STATUS_ACCEPTED,
    ]);
    $cancelPaymentRaceBidId = (int) $db->lastInsertId();
    $insertCancelPaymentAssignment = $db->prepare(
        'INSERT INTO job_assignments (job_id,bid_id,worker_id,status,payment_status,payment_amount,assigned_by,created_at) VALUES (?,?,?,?,?,?,?,CURRENT_TIMESTAMP)'
    );
    $insertCancelPaymentAssignment->execute([
        $cancelPaymentRaceJobId,
        $cancelPaymentRaceBidId,
        $userIds['worker_a'],
        JobAssignment::STATUS_ASSIGNED,
        JobAssignment::PAYMENT_HELD,
        100,
        $userIds['admin'],
    ]);
    $cancelPaymentRaceAssignmentId = (int) $db->lastInsertId();
    $db->prepare('UPDATE users SET wallet_balance = 900, frozen_balance = 100 WHERE id = ?')->execute([$userIds['poster']]);
    $cancelPaymentSubmission = (new JobService())->submitWork(
        User::find($userIds['worker_a']),
        $cancelPaymentRaceJobId,
        'This is a sufficiently detailed cancellation and payment race submission.',
        null,
        null,
        '10.0.0.99',
        'JMJobCancelPaymentRace/1.0'
    );
    $assert(($cancelPaymentSubmission['success'] ?? false) === true, 'Cancellation/payment race fixture submission failed.');
    $cancelPaymentRaceSubmissionId = (int) ($cancelPaymentSubmission['submission']->id ?? 0);
    unset($insertCancelPaymentJob, $insertCancelPaymentBid, $insertCancelPaymentAssignment, $cancelPaymentSubmission);
    $db = null;
    Database::disconnect();

    $cancelPaymentProcesses = [];
    $cancelPaymentCommands = [
        ['--cancel-job-child', $cancelPaymentRaceJobId, $userIds['poster']],
        ['--review-child', $cancelPaymentRaceSubmissionId, $userIds['admin']],
    ];
    foreach ($cancelPaymentCommands as $arguments) {
        $command = escapeshellarg(PHP_BINARY) . ' ' . escapeshellarg(__FILE__);
        foreach ($arguments as $argument) $command .= ' ' . escapeshellarg((string) $argument);
        $pipes = [];
        $process = proc_open($command, $spec, $pipes, dirname(__DIR__), $env);
        if (!is_resource($process)) throw new RuntimeException('Could not start cancellation/payment race child process.');
        $cancelPaymentProcesses[] = [$process, $pipes];
    }
    $cancelPaymentResults = [];
    foreach ($cancelPaymentProcesses as [$process, $pipes]) {
        $stdout = stream_get_contents($pipes[1]);
        $stderr = stream_get_contents($pipes[2]);
        fclose($pipes[1]);
        fclose($pipes[2]);
        $status = proc_close($process);
        $decoded = json_decode(trim((string) $stdout), true);
        if (!is_array($decoded)) {
            throw new RuntimeException('Cancellation/payment race child returned invalid output: ' . trim((string) $stdout) . ' ' . trim((string) $stderr));
        }
        $cancelPaymentResults[] = $decoded + ['process_status' => $status, 'stderr' => trim((string) $stderr)];
    }
    $db = Database::connect();
    $cancelPaymentSuccesses = count(array_filter($cancelPaymentResults, static fn(array $result): bool => ($result['success'] ?? false) === true));
    $assert($cancelPaymentSuccesses === 1, 'Cancellation/payment race did not produce exactly one winner: ' . json_encode($cancelPaymentResults));
    $cancelPaymentState = $db->prepare('SELECT status,payment_status FROM job_assignments WHERE id = ?');
    $cancelPaymentState->execute([$cancelPaymentRaceAssignmentId]);
    $cancelPaymentAssignment = $cancelPaymentState->fetch(PDO::FETCH_ASSOC);
    $cancelPaymentJobState = $db->prepare('SELECT status FROM jobs WHERE id = ?');
    $cancelPaymentJobState->execute([$cancelPaymentRaceJobId]);
    $cancelPaymentFinalJobStatus = (string) $cancelPaymentJobState->fetchColumn();
    $cancelPaymentIsReleased = ($cancelPaymentAssignment['status'] ?? '') === JobAssignment::STATUS_COMPLETED
        && ($cancelPaymentAssignment['payment_status'] ?? '') === JobAssignment::PAYMENT_RELEASED;
    $cancelPaymentIsRefunded = ($cancelPaymentAssignment['status'] ?? '') === JobAssignment::STATUS_CANCELLED
        && ($cancelPaymentAssignment['payment_status'] ?? '') === JobAssignment::PAYMENT_REFUNDED;
    $assert(($cancelPaymentIsReleased && $cancelPaymentFinalJobStatus === Job::STATUS_COMPLETED)
        || ($cancelPaymentIsRefunded && $cancelPaymentFinalJobStatus === Job::STATUS_CANCELLED),
        'Cancellation/payment race left an incoherent assignment or job state.');
    unset($cancelPaymentState, $cancelPaymentJobState);

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

    // A poster revision and an administrator approval may race on the same
    // pending submission. Exactly one decision may claim it, and the losing
    // decision must not overwrite the finalized submission or payment state.
    $moderationJob = $db->prepare(
        'INSERT INTO jobs (poster_id,title,slug,description,budget,currency,status,worker_count,cost_per_worker,created_at) VALUES (?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP)'
    );
    $moderationJob->execute([$userIds['poster'], "Moderation race {$suffix}", "moderation-race-{$suffix}", 'Concurrent moderation check', 100, 'BDT', Job::STATUS_ENGAGED, 1, 100]);
    $moderationJobId = (int) $db->lastInsertId();
    $moderationBid = $db->prepare(
        'INSERT INTO job_bids (job_id,worker_id,amount,currency,delivery_days,proposal,status,created_at) VALUES (?,?,?,?,?,?,?,CURRENT_TIMESTAMP)'
    );
    $moderationBid->execute([$moderationJobId, $userIds['worker_a'], 100, 'BDT', 1, 'moderation race bid', JobBid::STATUS_ACCEPTED]);
    $moderationBidId = (int) $db->lastInsertId();
    $moderationAssignment = $db->prepare(
        'INSERT INTO job_assignments (job_id,bid_id,worker_id,status,payment_status,payment_amount,assigned_by,created_at) VALUES (?,?,?,?,?,?,?,CURRENT_TIMESTAMP)'
    );
    $moderationAssignment->execute([
        $moderationJobId,
        $moderationBidId,
        $userIds['worker_a'],
        JobAssignment::STATUS_ASSIGNED,
        JobAssignment::PAYMENT_HELD,
        100,
        $userIds['admin'],
    ]);
    $moderationAssignmentId = (int) $db->lastInsertId();
    $moderationSubmit = (new JobService())->submitWork(
        User::find($userIds['worker_a']),
        $moderationJobId,
        'This is a sufficiently detailed moderation race submission.',
        null,
        null,
        '10.0.0.77',
        'JMJobModerationRace/1.0'
    );
    $assert(($moderationSubmit['success'] ?? false) === true, 'Moderation race fixture submission failed.');
    $moderationSubmissionId = (int) ($moderationSubmit['submission']->id ?? 0);
    $assert($moderationSubmissionId > 0, 'Moderation race fixture did not create a submission.');

    unset(
        $insertUser,
        $insertJob,
        $insertBid,
        $moderationJob,
        $moderationBid,
        $moderationAssignment,
        $moderationSubmit,
        $duplicateSubmissionCount,
        $duplicateFlagCount
    );
    $db = null;
    Database::disconnect();
    $moderationProcesses = [];
    $moderationCommands = [
        ['--revision-child', $moderationJobId, $moderationSubmissionId, $userIds['poster']],
        ['--review-child', $moderationSubmissionId, $userIds['admin']],
    ];
    foreach ($moderationCommands as $arguments) {
        $command = escapeshellarg(PHP_BINARY) . ' ' . escapeshellarg(__FILE__);
        foreach ($arguments as $argument) $command .= ' ' . escapeshellarg((string) $argument);
        $pipes = [];
        $process = proc_open($command, $spec, $pipes, dirname(__DIR__), $env);
        if (!is_resource($process)) throw new RuntimeException('Could not start moderation-race child process.');
        $moderationProcesses[] = [$process, $pipes];
    }

    $moderationResults = [];
    foreach ($moderationProcesses as [$process, $pipes]) {
        $stdout = stream_get_contents($pipes[1]);
        $stderr = stream_get_contents($pipes[2]);
        fclose($pipes[1]);
        fclose($pipes[2]);
        $status = proc_close($process);
        $decoded = json_decode(trim((string) $stdout), true);
        if (!is_array($decoded)) {
            throw new RuntimeException('Moderation-race child returned invalid output: ' . trim((string) $stdout) . ' ' . trim((string) $stderr));
        }
        $moderationResults[] = $decoded + ['process_status' => $status, 'stderr' => trim((string) $stderr)];
    }

    $db = Database::connect();
    $moderationSuccesses = count(array_filter($moderationResults, static fn(array $result): bool => ($result['success'] ?? false) === true));
    $assert($moderationSuccesses === 1, 'Moderation race allowed more than one decision to claim the submission: ' . json_encode($moderationResults));
    $moderationState = $db->prepare(
        'SELECT s.status AS submission_status, a.status AS assignment_status, a.payment_status FROM job_submissions s JOIN job_assignments a ON a.id = s.assignment_id WHERE s.id = ?'
    );
    $moderationState->execute([$moderationSubmissionId]);
    $moderationRow = $moderationState->fetch(PDO::FETCH_ASSOC);
    $assert(in_array($moderationRow['submission_status'] ?? '', [JobSubmission::STATUS_APPROVED, JobSubmission::STATUS_REVISION], true), 'Moderation race left the submission pending or in an unknown state.');
    if ($moderationRow['submission_status'] === JobSubmission::STATUS_APPROVED) {
        $assert($moderationRow['assignment_status'] === JobAssignment::STATUS_COMPLETED
            && $moderationRow['payment_status'] === JobAssignment::PAYMENT_RELEASED,
            'Approval won the moderation race without completing and releasing the assignment.');
    } else {
        $assert($moderationRow['assignment_status'] === JobAssignment::STATUS_REVISION
            && $moderationRow['payment_status'] === JobAssignment::PAYMENT_HELD,
            'Revision won the moderation race without returning the assignment to revision with escrow held.');
    }

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
    if ($moderationJobId > 0) {
        $db->prepare('DELETE FROM job_submissions WHERE job_id = ?')->execute([$moderationJobId]);
        $db->prepare('DELETE FROM job_assignments WHERE job_id = ?')->execute([$moderationJobId]);
        $db->prepare('DELETE FROM transactions WHERE job_id = ?')->execute([$moderationJobId]);
        $db->prepare('DELETE FROM job_bids WHERE job_id = ?')->execute([$moderationJobId]);
        $db->prepare('DELETE FROM jobs WHERE id = ?')->execute([$moderationJobId]);
    }
    foreach ([$applicationRaceJobId, $bidRaceJobId] as $duplicateRaceJobId) {
        if ($duplicateRaceJobId <= 0) continue;
        $db->prepare('DELETE FROM job_bids WHERE job_id = ?')->execute([$duplicateRaceJobId]);
        $db->prepare('DELETE FROM jobs WHERE id = ?')->execute([$duplicateRaceJobId]);
    }
    if ($withdrawRaceJobId > 0) {
        $db->prepare('DELETE FROM transactions WHERE job_id = ?')->execute([$withdrawRaceJobId]);
        $db->prepare('DELETE FROM job_assignments WHERE job_id = ?')->execute([$withdrawRaceJobId]);
        $db->prepare('DELETE FROM job_bids WHERE job_id = ?')->execute([$withdrawRaceJobId]);
        $db->prepare('DELETE FROM jobs WHERE id = ?')->execute([$withdrawRaceJobId]);
    }
    if ($cancelPaymentRaceJobId > 0) {
        $db->prepare('DELETE FROM job_submissions WHERE job_id = ?')->execute([$cancelPaymentRaceJobId]);
        $db->prepare('DELETE FROM transactions WHERE job_id = ?')->execute([$cancelPaymentRaceJobId]);
        $db->prepare('DELETE FROM job_assignments WHERE job_id = ?')->execute([$cancelPaymentRaceJobId]);
        $db->prepare('DELETE FROM job_bids WHERE job_id = ?')->execute([$cancelPaymentRaceJobId]);
        $db->prepare('DELETE FROM jobs WHERE id = ?')->execute([$cancelPaymentRaceJobId]);
    }
    if ($userIds) {
        $placeholders = implode(',', array_fill(0, count($userIds), '?'));
        $db->prepare("DELETE FROM sessions WHERE user_id IN ({$placeholders})")->execute(array_values($userIds));
        $db->prepare("DELETE FROM notifications WHERE notifiable_id IN ({$placeholders})")->execute(array_values($userIds));
        $db->prepare("DELETE FROM users WHERE id IN ({$placeholders})")->execute(array_values($userIds));
    }
}

exit($exitCode);
