<?php
declare(strict_types=1);

namespace App\Services;

use App\Models\Job;
use App\Models\JobBid;
use App\Models\JobSubmission;
use App\Models\JobAssignment;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Category;
use App\Models\Subcategory;
use Nemesis\Core\Fluent;
use Nemesis\Core\Database;
use Nemesis\Http\UploadedFile;
use Nemesis\Support\FileValidator;
use RuntimeException;

/**
 * JobService — the engine that drives the job marketplace.
 *
 * Responsibilities:
 *   - validate + create new job listings (poster flow)
 *   - place / withdraw / list bids (worker flow)
 *   - accept a bid → move funds to escrow + assign worker (poster flow)
 *   - submit work + verify (worker + poster)
 *   - release payment → apply commission, credit worker, log transactions
 *   - cancel a job → refund escrow to poster
 *
 * All financial operations are wrapped in a DB transaction so a partial
 * failure (e.g. credit succeeded but status update didn't) can't leave
 * the wallet in a wrong state.
 */
class JobService
{
    /**
     * Enhanced Poster flow: 3-step job creation with additive fee and pending_approval status.
     */
    public function createWorkflowJob(
        User $poster,
        int $categoryId,
        ?int $subcategoryId,
        string $title,
        string $description,
        array $proofRequirements,
        int $workerCount,
        float $costPerWorker,
        string $deadlineAt,
        ?string $subtitle = null,
        ?string $customerName = null,
        ?string $customerPhone = null,
        ?string $customerEmail = null
    ): array {
        if ($poster->isBanned()) {
            return ['success' => false, 'message' => 'Banned accounts cannot post jobs.'];
        }
        if (!$this->canManagePosterJobs($poster)) {
            return ['success' => false, 'message' => 'Poster access is required to post jobs.'];
        }
        if (trim($title) === '' || mb_strlen($title) > 160) {
            return ['success' => false, 'message' => 'Title is required (1-160 chars).'];
        }
        if (trim($description) === '') {
            return ['success' => false, 'message' => 'Description is required.'];
        }
        if ($workerCount < 1) {
            return ['success' => false, 'message' => 'Worker count must be at least 1.'];
        }
        if ($costPerWorker <= 0) {
            return ['success' => false, 'message' => 'Cost per worker must be positive.'];
        }

        $category = Category::find($categoryId);
        if ($category === null || !$category->isActive()) {
            return ['success' => false, 'message' => 'Invalid or inactive category.'];
        }
        if ($subcategoryId !== null && $subcategoryId > 0) {
            $subcategory = Subcategory::find($subcategoryId);
            if ($subcategory === null || !$subcategory->isActive() || (int) $subcategory->category_id !== $categoryId) {
                return ['success' => false, 'message' => 'Invalid or inactive subcategory for the selected category.'];
            }
        } else {
            $subcategoryId = null;
        }

        $feePercent = (float) SettingService::get('job_system_fee_percentage', 30.00);
        $netAmount = round($workerCount * $costPerWorker, 4);
        $systemFeeAmount = round($netAmount * ($feePercent / 100.0), 4);
        $totalPayableAmount = round($netAmount + $systemFeeAmount, 4);

        $slug = self::makeUniqueSlug($title);

        $id = (int) Fluent::table('jobs')->insert([
            'poster_id'            => $poster->id,
            'category_id'          => $categoryId,
            'subcategory_id'       => $subcategoryId,
            'title'                => $title,
            'slug'                 => $slug,
            'description'          => $description,
            'proof_requirements'   => json_encode($proofRequirements, JSON_UNESCAPED_UNICODE),
            'budget'               => $netAmount,
            'worker_count'         => $workerCount,
            'cost_per_worker'      => $costPerWorker,
            'system_fee_percent'   => $feePercent,
            'system_fee_amount'    => $systemFeeAmount,
            'total_payable_amount' => $totalPayableAmount,
            'currency'             => SettingService::currencyCode(),
            'deadline_at'          => $deadlineAt,
            'bidding_closes_at'    => $deadlineAt,
            'status'               => Job::STATUS_PENDING_APPROVAL,
            'created_at'           => date('Y-m-d H:i:s'),
        ]);

        // Customer metadata is additive and may not exist during a staged
        // rollout. Keep the core job creation successful on older hosts.
        try {
            Fluent::table('jobs')->where('id', '=', $id)->update([
                'subtitle'       => $subtitle,
                'customer_name'  => $customerName ?? $poster->name,
                'customer_phone' => $customerPhone ?? ($poster->phone ?? null),
                'customer_email' => $customerEmail ?? $poster->email,
                'updated_at'     => date('Y-m-d H:i:s'),
            ]);
        } catch (\Throwable $e) {
            // Metadata migration can be applied after the application code.
        }

        $this->notifyAdmins(
            'New job posted',
            'Job “' . $title . '” is awaiting review.',
            'info',
            'bi-briefcase',
            '/admin/jobs/' . $id
        );

        return ['success' => true, 'job' => Job::find($id), 'message' => 'Job posted and submitted for admin review.'];
    }

    /**
     * Admin flow: approve job posting.
     */
    public function approveJob(int $jobId, int $adminId): array
    {
        if (!$this->isAdminId($adminId)) {
            return ['success' => false, 'message' => 'Administrator access is required.'];
        }
        $db = Database::connect();
        try {
            $this->beginWriteTransaction($db);
            $jobSql = 'SELECT * FROM jobs WHERE id = :id LIMIT 1';
            if (Database::getDriverName() !== 'sqlite') $jobSql .= ' FOR UPDATE';
            $jobStmt = $db->prepare($jobSql);
            $jobStmt->execute(['id' => $jobId]);
            $jobRow = $jobStmt->fetch(\PDO::FETCH_ASSOC);
            if (!$jobRow) throw new \RuntimeException('Job not found.');
            $job = new Job($jobRow);
            if ($job->status !== Job::STATUS_PENDING_APPROVAL) {
                throw new \RuntimeException('Job is not pending approval.');
            }

            $updated = $db->prepare(
                'UPDATE jobs SET status = :open, updated_at = :updated_at WHERE id = :id AND status = :pending'
            );
            $updated->execute([
                'open' => Job::STATUS_OPEN,
                'updated_at' => date('Y-m-d H:i:s'),
                'id' => $jobId,
                'pending' => Job::STATUS_PENDING_APPROVAL,
            ]);
            if ($updated->rowCount() !== 1) throw new \RuntimeException('Job is not pending approval.');
            $this->commitWriteTransaction($db);
        } catch (\Throwable $e) {
            $this->rollbackWriteTransaction($db);
            return ['success' => false, 'message' => 'Job approval failed: ' . $e->getMessage()];
        }

        $this->notifyUser(
            $job->poster(),
            'Job approved',
            'Your job “' . $job->title . '” was approved and is now available to workers.',
            'success',
            'bi-check-circle',
            '/poster/jobs/' . $job->id
        );
        $this->notifyWorkersAboutNewJob($job);

        return ['success' => true, 'job' => Job::find($jobId), 'message' => 'Job approved successfully.'];
    }

    /**
     * Admin flow: decline job posting with reason.
     */
    public function declineJob(int $jobId, string $reason, int $adminId): array
    {
        if (!$this->isAdminId($adminId)) {
            return ['success' => false, 'message' => 'Administrator access is required.'];
        }
        if (trim($reason) === '') return ['success' => false, 'message' => 'Decline reason is required.'];

        $db = Database::connect();
        try {
            $this->beginWriteTransaction($db);
            $jobSql = 'SELECT * FROM jobs WHERE id = :id LIMIT 1';
            if (Database::getDriverName() !== 'sqlite') $jobSql .= ' FOR UPDATE';
            $jobStmt = $db->prepare($jobSql);
            $jobStmt->execute(['id' => $jobId]);
            $jobRow = $jobStmt->fetch(\PDO::FETCH_ASSOC);
            if (!$jobRow) throw new \RuntimeException('Job not found.');
            $job = new Job($jobRow);
            if ($job->status !== Job::STATUS_PENDING_APPROVAL) {
                throw new \RuntimeException('Job is not pending approval.');
            }

            $updated = $db->prepare(
                'UPDATE jobs SET status = :declined, decline_reason = :reason, updated_at = :updated_at WHERE id = :id AND status = :pending'
            );
            $updated->execute([
                'declined' => Job::STATUS_DECLINED,
                'reason' => trim($reason),
                'updated_at' => date('Y-m-d H:i:s'),
                'id' => $jobId,
                'pending' => Job::STATUS_PENDING_APPROVAL,
            ]);
            if ($updated->rowCount() !== 1) throw new \RuntimeException('Job is not pending approval.');
            $this->commitWriteTransaction($db);
        } catch (\Throwable $e) {
            $this->rollbackWriteTransaction($db);
            return ['success' => false, 'message' => 'Job decline failed: ' . $e->getMessage()];
        }

        $this->notifyUser(
            $job->poster(),
            'Job declined',
            'Your job “' . $job->title . '” was declined. Reason: ' . trim($reason),
            'warning',
            'bi-exclamation-circle',
            '/poster/jobs/' . $job->id
        );

        return ['success' => true, 'job' => Job::find($jobId), 'message' => 'Job declined.'];
    }

    /**
     * Worker flow: apply for job with anti-self-application and single application anti-spam checks.
     */
    public function applyForJob(User $worker, int $jobId, ?string $proposal = null, ?string $bkashNumber = null): array
    {
        if (!$worker->isWorker()) {
            return ['success' => false, 'message' => 'Worker access is required to apply for jobs.'];
        }
        if ($worker->isBanned()) {
            return ['success' => false, 'message' => 'Banned accounts cannot apply for jobs.'];
        }
        $db = Database::connect();
        try {
            $this->beginWriteTransaction($db);

            // Re-read the job and the worker's bid inside the same serialized
            // write boundary. The unique index remains the final safeguard,
            // while this turns a concurrent duplicate into the normal API
            // response instead of a database exception.
            $jobSql = 'SELECT * FROM jobs WHERE id = :id LIMIT 1';
            if (Database::getDriverName() !== 'sqlite') $jobSql .= ' FOR UPDATE';
            $jobStmt = $db->prepare($jobSql);
            $jobStmt->execute(['id' => $jobId]);
            $jobRow = $jobStmt->fetch(\PDO::FETCH_ASSOC);
            if (!$jobRow) throw new \RuntimeException('Job not found.');
            $job = new Job($jobRow);
            if ((int) $job->poster_id === (int) $worker->id) {
                throw new \RuntimeException('You cannot apply to your own job posting.');
            }
            if (!$job->isOpen()) throw new \RuntimeException('Job is not open for applications.');
            if ($job->deadline_at && strtotime($job->deadline_at) < time()) {
                throw new \RuntimeException('Job deadline has passed.');
            }

            $existingStmt = $db->prepare(
                'SELECT id FROM job_bids WHERE job_id = :job_id AND worker_id = :worker_id LIMIT 1'
            );
            $existingStmt->execute(['job_id' => $jobId, 'worker_id' => $worker->id]);
            if ($existingStmt->fetchColumn()) {
                throw new \RuntimeException('You have already applied for this job posting cycle.');
            }

            $bidAmount = $job->cost_per_worker > 0 ? $job->cost_per_worker : $job->budget;
            $id = (int) Fluent::table('job_bids')->insert([
                'job_id'        => $jobId,
                'worker_id'     => $worker->id,
                'amount'        => $bidAmount,
                'currency'      => $job->currency,
                'delivery_days' => 1,
                'proposal'      => $proposal ?? 'Application submitted',
                'bkash_number'  => $bkashNumber,
                'status'        => JobBid::STATUS_PENDING,
                'created_at'    => date('Y-m-d H:i:s'),
            ]);

            $db->prepare(
                'UPDATE jobs SET bid_count = COALESCE(bid_count, 0) + 1, updated_at = :updated_at WHERE id = :id'
            )->execute(['updated_at' => date('Y-m-d H:i:s'), 'id' => $jobId]);
            $this->commitWriteTransaction($db);
        } catch (\Throwable $e) {
            $this->rollbackWriteTransaction($db);
            return ['success' => false, 'message' => 'Application failed: ' . $e->getMessage()];
        }

        $this->notifyUser(
            $job->poster(),
            'New worker application',
            $worker->name . ' applied for “' . $job->title . '”.',
            'info',
            'bi-person-check',
            '/poster/jobs/' . $job->id
        );
        $this->notifyAdmins(
            'New worker application',
            $worker->name . ' applied for “' . $job->title . '”.',
            'info',
            'bi-person-check',
            '/admin/jobs/' . $job->id
        );

        return ['success' => true, 'bid' => JobBid::find($id), 'message' => 'Application submitted to Admin for review.'];
    }

