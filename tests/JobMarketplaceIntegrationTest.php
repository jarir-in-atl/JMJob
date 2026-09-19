<?php
declare(strict_types=1);

/**
 * Disposable-database integration checks for the marketplace foundation.
 *
 * Safety: this script refuses to run unless JOB_MARKETPLACE_TEST_DB points to
 * a SQLite file under /tmp. Apply the migrations to that file first, then run:
 *   JOB_MARKETPLACE_TEST_DB=/tmp/jmjob-marketplace-test.sqlite \
 *   php tests/JobMarketplaceIntegrationTest.php
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

require_once __DIR__ . '/../vendor/autoload.php';

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AdminJobController;
use App\Http\Controllers\Api\AdminSettingsController;
use App\Http\Controllers\Api\AdController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\JobController;
use App\Http\Controllers\Api\PosterController;
use App\Http\Controllers\Api\VideoAdController;
use App\Models\Job;
use App\Models\JobAssignment;
use App\Models\JobBid;
use App\Models\Session;
use App\Models\User;
use App\Services\JobService;
use App\Services\NotificationService;
use App\Services\RewardService;
use App\Services\WithdrawalService;
use Nemesis\Core\Config;
use Nemesis\Core\Database;
use Nemesis\Http\Request;
use Nemesis\Http\Response;
use Nemesis\Http\Middleware\AuthenticateApi;
use Nemesis\Http\Middleware\AdminOnly;
use Nemesis\Notifications\Channels\MailChannel;

Config::load(dirname(__DIR__));
Database::connect((require dirname(__DIR__) . '/config/config.php')['database']);
$db = Database::connect();

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
$jobIds = [];
$bidIds = [];
$assignmentIds = [];
$submissionIds = [];
$withdrawalIds = [];
$videoAdIds = [];
$videoViewIds = [];
$categoryIds = [];
$subcategoryIds = [];

$assert = static function (bool $condition, string $message): void {
    if (!$condition) throw new RuntimeException($message);
};

$insertUser = $db->prepare(
    'INSERT INTO users (username,email,password,name,is_admin,role,wallet_balance,frozen_balance) VALUES (?,?,?,?,?,?,?,?)'
);
$insertUser->execute(["poster-{$suffix}", "poster-{$suffix}@example.test", 'x', 'Integration Poster', 0, 'poster', 1000, 0]);
$userIds['poster'] = (int) $db->lastInsertId();
$insertUser->execute(["worker-{$suffix}", "worker-{$suffix}@example.test", 'x', 'Integration Worker', 0, 'worker', 0, 0]);
$userIds['worker'] = (int) $db->lastInsertId();
$insertUser->execute(["admin-{$suffix}", "admin-{$suffix}@example.test", 'x', 'Integration Admin', 1, 'admin', 0, 0]);
$userIds['admin'] = (int) $db->lastInsertId();
$insertUser->execute(["risk-{$suffix}", "risk-{$suffix}@example.test", 'x', 'Risk Worker', 0, 'worker', 0, 0]);
$userIds['risk'] = (int) $db->lastInsertId();
$db->prepare('UPDATE users SET password = ? WHERE id = ?')->execute([password_hash('integration-password', PASSWORD_BCRYPT), $userIds['risk']]);

$insertJob = $db->prepare(
    'INSERT INTO jobs (poster_id,title,slug,description,budget,currency,status,worker_count,cost_per_worker,deadline_at,bidding_closes_at,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP)'
);
$insertBid = $db->prepare(
    'INSERT INTO job_bids (job_id,worker_id,amount,currency,delivery_days,proposal,status,created_at) VALUES (?,?,?,?,?,?,?,CURRENT_TIMESTAMP)'
);
$insertAssignment = $db->prepare(
    'INSERT INTO job_assignments (job_id,bid_id,worker_id,status,payment_status,payment_amount,assigned_by,created_at) VALUES (?,?,?,?,?,?,?,CURRENT_TIMESTAMP)'
);

$service = new JobService();

try {
    // Poster routes and the service layer must enforce the role boundary even
    // when a caller bypasses the normal frontend navigation.
    $workerPosterRequest = new Request();
    $workerPosterRequest->setMeta('auth.user', User::find($userIds['worker']));
    $workerPosterResponse = (new PosterController())->stats($workerPosterRequest);
    $assert($workerPosterResponse->getStatus() === 403, 'A worker could access poster endpoints through a direct controller call.');
    $workerCreate = $service->create(
        User::find($userIds['worker']),
        1,
        'Worker must not post',
        'Role boundary integration check.',
        null,
        100
    );
    $assert(($workerCreate['success'] ?? true) === false && str_contains((string) ($workerCreate['message'] ?? ''), 'Poster access'), 'A worker bypassed the poster service role boundary.');

    // The inverse boundary must hold too: a poster or administrator cannot
    // reach worker-only marketplace operations by calling a service directly
    // or by invoking the controller without route middleware.
    $poster = User::find($userIds['poster']);
    $admin = User::find($userIds['admin']);
    foreach ([
        'apply' => $service->applyForJob($poster, 999999, 'poster must not apply'),
        'bid' => $service->placeBid($poster, 999999, 100, 1, 'poster must not bid'),
        'withdraw' => $service->withdrawBid($poster, 999999),
        'submit' => $service->submitWork($poster, 999999, 'poster must not submit', null),
        'cancel' => $service->cancelAssignment(999999, (int) $poster->id, 'poster must not cancel', 'worker'),
    ] as $operation => $result) {
        $assert(($result['success'] ?? true) === false && str_contains((string) ($result['message'] ?? ''), 'Worker access'), "A poster bypassed the worker service boundary for {$operation}.");
    }

    $posterWorkerRequest = new Request();
    $posterWorkerRequest->setMeta('auth.user', $poster);
    foreach ([
        'bid' => (new JobController())->bid($posterWorkerRequest, 999999),
        'withdraw' => (new JobController())->withdrawBid($posterWorkerRequest, 999999),
        'my_bids' => (new JobController())->myBids($posterWorkerRequest),
        'active_jobs' => (new JobController())->activeJobs($posterWorkerRequest),
        'cancel' => (new JobController())->cancelAssignment($posterWorkerRequest, 999999),
        'submit' => (new JobController())->submit($posterWorkerRequest, 999999),
        'submissions' => (new JobController())->mySubmissions($posterWorkerRequest),
        'apply' => (new JobController())->applyForJob($posterWorkerRequest, 999999),
    ] as $operation => $response) {
        $assert($response->getStatus() === 403, "A poster reached the worker controller endpoint for {$operation}.");
    }
    $workerWorkflowResponse = (new JobController())->createWorkflowJob($workerPosterRequest);
    $assert($workerWorkflowResponse->getStatus() === 403, 'A worker reached the poster workflow controller endpoint.');
    $workerDeadlineResponse = (new JobController())->extendDeadline($workerPosterRequest, 999999);
    $assert($workerDeadlineResponse->getStatus() === 403, 'A worker reached the poster deadline controller endpoint.');

    $adminWorkerRequest = new Request();
    $adminWorkerRequest->setMeta('auth.user', $admin);
    $assert((new JobController())->myBids($adminWorkerRequest)->getStatus() === 403, 'An administrator reached a worker-only controller endpoint.');

    // The route-level admin middleware must reject anonymous and worker
    // callers while allowing the seeded administrator through.
    $adminOnly = new AdminOnly();
    $anonymousAdminResponse = $adminOnly->handle(new Request(), static fn(): Response => Response::json(['success' => true]));
    $assert($anonymousAdminResponse->getStatus() === 401, 'Anonymous access passed the admin middleware.');
    $workerAdminRequest = new Request();
    $workerAdminRequest->setMeta('auth.user', User::find($userIds['worker']));
    $workerAdminResponse = $adminOnly->handle($workerAdminRequest, static fn(): Response => Response::json(['success' => true]));
    $assert($workerAdminResponse->getStatus() === 403, 'Worker access passed the admin middleware.');
    $adminRequest = new Request();
    $adminRequest->setMeta('auth.user', User::find($userIds['admin']));
    $adminResponse = $adminOnly->handle($adminRequest, static fn(): Response => Response::json(['success' => true]));
    $assert($adminResponse->getStatus() === 200, 'Administrator access was rejected by the admin middleware.');

    // Cancellation/refund and worker ownership protection.
    $insertJob->execute([$userIds['poster'], "Cancel {$suffix}", "cancel-{$suffix}", 'Cancellation test', 100, 'BDT', Job::STATUS_ENGAGED, 1, 100, null, null]);
    $jobIds['cancel'] = (int) $db->lastInsertId();
    $insertBid->execute([$jobIds['cancel'], $userIds['worker'], 100, 'BDT', 1, 'cancel bid', 'accepted']);
    $bidIds['cancel'] = (int) $db->lastInsertId();
    $insertAssignment->execute([$jobIds['cancel'], $bidIds['cancel'], $userIds['worker'], JobAssignment::STATUS_ASSIGNED, JobAssignment::PAYMENT_HELD, 100, $userIds['admin']]);
    $assignmentIds['cancel'] = (int) $db->lastInsertId();
    $db->exec('UPDATE users SET wallet_balance = 900, frozen_balance = 100 WHERE id = ' . $userIds['poster']);

    $wrongAdminActor = $service->cancelAssignment($assignmentIds['cancel'], $userIds['worker'], 'not an admin action', 'admin');
    $assert(!($wrongAdminActor['success'] ?? false), 'A non-admin user invoked the admin assignment cancellation path.');
    $wrongWorker = $service->cancelAssignment($assignmentIds['cancel'], $userIds['risk'], 'not my assignment', 'worker');
    $assert(!($wrongWorker['success'] ?? false), 'A worker cancelled another worker assignment.');
    $cancel = $service->cancelAssignment($assignmentIds['cancel'], $userIds['admin'], 'integration refund', 'admin');
    $assert(($cancel['success'] ?? false) === true, 'Assignment cancellation failed.');
    $row = $db->prepare('SELECT status,payment_status FROM job_assignments WHERE id = ?');
    $row->execute([$assignmentIds['cancel']]);
    $cancelState = $row->fetch(PDO::FETCH_ASSOC);
    $assert($cancelState['status'] === JobAssignment::STATUS_CANCELLED && $cancelState['payment_status'] === JobAssignment::PAYMENT_REFUNDED, 'Cancellation state was not refunded.');

    // Reassignment refunds the old escrow and holds the replacement escrow in
    // one transaction, so a replacement failure cannot strand the old worker.
    $insertJob->execute([$userIds['poster'], "Reassign {$suffix}", "reassign-{$suffix}", 'Reassignment test', 100, 'BDT', Job::STATUS_ENGAGED, 1, 100, null, null]);
    $jobIds['reassign'] = (int) $db->lastInsertId();
    $insertBid->execute([$jobIds['reassign'], $userIds['worker'], 100, 'BDT', 1, 'old assignment', 'accepted']);
    $bidIds['reassign_old'] = (int) $db->lastInsertId();
    $insertBid->execute([$jobIds['reassign'], $userIds['risk'], 100, 'BDT', 1, 'replacement bid', 'pending']);
    $bidIds['reassign_new'] = (int) $db->lastInsertId();
    $insertAssignment->execute([$jobIds['reassign'], $bidIds['reassign_old'], $userIds['worker'], JobAssignment::STATUS_ASSIGNED, JobAssignment::PAYMENT_HELD, 100, $userIds['admin']]);
    $assignmentIds['reassign_old'] = (int) $db->lastInsertId();
    $db->exec('UPDATE users SET wallet_balance = 900, frozen_balance = 100 WHERE id = ' . $userIds['poster']);
    $reassign = $service->reassignAssignment($assignmentIds['reassign_old'], $bidIds['reassign_new'], $userIds['admin'], 'integration replacement');
    $assert(($reassign['success'] ?? false) === true, 'Assignment reassignment failed.');
    $oldState = $db->prepare('SELECT status,payment_status FROM job_assignments WHERE id = ?');
    $oldState->execute([$assignmentIds['reassign_old']]);
    $oldReassignState = $oldState->fetch(PDO::FETCH_ASSOC);
    $assert($oldReassignState['status'] === JobAssignment::STATUS_CANCELLED && $oldReassignState['payment_status'] === JobAssignment::PAYMENT_REFUNDED, 'Old assignment was not refunded during reassignment.');
    $newAssignmentId = (int) ($reassign['assignment']->id ?? 0);
    $assignmentIds['reassign_new'] = $newAssignmentId;
    $newState = $db->prepare('SELECT status,payment_status,worker_id FROM job_assignments WHERE id = ?');
    $newState->execute([$newAssignmentId]);
    $newReassignState = $newState->fetch(PDO::FETCH_ASSOC);
    $assert($newReassignState['status'] === JobAssignment::STATUS_ASSIGNED && $newReassignState['payment_status'] === JobAssignment::PAYMENT_HELD && (int) $newReassignState['worker_id'] === $userIds['risk'], 'Replacement assignment state is incorrect.');

    // The single-worker poster flow still closes competing bids.
    $insertJob->execute([$userIds['poster'], "Poster single {$suffix}", "poster-single-{$suffix}", 'Poster single-worker acceptance test', 100, 'BDT', Job::STATUS_OPEN, 1, 100, null, null]);
    $jobIds['poster_single'] = (int) $db->lastInsertId();
    $insertBid->execute([$jobIds['poster_single'], $userIds['worker'], 100, 'BDT', 1, 'poster single first', 'pending']);
    $bidIds['poster_single_first'] = (int) $db->lastInsertId();
    $insertBid->execute([$jobIds['poster_single'], $userIds['risk'], 100, 'BDT', 1, 'poster single second', 'pending']);
    $bidIds['poster_single_second'] = (int) $db->lastInsertId();
    $db->exec('UPDATE users SET wallet_balance = 1000, frozen_balance = 0 WHERE id = ' . $userIds['poster']);
    $singleAccept = $service->acceptBid(User::find($userIds['poster']), $bidIds['poster_single_first']);
    $assert(($singleAccept['success'] ?? false) === true, 'Poster-side acceptance failed for the single-worker path.');
    $pendingCheck = $db->prepare('SELECT status FROM job_bids WHERE id = ?');
    $pendingCheck->execute([$bidIds['poster_single_second']]);
    $assert($pendingCheck->fetchColumn() === JobBid::STATUS_REJECTED, 'Single-worker acceptance no longer closes competing bids.');

    // Poster-side acceptance keeps the second pending bid available for a
    // multi-worker job and transitions only after capacity is filled.
    $insertJob->execute([$userIds['poster'], "Poster multi {$suffix}", "poster-multi-{$suffix}", 'Poster multi-worker acceptance test', 200, 'BDT', Job::STATUS_OPEN, 2, 100, null, null]);
    $jobIds['poster_multi'] = (int) $db->lastInsertId();
    $insertBid->execute([$jobIds['poster_multi'], $userIds['worker'], 100, 'BDT', 1, 'poster multi first', 'pending']);
    $bidIds['poster_multi_first'] = (int) $db->lastInsertId();
    $insertBid->execute([$jobIds['poster_multi'], $userIds['risk'], 100, 'BDT', 1, 'poster multi second', 'pending']);
    $bidIds['poster_multi_second'] = (int) $db->lastInsertId();
    $db->exec('UPDATE users SET wallet_balance = 1000, frozen_balance = 0 WHERE id = ' . $userIds['poster']);
    $firstAccept = $service->acceptBid(User::find($userIds['poster']), $bidIds['poster_multi_first']);
    $assert(($firstAccept['success'] ?? false) === true, 'Poster-side acceptance failed for the first multi-worker bid.');
    $pendingCheck = $db->prepare('SELECT status FROM job_bids WHERE id = ?');
    $pendingCheck->execute([$bidIds['poster_multi_second']]);
    $assert($pendingCheck->fetchColumn() === JobBid::STATUS_PENDING, 'Poster-side acceptance closed a valid second multi-worker bid.');
    $multiJobCheck = $db->prepare('SELECT status FROM jobs WHERE id = ?');
    $multiJobCheck->execute([$jobIds['poster_multi']]);
    $assert($multiJobCheck->fetchColumn() === Job::STATUS_IN_REVIEW, 'A partially filled multi-worker job did not remain in review.');
    $secondAccept = $service->acceptBid(User::find($userIds['poster']), $bidIds['poster_multi_second']);
    $assert(($secondAccept['success'] ?? false) === true, 'Poster-side acceptance failed for the second multi-worker bid.');
    $multiJobCheck->execute([$jobIds['poster_multi']]);
    $assert($multiJobCheck->fetchColumn() === Job::STATUS_ENGAGED, 'A full multi-worker job did not transition to engaged.');
    $multiAssignmentCount = $db->prepare('SELECT COUNT(*) FROM job_assignments WHERE job_id = ? AND payment_status = ?');
    $multiAssignmentCount->execute([$jobIds['poster_multi'], JobAssignment::PAYMENT_HELD]);
    $assert((int) $multiAssignmentCount->fetchColumn() === 2, 'Poster-side multi-worker acceptance did not create two held assignments.');
    $multiSubmit = $service->submitWork(
        User::find($userIds['worker']),
        $jobIds['poster_multi'],
        'This is a sufficiently detailed multi-worker proof submission.',
        null,
        null,
        '10.0.0.30',
        'JMJobIntegration/1.0'
    );
    $assert(($multiSubmit['success'] ?? false) === true, 'A worker could not submit against the poster-created multi-worker assignment.');
    $multiJobCheck->execute([$jobIds['poster_multi']]);
    $assert($multiJobCheck->fetchColumn() === Job::STATUS_SUBMITTED, 'Submitting one multi-worker assignment did not refresh the aggregate job status.');
    $secondAssignmentState = $db->prepare('SELECT status FROM job_assignments WHERE job_id = ? AND worker_id = ?');
    $secondAssignmentState->execute([$jobIds['poster_multi'], $userIds['risk']]);
    $assert($secondAssignmentState->fetchColumn() === JobAssignment::STATUS_ASSIGNED, 'Submitting one worker changed another worker assignment state.');

    // Poster actions must continue to target individual assignments when the
    // aggregate multi-worker job is in revision because another worker still
    // has a pending submission. This catches an overly strict job-level guard.
    $multiSecondSubmit = $service->submitWork(
        User::find($userIds['risk']),
        $jobIds['poster_multi'],
        'This is a sufficiently detailed second multi-worker proof submission.',
        null,
        null,
        '10.0.0.31',
        'JMJobIntegration/1.0'
    );
    $assert(($multiSecondSubmit['success'] ?? false) === true, 'The second multi-worker assignment could not submit work.');
    $submissionLookup = $db->prepare('SELECT id, worker_id FROM job_submissions WHERE job_id = ? ORDER BY id ASC');
    $submissionLookup->execute([$jobIds['poster_multi']]);
    $multiSubmissionIds = [];
    while ($submissionRow = $submissionLookup->fetch(PDO::FETCH_ASSOC)) {
        $multiSubmissionIds[(int) $submissionRow['worker_id']] = (int) $submissionRow['id'];
    }
    $mixedRevision = $service->requestRevision(
        User::find($userIds['poster']),
        $jobIds['poster_multi'],
        $multiSubmissionIds[$userIds['worker']],
        'Please add one more verification detail.'
    );
    $assert(($mixedRevision['success'] ?? false) === true, 'Poster could not request revision for the first multi-worker submission.');
    $multiJobCheck->execute([$jobIds['poster_multi']]);
    $assert($multiJobCheck->fetchColumn() === Job::STATUS_REVISION, 'Mixed multi-worker review did not retain revision status.');
    $mixedRelease = $service->releasePayment(
        User::find($userIds['poster']),
        $jobIds['poster_multi'],
        $multiSubmissionIds[$userIds['risk']]
    );
    $assert(($mixedRelease['success'] ?? false) === true, 'Poster could not release the other pending assignment while the job was in revision.');

    // Exercise the real poster/worker controller path across acceptance,
    // submission, revision, resubmission, and final payment release.
    $insertJob->execute([$userIds['poster'], "Controller flow {$suffix}", "controller-flow-{$suffix}", 'Controller flow test', 100, 'BDT', Job::STATUS_OPEN, 1, 100, null, null]);
    $jobIds['controller_flow'] = (int) $db->lastInsertId();
    $insertBid->execute([$jobIds['controller_flow'], $userIds['worker'], 100, 'BDT', 1, 'controller flow bid', 'pending']);
    $bidIds['controller_flow'] = (int) $db->lastInsertId();
    $db->exec('UPDATE users SET wallet_balance = 1000, frozen_balance = 0 WHERE id = ' . $userIds['poster']);

    $_POST = ['bid_id' => $bidIds['controller_flow']];
    $posterController = new PosterController();
    $posterRequest = new Request();
    $posterRequest->setMeta('auth.user', User::find($userIds['poster']));
    $acceptResponse = $posterController->acceptBid($posterRequest, $jobIds['controller_flow']);
    $assert($acceptResponse->getStatus() === 200, 'Poster controller bid acceptance failed.');
    $assignmentLookup = $db->prepare('SELECT id FROM job_assignments WHERE job_id = ? AND worker_id = ?');
    $assignmentLookup->execute([$jobIds['controller_flow'], $userIds['worker']]);
    $assignmentIds['controller_flow'] = (int) $assignmentLookup->fetchColumn();
    $assert($assignmentIds['controller_flow'] > 0, 'Poster controller acceptance did not create an assignment.');

    $_POST = ['description' => 'This is a sufficiently detailed controller submission.'];
    $workerRequest = new Request();
    $workerRequest->setMeta('auth.user', User::find($userIds['worker']));
    $workerSubmitResponse = (new JobController())->submit($workerRequest, $jobIds['controller_flow']);
    $assert($workerSubmitResponse->getStatus() === 200, 'Worker controller submission failed.');
    $latestSubmissionLookup = $db->prepare('SELECT id FROM job_submissions WHERE job_id = ? ORDER BY id DESC LIMIT 1');
    $latestSubmissionLookup->execute([$jobIds['controller_flow']]);
    $controllerSubmissionId = (int) $latestSubmissionLookup->fetchColumn();
    $submissionIds['controller_flow'] = $controllerSubmissionId;

    $_POST = [
        'submission_id' => $controllerSubmissionId,
        'note' => 'Please include one more verification detail.',
    ];
    $revisionRequest = new Request();
    $revisionRequest->setMeta('auth.user', User::find($userIds['poster']));
    $revisionResponse = $posterController->requestRevision($revisionRequest, $jobIds['controller_flow']);
    $assert($revisionResponse->getStatus() === 200, 'Poster controller revision request failed.');

    $_POST = ['description' => 'This revised controller submission includes the requested detail.'];
    $resubmitRequest = new Request();
    $resubmitRequest->setMeta('auth.user', User::find($userIds['worker']));
    $resubmitResponse = (new JobController())->submit($resubmitRequest, $jobIds['controller_flow']);
    $assert($resubmitResponse->getStatus() === 200, 'Worker controller resubmission failed after revision.');
    $latestSubmissionLookup->execute([$jobIds['controller_flow']]);
    $controllerResubmissionId = (int) $latestSubmissionLookup->fetchColumn();
    $submissionIds['controller_resubmission'] = $controllerResubmissionId;

    $_POST = ['submission_id' => $controllerResubmissionId];
    $releaseRequest = new Request();
    $releaseRequest->setMeta('auth.user', User::find($userIds['poster']));
    $releaseResponse = $posterController->releasePayment($releaseRequest, $jobIds['controller_flow']);
    $assert($releaseResponse->getStatus() === 200, 'Poster controller payment release failed after resubmission.');
    $controllerAssignmentState = $db->prepare('SELECT status, payment_status FROM job_assignments WHERE id = ?');
    $controllerAssignmentState->execute([$assignmentIds['controller_flow']]);
    $controllerState = $controllerAssignmentState->fetch(PDO::FETCH_ASSOC);
    $assert($controllerState['status'] === JobAssignment::STATUS_COMPLETED && $controllerState['payment_status'] === JobAssignment::PAYMENT_RELEASED, 'Controller workflow did not complete and release payment.');
    $_POST = [];

    // Exercise the worker cancellation and admin reassignment controller
    // paths, including their escrow rollback and replacement assignment.
    $insertJob->execute([$userIds['poster'], "Controller rollback {$suffix}", "controller-rollback-{$suffix}", 'Controller rollback test', 100, 'BDT', Job::STATUS_ENGAGED, 1, 100, null, null]);
    $jobIds['controller_rollback'] = (int) $db->lastInsertId();
    $insertBid->execute([$jobIds['controller_rollback'], $userIds['worker'], 100, 'BDT', 1, 'controller rollback old bid', 'accepted']);
    $bidIds['controller_rollback_old'] = (int) $db->lastInsertId();
    $insertBid->execute([$jobIds['controller_rollback'], $userIds['risk'], 100, 'BDT', 1, 'controller rollback replacement bid', 'pending']);
    $bidIds['controller_rollback_new'] = (int) $db->lastInsertId();
    $insertAssignment->execute([$jobIds['controller_rollback'], $bidIds['controller_rollback_old'], $userIds['worker'], JobAssignment::STATUS_ASSIGNED, JobAssignment::PAYMENT_HELD, 100, $userIds['admin']]);
    $assignmentIds['controller_rollback'] = (int) $db->lastInsertId();
    $db->exec('UPDATE users SET wallet_balance = 900, frozen_balance = 100 WHERE id = ' . $userIds['poster']);

    $controllerRollbackState = $db->prepare('SELECT status, payment_status FROM job_assignments WHERE id = ?');
    $_POST = [
        'bid_id' => $bidIds['controller_rollback_new'],
        'reason' => 'Controller reassignment rollback.',
    ];
    $adminReassignRequest = new Request();
    $adminReassignRequest->setMeta('auth.user', User::find($userIds['admin']));
    $adminReassignResponse = (new AdminJobController())->reassignAssignment($adminReassignRequest, $assignmentIds['controller_rollback']);
    $assert($adminReassignResponse->getStatus() === 200, 'Admin controller reassignment failed.');
    $controllerRollbackState->execute([$assignmentIds['controller_rollback']]);
    $rollbackAssignment = $controllerRollbackState->fetch(PDO::FETCH_ASSOC);
    $assert($rollbackAssignment['status'] === JobAssignment::STATUS_CANCELLED && $rollbackAssignment['payment_status'] === JobAssignment::PAYMENT_REFUNDED, 'Admin controller reassignment did not refund the old assignment.');
    $replacementLookup = $db->prepare('SELECT id FROM job_assignments WHERE job_id = ? AND worker_id = ? AND status = ? AND payment_status = ?');
    $replacementLookup->execute([$jobIds['controller_rollback'], $userIds['risk'], JobAssignment::STATUS_ASSIGNED, JobAssignment::PAYMENT_HELD]);
    $replacementAssignmentId = (int) $replacementLookup->fetchColumn();
    $assert($replacementAssignmentId > 0, 'Admin controller reassignment did not create the replacement held assignment.');

    $_POST = ['reason' => 'Controller cancellation before submission.'];
    $workerCancelRequest = new Request();
    $workerCancelRequest->setMeta('auth.user', User::find($userIds['risk']));
    $workerCancelResponse = (new JobController())->cancelAssignment($workerCancelRequest, $replacementAssignmentId);
    $assert($workerCancelResponse->getStatus() === 200, 'Worker controller cancellation failed.');
    $controllerRollbackState->execute([$replacementAssignmentId]);
    $rollbackReplacement = $controllerRollbackState->fetch(PDO::FETCH_ASSOC);
    $assert($rollbackReplacement['status'] === JobAssignment::STATUS_CANCELLED && $rollbackReplacement['payment_status'] === JobAssignment::PAYMENT_REFUNDED, 'Worker controller cancellation did not refund the replacement assignment.');
    $_POST = [];

    // A flagged signal can be explicitly cleared as a false positive without
    // crediting the worker or escalating to a ban.
    $falsePositiveSubmit = $service->submitWork(User::find($userIds['risk']), $jobIds['reassign'], 'short', null, null, '10.0.0.22', 'JMJobIntegration/1.0');
    $assert(($falsePositiveSubmit['success'] ?? false) === true, 'False-positive moderation submission failed.');
    $submissionLookup = $db->prepare('SELECT id FROM job_submissions WHERE job_id = ? ORDER BY id DESC LIMIT 1');
    $submissionLookup->execute([$jobIds['reassign']]);
    $submissionIds['false_positive'] = (int) $submissionLookup->fetchColumn();
    $riskRow = $db->prepare('SELECT risk_status FROM job_submissions WHERE id = ?');
    $riskRow->execute([$submissionIds['false_positive']]);
    $assert($riskRow->fetchColumn() === 'flagged', 'False-positive test submission was not queued for review.');
    $_POST = ['decision' => 'cleared', 'note' => 'Integration review found the signal was a false positive.'];
    $clearRequest = new Request();
    $clearRequest->setMeta('auth.user', User::find($userIds['admin']));
    $clearResponse = (new AdminController())->reviewFraud($clearRequest, (string) $submissionIds['false_positive']);
    $clearBody = json_decode($clearResponse->getContent(), true);
    $assert(($clearBody['success'] ?? false) === true && ($clearBody['data']['risk_status'] ?? '') === 'cleared', 'False-positive fraud review was not cleared.');
    $_POST = [];

    // Approval must atomically release assignment escrow and credit the worker.
    $insertJob->execute([$userIds['poster'], "Release {$suffix}", "release-{$suffix}", 'Release test', 100, 'BDT', Job::STATUS_ENGAGED, 1, 100, null, null]);
    $jobIds['release'] = (int) $db->lastInsertId();
    $insertBid->execute([$jobIds['release'], $userIds['worker'], 100, 'BDT', 1, 'release bid', 'accepted']);
    $bidIds['release'] = (int) $db->lastInsertId();
    $insertAssignment->execute([$jobIds['release'], $bidIds['release'], $userIds['worker'], JobAssignment::STATUS_ASSIGNED, JobAssignment::PAYMENT_HELD, 100, $userIds['admin']]);
    $assignmentIds['release'] = (int) $db->lastInsertId();
    $db->exec('UPDATE users SET wallet_balance = 800, frozen_balance = 100 WHERE id = ' . $userIds['poster']);

    $submit = $service->submitWork(
        User::find($userIds['worker']),
        $jobIds['release'],
        'This is a sufficiently detailed integration submission description.',
        null,
        null,
        '10.0.0.20',
        'JMJobIntegration/1.0'
    );
    $assert(($submit['success'] ?? false) === true, 'Valid assignment submission failed.');
    $duplicateSubmit = $service->submitWork(
        User::find($userIds['worker']),
        $jobIds['release'],
        'This is a sufficiently detailed integration submission description.',
        null,
        null,
        '10.0.0.20',
        'JMJobIntegration/1.0'
    );
    $assert(($duplicateSubmit['success'] ?? true) === false, 'A second pending submission was accepted for the same assignment.');
    $submissionLookup = $db->prepare('SELECT id FROM job_submissions WHERE job_id = ? ORDER BY id DESC LIMIT 1');
    $submissionLookup->execute([$jobIds['release']]);
    $submissionIds['release'] = (int) $submissionLookup->fetchColumn();
    $workerReview = $service->reviewSubmission($submissionIds['release'], $userIds['worker'], 'approve');
    $assert(($workerReview['success'] ?? true) === false, 'A worker could invoke the admin submission review service path.');
    $workerRelease = $service->releaseAssignmentPayment($assignmentIds['release'], $userIds['worker'], $submissionIds['release'], false);
    $assert(($workerRelease['success'] ?? true) === false, 'A worker could invoke the assignment payment release service path.');
    $_POST = ['decision' => 'approve'];
    $reviewRequest = new Request();
    $reviewRequest->setMeta('auth.user', User::find($userIds['admin']));
    $reviewResponse = (new AdminController())->reviewSubmission($reviewRequest, (string) $submissionIds['release']);
    $review = json_decode($reviewResponse->getContent(), true);
    $assert(($review['success'] ?? false) === true && (int) ($review['data']['id'] ?? 0) === $submissionIds['release'], 'Approved assignment submission did not return the reviewed submission payload.');
    $_POST = [];
    $row->execute([$assignmentIds['release']]);
    $releaseState = $row->fetch(PDO::FETCH_ASSOC);
    $assert($releaseState['status'] === JobAssignment::STATUS_COMPLETED && $releaseState['payment_status'] === JobAssignment::PAYMENT_RELEASED, 'Released assignment state is incorrect.');
    $workerBalance = $db->prepare('SELECT balance FROM users WHERE id = ?');
    $workerBalance->execute([$userIds['worker']]);
    $creditedBalance = (float) $workerBalance->fetchColumn();
    $assert($creditedBalance > 0, 'Worker was not credited after approval.');
    $repeatRelease = $service->releaseAssignmentPayment($assignmentIds['release'], $userIds['admin'], $submissionIds['release'], false);
    $assert(($repeatRelease['success'] ?? false) === true && ($repeatRelease['already_released'] ?? false) === true, 'Repeated assignment payment release was not idempotent.');
    $workerBalance->execute([$userIds['worker']]);
    $assert((float) $workerBalance->fetchColumn() === $creditedBalance, 'Repeated payment release credited the worker twice.');

    // Rejection returns an assignment to revision and records the moderator's
    // reason without releasing the held payment.
    $insertJob->execute([$userIds['poster'], "Reject {$suffix}", "reject-{$suffix}", 'Rejection test', 100, 'BDT', Job::STATUS_ENGAGED, 1, 100, null, null]);
    $jobIds['reject'] = (int) $db->lastInsertId();
    $insertBid->execute([$jobIds['reject'], $userIds['worker'], 100, 'BDT', 1, 'reject bid', 'accepted']);
    $bidIds['reject'] = (int) $db->lastInsertId();
    $insertAssignment->execute([$jobIds['reject'], $bidIds['reject'], $userIds['worker'], JobAssignment::STATUS_ASSIGNED, JobAssignment::PAYMENT_HELD, 100, $userIds['admin']]);
    $assignmentIds['reject'] = (int) $db->lastInsertId();
    $rejectSubmit = $service->submitWork(
        User::find($userIds['worker']),
        $jobIds['reject'],
        'This is a sufficiently detailed rejection-path submission description.',
        null,
        null,
        '10.0.0.24',
        'JMJobIntegration/1.0'
    );
    $assert(($rejectSubmit['success'] ?? false) === true, 'Rejection-path submission failed.');
    $submissionLookup->execute([$jobIds['reject']]);
    $submissionIds['reject'] = (int) $submissionLookup->fetchColumn();
    $rejectResult = $service->reviewSubmission($submissionIds['reject'], $userIds['admin'], 'reject', 'Please provide clearer proof details.');
    $assert(($rejectResult['success'] ?? false) === true, 'Submission rejection failed.');
    $rejectState = $db->prepare('SELECT status, rejection_reason FROM job_submissions WHERE id = ?');
    $rejectState->execute([$submissionIds['reject']]);
    $rejected = $rejectState->fetch(PDO::FETCH_ASSOC);
    $assert($rejected['status'] === 'rejected' && $rejected['rejection_reason'] === 'Please provide clearer proof details.', 'Submission rejection reason was not persisted.');
    $rejectAssignmentState = $db->prepare('SELECT status, payment_status FROM job_assignments WHERE id = ?');
    $rejectAssignmentState->execute([$assignmentIds['reject']]);
    $rejectedAssignment = $rejectAssignmentState->fetch(PDO::FETCH_ASSOC);
    $assert($rejectedAssignment['status'] === JobAssignment::STATUS_REVISION && $rejectedAssignment['payment_status'] === JobAssignment::PAYMENT_HELD, 'Rejected submission did not return the assignment to revision with escrow held.');

    // Withdrawal creation locks the balance and enforces one pending request.
    $withdrawalService = new WithdrawalService();
    $withdrawalResult = $withdrawalService->request(User::find($userIds['worker']), 10, 'bkash', '0123456789');
    $assert(($withdrawalResult['success'] ?? false) === true, 'Withdrawal request failed after a worker was credited.');
    $withdrawalIds[] = (int) ($withdrawalResult['withdrawal']->id ?? 0);
    $duplicateWithdrawal = $withdrawalService->request(User::find($userIds['worker']), 10, 'bkash', '0123456789');
    $assert(($duplicateWithdrawal['success'] ?? false) === false, 'A second pending withdrawal was accepted.');
    $workerBalance->execute([$userIds['worker']]);
    $assert((float) $workerBalance->fetchColumn() === round($creditedBalance - 10, 4), 'Withdrawal did not debit the worker balance exactly once.');

    // Admin withdrawal transitions are one-way and the rejection refund is
    // atomic with the status change; repeating an action cannot refund twice.
    $_POST = ['admin_note' => 'Integration withdrawal rejection.'];
    $withdrawalRequest = new Request();
    $withdrawalRequest->setMeta('auth.user', User::find($userIds['admin']));
    $withdrawalReject = (new AdminController())->reject($withdrawalRequest, (string) $withdrawalIds[0]);
    $assert($withdrawalReject->getStatus() === 200, 'Admin withdrawal rejection failed.');
    $withdrawalState = $db->prepare('SELECT status FROM withdrawals WHERE id = ?');
    $withdrawalState->execute([$withdrawalIds[0]]);
    $assert($withdrawalState->fetchColumn() === 'rejected', 'Rejected withdrawal did not persist its final state.');
    $workerBalance->execute([$userIds['worker']]);
    $assert((float) $workerBalance->fetchColumn() === $creditedBalance, 'Rejected withdrawal did not refund the reserved balance exactly once.');
    $repeatWithdrawalReject = (new AdminController())->reject($withdrawalRequest, (string) $withdrawalIds[0]);
    $assert($repeatWithdrawalReject->getStatus() === 422, 'A finalized withdrawal could be rejected a second time.');
    $workerBalance->execute([$userIds['worker']]);
    $assert((float) $workerBalance->fetchColumn() === $creditedBalance, 'Repeated withdrawal rejection refunded the worker twice.');
    $_POST = [];

    $secondWithdrawal = $withdrawalService->request(User::find($userIds['worker']), 5, 'nagad', '01999999999');
    $assert(($secondWithdrawal['success'] ?? false) === true, 'A new withdrawal could not be created after rejection.');
    $withdrawalIds[] = (int) ($secondWithdrawal['withdrawal']->id ?? 0);
    $approveWithdrawal = (new AdminController())->approve($withdrawalRequest, (string) $withdrawalIds[1]);
    $assert($approveWithdrawal->getStatus() === 200, 'Admin withdrawal approval failed.');
    $payWithdrawal = (new AdminController())->pay($withdrawalRequest, (string) $withdrawalIds[1]);
    $assert($payWithdrawal->getStatus() === 200, 'Admin withdrawal payment transition failed.');
    $repeatWithdrawalPay = (new AdminController())->pay($withdrawalRequest, (string) $withdrawalIds[1]);
    $assert($repeatWithdrawalPay->getStatus() === 422, 'A paid withdrawal could be marked paid a second time.');

    // Short content is flagged, but does not automatically ban until an admin
    // confirms fraud and explicitly requests escalation.
    $insertJob->execute([$userIds['poster'], "Risk {$suffix}", "risk-{$suffix}", 'Risk test', 100, 'BDT', Job::STATUS_ENGAGED, 1, 100, null, null]);
    $jobIds['risk'] = (int) $db->lastInsertId();
    $insertBid->execute([$jobIds['risk'], $userIds['risk'], 100, 'BDT', 1, 'risk bid', 'accepted']);
    $bidIds['risk'] = (int) $db->lastInsertId();
    $insertAssignment->execute([$jobIds['risk'], $bidIds['risk'], $userIds['risk'], JobAssignment::STATUS_ASSIGNED, JobAssignment::PAYMENT_HELD, 100, $userIds['admin']]);
    $assignmentIds['risk'] = (int) $db->lastInsertId();
    $riskSubmit = $service->submitWork(User::find($userIds['risk']), $jobIds['risk'], 'short', null, null, '10.0.0.21', 'JMJobIntegration/1.0');
    $assert(($riskSubmit['success'] ?? false) === true, 'Risk submission failed before moderation.');
    $submissionLookup->execute([$jobIds['risk']]);
    $submissionIds['risk'] = (int) $submissionLookup->fetchColumn();
    $riskRow = $db->prepare('SELECT risk_status FROM job_submissions WHERE id = ?');
    $riskRow->execute([$submissionIds['risk']]);
    $assert($riskRow->fetchColumn() === 'flagged', 'Short submission was not flagged.');

    $_POST = ['decision' => 'confirmed_fraud', 'note' => 'Integration proof review confirmed fraud.', 'ban_user' => 'true'];
    $request = new Request();
    $request->setMeta('auth.user', User::find($userIds['admin']));
    $fraudResponse = (new AdminController())->reviewFraud($request, (string) $submissionIds['risk']);
    $fraudBody = json_decode($fraudResponse->getContent(), true);
    $assert(($fraudBody['success'] ?? false) === true && ($fraudBody['data']['user_banned'] ?? false) === true, 'Fraud confirmation did not record the explicit ban escalation.');
    $banned = $db->prepare('SELECT is_banned FROM users WHERE id = ?');
    $banned->execute([$userIds['risk']]);
    $assert((int) $banned->fetchColumn() === 1, 'Fraud escalation did not ban the worker.');
    $auditCount = $db->prepare("SELECT COUNT(*) FROM admin_action_logs WHERE action IN ('submission.fraud_review', 'user.ban.fraud_escalation') AND entity_id = ?");
    $auditCount->execute([$submissionIds['risk']]);
    $assert((int) $auditCount->fetchColumn() >= 1, 'Fraud escalation did not leave an administrator audit record.');

    // Cross-owner reads and proof access remain denied even when a caller
    // reaches a controller directly instead of through the route middleware.
    $wrongOwnerRequest = new Request();
    $wrongOwnerRequest->setMeta('auth.user', User::find($userIds['worker']));
    $wrongOwnerBids = (new PosterController())->jobBids($wrongOwnerRequest, $jobIds['risk']);
    $assert($wrongOwnerBids->getStatus() === 403, 'A non-owner worker could read another poster job bids endpoint.');
    $wrongProofResponse = (new JobController())->submissionAttachment($wrongOwnerRequest, $submissionIds['risk']);
    $assert($wrongProofResponse->getStatus() === 403, 'A non-owner worker could access another worker proof attachment.');

    // Even an owner/admin cannot turn the logical proof path into a filesystem
    // traversal target.
    $db->prepare('UPDATE job_submissions SET attachment_path = ? WHERE id = ?')
        ->execute(['job-proofs/../../.env', $submissionIds['risk']]);
    $traversalRequest = new Request();
    $traversalRequest->setMeta('auth.user', User::find($userIds['admin']));
    $traversalResponse = (new JobController())->submissionAttachment($traversalRequest, $submissionIds['risk']);
    $assert($traversalResponse->getStatus() === 404, 'A proof path traversal escaped the logical storage root.');
    $db->prepare('UPDATE job_submissions SET attachment_path = NULL WHERE id = ?')->execute([$submissionIds['risk']]);

    // Bans stop authentication and withdrawals before any balance mutation.
    $_POST = ['email' => "risk-{$suffix}@example.test", 'password' => 'integration-password'];
    $bannedLogin = (new AuthController())->login(new Request());
    $bannedLoginBody = json_decode($bannedLogin->getContent(), true);
    $assert($bannedLogin->getStatus() === 403 && ($bannedLoginBody['error'] ?? '') === 'banned', 'Banned login was not rejected.');
    $_POST = [];
    $blockedWithdrawal = $withdrawalService->request(User::find($userIds['risk']), 1, 'bkash', '01999999999');
    $assert(($blockedWithdrawal['success'] ?? true) === false, 'A banned worker was allowed to create a withdrawal request.');
    $blockedCreate = $service->create(User::find($userIds['risk']), 999999, 'Banned job', 'Banned job must not be created.', null, 100);
    $assert(($blockedCreate['success'] ?? true) === false && str_contains((string) ($blockedCreate['message'] ?? ''), 'Banned'), 'A banned user was allowed to create a job through the service layer.');
    $blockedWorkflow = $service->createWorkflowJob(User::find($userIds['risk']), 999999, null, 'Banned workflow job', 'Banned workflow job must not be created.', [], 1, 100, date('Y-m-d H:i:s', time() + 3600));
    $assert(($blockedWorkflow['success'] ?? true) === false && str_contains((string) ($blockedWorkflow['message'] ?? ''), 'Banned'), 'A banned user was allowed to create a workflow job through the service layer.');
    $blockedApply = $service->applyForJob(User::find($userIds['risk']), $jobIds['risk'], 'banned application');
    $assert(($blockedApply['success'] ?? true) === false && str_contains((string) ($blockedApply['message'] ?? ''), 'Banned'), 'A banned user was allowed to apply for a job through the service layer.');
    $blockedBid = $service->placeBid(User::find($userIds['risk']), $jobIds['risk'], 100, 1, 'banned bid');
    $assert(($blockedBid['success'] ?? true) === false && str_contains((string) ($blockedBid['message'] ?? ''), 'Banned'), 'A banned user was allowed to place a bid through the service layer.');
    $blockedSubmit = $service->submitWork(User::find($userIds['risk']), $jobIds['risk'], 'banned submission', null);
    $assert(($blockedSubmit['success'] ?? true) === false && str_contains((string) ($blockedSubmit['message'] ?? ''), 'Banned'), 'A banned user was allowed to submit work through the service layer.');
    $blockedReward = (new RewardService())->creditAdReward(User::find($userIds['risk']), 'integration', 1);
    $assert(($blockedReward['success'] ?? true) === false && str_contains((string) ($blockedReward['message'] ?? ''), 'Banned'), 'A banned user was allowed to receive a reward through the service layer.');
    $blockedWebReward = (new RewardService())->creditWebTaskReward(User::find($userIds['risk']), 1, 0);
    $assert(($blockedWebReward['success'] ?? true) === false && str_contains((string) ($blockedWebReward['message'] ?? ''), 'Banned'), 'A banned user was allowed to receive a web-task reward through the service layer.');
    $blockedTgReward = (new RewardService())->creditTgTaskReward(User::find($userIds['risk']), 1, 0);
    $assert(($blockedTgReward['success'] ?? true) === false && str_contains((string) ($blockedTgReward['message'] ?? ''), 'Banned'), 'A banned user was allowed to receive a Telegram-task reward through the service layer.');

    // A banned session is rejected and revoked by the API middleware.
    $bannedSession = Session::createForUser($userIds['risk'], '127.0.0.1', 'integration-test');
    $_SERVER['HTTP_AUTHORIZATION'] = 'Bearer ' . (string) $bannedSession->token;
    $bannedResponse = (new AuthenticateApi())->handle(new Request(), static fn(): Response => Response::json(['success' => true]));
    $bannedBody = json_decode($bannedResponse->getContent(), true);
    $assert($bannedResponse->getStatus() === 403 && ($bannedBody['error'] ?? '') === 'banned', 'Banned API session was not rejected.');
    $assert(Session::findValid((string) $bannedSession->token) === null, 'Rejected banned session was not revoked.');
    unset($_SERVER['HTTP_AUTHORIZATION']);

    // A banned replacement is rejected before reassignment mutates the held
    // assignment, preserving the original payment state.
    $insertJob->execute([$userIds['poster'], "Rollback {$suffix}", "rollback-{$suffix}", 'Rollback test', 100, 'BDT', Job::STATUS_ENGAGED, 1, 100, null, null]);
    $jobIds['rollback'] = (int) $db->lastInsertId();
    $insertBid->execute([$jobIds['rollback'], $userIds['worker'], 100, 'BDT', 1, 'rollback old assignment', 'accepted']);
    $bidIds['rollback_old'] = (int) $db->lastInsertId();
    $insertBid->execute([$jobIds['rollback'], $userIds['risk'], 100, 'BDT', 1, 'banned replacement', 'pending']);
    $bidIds['rollback_new'] = (int) $db->lastInsertId();
    $insertAssignment->execute([$jobIds['rollback'], $bidIds['rollback_old'], $userIds['worker'], JobAssignment::STATUS_ASSIGNED, JobAssignment::PAYMENT_HELD, 100, $userIds['admin']]);
    $assignmentIds['rollback'] = (int) $db->lastInsertId();
    $failedReassign = $service->reassignAssignment($assignmentIds['rollback'], $bidIds['rollback_new'], $userIds['admin'], 'banned replacement');
    $assert(($failedReassign['success'] ?? false) === false, 'Banned replacement assignment was accepted.');
    $newState->execute([$assignmentIds['rollback']]);
    $preservedState = $newState->fetch(PDO::FETCH_ASSOC);
    $assert($preservedState['status'] === JobAssignment::STATUS_ASSIGNED && $preservedState['payment_status'] === JobAssignment::PAYMENT_HELD, 'Failed reassignment changed the existing assignment state.');

    $_POST = ['reason' => 'Integration unban recovery check.'];
    $unbanRequest = new Request();
    $unbanRequest->setMeta('auth.user', User::find($userIds['admin']));
    $unbanResponse = (new AdminController())->unbanUser($unbanRequest, (string) $userIds['risk']);
    $unbanBody = json_decode($unbanResponse->getContent(), true);
    $assert(($unbanBody['success'] ?? false) === true && ($unbanBody['data']['is_banned'] ?? true) === false, 'Admin unban did not restore the worker account.');
    $banned->execute([$userIds['risk']]);
    $assert((int) $banned->fetchColumn() === 0, 'Admin unban did not clear the stored ban state.');
    $_POST = [];

    // Scheduler-safe deadline reminders are deduplicated per recipient/event.
    $deadline = date('Y-m-d H:i:s', time() + 3600);
    $insertJob->execute([$userIds['poster'], "Deadline {$suffix}", "deadline-{$suffix}", 'Deadline test', 100, 'BDT', Job::STATUS_OPEN, 1, 100, $deadline, $deadline]);
    $jobIds['deadline'] = (int) $db->lastInsertId();
    $service->notifyUpcomingDeadlines(24);
    $service->notifyUpcomingDeadlines(24);
    $eventNeedle = 'job-deadline:' . $jobIds['deadline'];
    $notificationCount = $db->prepare("SELECT COUNT(*) FROM notifications WHERE data LIKE ?");
    $notificationCount->execute(['%' . $eventNeedle . '%']);
    $expectedDeadlineNotifications = 1 + (int) $db->query('SELECT COUNT(*) FROM users WHERE is_admin = 1')->fetchColumn();
    $assert((int) $notificationCount->fetchColumn() === $expectedDeadlineNotifications, 'Deadline reminder was not deduplicated per poster/admin recipient.');

    // A lifetime ad limit is enforced at the database reservation boundary;
    // a second start cannot create another view after the final slot is used.
    $insertVideoAd = $db->prepare(
        'INSERT INTO video_ads (title,video_path,duration_seconds,status,reward_amount,total_limit,created_by,created_at) VALUES (?,?,?,?,?,?,?,CURRENT_TIMESTAMP)'
    );
    $insertVideoAd->execute(['Integration limit ad', 'video-ads/integration-limit.mp4', 1, 'active', 1, 1, $userIds['admin']]);
    $videoAdIds[] = (int) $db->lastInsertId();
    $_POST = ['video_ad_id' => $videoAdIds[0]];
    $videoRequest = new Request();
    $videoRequest->setMeta('auth.user', User::find($userIds['worker']));
    $videoController = new VideoAdController();
    $videoStart = $videoController->start($videoRequest);
    $videoStartBody = json_decode($videoStart->getContent(), true);
    $assert(($videoStartBody['success'] ?? false) === true, 'The first lifetime-limited video view did not start.');
    $videoViewIds[] = (int) ($videoStartBody['data']['view_id'] ?? 0);
    $secondVideoRequest = new Request();
    $secondVideoRequest->setMeta('auth.user', User::find($userIds['worker']));
    $secondVideoStart = $videoController->start($secondVideoRequest);
    $secondVideoBody = json_decode($secondVideoStart->getContent(), true);
    $assert(($secondVideoBody['success'] ?? true) === false, 'The lifetime video limit allowed a second start.');
    $videoCounts = $db->prepare('SELECT total_views, (SELECT COUNT(*) FROM video_ad_views WHERE video_ad_id = ?) AS view_count FROM video_ads WHERE id = ?');
    $videoCounts->execute([$videoAdIds[0], $videoAdIds[0]]);
    $videoState = $videoCounts->fetch(PDO::FETCH_ASSOC);
    $assert((int) $videoState['total_views'] === 1 && (int) $videoState['view_count'] === 1, 'The lifetime video limit did not preserve one reserved view.');
    $_POST = [];

    // Database notifications expose unread state and can be marked read for
    // the owning recipient without affecting another user's notifications.
    $notificationUser = User::find($userIds['poster']);
    NotificationService::send($notificationUser, 'Integration notification', 'Read-state check.', 'info', 'bi-bell', '/notifications');
    $notificationRows = NotificationService::listFor($notificationUser);
    $notificationTarget = null;
    foreach ($notificationRows as $notificationRow) {
        if (($notificationRow['data']['title'] ?? '') === 'Integration notification') {
            $notificationTarget = $notificationRow;
            break;
        }
    }
    $assert(is_array($notificationTarget) && !($notificationTarget['read'] ?? true), 'Database notification was not delivered as unread.');
    $unreadBeforeMark = NotificationService::unreadCount($notificationUser);
    $assert($unreadBeforeMark > 0, 'Unread notification count did not include the delivered notification.');
    $assert(NotificationService::markRead($notificationUser, (string) $notificationTarget['id']) === true, 'Notification could not be marked read by its owner.');
    $notificationRowsAfter = NotificationService::listFor($notificationUser);
    $notificationTargetAfter = null;
    foreach ($notificationRowsAfter as $notificationRow) {
        if (($notificationRow['id'] ?? '') === ($notificationTarget['id'] ?? '')) {
            $notificationTargetAfter = $notificationRow;
            break;
        }
    }
    $assert(is_array($notificationTargetAfter) && ($notificationTargetAfter['read'] ?? false) === true, 'Marking the notification read did not update its read state.');
    $assert(NotificationService::unreadCount($notificationUser) === $unreadBeforeMark - 1, 'Marking the notification read changed the unread count incorrectly.');

    // Email is opt-in and must be routed through the mail channel when
    // configured; fake delivery keeps this integration test side-effect free.
    putenv('NOTIFICATIONS_EMAIL_ENABLED=1');
    MailChannel::reset();
    MailChannel::fake();
    NotificationService::send($notificationUser, 'Integration email notification', 'Email channel check.', 'info', 'bi-envelope', '/notifications');
    $assert(MailChannel::assertSentTo((string) $notificationUser->email), 'Configured notification email was not routed to the mail channel.');
    MailChannel::reset();
    putenv('NOTIFICATIONS_EMAIL_ENABLED=0');

    // Admin job edit/detail/delete flows preserve editable metadata while
    // refusing to delete a job that still has an active assignment.
    $_POST = [];
    $activeDeleteRequest = new Request();
    $activeDeleteRequest->setMeta('auth.user', User::find($userIds['admin']));
    $activeDeleteResponse = (new AdminJobController())->delete($activeDeleteRequest, $jobIds['reassign']);
    $activeDeleteBody = json_decode($activeDeleteResponse->getContent(), true);
    $assert(($activeDeleteBody['success'] ?? true) === false, 'An actively assigned job was deleted.');
    $assert(Job::find($jobIds['reassign']) !== null, 'The active assignment deletion guard removed the job.');

    $insertJob->execute([$userIds['poster'], "Admin edit {$suffix}", "admin-edit-{$suffix}", 'Admin edit test', 100, 'BDT', Job::STATUS_PENDING_APPROVAL, 1, 100, null, null]);
    $jobIds['admin_edit'] = (int) $db->lastInsertId();
    $_POST = [
        'title' => "Admin edited {$suffix}",
        'description' => 'Updated by the administrator integration check.',
        'requirements' => 'Return the updated proof.',
        'status' => Job::STATUS_OPEN,
    ];
    $editRequest = new Request();
    $editRequest->setMeta('auth.user', User::find($userIds['admin']));
    $editResponse = (new AdminJobController())->update($editRequest, $jobIds['admin_edit']);
    $editBody = json_decode($editResponse->getContent(), true);
    $assert(($editBody['success'] ?? false) === true, 'Admin job edit failed.');
    $editedRow = $db->prepare('SELECT title,description,requirements,status FROM jobs WHERE id = ?');
    $editedRow->execute([$jobIds['admin_edit']]);
    $edited = $editedRow->fetch(PDO::FETCH_ASSOC);
    $assert($edited['title'] === "Admin edited {$suffix}" && $edited['status'] === Job::STATUS_OPEN, 'Admin job edit did not persist the requested fields.');
    $_POST = [];

    $detailResponse = (new AdminJobController())->show(new Request(), $jobIds['admin_edit']);
    $detailBody = json_decode($detailResponse->getContent(), true);
    $assert(($detailBody['success'] ?? false) === true && ($detailBody['data']['job']['title'] ?? '') === "Admin edited {$suffix}", 'Admin job detail did not expose the edited job.');
    $deleteResponse = (new AdminJobController())->delete($activeDeleteRequest, $jobIds['admin_edit']);
    $deleteBody = json_decode($deleteResponse->getContent(), true);
    $assert(($deleteBody['success'] ?? false) === true && Job::find($jobIds['admin_edit']) === null, 'Unassigned admin job deletion failed.');

    // Admin category/subcategory CRUD must work on the same SQLite staging
    // path as the marketplace migrations; this guards against MySQL-only
    // timestamp expressions leaking into the existing settings workflow.
    $categoryController = new AdminSettingsController();
    $_POST = [
        'name' => "Integration category {$suffix}",
        'slug' => "integration-category-{$suffix}",
        'description' => 'Disposable category CRUD check.',
        'display_order' => 99,
    ];
    $categoryResponse = $categoryController->createCategory(new Request());
    $categoryBody = json_decode($categoryResponse->getContent(), true);
    $categoryIds[] = (int) ($categoryBody['data']['id'] ?? 0);
    $assert($categoryResponse->getStatus() === 200 && ($categoryBody['success'] ?? false) === true, 'Admin category creation failed on SQLite.');
    $categoryId = $categoryIds[0];

    $_POST = ['name' => "Updated category {$suffix}", 'is_active' => 1];
    $categoryUpdate = $categoryController->updateCategory(new Request(), $categoryId);
    $categoryUpdateBody = json_decode($categoryUpdate->getContent(), true);
    $assert(($categoryUpdateBody['success'] ?? false) === true && ($categoryUpdateBody['data']['name'] ?? '') === "Updated category {$suffix}", 'Admin category update failed.');

    $_POST = [
        'category_id' => $categoryId,
        'name' => "Integration subcategory {$suffix}",
        'slug' => "integration-subcategory-{$suffix}",
    ];
    $subcategoryResponse = $categoryController->createSubcategory(new Request());
    $subcategoryBody = json_decode($subcategoryResponse->getContent(), true);
    $subcategoryIds[] = (int) ($subcategoryBody['data']['id'] ?? 0);
    $assert($subcategoryResponse->getStatus() === 200 && ($subcategoryBody['success'] ?? false) === true, 'Admin subcategory creation failed on SQLite.');

    $_POST = ['name' => "Updated subcategory {$suffix}"];
    $subcategoryUpdate = $categoryController->updateSubcategory(new Request(), $subcategoryIds[0]);
    $subcategoryUpdateBody = json_decode($subcategoryUpdate->getContent(), true);
    $assert(($subcategoryUpdateBody['success'] ?? false) === true && ($subcategoryUpdateBody['data']['name'] ?? '') === "Updated subcategory {$suffix}", 'Admin subcategory update failed.');
    $_POST = [];
    $subcategoryDelete = $categoryController->deleteSubcategory(new Request(), $subcategoryIds[0]);
    $subcategoryDeleteBody = json_decode($subcategoryDelete->getContent(), true);
    $assert(($subcategoryDeleteBody['success'] ?? false) === true, 'Admin subcategory deletion failed.');
    $categoryDelete = $categoryController->deleteCategory(new Request(), $categoryId);
    $categoryDeleteBody = json_decode($categoryDelete->getContent(), true);
    $assert(($categoryDeleteBody['success'] ?? false) === true, 'Admin category deletion failed.');

    // Reports expose assignment/payment and submission-risk drill-downs and
    // can be exported without changing the JSON response contract.
    $_GET = [];
    $reportResponse = (new AdminSettingsController())->reports(new Request());
    $reportBody = json_decode($reportResponse->getContent(), true);
    $assert(($reportBody['success'] ?? false) === true
        && isset($reportBody['data']['assignments'], $reportBody['data']['submissions'])
        && array_key_exists('held_amount', $reportBody['data']['totals'] ?? []), 'Admin report drill-down aggregates are missing.');
    $_GET = ['format' => 'csv'];
    $csvResponse = (new AdminSettingsController())->reports(new Request());
    $assert($csvResponse->getStatus() === 200
        && str_contains((string) ($csvResponse->getHeaders()['Content-Type'] ?? ''), 'text/csv')
        && str_contains($csvResponse->getContent(), 'section,key,subkey,count,amount'), 'Admin report CSV export is missing or malformed.');
    $_GET = [];

    // Provider-neutral ad settings are bounded at the admin boundary and
    // exposed to website/app clients as a typed placement contract. Keep the
    // check disposable by restoring the two settings after exercising it.
    $originalAdSettings = [];
    $readAdSetting = $db->prepare('SELECT value FROM platform_settings WHERE setting_key = ?');
    foreach (['advertisement_system_enabled', 'website_ads_enabled', 'website_publisher_id', 'website_ad_units'] as $settingKey) {
        $readAdSetting->execute([$settingKey]);
        $originalAdSettings[$settingKey] = $readAdSetting->fetchColumn();
    }
    try {
        $_POST = [
            'website_publisher_id' => 'pub-integration.example',
            'website_ad_units' => ['banner' => ['unit_id' => 'unit-home-banner', 'format' => 'responsive']],
        ];
        $adSettingsResponse = (new AdminSettingsController())->updateSettings(new Request());
        $adSettingsBody = json_decode($adSettingsResponse->getContent(), true);
        $assert(($adSettingsBody['success'] ?? false) === true, 'Valid provider-neutral ad settings were rejected.');

        $_POST = ['website_ad_units' => ['bad placement' => str_repeat('x', 300)]];
        $invalidAdSettingsResponse = (new AdminSettingsController())->updateSettings(new Request());
        $invalidAdSettingsBody = json_decode($invalidAdSettingsResponse->getContent(), true);
        $assert($invalidAdSettingsResponse->getStatus() === 422 && ($invalidAdSettingsBody['error'] ?? '') === 'invalid_ad_configuration', 'Malformed ad placement settings were accepted.');

        $_POST = [
            'website_publisher_id' => 'pub-should-not-persist',
            'website_ad_units' => ['bad placement' => 'unit-invalid'],
        ];
        $mixedAdSettingsResponse = (new AdminSettingsController())->updateSettings(new Request());
        $assert($mixedAdSettingsResponse->getStatus() === 422, 'Mixed valid and invalid ad settings did not fail validation.');
        $currentPublisher = $db->prepare('SELECT value FROM platform_settings WHERE setting_key = ?');
        $currentPublisher->execute(['website_publisher_id']);
        $assert($currentPublisher->fetchColumn() === 'pub-integration.example', 'Invalid mixed settings payload partially persisted a valid field.');

        $_POST = [];
        $adConfigResponse = (new AdController())->config(new Request());
        $adConfigBody = json_decode($adConfigResponse->getContent(), true);
        $assert(($adConfigBody['data']['placements']['website']['publisher_id'] ?? '') === 'pub-integration.example'
            && ($adConfigBody['data']['placements']['website']['ad_units']['banner']['unit_id'] ?? '') === 'unit-home-banner', 'Public ad placement contract did not expose normalized website settings.');

        $_POST = ['advertisement_system_enabled' => false];
        $masterOffResponse = (new AdminSettingsController())->updateSettings(new Request());
        $assert($masterOffResponse->getStatus() === 200, 'Advertisement master switch could not be disabled.');
        $_POST = [];
        $masterOffConfig = json_decode((new AdController())->config(new Request())->getContent(), true);
        $assert(($masterOffConfig['data']['placements']['website']['enabled'] ?? true) === false, 'Advertisement master switch did not disable the effective website placement contract.');
    } finally {
        $restoreAdSetting = $db->prepare('UPDATE platform_settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE setting_key = ?');
        foreach ($originalAdSettings as $settingKey => $settingValue) {
            $restoreAdSetting->execute([(string) $settingValue, $settingKey]);
        }
        \App\Services\SettingService::clearCache();
        $_POST = [];
    }

    echo "Job marketplace integration checks passed.\n";
} catch (Throwable $e) {
    fwrite(STDERR, "Job marketplace integration checks failed: " . $e->getMessage() . "\n");
    $exitCode = 1;
} finally {
    if ($submissionIds) {
        $placeholders = implode(',', array_fill(0, count($submissionIds), '?'));
        $db->prepare("DELETE FROM job_submissions WHERE id IN ({$placeholders})")->execute(array_values($submissionIds));
    }
    if ($assignmentIds) {
        $placeholders = implode(',', array_fill(0, count($assignmentIds), '?'));
        $db->prepare("DELETE FROM job_assignments WHERE id IN ({$placeholders})")->execute(array_values($assignmentIds));
    }
    if ($bidIds) {
        $placeholders = implode(',', array_fill(0, count($bidIds), '?'));
        $db->prepare("DELETE FROM job_bids WHERE id IN ({$placeholders})")->execute(array_values($bidIds));
    }
    if ($jobIds) {
        $placeholders = implode(',', array_fill(0, count($jobIds), '?'));
        $db->prepare("DELETE FROM job_submissions WHERE job_id IN ({$placeholders})")->execute(array_values($jobIds));
        $db->prepare("DELETE FROM job_assignments WHERE job_id IN ({$placeholders})")->execute(array_values($jobIds));
        $db->prepare("DELETE FROM transactions WHERE job_id IN ({$placeholders})")->execute(array_values($jobIds));
        $db->prepare("DELETE FROM admin_action_logs WHERE entity_id IN ({$placeholders})")->execute(array_values($jobIds));
        $db->prepare("DELETE FROM jobs WHERE id IN ({$placeholders})")->execute(array_values($jobIds));
    }
    if ($submissionIds) {
        $placeholders = implode(',', array_fill(0, count($submissionIds), '?'));
        $db->prepare("DELETE FROM admin_action_logs WHERE entity_id IN ({$placeholders})")->execute(array_values($submissionIds));
    }
    if ($videoViewIds) {
        $placeholders = implode(',', array_fill(0, count($videoViewIds), '?'));
        $db->prepare("DELETE FROM video_ad_views WHERE id IN ({$placeholders})")->execute(array_values($videoViewIds));
    }
    if ($videoAdIds) {
        $placeholders = implode(',', array_fill(0, count($videoAdIds), '?'));
        $db->prepare("DELETE FROM video_ads WHERE id IN ({$placeholders})")->execute(array_values($videoAdIds));
    }
    if ($subcategoryIds) {
        $placeholders = implode(',', array_fill(0, count($subcategoryIds), '?'));
        $db->prepare("DELETE FROM subcategories WHERE id IN ({$placeholders})")->execute(array_values($subcategoryIds));
    }
    if ($categoryIds) {
        $placeholders = implode(',', array_fill(0, count($categoryIds), '?'));
        $db->prepare("DELETE FROM categories WHERE id IN ({$placeholders})")->execute(array_values($categoryIds));
    }
    if ($userIds) {
        $placeholders = implode(',', array_fill(0, count($userIds), '?'));
        $db->prepare("DELETE FROM withdrawals WHERE user_id IN ({$placeholders})")->execute(array_values($userIds));
        $db->prepare("DELETE FROM notifications WHERE notifiable_id IN ({$placeholders})")->execute(array_values($userIds));
        $db->prepare("DELETE FROM admin_action_logs WHERE entity_id IN ({$placeholders})")->execute(array_values($userIds));
        $db->prepare("DELETE FROM user_ban_history WHERE user_id IN ({$placeholders})")->execute(array_values($userIds));
        $db->prepare("DELETE FROM sessions WHERE user_id IN ({$placeholders})")->execute(array_values($userIds));
        $db->prepare("DELETE FROM users WHERE id IN ({$placeholders})")->execute(array_values($userIds));
    }
    $_POST = [];
}

exit($exitCode ?? 0);