    /**
     * Admin flow: approve worker application (first-come first-serve capacity check).
     */
    public function approveWorkerApplication(int $bidId, int $adminId): array
    {
        if (!$this->isAdminId($adminId)) {
            return ['success' => false, 'message' => 'Administrator access is required.'];
        }
        $bid = JobBid::find($bidId);
        if ($bid === null) return ['success' => false, 'message' => 'Application bid not found.'];
        if (!$bid->isPending()) return ['success' => false, 'message' => 'Application has already been reviewed.'];
        $job = Job::find((int) $bid->job_id);
        if ($job === null) return ['success' => false, 'message' => 'Job not found.'];
        $worker = User::find((int) $bid->worker_id);
        if ($worker === null) return ['success' => false, 'message' => 'Worker not found.'];
        if (!$worker->isWorker()) return ['success' => false, 'message' => 'Only worker accounts can be assigned to jobs.'];
        if ($worker->isBanned()) return ['success' => false, 'message' => 'Banned workers cannot be assigned to jobs.'];
        if (in_array((string) $job->status, [
            Job::STATUS_PENDING_APPROVAL,
            Job::STATUS_DECLINED,
            Job::STATUS_CANCELLED,
            Job::STATUS_COMPLETED,
            Job::STATUS_DISPUTED,
            Job::STATUS_EXPIRED,
        ], true)) {
            return ['success' => false, 'message' => 'This job is not accepting worker assignments.'];
        }

        $maxWorkers = (int) ($job->worker_count ?? 1);
        $assignmentTableAvailable = JobAssignment::isAvailable();
        $assignedCount = $assignmentTableAvailable
            ? $this->assignmentCapacityCount((int) $job->id)
            : (int) Fluent::table('job_bids')
                ->where('job_id', '=', $job->id)
                ->where('status', '=', JobBid::STATUS_ACCEPTED)
                ->count();
        if ($assignedCount >= $maxWorkers) {
            return ['success' => false, 'message' => 'Job worker capacity has already been filled.'];
        }

        $now = date('Y-m-d H:i:s');
        $poster = $assignmentTableAvailable ? User::find((int) $job->poster_id) : null;
        $bidAmount = (float) ($bid->amount ?: ($job->cost_per_worker ?: $job->budget));
        $escrowAmount = SettingService::escrowAmount($bidAmount);
        if ($assignmentTableAvailable) {
            if ($poster === null) {
                return ['success' => false, 'message' => 'Job poster not found.'];
            }
            if ((float) ($poster->wallet_balance ?? 0) < $escrowAmount) {
                return [
                    'success' => false,
                    'message' => 'The poster does not have enough wallet balance to reserve this worker payment.',
                ];
            }
        }

        $db = Database::connect();
        try {
            $this->beginWriteTransaction($db);

            // Lock the job and bid before rechecking capacity. This closes
            // the race where two admins approve the last available worker at
            // the same time on transactional databases.
            $jobLockSql = 'SELECT * FROM jobs WHERE id = :id LIMIT 1';
            $bidLockSql = 'SELECT * FROM job_bids WHERE id = :id LIMIT 1';
            if (Database::getDriverName() !== 'sqlite') {
                $jobLockSql .= ' FOR UPDATE';
                $bidLockSql .= ' FOR UPDATE';
            }
            $jobLock = $db->prepare($jobLockSql);
            $jobLock->execute(['id' => $job->id]);
            $jobRow = $jobLock->fetch(\PDO::FETCH_ASSOC);
            if (!$jobRow) throw new \RuntimeException('Job not found.');
            $job = new Job($jobRow);
            if (in_array((string) $job->status, [
                Job::STATUS_PENDING_APPROVAL,
                Job::STATUS_DECLINED,
                Job::STATUS_CANCELLED,
                Job::STATUS_COMPLETED,
                Job::STATUS_DISPUTED,
                Job::STATUS_EXPIRED,
            ], true)) {
                throw new \RuntimeException('This job is not accepting worker assignments.');
            }

            $bidLock = $db->prepare($bidLockSql);
            $bidLock->execute(['id' => $bid->id]);
            $bidRow = $bidLock->fetch(\PDO::FETCH_ASSOC);
            if (!$bidRow) throw new \RuntimeException('Application bid not found.');
            $bid = new JobBid($bidRow);
            if (!$bid->isPending()) throw new \RuntimeException('Application has already been reviewed.');
            $bidAmount = (float) ($bid->amount ?: ($job->cost_per_worker ?: $job->budget));
            $escrowAmount = SettingService::escrowAmount($bidAmount);
            $maxWorkers = (int) ($job->worker_count ?? 1);
            $assignedCount = $assignmentTableAvailable
                ? $this->assignmentCapacityCount((int) $job->id)
                : (int) Fluent::table('job_bids')
                    ->where('job_id', '=', $job->id)
                    ->where('status', '=', JobBid::STATUS_ACCEPTED)
                    ->count();
            if ($assignedCount >= $maxWorkers) {
                throw new \RuntimeException('Job worker capacity has already been filled.');
            }
            if ($assignmentTableAvailable) {
                $posterSql = 'SELECT * FROM users WHERE id = :id LIMIT 1';
                if (Database::getDriverName() !== 'sqlite') $posterSql .= ' FOR UPDATE';
                $posterLock = $db->prepare($posterSql);
                $posterLock->execute(['id' => (int) $job->poster_id]);
                $posterRow = $posterLock->fetch(\PDO::FETCH_ASSOC);
                $poster = $posterRow ? new User($posterRow) : null;
                if ($poster === null) throw new \RuntimeException('Job poster not found.');
                if ((float) ($poster->wallet_balance ?? 0) < $escrowAmount) {
                    throw new \RuntimeException('The poster does not have enough wallet balance to reserve this worker payment.');
                }
            }
            // Lock the worker after the poster so approval follows the same
            // job -> bid -> poster -> worker order as the escrow paths.
            $workerSql = 'SELECT * FROM users WHERE id = :id LIMIT 1';
            if (Database::getDriverName() !== 'sqlite') $workerSql .= ' FOR UPDATE';
            $workerLock = $db->prepare($workerSql);
            $workerLock->execute(['id' => (int) $bid->worker_id]);
            $workerRow = $workerLock->fetch(\PDO::FETCH_ASSOC);
            $worker = $workerRow ? new User($workerRow) : null;
            if ($worker === null || !$worker->isWorker()) {
                throw new \RuntimeException('Only worker accounts can be assigned to jobs.');
            }
            if ($worker->isBanned()) {
                throw new \RuntimeException('Banned workers cannot be assigned to jobs.');
            }

            Fluent::table('job_bids')->where('id', '=', $bid->id)->update([
                'status'     => JobBid::STATUS_ACCEPTED,
                'decided_at' => $now,
                'decided_by' => $adminId,
                'updated_at' => $now,
            ]);

            if ($assignmentTableAvailable && JobAssignment::findForBid((int) $bid->id) === null) {
                $posterWallet = round((float) $poster->wallet_balance - $escrowAmount, 4);
                $posterFrozen = round((float) ($poster->frozen_balance ?? 0) + $escrowAmount, 4);
                Fluent::table('users')->where('id', '=', $poster->id)->update([
                    'wallet_balance' => $posterWallet,
                    'frozen_balance' => $posterFrozen,
                    'updated_at'     => $now,
                ]);

                Fluent::table('job_assignments')->insert([
                    'job_id'         => $job->id,
                    'bid_id'         => $bid->id,
                    'worker_id'      => $bid->worker_id,
                    'status'         => JobAssignment::STATUS_ASSIGNED,
                    'payment_status' => JobAssignment::PAYMENT_HELD,
                    'payment_amount' => $bidAmount,
                    'assigned_by'    => $adminId,
                    'assigned_at'    => $now,
                    'created_at'     => $now,
                ]);

                self::logTransaction(
                    $poster->id,
                    $job->id,
                    Transaction::TYPE_ESCROW_HOLD,
                    $escrowAmount,
                    $job->currency,
                    $posterWallet,
                    $posterFrozen,
                    'assignment:' . $bid->id,
                    'Escrow held for admin-approved worker assignment'
                );
            }

            $newAssignedCount = $assignedCount + 1;
            Fluent::table('jobs')->where('id', '=', $job->id)->update([
                'status'             => $newAssignedCount >= $maxWorkers ? Job::STATUS_ENGAGED : Job::STATUS_IN_REVIEW,
                // Preserve the legacy pointer for the first assigned worker.
                'assigned_bid_id'    => $job->assigned_bid_id ?: $bid->id,
                'assigned_worker_id' => $job->assigned_worker_id ?: $bid->worker_id,
                'updated_at'         => $now,
            ]);

            $this->commitWriteTransaction($db);
        } catch (\Throwable $e) {
            $this->rollbackWriteTransaction($db);
            return ['success' => false, 'message' => 'Application approval failed: ' . $e->getMessage()];
        }

        $this->notifyUser(
            User::find((int) $bid->worker_id),
            'Worker assignment approved',
            'You were assigned to “' . $job->title . '”.',
            'success',
            'bi-check-circle',
            '/jobs/' . $job->id
        );
        $this->notifyUser(
            $poster,
            'Worker assigned',
            'A worker was assigned to “' . $job->title . '”.',
            'info',
            'bi-person-check',
            '/poster/jobs/' . $job->id
        );

        return ['success' => true, 'message' => 'Worker application approved and assigned to job.'];
    }

    /**
     * Cancel one held assignment and refund only that worker's escrow.
     *
     * Admins may cancel any not-yet-paid assignment. Workers may request
     * cancellation only before submitting work; this makes the reassignment
     * path explicit and prevents a submitted assignment from being silently
     * withdrawn around moderation or payment.
     */
    public function cancelAssignment(
        int $assignmentId,
        int $actorId,
        ?string $reason = null,
        string $actorType = 'admin'
    ): array {
        if (!JobAssignment::isAvailable()) {
            return ['success' => false, 'message' => 'Multi-worker assignment storage is not available.'];
        }

        $actorType = strtolower(trim($actorType));
        if (!in_array($actorType, ['admin', 'worker'], true)) {
            return ['success' => false, 'message' => 'Invalid assignment cancellation actor.'];
        }
        if ($actorType === 'admin' && !$this->isAdminId($actorId)) {
            return ['success' => false, 'message' => 'Administrator access is required.'];
        }
        if ($actorType === 'worker') {
            $worker = User::find($actorId);
            if ($worker === null || !$worker->isWorker()) {
                return ['success' => false, 'message' => 'Worker access is required to cancel an assignment.'];
            }
            if ($worker->isBanned()) {
                return ['success' => false, 'message' => 'Banned accounts cannot cancel assignments.'];
            }
        }

        $db = Database::connect();
        try {
            $this->beginWriteTransaction($db);

            // Match the other escrow paths: job -> poster -> assignment.
            $identityStmt = $db->prepare('SELECT job_id FROM job_assignments WHERE id = :id LIMIT 1');
            $identityStmt->execute(['id' => $assignmentId]);
            $identityRow = $identityStmt->fetch(\PDO::FETCH_ASSOC);
            if (!$identityRow) throw new \RuntimeException('Assignment not found.');

            $jobSql = 'SELECT * FROM jobs WHERE id = :id LIMIT 1';
            $posterSql = 'SELECT * FROM users WHERE id = :id LIMIT 1';
            if (Database::getDriverName() !== 'sqlite') {
                $jobSql .= ' FOR UPDATE';
                $posterSql .= ' FOR UPDATE';
            }
            $jobStmt = $db->prepare($jobSql);
            $jobStmt->execute(['id' => (int) $identityRow['job_id']]);
            $jobRow = $jobStmt->fetch(\PDO::FETCH_ASSOC);
            if (!$jobRow) throw new \RuntimeException('Job not found.');
            $job = new Job($jobRow);

            $posterStmt = $db->prepare($posterSql);
            $posterStmt->execute(['id' => (int) $job->poster_id]);
            $posterRow = $posterStmt->fetch(\PDO::FETCH_ASSOC);
            $poster = $posterRow ? new User($posterRow) : null;
            if ($poster === null) throw new \RuntimeException('Job poster not found.');

            $lockSql = 'SELECT * FROM job_assignments WHERE id = :id LIMIT 1';
            if (Database::getDriverName() !== 'sqlite') $lockSql .= ' FOR UPDATE';
            $assignmentStmt = $db->prepare($lockSql);
            $assignmentStmt->execute(['id' => $assignmentId]);
            $assignmentRow = $assignmentStmt->fetch(\PDO::FETCH_ASSOC);
            if (!$assignmentRow) throw new \RuntimeException('Assignment not found.');

            $assignment = new JobAssignment($assignmentRow);
            if ($actorType === 'worker' && (int) $assignment->worker_id !== $actorId) {
                throw new \RuntimeException('Only the assigned worker can request this cancellation.');
            }
            if ($assignment->payment_status === JobAssignment::PAYMENT_RELEASED) {
                throw new \RuntimeException('A paid assignment cannot be cancelled.');
            }
            if ($assignment->payment_status === JobAssignment::PAYMENT_REFUNDED
                || $assignment->status === JobAssignment::STATUS_CANCELLED) {
                $this->commitWriteTransaction($db);
                return [
                    'success' => true,
                    'already_cancelled' => true,
                    'message' => 'Assignment was already cancelled.',
                    'assignment' => $assignment,
                ];
            }
            if ($assignment->payment_status !== JobAssignment::PAYMENT_HELD) {
                throw new \RuntimeException('Assignment does not have held escrow to refund.');
            }
            if ($actorType === 'worker' && $assignment->status !== JobAssignment::STATUS_ASSIGNED
                && $assignment->status !== JobAssignment::STATUS_IN_PROGRESS) {
                throw new \RuntimeException('Workers may cancel only before submitting work.');
            }

            $escrowAmount = SettingService::escrowAmount((float) $assignment->payment_amount);
            $frozenBefore = (float) ($poster->frozen_balance ?? 0);
            if ($frozenBefore + 0.00005 < $escrowAmount) {
                throw new \RuntimeException('Poster escrow balance is lower than this assignment refund.');
            }

            $now = date('Y-m-d H:i:s');
            $newWallet = round((float) ($poster->wallet_balance ?? 0) + $escrowAmount, 4);
            $newFrozen = round($frozenBefore - $escrowAmount, 4);
            Fluent::table('users')->where('id', '=', $poster->id)->update([
                'wallet_balance' => $newWallet,
                'frozen_balance' => max(0, $newFrozen),
                'updated_at' => $now,
            ]);
            Fluent::table('job_assignments')->where('id', '=', $assignmentId)->update([
                'status' => JobAssignment::STATUS_CANCELLED,
                'payment_status' => JobAssignment::PAYMENT_REFUNDED,
                'updated_at' => $now,
            ]);
            Fluent::table('job_bids')->where('id', '=', (int) $assignment->bid_id)->update([
                'status' => JobBid::STATUS_REJECTED,
                'decided_at' => $now,
                'decided_by' => $actorId,
                'updated_at' => $now,
            ]);

            self::logTransaction(
                $poster->id,
                $job->id,
                Transaction::TYPE_REFUND,
                $escrowAmount,
                $job->currency,
                $newWallet,
                $newFrozen,
                'assignment:' . $assignmentId,
                'Assignment cancelled' . ($reason ? ': ' . trim($reason) : '')
            );

            $replacement = $db->prepare(
                "SELECT bid_id, worker_id FROM job_assignments
                 WHERE job_id = :job_id
                   AND status <> :cancelled
                   AND payment_status <> :refunded
                 ORDER BY id ASC LIMIT 1"
            );
            $replacement->execute([
                'job_id' => $job->id,
                'cancelled' => JobAssignment::STATUS_CANCELLED,
                'refunded' => JobAssignment::PAYMENT_REFUNDED,
            ]);
            $replacementRow = $replacement->fetch(\PDO::FETCH_ASSOC) ?: null;
            $jobUpdate = [
                'assigned_bid_id' => $replacementRow ? (int) $replacementRow['bid_id'] : null,
                'assigned_worker_id' => $replacementRow ? (int) $replacementRow['worker_id'] : null,
                'updated_at' => $now,
            ];
            Fluent::table('jobs')->where('id', '=', $job->id)->update($jobUpdate);
            $this->refreshJobProgress((int) $job->id, $now);

            $this->commitWriteTransaction($db);
            $assignment = JobAssignment::find((int) $assignmentId);
            $this->notifyUser(
                $assignment?->worker(),
                'Assignment cancelled',
                'Your assignment for “' . $job->title . '” was cancelled and the held escrow was refunded.'
                    . ($reason ? ' Reason: ' . trim($reason) : ''),
                'warning',
                'bi-arrow-counterclockwise',
                '/jobs/' . $job->id
            );
            $this->notifyUser(
                $job->poster(),
                'Assignment cancelled',
                'An assignment for “' . $job->title . '” was cancelled and its escrow was refunded.',
                'info',
                'bi-arrow-counterclockwise',
                '/poster/jobs/' . $job->id
            );
            return [
                'success' => true,
                'message' => $actorType === 'worker'
                    ? 'Assignment cancellation requested and escrow refunded.'
                    : 'Assignment cancelled and escrow refunded.',
                'assignment' => JobAssignment::find((int) $assignmentId),
            ];
        } catch (\Throwable $e) {
            $this->rollbackWriteTransaction($db);
            return ['success' => false, 'message' => 'Assignment cancellation failed: ' . $e->getMessage()];
        }
    }

    /**
     * Replace one held assignment and carry its escrow transition in the same
     * transaction. A failed replacement therefore leaves the original
     * assignment and its payment state untouched.
     */
    public function reassignAssignment(int $assignmentId, int $replacementBidId, int $adminId, ?string $reason = null): array
    {
        if (!$this->isAdminId($adminId)) {
            return ['success' => false, 'message' => 'Administrator access is required.'];
        }
        if (!JobAssignment::isAvailable()) {
            return ['success' => false, 'message' => 'Multi-worker assignment storage is not available.'];
        }

        $db = Database::connect();
        try {
            $this->beginWriteTransaction($db);

            $identityStmt = $db->prepare('SELECT job_id FROM job_assignments WHERE id = :id LIMIT 1');
            $identityStmt->execute(['id' => $assignmentId]);
            $identityRow = $identityStmt->fetch(\PDO::FETCH_ASSOC);
            if (!$identityRow) throw new \RuntimeException('Assignment not found.');

            $jobSql = 'SELECT * FROM jobs WHERE id = :id LIMIT 1';
            $posterSql = 'SELECT * FROM users WHERE id = :id LIMIT 1';
            $assignmentSql = 'SELECT * FROM job_assignments WHERE id = :id LIMIT 1';
            $bidSql = 'SELECT * FROM job_bids WHERE id = :id LIMIT 1';
            if (Database::getDriverName() !== 'sqlite') {
                $jobSql .= ' FOR UPDATE';
                $posterSql .= ' FOR UPDATE';
                $assignmentSql .= ' FOR UPDATE';
                $bidSql .= ' FOR UPDATE';
            }

            $jobStmt = $db->prepare($jobSql);
            $jobStmt->execute(['id' => (int) $identityRow['job_id']]);
            $jobRow = $jobStmt->fetch(\PDO::FETCH_ASSOC);
            if (!$jobRow) throw new \RuntimeException('Job not found.');
            $job = new Job($jobRow);

            $posterStmt = $db->prepare($posterSql);
            $posterStmt->execute(['id' => (int) $job->poster_id]);
            $posterRow = $posterStmt->fetch(\PDO::FETCH_ASSOC);
            $poster = $posterRow ? new User($posterRow) : null;
            if ($poster === null) throw new \RuntimeException('Job poster not found.');

            $assignmentStmt = $db->prepare($assignmentSql);
            $assignmentStmt->execute(['id' => $assignmentId]);
            $assignmentRow = $assignmentStmt->fetch(\PDO::FETCH_ASSOC);
            if (!$assignmentRow) throw new \RuntimeException('Assignment not found.');

            $replacementStmt = $db->prepare($bidSql);
            $replacementStmt->execute(['id' => $replacementBidId]);
            $replacementRow = $replacementStmt->fetch(\PDO::FETCH_ASSOC);
            if (!$replacementRow) throw new \RuntimeException('Replacement bid not found.');

            $assignment = new JobAssignment($assignmentRow);
            $replacementBid = new JobBid($replacementRow);
            if ((int) $replacementBid->job_id !== (int) $job->id) {
                throw new \RuntimeException('Replacement bid must belong to the same job.');
            }
            if (!$replacementBid->isPending()) throw new \RuntimeException('Replacement bid has already been reviewed.');
            if ($assignment->payment_status !== JobAssignment::PAYMENT_HELD
                || $assignment->status === JobAssignment::STATUS_CANCELLED) {
                throw new \RuntimeException('Only an active held assignment can be reassigned.');
            }

            $maxWorkers = max(1, (int) ($job->worker_count ?? 1));
            $capacityStmt = $db->prepare(
                "SELECT COUNT(*) FROM job_assignments
                 WHERE job_id = :job_id AND id <> :assignment_id
                   AND status <> :cancelled AND payment_status <> :refunded"
            );
            $capacityStmt->execute([
                'job_id' => $job->id,
                'assignment_id' => $assignmentId,
                'cancelled' => JobAssignment::STATUS_CANCELLED,
                'refunded' => JobAssignment::PAYMENT_REFUNDED,
            ]);
            if ((int) $capacityStmt->fetchColumn() >= $maxWorkers) {
                throw new \RuntimeException('Job worker capacity has already been filled by other assignments.');
            }

            $oldWorker = User::find((int) $assignment->worker_id);
            $newWorker = User::find((int) $replacementBid->worker_id);
            if ($oldWorker === null || $newWorker === null) {
                throw new \RuntimeException('Assignment participants could not be found.');
            }
            if (!$newWorker->isWorker()) throw new \RuntimeException('Only worker accounts can be assigned to jobs.');
            if ($newWorker->isBanned()) throw new \RuntimeException('Banned workers cannot be assigned to jobs.');

            $oldEscrow = SettingService::escrowAmount((float) $assignment->payment_amount);
            $newAmount = (float) ($replacementBid->amount ?: ($job->cost_per_worker ?: $job->budget));
            $newEscrow = SettingService::escrowAmount($newAmount);
            $walletBefore = (float) ($poster->wallet_balance ?? 0);
            $frozenBefore = (float) ($poster->frozen_balance ?? 0);
            if ($frozenBefore + 0.00005 < $oldEscrow) {
                throw new \RuntimeException('Poster escrow balance is lower than the old assignment refund.');
            }
            $walletAfter = round($walletBefore + $oldEscrow - $newEscrow, 4);
            $frozenAfter = round($frozenBefore - $oldEscrow + $newEscrow, 4);
            if ($walletAfter < -0.00005) {
                throw new \RuntimeException('The poster does not have enough balance for the replacement worker payment.');
            }

            $now = date('Y-m-d H:i:s');
            Fluent::table('users')->where('id', '=', $poster->id)->update([
                'wallet_balance' => max(0, $walletAfter),
                'frozen_balance' => max(0, $frozenAfter),
                'updated_at' => $now,
            ]);
            Fluent::table('job_assignments')->where('id', '=', $assignmentId)->update([
                'status' => JobAssignment::STATUS_CANCELLED,
                'payment_status' => JobAssignment::PAYMENT_REFUNDED,
                'updated_at' => $now,
            ]);
            Fluent::table('job_bids')->where('id', '=', $assignment->bid_id)->update([
                'status' => JobBid::STATUS_REJECTED,
                'decided_at' => $now,
                'decided_by' => $adminId,
                'updated_at' => $now,
            ]);
            Fluent::table('job_bids')->where('id', '=', $replacementBidId)->update([
                'status' => JobBid::STATUS_ACCEPTED,
                'decided_at' => $now,
                'decided_by' => $adminId,
                'updated_at' => $now,
            ]);
            $newAssignmentId = (int) Fluent::table('job_assignments')->insert([
                'job_id' => $job->id,
                'bid_id' => $replacementBidId,
                'worker_id' => $replacementBid->worker_id,
                'status' => JobAssignment::STATUS_ASSIGNED,
                'payment_status' => JobAssignment::PAYMENT_HELD,
                'payment_amount' => $newAmount,
                'assigned_by' => $adminId,
                'assigned_at' => $now,
                'created_at' => $now,
            ]);
            Fluent::table('jobs')->where('id', '=', $job->id)->update([
                'assigned_bid_id' => $replacementBidId,
                'assigned_worker_id' => $replacementBid->worker_id,
                'updated_at' => $now,
            ]);
            $this->refreshJobProgress((int) $job->id, $now);

            self::logTransaction(
                $poster->id,
                $job->id,
                Transaction::TYPE_REFUND,
                $oldEscrow,
                $job->currency,
                max(0, $walletBefore + $oldEscrow),
                max(0, $frozenBefore - $oldEscrow),
                'assignment:' . $assignmentId,
                'Refund before assignment reassignment' . ($reason ? ': ' . trim($reason) : '')
            );
            self::logTransaction(
                $poster->id,
                $job->id,
                Transaction::TYPE_ESCROW_HOLD,
                $newEscrow,
                $job->currency,
                max(0, $walletAfter),
                max(0, $frozenAfter),
                'assignment:' . $newAssignmentId,
                'Escrow held for replacement worker assignment'
            );

            $this->commitWriteTransaction($db);
            $this->notifyUser(
                $oldWorker,
                'Assignment cancelled',
                'Your assignment for “' . $job->title . '” was cancelled for reassignment.'
                    . ($reason ? ' Reason: ' . trim($reason) : ''),
                'warning',
                'bi-arrow-counterclockwise',
                '/jobs/' . $job->id
            );
            $this->notifyUser(
                $newWorker,
                'Worker assignment approved',
                'You were assigned to “' . $job->title . '” as a replacement worker.',
                'success',
                'bi-check-circle',
                '/jobs/' . $job->id
            );
            $this->notifyUser(
                $poster,
                'Worker reassigned',
                'A replacement worker was assigned to “' . $job->title . '”.',
                'info',
                'bi-person-check',
                '/poster/jobs/' . $job->id
            );
            return [
                'success' => true,
                'message' => 'Assignment cancelled and replacement worker assigned.',
                'assignment' => JobAssignment::find($newAssignmentId),
                'job' => Job::find((int) $job->id),
            ];
        } catch (\Throwable $e) {
            $this->rollbackWriteTransaction($db);
            return ['success' => false, 'message' => 'Assignment reassignment failed: ' . $e->getMessage()];
        }
    }

    private function assignmentCapacityCount(int $jobId): int
    {
        if (!JobAssignment::isAvailable()) return 0;
        $stmt = Database::connect()->prepare(
            "SELECT COUNT(*) FROM job_assignments
             WHERE job_id = :job_id
               AND status <> :cancelled
               AND payment_status <> :refunded"
        );
        $stmt->execute([
            'job_id' => $jobId,
            'cancelled' => JobAssignment::STATUS_CANCELLED,
            'refunded' => JobAssignment::PAYMENT_REFUNDED,
        ]);
        return (int) $stmt->fetchColumn();
    }

    /**
     * Poster flow: extend deadline by X days.
     */
    public function extendDeadline(User $poster, int $jobId, int $days): array
    {
        if ($poster->isBanned()) {
            return ['success' => false, 'message' => 'Banned accounts cannot modify jobs.'];
        }
        if (!$this->canManagePosterJobs($poster)) {
            return ['success' => false, 'message' => 'Poster access is required to modify jobs.'];
        }
        $job = Job::find($jobId);
        if ($job === null) return ['success' => false, 'message' => 'Job not found.'];
        if ((int) $job->poster_id !== (int) $poster->id) {
            return ['success' => false, 'message' => 'Only the job poster can extend the deadline.'];
        }
        if ($days <= 0 || $days > 90) {
            return ['success' => false, 'message' => 'Days must be between 1 and 90.'];
        }

        $db = Database::connect();
        try {
            $this->beginWriteTransaction($db);
            $jobSql = 'SELECT * FROM jobs WHERE id = :id LIMIT 1';
            if (Database::getDriverName() !== 'sqlite') $jobSql .= ' FOR UPDATE';
            $jobStmt = $db->prepare($jobSql);
            $jobStmt->execute(['id' => $jobId]);
            $jobRow = $jobStmt->fetch(\PDO::FETCH_ASSOC);
            if (!$jobRow) throw new \RuntimeException('Job not found.');
            $job = new Job($jobRow);
            if ((int) $job->poster_id !== (int) $poster->id) {
                throw new \RuntimeException('Only the job poster can extend the deadline.');
            }

            $extendableStatuses = [
                Job::STATUS_OPEN,
                Job::STATUS_IN_REVIEW,
                Job::STATUS_ENGAGED,
                Job::STATUS_ASSIGNED,
                Job::STATUS_SUBMITTED,
                Job::STATUS_REVISION,
                Job::STATUS_EXPIRED,
            ];
            if (!in_array((string) $job->status, $extendableStatuses, true)) {
                throw new \RuntimeException('This job cannot be extended in its current state.');
            }

            $baseTime = strtotime($job->deadline_at ?? 'now');
            if ($baseTime < time()) $baseTime = time();
            $newDeadline = date('Y-m-d H:i:s', $baseTime + ($days * 86400));
            $nextStatus = $job->status === Job::STATUS_EXPIRED ? Job::STATUS_OPEN : $job->status;
            $updated = $db->prepare(
                'UPDATE jobs
                 SET deadline_at = :deadline_at,
                     bidding_closes_at = :bidding_closes_at,
                     status = :status,
                     updated_at = :updated_at
                 WHERE id = :id AND status = :current_status'
            );
            $updated->execute([
                'deadline_at' => $newDeadline,
                'bidding_closes_at' => $newDeadline,
                'status' => $nextStatus,
                'updated_at' => date('Y-m-d H:i:s'),
                'id' => $jobId,
                'current_status' => $job->status,
            ]);
            if ($updated->rowCount() !== 1) throw new \RuntimeException('Job status changed before the deadline could be extended.');
            $job->deadline_at = $newDeadline;
            $job->bidding_closes_at = $newDeadline;
            $job->status = $nextStatus;
            $this->commitWriteTransaction($db);
        } catch (\Throwable $e) {
            $this->rollbackWriteTransaction($db);
            return ['success' => false, 'message' => 'Deadline extension failed: ' . $e->getMessage()];
        }

        $message = 'The deadline for “' . $job->title . '” was extended to ' . $newDeadline . '.';
        $this->notifyUser($poster, 'Job deadline extended', $message, 'info', 'bi-calendar-plus', '/poster/jobs/' . $job->id);
        foreach (JobAssignment::forJob((int) $job->id) as $assignment) {
            if (!$assignment->isActive()) continue;
            $this->notifyUser($assignment->worker(), 'Job deadline extended', $message, 'info', 'bi-calendar-plus', '/jobs/' . $job->id);
        }
        $this->notifyAdmins('Job deadline extended', 'The deadline for “' . $job->title . '” was extended by its poster.', 'info', 'bi-calendar-plus', '/admin/jobs/' . $job->id);

        return ['success' => true, 'job' => Job::find($jobId), 'message' => "Deadline extended by {$days} days."];
    }

    /**
     * Poster flow: validate + create a new job.
     * Returns ['success' => bool, 'job' => Job|null, 'message' => string].
     */
    public function create(User $poster, int $categoryId, string $title, string $description, ?string $requirements, float $budget, ?string $deadlineAt = null, ?int $biddingWindowHours = null): array
    {
        if ($poster->isBanned()) {
            return ['success' => false, 'message' => 'Banned accounts cannot post jobs.'];
        }
        if (!$this->canManagePosterJobs($poster)) {
            return ['success' => false, 'message' => 'Poster access is required to post jobs.'];
        }
        if (trim($title) === '' || mb_strlen($title) > 160) {
            return ['success' => false, 'message' => 'Title is required (1-160 chars).'];
        }
        if (trim($description) === '') {
            return ['success' => false, 'message' => 'Description is required.'];
        }
        $minBudget = (float) SettingService::get('min_job_budget', 100.00);
        $maxBudget = (float) SettingService::get('max_job_budget', 50000.00);
        if ($budget < $minBudget || $budget > $maxBudget) {
            return ['success' => false, 'message' => "Budget must be between {$minBudget} and {$maxBudget}."];
        }
        $category = Category::find($categoryId);
        if ($category === null || !$category->isActive()) {
            return ['success' => false, 'message' => 'Invalid or inactive category.'];
        }
        $windowHours = $biddingWindowHours !== null ? (float) $biddingWindowHours : (float) SettingService::get('ad_bidding_window_hours', 72);
        $biddingClosesAt = $windowHours > 0 ? date('Y-m-d H:i:s', time() + (int) round($windowHours * 3600)) : null;
        $slug = self::makeUniqueSlug($title);

        $id = (int) Fluent::table('jobs')->insert([
            'poster_id'         => $poster->id,
            'category_id'       => $categoryId,
            'title'             => $title,
            'slug'             => $slug,
            'description'       => $description,
            'requirements'      => $requirements,
            'budget'            => round($budget, 4),
            'currency'          => SettingService::currencyCode(),
            'deadline_at'       => $deadlineAt,
            'bidding_closes_at' => $biddingClosesAt,
            'status'            => Job::STATUS_OPEN,
            'created_at'        => date('Y-m-d H:i:s'),
        ]);
        $this->notifyAdmins(
            'New job posted',
            'Job “' . $title . '” is awaiting review.',
            'info',
            'bi-briefcase',
            '/admin/jobs/' . $id
        );
        return ['success' => true, 'job' => Job::find($id), 'message' => 'Job posted.'];
    }

    /**
     * Worker flow: place a bid on an open job. Validates:
     *   - job is open
     *   - bidding hasn't closed
     *   - worker hasn't already bid on this job
     *   - bid amount > 0
     */
    public function placeBid(User $worker, int $jobId, float $amount, int $deliveryDays, string $proposal): array
    {
        if (!$worker->isWorker()) {
            return ['success' => false, 'message' => 'Worker access is required to place bids.'];
        }
        if ($worker->isBanned()) {
            return ['success' => false, 'message' => 'Banned accounts cannot place bids.'];
        }
        if ($amount <= 0) return ['success' => false, 'message' => 'Bid amount must be positive.'];
        if (trim($proposal) === '') return ['success' => false, 'message' => 'Proposal is required.'];
        if ($deliveryDays < 1 || $deliveryDays > 365) {
            return ['success' => false, 'message' => 'Delivery days must be 1-365.'];
        }

        $db = Database::connect();
        try {
            $this->beginWriteTransaction($db);

            // Serialize the duplicate check with the insert. This protects
            // the current bid endpoint as well as the legacy application
            // endpoint above when two requests arrive together.
            $jobSql = 'SELECT * FROM jobs WHERE id = :id LIMIT 1';
            if (Database::getDriverName() !== 'sqlite') $jobSql .= ' FOR UPDATE';
            $jobStmt = $db->prepare($jobSql);
            $jobStmt->execute(['id' => $jobId]);
            $jobRow = $jobStmt->fetch(\PDO::FETCH_ASSOC);
            if (!$jobRow) throw new \RuntimeException('Job not found.');
            $job = new Job($jobRow);
            if (!$job->isOpen()) throw new \RuntimeException('Job is not open for bids.');
            if ($job->bidding_closes_at && strtotime($job->bidding_closes_at) < time()) {
                throw new \RuntimeException('Bidding window has closed.');
            }

            $existingStmt = $db->prepare(
                'SELECT id FROM job_bids WHERE job_id = :job_id AND worker_id = :worker_id LIMIT 1'
            );
            $existingStmt->execute(['job_id' => $jobId, 'worker_id' => $worker->id]);
            if ($existingStmt->fetchColumn()) {
                throw new \RuntimeException('You have already bid on this job.');
            }

            $id = (int) Fluent::table('job_bids')->insert([
                'job_id'        => $jobId,
                'worker_id'     => $worker->id,
                'amount'        => round($amount, 4),
                'currency'      => $job->currency,
                'delivery_days' => $deliveryDays,
                'proposal'      => $proposal,
                'status'        => JobBid::STATUS_PENDING,
                'created_at'    => date('Y-m-d H:i:s'),
            ]);
            $db->prepare(
                'UPDATE jobs SET bid_count = COALESCE(bid_count, 0) + 1, updated_at = :updated_at WHERE id = :id'
            )->execute(['updated_at' => date('Y-m-d H:i:s'), 'id' => $jobId]);
            $this->commitWriteTransaction($db);
        } catch (\Throwable $e) {
            $this->rollbackWriteTransaction($db);
            return ['success' => false, 'message' => 'Bid failed: ' . $e->getMessage()];
        }
        $this->notifyUser(
            $job->poster(),
            'New worker bid',
            $worker->name . ' placed a bid on “' . $job->title . '”.',
            'info',
            'bi-person-plus',
            '/poster/jobs/' . $job->id
        );
        $this->notifyAdmins(
            'New worker bid',
            $worker->name . ' placed a bid on “' . $job->title . '”.',
            'info',
            'bi-person-plus',
            '/admin/jobs/' . $job->id
        );
        return ['success' => true, 'bid' => JobBid::find($id), 'message' => 'Bid placed.'];
    }

    /**
     * Worker flow: withdraw a still-pending bid.
     */
    public function withdrawBid(User $worker, int $bidId): array
    {
        if (!$worker->isWorker()) {
            return ['success' => false, 'message' => 'Worker access is required to modify bids.'];
        }
        if ($worker->isBanned()) {
            return ['success' => false, 'message' => 'Banned accounts cannot modify bids.'];
        }

        $db = Database::connect();
        try {
            $this->beginWriteTransaction($db);

            $bidSql = 'SELECT * FROM job_bids WHERE id = :id LIMIT 1';
            if (Database::getDriverName() !== 'sqlite') $bidSql .= ' FOR UPDATE';
            $bidStmt = $db->prepare($bidSql);
            $bidStmt->execute(['id' => $bidId]);
            $bidRow = $bidStmt->fetch(\PDO::FETCH_ASSOC);
            if (!$bidRow) throw new \RuntimeException('Bid not found.');
            $bid = new JobBid($bidRow);
            if ((int) $bid->worker_id !== (int) $worker->id) throw new \RuntimeException('Not your bid.');

            $updated = $db->prepare(
                'UPDATE job_bids SET status = :withdrawn, updated_at = :updated_at WHERE id = :id AND worker_id = :worker_id AND status = :pending'
            );
            $updated->execute([
                'withdrawn' => JobBid::STATUS_WITHDRAWN,
                'updated_at' => date('Y-m-d H:i:s'),
                'id' => $bidId,
                'worker_id' => $worker->id,
                'pending' => JobBid::STATUS_PENDING,
            ]);
            if ($updated->rowCount() !== 1) throw new \RuntimeException('Bid is no longer pending.');
            $this->commitWriteTransaction($db);
        } catch (\Throwable $e) {
            $this->rollbackWriteTransaction($db);
            return ['success' => false, 'message' => 'Bid withdrawal failed: ' . $e->getMessage()];
        }
        return ['success' => true, 'message' => 'Bid withdrawn.'];
    }

    /**
     * Poster flow: accept a bid. Atomically holds escrow and creates an
     * assignment. Single-worker jobs close competing bids; multi-worker jobs
     * retain pending bids until their configured capacity is filled.
     */
    public function acceptBid(User $poster, int $bidId): array
    {
        if ($poster->isBanned()) {
            return ['success' => false, 'message' => 'Banned accounts cannot accept bids.'];
        }
        if (!$this->canManagePosterJobs($poster)) {
            return ['success' => false, 'message' => 'Poster access is required to accept bids.'];
        }
        $bid = JobBid::find($bidId);
        if ($bid === null) return ['success' => false, 'message' => 'Bid not found.'];
        $job = Job::find((int) $bid->job_id);
        if ($job === null) return ['success' => false, 'message' => 'Job not found.'];
        if ((int) $job->poster_id !== (int) $poster->id) {
            return ['success' => false, 'message' => 'Only the poster can accept a bid.'];
        }
        if (!$job->isOpen()) return ['success' => false, 'message' => 'Job is not open.'];
        if (!$bid->isPending()) return ['success' => false, 'message' => 'Bid is not pending.'];

        $assignmentTableAvailable = JobAssignment::isAvailable();
        $maxWorkers = max(1, (int) ($job->worker_count ?? 1));
        $multiWorker = $assignmentTableAvailable && $maxWorkers > 1;
        $assignedCount = $multiWorker ? $this->assignmentCapacityCount((int) $job->id) : 0;
        if ($multiWorker && $assignedCount >= $maxWorkers) {
            return ['success' => false, 'message' => 'Job worker capacity has already been filled.'];
        }

        $escrowAmount = SettingService::escrowAmount((float) $bid->amount);
        if ((float) $poster->wallet_balance < $escrowAmount) {
            return [
                'success' => false,
                'message' => 'Insufficient wallet balance. Available: ' . number_format((float) $poster->wallet_balance, 2)
                    . ' BDT, required: ' . number_format($escrowAmount, 2) . ' BDT. Please deposit first.',
            ];
        }

        $db = Database::connect();
        try {
            $this->beginWriteTransaction($db);

            // Re-read the mutable rows inside the transaction. Row locks on
            // transactional databases and the first conditional write on
            // SQLite keep two accepts from exceeding multi-worker capacity.
            $jobSql = 'SELECT * FROM jobs WHERE id = :id LIMIT 1';
            $bidSql = 'SELECT * FROM job_bids WHERE id = :id LIMIT 1';
            $posterSql = 'SELECT * FROM users WHERE id = :id LIMIT 1';
            if (Database::getDriverName() !== 'sqlite') {
                $jobSql .= ' FOR UPDATE';
                $bidSql .= ' FOR UPDATE';
                $posterSql .= ' FOR UPDATE';
            }
            $jobStmt = $db->prepare($jobSql);
            $jobStmt->execute(['id' => $job->id]);
            $jobRow = $jobStmt->fetch(\PDO::FETCH_ASSOC);
            $bidStmt = $db->prepare($bidSql);
            $bidStmt->execute(['id' => $bid->id]);
            $bidRow = $bidStmt->fetch(\PDO::FETCH_ASSOC);
            $posterStmt = $db->prepare($posterSql);
            $posterStmt->execute(['id' => $poster->id]);
            $posterRow = $posterStmt->fetch(\PDO::FETCH_ASSOC);
            if (!$jobRow || !$bidRow || !$posterRow) throw new \RuntimeException('Job, bid, or poster was not found.');
            $job = new Job($jobRow);
            $bid = new JobBid($bidRow);
            $poster = new User($posterRow);
            if (!$job->isOpen() || !$bid->isPending()) throw new \RuntimeException('Job or bid is no longer available.');

            $maxWorkers = max(1, (int) ($job->worker_count ?? 1));
            $multiWorker = $assignmentTableAvailable && $maxWorkers > 1;
            $assignedCount = $multiWorker ? $this->assignmentCapacityCount((int) $job->id) : 0;
            if ($multiWorker && $assignedCount >= $maxWorkers) {
                throw new \RuntimeException('Job worker capacity has already been filled.');
            }
            $escrowAmount = SettingService::escrowAmount((float) $bid->amount);
            if ((float) $poster->wallet_balance < $escrowAmount) {
                throw new \RuntimeException('The poster does not have enough wallet balance to reserve this worker payment.');
            }

            // Single-worker jobs retain the historical behavior of closing
            // competing bids. Multi-worker jobs keep other pending bids
            // available until their capacity is filled.
            if (!$multiWorker) {
                Fluent::table('job_bids')
                    ->where('job_id', '=', $job->id)
                    ->where('id', '!=', $bid->id)
                    ->where('status', '=', JobBid::STATUS_PENDING)
                    ->update([
                        'status'     => JobBid::STATUS_REJECTED,
                        'decided_at' => date('Y-m-d H:i:s'),
                        'decided_by' => $poster->id,
                        'updated_at' => date('Y-m-d H:i:s'),
                    ]);
            }

            // Mark this bid accepted.
            Fluent::table('job_bids')
                ->where('id', '=', $bid->id)
                ->update([
                    'status'     => JobBid::STATUS_ACCEPTED,
                    'decided_at' => date('Y-m-d H:i:s'),
                    'decided_by' => $poster->id,
                    'updated_at' => date('Y-m-d H:i:s'),
                ]);
            // 3. Move escrow
            $newWallet  = round(((float) $poster->wallet_balance) - $escrowAmount, 4);
            $newFrozen  = round(((float) $poster->frozen_balance) + $escrowAmount, 4);
            Fluent::table('users')
                ->where('id', '=', $poster->id)
                ->update([
                    'wallet_balance'  => $newWallet,
                    'frozen_balance'  => $newFrozen,
                    'updated_at'      => date('Y-m-d H:i:s'),
                ]);
            // 4. Update job
            $newAssignedCount = $multiWorker ? $assignedCount + 1 : 1;
            Fluent::table('jobs')
                ->where('id', '=', $job->id)
                ->update([
                    'status'             => $multiWorker
                        ? ($newAssignedCount >= $maxWorkers ? Job::STATUS_ENGAGED : Job::STATUS_IN_REVIEW)
                        : Job::STATUS_ASSIGNED,
                    'assigned_bid_id'    => $job->assigned_bid_id ?: $bid->id,
                    'assigned_worker_id' => $job->assigned_worker_id ?: $bid->worker_id,
                    'updated_at'         => date('Y-m-d H:i:s'),
                ]);
            if ($assignmentTableAvailable && JobAssignment::findForBid((int) $bid->id) === null) {
                Fluent::table('job_assignments')->insert([
                    'job_id'         => $job->id,
                    'bid_id'         => $bid->id,
                    'worker_id'      => $bid->worker_id,
                    'status'         => JobAssignment::STATUS_ASSIGNED,
                    'payment_status' => JobAssignment::PAYMENT_HELD,
                    'payment_amount' => (float) $bid->amount,
                    'assigned_by'    => $poster->id,
                    'assigned_at'    => date('Y-m-d H:i:s'),
                    'created_at'     => date('Y-m-d H:i:s'),
                ]);
            }
            // 5. Log the escrow hold
            self::logTransaction(
                $poster->id, $job->id, Transaction::TYPE_ESCROW_HOLD,
                $escrowAmount, $job->currency, $newWallet, $newFrozen,
                'bid:' . $bid->id, 'Escrow held for accepted bid'
            );

            $this->commitWriteTransaction($db);
        } catch (\Throwable $e) {
            $this->rollbackWriteTransaction($db);
            return ['success' => false, 'message' => 'Accept failed: ' . $e->getMessage()];
        }

        return ['success' => true, 'job' => Job::find($job->id), 'message' => 'Bid accepted.'];
    }

    /**
     * Worker flow: submit completed work for the assigned job.
     * Validates: worker is the assigned worker and job is in assigned or revision state.
     */
    public function submitWork(
        User $worker,
        int $jobId,
        ?string $description,
        ?string $externalLink,
        ?UploadedFile $proofFile = null,
        ?string $clientIp = null,
        ?string $userAgent = null
    ): array
    {
        if (!$worker->isWorker()) {
            return ['success' => false, 'message' => 'Worker access is required to submit work.'];
        }
        if ($worker->isBanned()) {
            return ['success' => false, 'message' => 'Banned accounts cannot submit work.'];
        }
        $job = Job::find($jobId);
        if ($job === null) return ['success' => false, 'message' => 'Job not found.'];
        $assignmentTableAvailable = JobAssignment::isAvailable();
        $assignment = $assignmentTableAvailable
            ? JobAssignment::findForJobWorker($jobId, (int) $worker->id)
            : null;
        if ($assignment !== null) {
            if (!$assignment->isActive()) {
                return ['success' => false, 'message' => 'This assignment is not in a submittable state.'];
            }
            if ($assignment->status === JobAssignment::STATUS_SUBMITTED) {
                return ['success' => false, 'message' => 'A submission is already awaiting review.'];
            }
        } elseif ((int) $job->assigned_worker_id !== (int) $worker->id) {
            return ['success' => false, 'message' => 'You are not the assigned worker for this job.'];
        }
        if ($assignment === null && !in_array($job->status, [Job::STATUS_ASSIGNED, Job::STATUS_REVISION], true)) {
            return ['success' => false, 'message' => 'Job is not in a submittable state.'];
        }
        $bid = $assignment?->bid() ?? ($job->assigned_bid_id ? JobBid::find((int) $job->assigned_bid_id) : null);
        if ($bid === null) return ['success' => false, 'message' => 'Job has no assigned bid.'];

        $proofRequirements = $job->proof_requirements ?? [];
        if (is_string($proofRequirements)) {
            $proofRequirements = json_decode($proofRequirements, true) ?: [];
        }
        $requiresScreenshot = false;
        $requiresWrittenReport = false;
        foreach ((array) $proofRequirements as $requirement) {
            $type = is_array($requirement)
                ? strtolower(trim((string) ($requirement['type'] ?? 'text')))
                : strtolower(trim((string) $requirement));
            if ($type === 'screenshot') {
                $requiresScreenshot = true;
            }
            if (in_array($type, ['text', 'written', 'written_report', 'report', 'description'], true)) {
                $requiresWrittenReport = true;
            }
        }
        if ($requiresScreenshot && $proofFile === null) {
            return ['success' => false, 'message' => 'A screenshot proof is required for this job.'];
        }
        if ($requiresWrittenReport && trim((string) $description) === '') {
            return ['success' => false, 'message' => 'A written report is required for this job.'];
        }

        $attachmentPath = null;
        $attachmentAbsolutePath = null;
        if ($proofFile !== null) {
            $extension = strtolower($proofFile->getClientOriginalExtension());
            if (!in_array($extension, ['jpg', 'jpeg', 'png', 'gif', 'webp'], true)) {
                return ['success' => false, 'message' => 'Screenshot must be a JPG, PNG, GIF, or WEBP image.'];
            }

            $proofDirectory = base_path('storage/job-proofs');
            $upload = FileValidator::image($proofFile, $proofDirectory, (int) $worker->id, 10, 'screenshot');
            if ($upload->failed()) {
                return ['success' => false, 'message' => $upload->error ?: 'Screenshot upload failed.'];
            }

            $filename = basename((string) $upload->path);
            $attachmentPath = 'job-proofs/' . $filename;
            $attachmentAbsolutePath = $proofDirectory . DIRECTORY_SEPARATOR . $filename;
        }

        $attemptNumber = 1;
        if ($assignment !== null) {
            $previous = JobSubmission::latestForAssignment((int) $assignment->id);
            $attemptNumber = $previous ? ((int) ($previous->attempt_number ?? 1) + 1) : 1;
        }

        $riskColumnsAvailable = false;
        try {
            Database::connect()->query('SELECT risk_status FROM job_submissions LIMIT 0');
            $riskColumnsAvailable = true;
        } catch (\Throwable) {
            // Older hosts can keep submitting while the additive risk migration
            // is being rolled out; risk metadata becomes active once present.
        }
        $riskScore = 0.0;
        $riskFlags = [];
        $normalizedDescription = strtolower(trim((string) $description));
        $minimumDescriptionLength = max(1, (int) SettingService::get('fraud_min_description_chars', 20));
        $velocityLimit = max(1, (int) SettingService::get('fraud_daily_submission_velocity_limit', 10));
        $sharedIdentityThreshold = max(2, (int) SettingService::get('fraud_shared_identity_worker_threshold', 2));
        $reviewThreshold = max(1, (int) SettingService::get('fraud_review_threshold', 20));
        if (mb_strlen($normalizedDescription) < $minimumDescriptionLength) {
            $riskScore += 20;
            $riskFlags[] = 'very_short_description';
        }
        $contentHash = hash('sha256', implode('|', [
            (int) $job->id,
            $normalizedDescription,
            strtolower(trim((string) $externalLink)),
        ]));
        $proofHash = $attachmentAbsolutePath !== null && is_file($attachmentAbsolutePath)
            ? hash_file('sha256', $attachmentAbsolutePath)
            : null;
        $clientFingerprint = trim((string) $userAgent) !== ''
            ? hash('sha256', strtolower(trim((string) $userAgent)))
            : null;

        if ($riskColumnsAvailable) {
            try {
                $duplicateStmt = Database::connect()->prepare(
                    "SELECT COUNT(*) FROM job_submissions
                     WHERE job_id = :job_id AND content_hash = :content_hash
                       AND status IN ('pending_review', 'approved')"
                );
                $duplicateStmt->execute(['job_id' => $job->id, 'content_hash' => $contentHash]);
                if ((int) $duplicateStmt->fetchColumn() > 0) {
                    $riskScore += 45;
                    $riskFlags[] = 'duplicate_content_on_job';
                }

                $velocityStmt = Database::connect()->prepare(
                    "SELECT COUNT(*) FROM job_submissions
                     WHERE worker_id = :worker_id AND created_at >= :since"
                );
                $velocityStmt->execute([
                    'worker_id' => $worker->id,
                    'since' => date('Y-m-d H:i:s', time() - 86400),
                ]);
                if ((int) $velocityStmt->fetchColumn() >= $velocityLimit) {
                    $riskScore += 30;
                    $riskFlags[] = 'high_submission_velocity';
                }

                if ($clientIp !== null && trim($clientIp) !== '') {
                    $ipStmt = Database::connect()->prepare(
                        "SELECT COUNT(DISTINCT worker_id) FROM job_submissions
                         WHERE job_id = :job_id AND client_ip = :client_ip"
                    );
                    $ipStmt->execute(['job_id' => $job->id, 'client_ip' => trim($clientIp)]);
                    if ((int) $ipStmt->fetchColumn() >= $sharedIdentityThreshold) {
                        $riskScore += 25;
                        $riskFlags[] = 'shared_ip_across_workers';
                    }
                }
                if ($clientFingerprint !== null) {
                    $fingerprintStmt = Database::connect()->prepare(
                        "SELECT COUNT(DISTINCT worker_id) FROM job_submissions
                         WHERE job_id = :job_id AND client_fingerprint = :fingerprint"
                    );
                    $fingerprintStmt->execute(['job_id' => $job->id, 'fingerprint' => $clientFingerprint]);
                    if ((int) $fingerprintStmt->fetchColumn() >= $sharedIdentityThreshold) {
                        $riskScore += 25;
                        $riskFlags[] = 'shared_client_fingerprint';
                    }
                }
            } catch (\Throwable) {
                // Risk detection is advisory; never make a valid submission
                // fail because a legacy risk column is only partially present.
            }
        }
        // Close the advisory read cursors before upgrading this connection to
        // the write transaction. SQLite can otherwise retain a shared read
        // lock while another worker is committing the same job's submission.
        unset($duplicateStmt, $velocityStmt, $ipStmt, $fingerprintStmt);
        $riskScore = min(100, round($riskScore, 2));
        $riskStatus = $riskScore >= $reviewThreshold ? JobSubmission::RISK_FLAGGED : JobSubmission::RISK_CLEAR;

        $now = date('Y-m-d H:i:s');
        $submissionData = [
            'job_id'         => $job->id,
            'worker_id'      => $worker->id,
            'bid_id'         => $bid->id,
            'description'    => $description,
            'attachment_path'=> $attachmentPath,
            'external_link'  => $externalLink,
            'status'         => JobSubmission::STATUS_PENDING_REVIEW,
            'created_at'     => $now,
        ];
        if ($assignmentTableAvailable) {
            $submissionData['assignment_id'] = $assignment?->id;
            $submissionData['attempt_number'] = $attemptNumber;
            $submissionData['submitted_at'] = $now;
        }
        if ($riskColumnsAvailable) {
            $submissionData += [
                'content_hash' => $contentHash,
                'proof_hash' => $proofHash,
                'client_ip' => $clientIp !== null ? trim($clientIp) : null,
                'client_fingerprint' => $clientFingerprint,
                'risk_score' => $riskScore,
                'risk_status' => $riskStatus,
                'risk_flags' => $riskFlags ? json_encode(array_values(array_unique($riskFlags)), JSON_UNESCAPED_UNICODE) : null,
            ];
        }
        $db = Database::connect();
        try {
            $this->beginWriteTransaction($db);

            // Claim the aggregate job before the assignment transition. This
            // keeps submission aligned with cancellation/payment lock order
            // and prevents an active-looking assignment from submitting after
            // its job has already reached a terminal state.
            $jobSql = 'SELECT * FROM jobs WHERE id = :id LIMIT 1';
            if (Database::getDriverName() !== 'sqlite') $jobSql .= ' FOR UPDATE';
            $jobStmt = $db->prepare($jobSql);
            $jobStmt->execute(['id' => $job->id]);
            $jobRow = $jobStmt->fetch(\PDO::FETCH_ASSOC);
            if (!$jobRow) throw new \RuntimeException('Job not found.');
            $job = new Job($jobRow);
            if ($assignment !== null) {
                if (!in_array($job->status, [
                    Job::STATUS_IN_REVIEW,
                    Job::STATUS_ENGAGED,
                    Job::STATUS_ASSIGNED,
                    Job::STATUS_SUBMITTED,
                    Job::STATUS_REVISION,
                ], true)) {
                    throw new \RuntimeException('Job is not in a submittable state.');
                }
            }
            unset($jobStmt);

            // Re-check duplicate content after acquiring the write boundary.
            // The advisory preflight above can run before another worker's
            // concurrent submission commits; this second check makes the
            // fraud signal deterministic for that race without rejecting the
            // otherwise valid submission.
            if ($riskColumnsAvailable && !in_array('duplicate_content_on_job', $riskFlags, true)) {
                $duplicateStmt = $db->prepare(
                    "SELECT COUNT(*) FROM job_submissions
                     WHERE job_id = :job_id AND content_hash = :content_hash
                       AND status IN ('pending_review', 'approved')"
                );
                $duplicateStmt->execute(['job_id' => $job->id, 'content_hash' => $contentHash]);
                $duplicateExists = (int) $duplicateStmt->fetchColumn() > 0;
                unset($duplicateStmt);
                if ($duplicateExists) {
                    $riskScore = min(100, round($riskScore + 45, 2));
                    $riskFlags[] = 'duplicate_content_on_job';
                    $riskStatus = $riskScore >= $reviewThreshold ? JobSubmission::RISK_FLAGGED : JobSubmission::RISK_CLEAR;
                }
            }
            if ($riskColumnsAvailable) {
                $submissionData['risk_score'] = $riskScore;
                $submissionData['risk_status'] = $riskStatus;
                $submissionData['risk_flags'] = $riskFlags
                    ? json_encode(array_values(array_unique($riskFlags)), JSON_UNESCAPED_UNICODE)
                    : null;
            }

            // Claim the assignment/job transition as part of the same
            // transaction as the submission insert. The conditional update
            // prevents two concurrent requests from creating two pending
            // submissions for the same assignment.
            if ($assignment !== null) {
                $claimed = Fluent::table('job_assignments')
                    ->where('id', '=', $assignment->id)
                    ->whereIn('status', [
                        JobAssignment::STATUS_ASSIGNED,
                        JobAssignment::STATUS_IN_PROGRESS,
                        JobAssignment::STATUS_REVISION,
                    ])
                    ->where('payment_status', '=', JobAssignment::PAYMENT_HELD)
                    ->update([
                        'status'       => JobAssignment::STATUS_SUBMITTED,
                        'submitted_at' => $now,
                        'updated_at'   => $now,
                    ]);
                if ($claimed !== 1) {
                    throw new \RuntimeException('A submission is already awaiting review or this assignment is no longer active.');
                }
            } else {
                $claimed = Fluent::table('jobs')
                    ->where('id', '=', $job->id)
                    ->where('assigned_worker_id', '=', $worker->id)
                    ->whereIn('status', [Job::STATUS_ASSIGNED, Job::STATUS_REVISION])
                    ->update([
                        'status'     => Job::STATUS_SUBMITTED,
                        'updated_at' => $now,
                    ]);
                if ($claimed !== 1) {
                    throw new \RuntimeException('A submission is already awaiting review or this job is no longer active.');
                }
            }

            $id = (int) Fluent::table('job_submissions')->insert($submissionData);
            if ($assignment !== null) {
                $this->refreshJobProgress($job->id, $now);
            }
            $this->commitWriteTransaction($db);
        } catch (\Throwable $e) {
            $this->rollbackWriteTransaction($db);
            if ($attachmentAbsolutePath !== null && is_file($attachmentAbsolutePath)) {
                @unlink($attachmentAbsolutePath);
            }
            return ['success' => false, 'message' => 'Work submission failed: ' . $e->getMessage()];
        }
        $this->notifyUser(
            $job->poster(),
            'New submission received',
            $worker->name . ' submitted work for “' . $job->title . '”.',
            'info',
            'bi-file-earmark-check',
            '/poster/jobs/' . $job->id
        );
        $this->notifyAdmins(
            'New submission needs review',
            $worker->name . ' submitted work for “' . $job->title . '”.',
            $riskStatus === JobSubmission::RISK_FLAGGED ? 'warning' : 'info',
            $riskStatus === JobSubmission::RISK_FLAGGED ? 'bi-shield-exclamation' : 'bi-file-earmark-check',
            '/admin/jobs/' . $job->id
        );
        return ['success' => true, 'submission' => JobSubmission::find($id), 'message' => 'Work submitted.'];
    }

    /**
     * Admin moderation gate for a worker submission.
     *
     * This records the review decision and, for assignment-backed jobs,
     * atomically releases the held worker payment after moderation.
     */
    public function reviewSubmission(int $submissionId, int $adminId, string $decision, ?string $note = null): array
    {
        if (!$this->isAdminId($adminId)) {
            return ['success' => false, 'message' => 'Administrator access is required.'];
        }
        $submission = JobSubmission::find($submissionId);
        if ($submission === null) return ['success' => false, 'message' => 'Submission not found.'];
        if (!$submission->isPending()) {
            return ['success' => false, 'message' => 'Submission has already been reviewed.'];
        }

        $decision = strtolower(trim($decision));
        if (!in_array($decision, ['approve', 'reject'], true)) {
            return ['success' => false, 'message' => 'Decision must be approve or reject.'];
        }
        if ($decision === 'reject' && trim((string) $note) === '') {
            return ['success' => false, 'message' => 'A rejection reason is required.'];
        }
        if ($decision === 'approve' && ($submission->risk_status ?? JobSubmission::RISK_CLEAR) === JobSubmission::RISK_CONFIRMED_FRAUD) {
            return ['success' => false, 'message' => 'Confirmed-fraud submissions must be resolved before payment approval.'];
        }

        if ($decision === 'approve' && (int) ($submission->assignment_id ?? 0) > 0) {
            return $this->releaseAssignmentPayment(
                (int) $submission->assignment_id,
                $adminId,
                (int) $submission->id,
                false,
                $note
            );
        }
        if ($decision === 'reject' && (int) ($submission->assignment_id ?? 0) > 0 && JobAssignment::isAvailable()) {
            return $this->rejectAssignmentSubmission($submissionId, $adminId, trim((string) $note));
        }

        $now = date('Y-m-d H:i:s');
        $newStatus = $decision === 'approve'
            ? JobSubmission::STATUS_APPROVED
            : JobSubmission::STATUS_REJECTED;
        $updates = [
            'status'           => $newStatus,
            'reviewed_at'      => $now,
            'reviewed_by'      => $adminId,
            'reviewer_note'    => $note,
            'rejection_reason' => $decision === 'reject' ? trim((string) $note) : null,
            'updated_at'       => $now,
        ];

        $db = Database::connect();
        try {
            $this->beginWriteTransaction($db);
            $updated = Fluent::table('job_submissions')
                ->where('id', '=', $submission->id)
                ->where('status', '=', JobSubmission::STATUS_PENDING_REVIEW)
                ->update($updates);
            if ($updated !== 1) {
                throw new \RuntimeException('Submission has already been reviewed.');
            }

            if ((int) ($submission->assignment_id ?? 0) > 0 && JobAssignment::isAvailable()) {
                Fluent::table('job_assignments')
                    ->where('id', '=', (int) $submission->assignment_id)
                    ->update([
                        'status'       => JobAssignment::STATUS_REVISION,
                        'submitted_at' => null,
                        'updated_at'   => $now,
                    ]);
            }

            if ($decision === 'reject') {
                Fluent::table('jobs')->where('id', '=', $submission->job_id)->update([
                    'status'     => Job::STATUS_REVISION,
                    'updated_at' => $now,
                ]);
            }

            $this->commitWriteTransaction($db);
        } catch (\Throwable $e) {
            $this->rollbackWriteTransaction($db);
            return ['success' => false, 'message' => 'Submission review failed: ' . $e->getMessage()];
        }

        $this->notifyUser(
            $submission->worker(),
            $decision === 'approve' ? 'Work approved' : 'Work rejected',
            $decision === 'approve'
                ? 'Your submission for “' . ($submission->job()?->title ?? 'the job') . '” was approved.'
                : 'Your submission was rejected.' . ($note ? ' Reason: ' . trim($note) : ''),
            $decision === 'approve' ? 'success' : 'warning',
            $decision === 'approve' ? 'bi-check-circle' : 'bi-exclamation-circle',
            '/jobs/' . (int) $submission->job_id
        );

        return [
            'success' => true,
            'message' => $decision === 'approve' ? 'Submission approved for payment review.' : 'Submission rejected with a reason.',
            'submission' => JobSubmission::find($submissionId),
        ];
    }

    /**
     * Reject an assignment-backed submission while claiming the job and
     * assignment state first. This keeps a stale moderation request from
     * reopening an assignment or aggregate job after cancellation/payment.
     */
    private function rejectAssignmentSubmission(int $submissionId, int $adminId, string $note): array
    {
        $db = Database::connect();
        try {
            $this->beginWriteTransaction($db);

            $identityStmt = $db->prepare('SELECT job_id, assignment_id FROM job_submissions WHERE id = :id LIMIT 1');
            $identityStmt->execute(['id' => $submissionId]);
            $identity = $identityStmt->fetch(\PDO::FETCH_ASSOC);
            if (!$identity || (int) ($identity['assignment_id'] ?? 0) <= 0) {
                throw new \RuntimeException('Submission or assignment not found.');
            }

            $jobSql = 'SELECT * FROM jobs WHERE id = :id LIMIT 1';
            $assignmentSql = 'SELECT * FROM job_assignments WHERE id = :id LIMIT 1';
            $submissionSql = 'SELECT * FROM job_submissions WHERE id = :id LIMIT 1';
            if (Database::getDriverName() !== 'sqlite') {
                $jobSql .= ' FOR UPDATE';
                $assignmentSql .= ' FOR UPDATE';
                $submissionSql .= ' FOR UPDATE';
            }
            $jobStmt = $db->prepare($jobSql);
            $jobStmt->execute(['id' => (int) $identity['job_id']]);
            $jobRow = $jobStmt->fetch(\PDO::FETCH_ASSOC);
            if (!$jobRow) throw new \RuntimeException('Job not found.');
            $job = new Job($jobRow);

            $assignmentStmt = $db->prepare($assignmentSql);
            $assignmentStmt->execute(['id' => (int) $identity['assignment_id']]);
            $assignmentRow = $assignmentStmt->fetch(\PDO::FETCH_ASSOC);
            if (!$assignmentRow || (int) $assignmentRow['job_id'] !== (int) $job->id) {
                throw new \RuntimeException('Submission or assignment no longer belongs to this job.');
            }
            $assignment = new JobAssignment($assignmentRow);
            if ($assignment->status !== JobAssignment::STATUS_SUBMITTED
                || $assignment->payment_status !== JobAssignment::PAYMENT_HELD) {
                throw new \RuntimeException('Submission or assignment has already left the review state.');
            }

            $submissionStmt = $db->prepare($submissionSql);
            $submissionStmt->execute(['id' => $submissionId]);
            $submissionRow = $submissionStmt->fetch(\PDO::FETCH_ASSOC);
            if (!$submissionRow || (string) $submissionRow['status'] !== JobSubmission::STATUS_PENDING_REVIEW) {
                throw new \RuntimeException('Submission has already been reviewed.');
            }
            $submission = new JobSubmission($submissionRow);

            $now = date('Y-m-d H:i:s');
            $updated = $db->prepare(
                'UPDATE job_submissions
                 SET status = :status,
                     reviewed_at = :reviewed_at,
                     reviewed_by = :reviewed_by,
                     reviewer_note = :reviewer_note,
                     rejection_reason = :rejection_reason,
                     updated_at = :updated_at
                 WHERE id = :id AND status = :pending'
            );
            $updated->execute([
                'status' => JobSubmission::STATUS_REJECTED,
                'reviewed_at' => $now,
                'reviewed_by' => $adminId,
                'reviewer_note' => $note,
                'rejection_reason' => $note,
                'updated_at' => $now,
                'id' => $submissionId,
                'pending' => JobSubmission::STATUS_PENDING_REVIEW,
            ]);
            if ($updated->rowCount() !== 1) throw new \RuntimeException('Submission has already been reviewed.');

            $assignmentUpdated = $db->prepare(
                'UPDATE job_assignments
                 SET status = :revision, submitted_at = NULL, updated_at = :updated_at
                 WHERE id = :id AND status = :submitted AND payment_status = :held'
            );
            $assignmentUpdated->execute([
                'revision' => JobAssignment::STATUS_REVISION,
                'updated_at' => $now,
                'id' => (int) $assignment->id,
                'submitted' => JobAssignment::STATUS_SUBMITTED,
                'held' => JobAssignment::PAYMENT_HELD,
            ]);
            if ($assignmentUpdated->rowCount() !== 1) {
                throw new \RuntimeException('Submission or assignment has already left the review state.');
            }

            $this->refreshJobProgress((int) $job->id, $now);
            $this->commitWriteTransaction($db);
        } catch (\Throwable $e) {
            $this->rollbackWriteTransaction($db);
            return ['success' => false, 'message' => 'Submission review failed: ' . $e->getMessage()];
        }

        $this->notifyUser(
            $submission->worker(),
            'Work rejected',
            'Your submission was rejected. Reason: ' . $note,
            'warning',
            'bi-exclamation-circle',
            '/jobs/' . (int) $submission->job_id
        );

        return [
            'success' => true,
            'message' => 'Submission rejected with a reason.',
            'submission' => JobSubmission::find($submissionId),
        ];
    }

    /**
     * Release one assignment's held escrow exactly once.
     *
     * The assignment row is locked inside the transaction and payment_status
     * is the idempotency boundary. A repeated approval therefore cannot credit
     * the worker or debit the poster a second time.
     */
    public function releaseAssignmentPayment(
        int $assignmentId,
        int $actorId,
        ?int $submissionId = null,
        bool $requireApprovedSubmission = true,
        ?string $reviewerNote = null
    ): array {
        if (!JobAssignment::isAvailable()) {
            return ['success' => false, 'message' => 'Multi-worker assignment storage is not available.'];
        }

        $db = Database::connect();
        try {
            $this->beginWriteTransaction($db);

            // Keep financial lock order consistent with job cancellation:
            // job -> poster -> assignment -> worker. This prevents two
            // assignments for the same poster from losing balance updates.
            $identityStmt = $db->prepare('SELECT job_id FROM job_assignments WHERE id = :id LIMIT 1');
            $identityStmt->execute(['id' => $assignmentId]);
            $identityRow = $identityStmt->fetch(\PDO::FETCH_ASSOC);
            if (!$identityRow) {
                throw new \RuntimeException('Assignment not found.');
            }

            $jobSql = 'SELECT * FROM jobs WHERE id = :id LIMIT 1';
            $posterSql = 'SELECT * FROM users WHERE id = :id LIMIT 1';
            if (Database::getDriverName() !== 'sqlite') {
                $jobSql .= ' FOR UPDATE';
                $posterSql .= ' FOR UPDATE';
            }
            $jobStmt = $db->prepare($jobSql);
            $jobStmt->execute(['id' => (int) $identityRow['job_id']]);
            $jobRow = $jobStmt->fetch(\PDO::FETCH_ASSOC);
            if (!$jobRow) throw new \RuntimeException('Job not found.');
            $job = new Job($jobRow);

            $posterStmt = $db->prepare($posterSql);
            $posterStmt->execute(['id' => (int) $job->poster_id]);
            $posterRow = $posterStmt->fetch(\PDO::FETCH_ASSOC);
            $poster = $posterRow ? new User($posterRow) : null;

            $lockSql = 'SELECT * FROM job_assignments WHERE id = :id LIMIT 1';
            if (Database::getDriverName() !== 'sqlite') $lockSql .= ' FOR UPDATE';
            $lockStmt = $db->prepare($lockSql);
            $lockStmt->execute(['id' => $assignmentId]);
            $assignmentRow = $lockStmt->fetch(\PDO::FETCH_ASSOC);
            if (!$assignmentRow) throw new \RuntimeException('Assignment not found.');
            $assignment = new JobAssignment($assignmentRow);
            $actor = User::find($actorId);
            if (!$job || !$poster) {
                throw new \RuntimeException('Assignment payment participants could not be found.');
            }
            if ((int) $poster->id !== $actorId && !($actor?->isAdmin() ?? false)) {
                throw new \RuntimeException('Only the job poster or an administrator can release assignment payment.');
            }
            if ($assignment->payment_status === JobAssignment::PAYMENT_RELEASED) {
                $this->commitWriteTransaction($db);
                return [
                    'success' => true,
                    'already_released' => true,
                    'message' => 'Assignment payment was already released.',
                    'assignment' => $assignment,
                    'submission' => $submissionId !== null
                        ? JobSubmission::find($submissionId)
                        : JobSubmission::latestForAssignment($assignmentId),
                ];
            }
            if ($assignment->payment_status !== JobAssignment::PAYMENT_HELD) {
                throw new \RuntimeException('Assignment has no held payment to release.');
            }
            if (!in_array($assignment->status, [
                JobAssignment::STATUS_SUBMITTED,
                JobAssignment::STATUS_APPROVED,
            ], true)) {
                throw new \RuntimeException('Assignment is not in a payment-review state.');
            }

            $bid = JobBid::find((int) $assignment->bid_id);
            $workerSql = 'SELECT * FROM users WHERE id = :id LIMIT 1';
            if (Database::getDriverName() !== 'sqlite') $workerSql .= ' FOR UPDATE';
            $workerStmt = $db->prepare($workerSql);
            $workerStmt->execute(['id' => (int) $assignment->worker_id]);
            $workerRow = $workerStmt->fetch(\PDO::FETCH_ASSOC);
            $worker = $workerRow ? new User($workerRow) : null;
            if (!$bid || !$worker) {
                throw new \RuntimeException('Assignment payment participants could not be found.');
            }
            if ($worker->isBanned()) {
                throw new \RuntimeException('Banned workers cannot receive assignment payments.');
            }

            $submission = null;
            if ($submissionId !== null) {
                $submission = JobSubmission::find($submissionId);
                if ($submission === null || (int) $submission->assignment_id !== $assignmentId) {
                    throw new \RuntimeException('Submission does not belong to this assignment.');
                }
            } else {
                $submission = JobSubmission::latestForAssignment($assignmentId);
            }
            if ($submission === null) {
                throw new \RuntimeException('An assignment submission is required before payment.');
            }
            if (in_array($submission->status, [JobSubmission::STATUS_REJECTED, JobSubmission::STATUS_REVISION], true)) {
                throw new \RuntimeException('Rejected or revision submissions cannot be paid.');
            }
            if (($submission->risk_status ?? JobSubmission::RISK_CLEAR) === JobSubmission::RISK_CONFIRMED_FRAUD) {
                throw new \RuntimeException('Confirmed-fraud submissions cannot be paid.');
            }
            if ($requireApprovedSubmission && $submission->status !== JobSubmission::STATUS_APPROVED) {
                throw new \RuntimeException('Submission must be approved before payment.');
            }

            $bidAmount = (float) ($assignment->payment_amount ?: $bid->amount);
            $escrowHeld = SettingService::escrowAmount($bidAmount);
            $commission = round($bidAmount * SettingService::commissionRate(), 4);
            $workerReceives = round(max(0, $bidAmount - $commission), 4);
            $excess = round(max(0, $escrowHeld - $bidAmount), 4);
            $posterFrozen = (float) ($poster->frozen_balance ?? 0);
            if ($posterFrozen + 0.00005 < $escrowHeld) {
                throw new \RuntimeException('Poster escrow balance is lower than the held assignment amount.');
            }

            $now = date('Y-m-d H:i:s');
            $workerBalance = round((float) $worker->balance + $workerReceives, 4);
            $workerLifetime = round((float) $worker->lifetime_earned + $workerReceives, 4);
            $workerPosted = round((float) ($worker->total_posted_earned ?? 0) + $workerReceives, 4);
            $posterWallet = round((float) ($poster->wallet_balance ?? 0) + $excess, 4);
            $posterFrozenAfter = round($posterFrozen - $escrowHeld, 4);
            $posterSpent = round((float) ($poster->total_spent ?? 0) + $bidAmount, 4);

            Fluent::table('users')->where('id', '=', $worker->id)->update([
                'balance'             => $workerBalance,
                'lifetime_earned'     => $workerLifetime,
                'total_posted_earned' => $workerPosted,
                'updated_at'          => $now,
            ]);
            Fluent::table('users')->where('id', '=', $poster->id)->update([
                'wallet_balance' => $posterWallet,
                'frozen_balance' => max(0, $posterFrozenAfter),
                'total_spent'    => $posterSpent,
                'updated_at'     => $now,
            ]);

            Fluent::table('job_assignments')->where('id', '=', $assignmentId)->update([
                'status'          => JobAssignment::STATUS_COMPLETED,
                'payment_status'  => JobAssignment::PAYMENT_RELEASED,
                'payment_amount'  => $bidAmount,
                'completed_at'    => $now,
                'paid_at'         => $now,
                'updated_at'      => $now,
            ]);
            $submissionUpdate = Fluent::table('job_submissions')
                ->where('id', '=', $submission->id);
            if ($submission->status === JobSubmission::STATUS_PENDING_REVIEW) {
                // Approval and rejection may have been requested from two
                // different surfaces. Only the request that still owns the
                // pending review may release the held assignment payment.
                $submissionUpdate->where('status', '=', JobSubmission::STATUS_PENDING_REVIEW);
            }
            $submissionUpdated = $submissionUpdate->update([
                'status'        => JobSubmission::STATUS_APPROVED,
                'reviewed_at'   => $submission->reviewed_at ?: $now,
                'reviewed_by'   => $submission->reviewed_by ?: $actorId,
                'reviewer_note' => $reviewerNote ?? $submission->reviewer_note,
                'updated_at'    => $now,
            ]);
            if ($submission->status === JobSubmission::STATUS_PENDING_REVIEW && $submissionUpdated !== 1) {
                throw new \RuntimeException('Submission has already been reviewed.');
            }

            self::logTransaction(
                $worker->id,
                $job->id,
                Transaction::TYPE_ESCROW_RELEASE,
                $workerReceives,
                $job->currency,
                $workerBalance,
                null,
                'assignment:' . $assignmentId,
                'Worker payment for approved assignment'
            );
            if ($commission > 0) {
                self::logTransaction(
                    null,
                    $job->id,
                    Transaction::TYPE_COMMISSION,
                    $commission,
                    $job->currency,
                    null,
                    null,
                    'assignment:' . $assignmentId,
                    'Platform commission for approved assignment'
                );
            }
            if ($excess > 0) {
                self::logTransaction(
                    $poster->id,
                    $job->id,
                    Transaction::TYPE_REFUND,
                    $excess,
                    $job->currency,
                    $posterWallet,
                    $posterFrozenAfter,
                    'assignment:' . $assignmentId,
                    'Excess assignment escrow refund'
                );
            }

            $this->refreshJobProgress($job->id, $now);
            $this->commitWriteTransaction($db);

            $this->notifyUser(
                $worker,
                'Payment released',
                'Payment for your approved work on “' . $job->title . '” has been released.',
                'success',
                'bi-wallet2',
                '/jobs/' . $job->id
            );
            $this->notifyUser(
                $poster,
                'Worker payment released',
                'Payment for “' . $job->title . '” was released to the worker.',
                'info',
                'bi-wallet2',
                '/poster/jobs/' . $job->id
            );
            if ((Job::find((int) $job->id)?->status ?? null) === Job::STATUS_COMPLETED) {
                $this->notifyAdmins(
                    'Job completed',
                    'All required workers completed “' . $job->title . '”.',
                    'success',
                    'bi-check2-all',
                    '/admin/jobs/' . $job->id
                );
            }

            return [
                'success' => true,
                'message' => 'Payment released. Worker credited ' . number_format($workerReceives, 2) . ' BDT.',
                'assignment' => JobAssignment::findForBid((int) $assignment->bid_id),
                'submission' => JobSubmission::find((int) $submission->id),
            ];
        } catch (\Throwable $e) {
            $this->rollbackWriteTransaction($db);
            return ['success' => false, 'message' => 'Assignment payment failed: ' . $e->getMessage()];
        }
    }

    private function refreshJobProgress(int $jobId, string $now): void
    {
        $job = Job::find($jobId);
        if ($job === null || !JobAssignment::isAvailable()) return;

        $stmt = Database::connect()->prepare(
            "SELECT
                SUM(CASE WHEN status <> 'cancelled' AND payment_status <> 'refunded' THEN 1 ELSE 0 END) AS total_assignments,
                SUM(CASE WHEN status = 'completed' AND payment_status = 'released' THEN 1 ELSE 0 END) AS completed_assignments,
                SUM(CASE WHEN status IN ('submitted', 'approved') AND payment_status <> 'refunded' THEN 1 ELSE 0 END) AS review_assignments,
                SUM(CASE WHEN status = 'revision' AND payment_status <> 'refunded' THEN 1 ELSE 0 END) AS revision_assignments,
                COALESCE(SUM(CASE WHEN payment_status = 'released' THEN payment_amount ELSE 0 END), 0) AS completed_amount,
                COALESCE(SUM(CASE WHEN payment_status = 'held' THEN payment_amount ELSE 0 END), 0) AS remaining_amount
             FROM job_assignments WHERE job_id = :job_id"
        );
        $stmt->execute(['job_id' => $jobId]);
        $progress = $stmt->fetch(\PDO::FETCH_ASSOC) ?: [];
        $total = (int) ($progress['total_assignments'] ?? 0);
        $completed = (int) ($progress['completed_assignments'] ?? 0);
        $required = max(1, (int) ($job->worker_count ?? 1));

        $status = $job->status;
        if ($completed >= $required) {
            $status = Job::STATUS_COMPLETED;
        } elseif ((int) ($progress['revision_assignments'] ?? 0) > 0) {
            $status = Job::STATUS_REVISION;
        } elseif ((int) ($progress['review_assignments'] ?? 0) > 0) {
            $status = Job::STATUS_SUBMITTED;
        } elseif (in_array($job->status, [
            Job::STATUS_PENDING_APPROVAL,
            Job::STATUS_DECLINED,
            Job::STATUS_COMPLETED,
            Job::STATUS_CANCELLED,
            Job::STATUS_DISPUTED,
            Job::STATUS_EXPIRED,
        ], true)) {
            // A terminal, pending, expired, or disputed aggregate must not
            // be reopened by assignment cleanup that happens afterward.
            $status = $job->status;
        } elseif ($total >= $required) {
            $status = Job::STATUS_ENGAGED;
        } else {
            // A cancelled/reassigned slot is available again when the job
            // still needs workers. Preserve the existing single-worker
            // reopen behavior while keeping mixed review states above.
            $status = Job::STATUS_OPEN;
        }

        Fluent::table('jobs')->where('id', '=', $jobId)->update([
            'status'     => $status,
            'updated_at' => $now,
        ]);
    }

    /** Poster flow: request a revision on the worker's pending submission. */
    public function requestRevision(User $poster, int $jobId, int $submissionId, string $note): array
    {
        if ($poster->isBanned()) {
            return ['success' => false, 'message' => 'Banned accounts cannot modify jobs.'];
        }
        if (!$this->canManagePosterJobs($poster)) {
            return ['success' => false, 'message' => 'Poster access is required to request revisions.'];
        }
        $job = Job::find($jobId);
        if ($job === null) return ['success' => false, 'message' => 'Job not found.'];
        if ((int) $job->poster_id !== (int) $poster->id) {
            return ['success' => false, 'message' => 'Only the poster can request a revision.'];
        }
        // A multi-worker job can have one assignment in revision while a
        // different assignment is still awaiting review. The aggregate job
        // status is then `revision`, but the pending submission remains a
        // valid target for this poster action.
        if (!in_array($job->status, [Job::STATUS_SUBMITTED, Job::STATUS_REVISION], true)) {
            return ['success' => false, 'message' => 'Job has no submission awaiting review.'];
        }
        $submission = JobSubmission::find($submissionId);
        if ($submission === null || (int) $submission->job_id !== (int) $job->id) {
            return ['success' => false, 'message' => 'Submission not found for this job.'];
        }
        if (!$submission->isPending()) {
            return ['success' => false, 'message' => 'Submission is no longer awaiting review.'];
        }
        if (trim($note) === '') return ['success' => false, 'message' => 'Revision note is required.'];
        if ((int) ($submission->assignment_id ?? 0) > 0 && JobAssignment::isAvailable()) {
            return $this->requestAssignmentRevision(
                $jobId,
                $submissionId,
                (int) $poster->id,
                trim($note)
            );
        }

        $now = date('Y-m-d H:i:s');
        $db = Database::connect();
        try {
            $this->beginWriteTransaction($db);
            $submissionUpdated = Fluent::table('job_submissions')
                ->where('id', '=', $submission->id)
                ->where('status', '=', JobSubmission::STATUS_PENDING_REVIEW)
                ->update([
                'status'        => JobSubmission::STATUS_REVISION,
                'reviewer_note' => $note,
                'reviewed_at'   => $now,
                'reviewed_by'   => $poster->id,
                'updated_at'    => $now,
            ]);
            if ($submissionUpdated !== 1) {
                throw new \RuntimeException('Submission is no longer awaiting review.');
            }
            if ((int) ($submission->assignment_id ?? 0) > 0 && JobAssignment::isAvailable()) {
                Fluent::table('job_assignments')->where('id', '=', (int) $submission->assignment_id)->update([
                    'status'        => JobAssignment::STATUS_REVISION,
                    'submitted_at'  => null,
                    'updated_at'    => $now,
                ]);
            }
            Fluent::table('jobs')->where('id', '=', $job->id)->update([
                'status'     => Job::STATUS_REVISION,
                'updated_at' => $now,
            ]);
            $this->commitWriteTransaction($db);
        } catch (\Throwable $e) {
            $this->rollbackWriteTransaction($db);
            return ['success' => false, 'message' => 'Revision request failed: ' . $e->getMessage()];
        }
        $this->notifyUser(
            $submission->worker(),
            'Revision requested',
            'A revision was requested for your submission on “' . $job->title . '”. Note: ' . trim($note),
            'warning',
            'bi-pencil-square',
            '/jobs/' . $job->id
        );
        return ['success' => true, 'message' => 'Revision requested.'];
    }

    /**
     * Request a revision for an assignment-backed submission while claiming
     * the job, assignment, and submission state in one transaction.
     */
    private function requestAssignmentRevision(int $jobId, int $submissionId, int $posterId, string $note): array
    {
        $db = Database::connect();
        try {
            $this->beginWriteTransaction($db);

            $identityStmt = $db->prepare('SELECT job_id, assignment_id FROM job_submissions WHERE id = :id LIMIT 1');
            $identityStmt->execute(['id' => $submissionId]);
            $identity = $identityStmt->fetch(\PDO::FETCH_ASSOC);
            if (!$identity || (int) ($identity['assignment_id'] ?? 0) <= 0 || (int) $identity['job_id'] !== $jobId) {
                throw new \RuntimeException('Submission or assignment not found.');
            }

            $jobSql = 'SELECT * FROM jobs WHERE id = :id LIMIT 1';
            $assignmentSql = 'SELECT * FROM job_assignments WHERE id = :id LIMIT 1';
            $submissionSql = 'SELECT * FROM job_submissions WHERE id = :id LIMIT 1';
            if (Database::getDriverName() !== 'sqlite') {
                $jobSql .= ' FOR UPDATE';
                $assignmentSql .= ' FOR UPDATE';
                $submissionSql .= ' FOR UPDATE';
            }
            $jobStmt = $db->prepare($jobSql);
            $jobStmt->execute(['id' => $jobId]);
            $jobRow = $jobStmt->fetch(\PDO::FETCH_ASSOC);
            if (!$jobRow || (int) $jobRow['poster_id'] !== $posterId) {
                throw new \RuntimeException('Only the job poster can request a revision.');
            }
            $job = new Job($jobRow);
            if (!in_array($job->status, [Job::STATUS_SUBMITTED, Job::STATUS_REVISION], true)) {
                throw new \RuntimeException('Job has no submission awaiting review.');
            }

            $assignmentStmt = $db->prepare($assignmentSql);
            $assignmentStmt->execute(['id' => (int) $identity['assignment_id']]);
            $assignmentRow = $assignmentStmt->fetch(\PDO::FETCH_ASSOC);
            if (!$assignmentRow || (int) $assignmentRow['job_id'] !== $jobId) {
                throw new \RuntimeException('Submission or assignment no longer belongs to this job.');
            }
            $assignment = new JobAssignment($assignmentRow);
            if ($assignment->status !== JobAssignment::STATUS_SUBMITTED
                || $assignment->payment_status !== JobAssignment::PAYMENT_HELD) {
                throw new \RuntimeException('Submission or assignment has already left the review state.');
            }

            $submissionStmt = $db->prepare($submissionSql);
            $submissionStmt->execute(['id' => $submissionId]);
            $submissionRow = $submissionStmt->fetch(\PDO::FETCH_ASSOC);
            if (!$submissionRow
                || (int) $submissionRow['job_id'] !== $jobId
                || (int) ($submissionRow['assignment_id'] ?? 0) !== (int) $assignment->id
                || (string) $submissionRow['status'] !== JobSubmission::STATUS_PENDING_REVIEW) {
                throw new \RuntimeException('Submission is no longer awaiting review.');
            }
            $submission = new JobSubmission($submissionRow);

            $now = date('Y-m-d H:i:s');
            $submissionUpdated = $db->prepare(
                'UPDATE job_submissions
                 SET status = :revision,
                     reviewer_note = :reviewer_note,
                     reviewed_at = :reviewed_at,
                     reviewed_by = :reviewed_by,
                     updated_at = :updated_at
                 WHERE id = :id AND status = :pending'
            );
            $submissionUpdated->execute([
                'revision' => JobSubmission::STATUS_REVISION,
                'reviewer_note' => $note,
                'reviewed_at' => $now,
                'reviewed_by' => $posterId,
                'updated_at' => $now,
                'id' => $submissionId,
                'pending' => JobSubmission::STATUS_PENDING_REVIEW,
            ]);
            if ($submissionUpdated->rowCount() !== 1) {
                throw new \RuntimeException('Submission is no longer awaiting review.');
            }

            $assignmentUpdated = $db->prepare(
                'UPDATE job_assignments
                 SET status = :revision, submitted_at = NULL, updated_at = :updated_at
                 WHERE id = :id AND status = :submitted AND payment_status = :held'
            );
            $assignmentUpdated->execute([
                'revision' => JobAssignment::STATUS_REVISION,
                'updated_at' => $now,
                'id' => (int) $assignment->id,
                'submitted' => JobAssignment::STATUS_SUBMITTED,
                'held' => JobAssignment::PAYMENT_HELD,
            ]);
            if ($assignmentUpdated->rowCount() !== 1) {
                throw new \RuntimeException('Submission or assignment has already left the review state.');
            }

            $this->refreshJobProgress($jobId, $now);
            $this->commitWriteTransaction($db);
        } catch (\Throwable $e) {
            $this->rollbackWriteTransaction($db);
            return ['success' => false, 'message' => 'Revision request failed: ' . $e->getMessage()];
        }

        $this->notifyUser(
            $submission->worker(),
            'Revision requested',
            'A revision was requested for your submission on “' . $job->title . '”. Note: ' . $note,
            'warning',
            'bi-pencil-square',
            '/jobs/' . $jobId
        );
        return ['success' => true, 'message' => 'Revision requested.'];
    }

    /**
     * Poster flow: approve a submission → release payment to worker,
     * apply platform commission, close the job.
     */
    public function releasePayment(User $poster, int $jobId, ?int $submissionId = null, ?User $adminOverride = null): array
    {
        if ($poster->isBanned() && !($adminOverride?->isAdmin() ?? false)) {
            return ['success' => false, 'message' => 'Banned accounts cannot release payments.'];
        }
        if (!$this->canManagePosterJobs($poster) && !($adminOverride?->isAdmin() ?? false)) {
            return ['success' => false, 'message' => 'Poster access is required to release payment.'];
        }
        $job = Job::find($jobId);
        if ($job === null) return ['success' => false, 'message' => 'Job not found.'];
        if ((int) $job->poster_id !== (int) $poster->id) {
            return ['success' => false, 'message' => 'Only the poster can release payment.'];
        }
        if (!in_array($job->status, [Job::STATUS_SUBMITTED, Job::STATUS_REVISION, Job::STATUS_DISPUTED], true)) {
            return ['success' => false, 'message' => 'No work to release.'];
        }

        if (JobAssignment::isAvailable()) {
            $assignment = null;
            $requestedSubmission = $submissionId !== null ? JobSubmission::find($submissionId) : null;
            if ($submissionId !== null && ($requestedSubmission === null || (int) $requestedSubmission->job_id !== (int) $job->id)) {
                return ['success' => false, 'message' => 'Submission not found for this job.'];
            }
            $requestedAssignmentId = $requestedSubmission?->assignment_id;
            foreach (JobAssignment::forJob((int) $job->id) as $candidate) {
                if ($submissionId !== null && (int) ($candidate->id ?? 0) === (int) $requestedAssignmentId) {
                    $assignment = $candidate;
                    break;
                }
                if ($submissionId === null
                    && in_array($candidate->status, [JobAssignment::STATUS_SUBMITTED, JobAssignment::STATUS_APPROVED], true)
                    && in_array($candidate->payment_status, [JobAssignment::PAYMENT_HELD, JobAssignment::PAYMENT_RELEASED], true)) {
                    $assignment = $candidate;
                    break;
                }
            }
            if ($assignment !== null) {
                return $this->releaseAssignmentPayment(
                    (int) $assignment->id,
                    (int) ($adminOverride?->id ?? $poster->id),
                    $submissionId,
                    false
                );
            }
        }

        $bid = $job->assigned_bid_id ? JobBid::find((int) $job->assigned_bid_id) : null;
        if ($bid === null) return ['success' => false, 'message' => 'No assigned bid.'];
        $worker = User::find((int) $bid->worker_id);
        if ($worker === null) return ['success' => false, 'message' => 'Worker not found.'];
        if ($worker->isBanned()) return ['success' => false, 'message' => 'Banned workers cannot receive assignment payments.'];

        $bidAmount = (float) $bid->amount;
        $escrowHeld = SettingService::escrowAmount($bidAmount);
        $commission = round($bidAmount * SettingService::commissionRate(), 4);
        $workerReceives = round($bidAmount - $commission, 4);
        // Excess from full_bid mode (if bid_amount > escrow_held) goes back to poster
        $excess = round($escrowHeld - $workerReceives - $commission, 4);

        $db = Database::connect();
        try {
            $this->beginWriteTransaction($db);

            // 1. Credit worker (balance + lifetime_earned + total_posted_earned)
            $wNewBalance = round(((float) $worker->balance) + $workerReceives, 4);
            $wNewLifetime = round(((float) $worker->lifetime_earned) + $workerReceives, 4);
            $wNewPosted   = round(((float) ($worker->total_posted_earned ?? 0)) + $workerReceives, 4);
            Fluent::table('users')
                ->where('id', '=', $worker->id)
                ->update([
                    'balance'             => $wNewBalance,
                    'lifetime_earned'     => $wNewLifetime,
                    'total_posted_earned' => $wNewPosted,
                    'updated_at'          => date('Y-m-d H:i:s'),
                ]);

            // 2. Release escrow on poster (frozen → 0)
            $pNewFrozen  = round(((float) $poster->frozen_balance) - $escrowHeld, 4);
            $pNewWallet  = round(((float) ($poster->wallet_balance ?? 0)) + $excess, 4);
            $pNewTotalSpent = round(((float) ($poster->total_spent ?? 0)) + $bidAmount, 4);
            Fluent::table('users')
                ->where('id', '=', $poster->id)
                ->update([
                    'frozen_balance' => max(0, $pNewFrozen),
                    'wallet_balance' => $pNewWallet,
                    'total_spent'    => $pNewTotalSpent,
                    'updated_at'     => date('Y-m-d H:i:s'),
                ]);

            // 3. Mark job completed
            Fluent::table('jobs')
                ->where('id', '=', $job->id)
                ->update(['status' => Job::STATUS_COMPLETED, 'updated_at' => date('Y-m-d H:i:s')]);

            // 4. Mark the submission approved (if provided)
            if ($submissionId) {
                Fluent::table('job_submissions')
                    ->where('id', '=', $submissionId)
                    ->where('job_id', '=', $job->id)
                    ->update([
                        'status'       => JobSubmission::STATUS_APPROVED,
                        'reviewed_at'  => date('Y-m-d H:i:s'),
                        'reviewed_by'  => $poster->id,
                        'updated_at'   => date('Y-m-d H:i:s'),
                    ]);
            }

            // 5. Log transactions
            self::logTransaction(
                $worker->id, $job->id, Transaction::TYPE_ESCROW_RELEASE,
                $workerReceives, $job->currency, $wNewBalance, null,
                'job:' . $job->id, 'Worker payment for completed job'
            );
            if ($commission > 0) {
                self::logTransaction(
                    null, $job->id, Transaction::TYPE_COMMISSION,
                    $commission, $job->currency, null, null,
                    'job:' . $job->id, 'Platform commission'
                );
            }
            if ($excess > 0) {
                self::logTransaction(
                    $poster->id, $job->id, Transaction::TYPE_REFUND,
                    $excess, $job->currency, $pNewWallet, null,
                    'job:' . $job->id, 'Excess escrow refund'
                );
            }

            $this->commitWriteTransaction($db);
        } catch (\Throwable $e) {
            $this->rollbackWriteTransaction($db);
            return ['success' => false, 'message' => 'Release failed: ' . $e->getMessage()];
        }

        return ['success' => true, 'message' => 'Payment released. Worker credited ' . number_format($workerReceives, 2) . ' BDT.'];
    }

    /**
     * Poster flow: cancel an open or assigned job. Refunds frozen_balance.
     */
    public function cancelJob(User $poster, int $jobId, ?string $reason = null, ?User $adminOverride = null): array
    {
        if ($poster->isBanned() && !($adminOverride?->isAdmin() ?? false)) {
            return ['success' => false, 'message' => 'Banned accounts cannot modify jobs.'];
        }
        if (!$this->canManagePosterJobs($poster) && !($adminOverride?->isAdmin() ?? false)) {
            return ['success' => false, 'message' => 'Poster access is required to cancel jobs.'];
        }
        $db = Database::connect();
        try {
            $this->beginWriteTransaction($db);

            // Re-read both mutable participants after acquiring the write
            // boundary. This prevents a stale poster/job snapshot from
            // refunding escrow after a concurrent payment release or second
            // cancellation has already claimed the job.
            $jobSql = 'SELECT * FROM jobs WHERE id = :id LIMIT 1';
            $posterSql = 'SELECT * FROM users WHERE id = :id LIMIT 1';
            if (Database::getDriverName() !== 'sqlite') {
                $jobSql .= ' FOR UPDATE';
                $posterSql .= ' FOR UPDATE';
            }
            $jobStmt = $db->prepare($jobSql);
            $jobStmt->execute(['id' => $jobId]);
            $jobRow = $jobStmt->fetch(\PDO::FETCH_ASSOC);
            if (!$jobRow) throw new \RuntimeException('Job not found.');
            $job = new Job($jobRow);
            if ((int) $job->poster_id !== (int) $poster->id) {
                throw new \RuntimeException('Only the poster can cancel.');
            }
            if (in_array($job->status, [Job::STATUS_COMPLETED, Job::STATUS_CANCELLED], true)) {
                throw new \RuntimeException('Job is already closed.');
            }

            $posterStmt = $db->prepare($posterSql);
            $posterStmt->execute(['id' => $poster->id]);
            $posterRow = $posterStmt->fetch(\PDO::FETCH_ASSOC);
            if (!$posterRow) throw new \RuntimeException('Job poster not found.');
            $poster = new User($posterRow);
            unset($jobStmt, $posterStmt);

            $now = date('Y-m-d H:i:s');
            $assignmentTableAvailable = JobAssignment::isAvailable();
            $heldAssignments = [];
            if ($assignmentTableAvailable) {
                $assignmentSql = 'SELECT * FROM job_assignments WHERE job_id = :job_id AND payment_status = :payment_status';
                if (Database::getDriverName() !== 'sqlite') $assignmentSql .= ' FOR UPDATE';
                $assignmentStmt = $db->prepare($assignmentSql);
                $assignmentStmt->execute([
                    'job_id' => $job->id,
                    'payment_status' => JobAssignment::PAYMENT_HELD,
                ]);
                $heldAssignments = $assignmentStmt->fetchAll(\PDO::FETCH_ASSOC);
            }

            // Refund only this job's escrow, not every escrow held by the poster.
            $refundTotal = 0.0;
            foreach ($heldAssignments as $heldAssignment) {
                $refundTotal += SettingService::escrowAmount((float) $heldAssignment['payment_amount']);
            }
            if ($refundTotal <= 0 && empty($heldAssignments)) {
                $assignedBid = $job->assigned_bid_id ? JobBid::find((int) $job->assigned_bid_id) : null;
                $refundTotal = $assignedBid
                    ? min(
                        (float) ($poster->frozen_balance ?? 0),
                        SettingService::escrowAmount((float) $assignedBid->amount)
                    )
                    : 0.0;
            }
            if ($refundTotal > 0) {
                $frozenBefore = (float) ($poster->frozen_balance ?? 0);
                if ($frozenBefore + 0.00005 < $refundTotal) {
                    throw new \RuntimeException('Poster escrow balance is lower than the refundable job assignments.');
                }
                $newWallet = round((float) ($poster->wallet_balance ?? 0) + $refundTotal, 4);
                $newFrozen = round($frozenBefore - $refundTotal, 4);
                Fluent::table('users')->where('id', '=', $poster->id)->update([
                    'wallet_balance' => $newWallet,
                    'frozen_balance' => max(0, $newFrozen),
                    'updated_at'     => $now,
                ]);
                foreach ($heldAssignments as $heldAssignment) {
                    Fluent::table('job_assignments')->where('id', '=', (int) $heldAssignment['id'])->update([
                        'status'         => JobAssignment::STATUS_CANCELLED,
                        'payment_status' => JobAssignment::PAYMENT_REFUNDED,
                        'updated_at'     => $now,
                    ]);
                    self::logTransaction(
                        $poster->id,
                        $job->id,
                        Transaction::TYPE_REFUND,
                        SettingService::escrowAmount((float) $heldAssignment['payment_amount']),
                        $job->currency,
                        $newWallet,
                        $newFrozen,
                        'assignment:' . (int) $heldAssignment['id'],
                        'Refund on cancel' . ($reason ? ': ' . $reason : '')
                    );
                }
                if (empty($heldAssignments)) {
                    self::logTransaction(
                        $poster->id, $job->id, Transaction::TYPE_REFUND,
                        $refundTotal, $job->currency, $newWallet, $newFrozen,
                        'job:' . $job->id, 'Refund on cancel' . ($reason ? ': ' . $reason : '')
                    );
                }
            }

            $jobUpdated = $db->prepare(
                'UPDATE jobs SET status = :cancelled, updated_at = :updated_at WHERE id = :id AND status = :current_status'
            );
            $jobUpdated->execute([
                'cancelled' => Job::STATUS_CANCELLED,
                'updated_at' => $now,
                'id' => $job->id,
                'current_status' => $job->status,
            ]);
            if ($jobUpdated->rowCount() !== 1) throw new \RuntimeException('Job is already closed.');
            // Mark any pending bids as rejected
            Fluent::table('job_bids')
                ->where('job_id', '=', $job->id)
                ->where('status', '=', JobBid::STATUS_PENDING)
                ->update([
                    'status'     => JobBid::STATUS_REJECTED,
                    'decided_at' => $now,
                    'decided_by' => $poster->id,
                    'updated_at' => $now,
                ]);

            $this->commitWriteTransaction($db);
        } catch (\Throwable $e) {
            $this->rollbackWriteTransaction($db);
            return ['success' => false, 'message' => 'Cancel failed: ' . $e->getMessage()];
        }

        $this->notifyUser(
            $poster,
            'Job cancelled',
            'Your job “' . $job->title . '” was cancelled and eligible escrow was refunded.',
            'warning',
            'bi-x-circle',
            '/poster/jobs/' . $job->id
        );
        $this->notifyAdmins(
            'Job cancelled',
            'Job “' . $job->title . '” was cancelled by its poster.',
            'info',
            'bi-x-circle',
            '/admin/jobs/' . $job->id
        );

        return ['success' => true, 'message' => 'Job cancelled.'];
    }

    /**
     * Notify affected users about jobs whose deadline falls within the next
     * window. The event key makes this safe to run from a minute/hourly
     * scheduler without creating duplicate unread notifications.
     */
    public function notifyUpcomingDeadlines(int $windowHours = 24, ?string $now = null): int
    {
        $now = $now ?: date('Y-m-d H:i:s');
        $until = date('Y-m-d H:i:s', strtotime($now) + (max(1, $windowHours) * 3600));
        $statuses = [
            Job::STATUS_OPEN,
            Job::STATUS_IN_REVIEW,
            Job::STATUS_ENGAGED,
            Job::STATUS_ASSIGNED,
            Job::STATUS_SUBMITTED,
            Job::STATUS_REVISION,
            Job::STATUS_DISPUTED,
        ];
        $jobs = Fluent::table('jobs')
            ->whereIn('status', $statuses)
            ->where('deadline_at', '>=', $now)
            ->where('deadline_at', '<=', $until)
            ->orderBy('deadline_at', 'asc')
            ->get();

        $notified = 0;
        foreach ($jobs as $row) {
            $job = new Job((array) $row);
            $deadline = strtotime((string) $job->deadline_at);
            if ($deadline === false) continue;
            $hoursLeft = max(1, (int) ceil(($deadline - strtotime($now)) / 3600));
            $eventKey = 'job-deadline:' . (int) $job->id . ':' . date('Y-m-d', $deadline);
            $message = '“' . $job->title . '” is due in approximately ' . $hoursLeft . ' hour(s) (' . $job->deadline_at . ').';

            NotificationService::sendOnce(
                $job->poster(),
                'Job deadline approaching',
                $message,
                $eventKey . ':poster',
                'warning',
                'bi-alarm',
                '/poster/jobs/' . $job->id,
                24
            );
            foreach (JobAssignment::forJob((int) $job->id) as $assignment) {
                if (!$assignment->isActive()) continue;
                NotificationService::sendOnce(
                    $assignment->worker(),
                    'Job deadline approaching',
                    $message,
                    $eventKey . ':worker:' . (int) $assignment->worker_id,
                    'warning',
                    'bi-alarm',
                    '/jobs/' . $job->id,
                    24
                );
            }
            NotificationService::sendToAdmins(
                'Job deadline approaching',
                $message,
                'warning',
                'bi-alarm',
                '/admin/jobs/' . $job->id,
                $eventKey . ':admin',
                true
            );
            $notified++;
        }

        return $notified;
    }

    private function notifyUser(
        ?User $user,
        string $title,
        string $message,
        string $tone = 'info',
        string $icon = 'bi-bell',
        ?string $actionUrl = null
    ): void {
        NotificationService::send($user, $title, $message, $tone, $icon, $actionUrl);
    }

    /**
     * Start a write transaction that serializes SQLite marketplace decisions.
     * Deferred SQLite transactions let two readers reach the same capacity
     * check and then both fail while upgrading to a writer. IMMEDIATE makes
     * one request own the write boundary up front, so the next request can
     * re-check state and return a normal capacity/idempotency response.
     */
    private function beginWriteTransaction(\PDO $db): void
    {
        Database::beginWriteTransaction($db);
    }

    private function commitWriteTransaction(\PDO $db): void
    {
        Database::commitWriteTransaction($db);
    }

    private function rollbackWriteTransaction(\PDO $db): void
    {
        Database::rollbackWriteTransaction($db);
    }

    private function canManagePosterJobs(User $user): bool
    {
        return $user->isAdmin() || $user->isPoster();
    }

    private function isAdminId(int $userId): bool
    {
        $user = User::find($userId);
        return $user !== null && $user->isAdmin();
    }

    private function notifyAdmins(
        string $title,
        string $message,
        string $tone = 'info',
        string $icon = 'bi-bell',
        ?string $actionUrl = null
    ): void {
        NotificationService::sendToAdmins($title, $message, $tone, $icon, $actionUrl);
    }

    /**
     * Notify eligible workers when any admin flow publishes a job.
     *
     * This is intentionally public so AdminJobController can use the same
     * notification behavior for immediate admin publication and later draft
     * activation as the normal approval workflow.
     */
    public function notifyWorkersAboutNewJob(Job $job): void
    {
        try {
            foreach (Fluent::table('users')->where('is_banned', '=', 0)->get() as $row) {
                if ((int) ($row['is_admin'] ?? 0) === 1) continue;
                $role = strtolower(trim((string) ($row['role'] ?? '')));
                if ($role !== '' && $role !== 'worker') continue;
                $this->notifyUser(
                    User::find((int) $row['id']),
                    'New job available',
                    'A new job, “' . $job->title . '”, is now available for applications.',
                    'info',
                    'bi-briefcase',
                    '/jobs/' . $job->id
                );
            }
        } catch (\Throwable) {
            // A worker notification failure must not undo job approval.
        }
    }

    /**
     * Insert a transactions ledger row.
     */
    public static function logTransaction(int|string|null $userId, int|string|null $jobId, string $type, float $amount, string $currency, ?float $balanceAfter, ?float $frozenAfter, ?string $reference, ?string $note): int
    {
        return (int) Fluent::table('transactions')->insert([
            'user_id'       => $userId === null ? null : (int) $userId,
            'job_id'        => $jobId === null ? null : (int) $jobId,
            'type'          => $type,
            'amount'        => round($amount, 4),
            'currency'      => $currency,
            'balance_after' => $balanceAfter,
            'frozen_after'  => $frozenAfter,
            'reference'     => $reference,
            'note'          => $note,
            'created_at'    => date('Y-m-d H:i:s'),
        ]);
    }

    /**
     * Generate a unique URL-safe slug from a title.
     */
    private static function makeUniqueSlug(string $title): string
    {
        $base = strtolower(trim($title));
        $base = preg_replace('/[^a-z0-9]+/i', '-', $base);
        $base = trim($base, '-');
        $base = substr($base, 0, 160) ?: 'job';
        $slug = $base;
        $i = 1;
        while (Job::findBySlug($slug) !== null) {
            $i++;
            $slug = $base . '-' . $i;
            if ($i > 50) { $slug = $base . '-' . substr(md5((string) microtime(true)), 0, 6); break; }
        }
        return $slug;
    }
}
