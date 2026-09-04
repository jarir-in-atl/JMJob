<?php
declare(strict_types=1);

namespace App\Services;

use App\Models\Job;
use App\Models\JobBid;
use App\Models\JobSubmission;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Category;
use Nemesis\Core\Fluent;
use Nemesis\Core\Database;
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
     * Poster flow: validate + create a new job.
     * Returns ['success' => bool, 'job' => Job|null, 'message' => string].
     */
    public function create(User $poster, int $categoryId, string $title, string $description, ?string $requirements, float $budget, ?string $deadlineAt = null, ?int $biddingWindowHours = null): array
    {
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
        $windowHours = $biddingWindowHours ?? (int) SettingService::get('ad_bidding_window_hours', 72);
        $biddingClosesAt = date('Y-m-d H:i:s', time() + $windowHours * 3600);
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
        $job = Job::find($jobId);
        if ($job === null) return ['success' => false, 'message' => 'Job not found.'];
        if (!$job->isOpen()) return ['success' => false, 'message' => 'Job is not open for bids.'];
        if ($job->bidding_closes_at && strtotime($job->bidding_closes_at) < time()) {
            return ['success' => false, 'message' => 'Bidding window has closed.'];
        }
        if (JobBid::findForWorker($jobId, (int) $worker->id) !== null) {
            return ['success' => false, 'message' => 'You have already bid on this job.'];
        }
        if ($amount <= 0) return ['success' => false, 'message' => 'Bid amount must be positive.'];
        if (trim($proposal) === '') return ['success' => false, 'message' => 'Proposal is required.'];
        if ($deliveryDays < 1 || $deliveryDays > 365) {
            return ['success' => false, 'message' => 'Delivery days must be 1-365.'];
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
        // Increment bid_count on the job
        Fluent::table('jobs')
            ->where('id', '=', $jobId)
            ->update(['bid_count' => (int) $job->bid_count + 1, 'updated_at' => date('Y-m-d H:i:s')]);
        return ['success' => true, 'bid' => JobBid::find($id), 'message' => 'Bid placed.'];
    }

    /**
     * Worker flow: withdraw a still-pending bid.
     */
    public function withdrawBid(User $worker, int $bidId): array
    {
        $bid = JobBid::find($bidId);
        if ($bid === null) return ['success' => false, 'message' => 'Bid not found.'];
        if ((int) $bid->worker_id !== (int) $worker->id) return ['success' => false, 'message' => 'Not your bid.'];
        if (!$bid->isPending()) return ['success' => false, 'message' => 'Bid is no longer pending.'];

        Fluent::table('job_bids')
            ->where('id', '=', $bidId)
            ->update(['status' => JobBid::STATUS_WITHDRAWN, 'updated_at' => date('Y-m-d H:i:s')]);
        return ['success' => true, 'message' => 'Bid withdrawn.'];
    }

    /**
     * Poster flow: accept a bid. Atomically:
     *   1. Reject all other pending bids on the same job
     *   2. Mark this bid accepted
     *   3. Move the bid amount (× escrow % setting) from poster.wallet_balance
     *      to poster.frozen_balance
     *   4. Set job.assigned_bid_id, assigned_worker_id, status='assigned'
     *   5. Log a transactions row (type=escrow_hold)
     */
    public function acceptBid(User $poster, int $bidId): array
    {
        $bid = JobBid::find($bidId);
        if ($bid === null) return ['success' => false, 'message' => 'Bid not found.'];
        $job = Job::find((int) $bid->job_id);
        if ($job === null) return ['success' => false, 'message' => 'Job not found.'];
        if ((int) $job->poster_id !== (int) $poster->id) {
            return ['success' => false, 'message' => 'Only the poster can accept a bid.'];
        }
        if (!$job->isOpen()) return ['success' => false, 'message' => 'Job is not open.'];
        if (!$bid->isPending()) return ['success' => false, 'message' => 'Bid is not pending.'];

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
            $db->beginTransaction();

            // 1. Reject other pending bids on the same job
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
            // 2. Mark this bid accepted
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
            Fluent::table('jobs')
                ->where('id', '=', $job->id)
                ->update([
                    'status'             => Job::STATUS_ASSIGNED,
                    'assigned_bid_id'    => $bid->id,
                    'assigned_worker_id' => $bid->worker_id,
                    'updated_at'         => date('Y-m-d H:i:s'),
                ]);
            // 5. Log the escrow hold
            self::logTransaction(
                $poster->id, $job->id, Transaction::TYPE_ESCROW_HOLD,
                $escrowAmount, $job->currency, $newWallet, $newFrozen,
                'bid:' . $bid->id, 'Escrow held for accepted bid'
            );

            $db->commit();
        } catch (\Throwable $e) {
            $db->rollBack();
            return ['success' => false, 'message' => 'Accept failed: ' . $e->getMessage()];
        }

        return ['success' => true, 'job' => Job::find($job->id), 'message' => 'Bid accepted.'];
    }

    /**
     * Worker flow: submit completed work for the assigned job.
     * Validates: worker is the assigned worker and job is in assigned or revision state.
     */
    public function submitWork(User $worker, int $jobId, ?string $description, ?string $externalLink): array
    {
        $job = Job::find($jobId);
        if ($job === null) return ['success' => false, 'message' => 'Job not found.'];
        if ((int) $job->assigned_worker_id !== (int) $worker->id) {
            return ['success' => false, 'message' => 'You are not the assigned worker for this job.'];
        }
        if (!in_array($job->status, [Job::STATUS_ASSIGNED, Job::STATUS_REVISION], true)) {
            return ['success' => false, 'message' => 'Job is not in a submittable state.'];
        }
        $bid = $job->assigned_bid_id ? JobBid::find((int) $job->assigned_bid_id) : null;
        if ($bid === null) return ['success' => false, 'message' => 'Job has no assigned bid.'];

        $id = (int) Fluent::table('job_submissions')->insert([
            'job_id'         => $job->id,
            'worker_id'      => $worker->id,
            'bid_id'         => $bid->id,
            'description'    => $description,
            'external_link'  => $externalLink,
            'status'         => JobSubmission::STATUS_PENDING_REVIEW,
            'created_at'     => date('Y-m-d H:i:s'),
        ]);
        Fluent::table('jobs')
            ->where('id', '=', $job->id)
            ->update(['status' => Job::STATUS_SUBMITTED, 'updated_at' => date('Y-m-d H:i:s')]);
        return ['success' => true, 'submission' => JobSubmission::find($id), 'message' => 'Work submitted.'];
    }

    /** Poster flow: request a revision on the worker's pending submission. */
    public function requestRevision(User $poster, int $jobId, int $submissionId, string $note): array
    {
        $job = Job::find($jobId);
        if ($job === null) return ['success' => false, 'message' => 'Job not found.'];
        if ((int) $job->poster_id !== (int) $poster->id) {
            return ['success' => false, 'message' => 'Only the poster can request a revision.'];
        }
        if ($job->status !== Job::STATUS_SUBMITTED) {
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

        $now = date('Y-m-d H:i:s');
        $db = Database::connect();
        try {
            $db->beginTransaction();
            Fluent::table('job_submissions')->where('id', '=', $submission->id)->update([
                'status'        => JobSubmission::STATUS_REVISION,
                'reviewer_note' => $note,
                'reviewed_at'   => $now,
                'reviewed_by'   => $poster->id,
                'updated_at'    => $now,
            ]);
            Fluent::table('jobs')->where('id', '=', $job->id)->update([
                'status'     => Job::STATUS_REVISION,
                'updated_at' => $now,
            ]);
            $db->commit();
        } catch (\Throwable $e) {
            $db->rollBack();
            return ['success' => false, 'message' => 'Revision request failed: ' . $e->getMessage()];
        }
        return ['success' => true, 'message' => 'Revision requested.'];
    }

    /**
     * Poster flow: approve a submission → release payment to worker,
     * apply platform commission, close the job.
     */
    public function releasePayment(User $poster, int $jobId, ?int $submissionId = null): array
    {
        $job = Job::find($jobId);
        if ($job === null) return ['success' => false, 'message' => 'Job not found.'];
        if ((int) $job->poster_id !== (int) $poster->id) {
            return ['success' => false, 'message' => 'Only the poster can release payment.'];
        }
        if (!in_array($job->status, [Job::STATUS_SUBMITTED, Job::STATUS_DISPUTED], true)) {
            return ['success' => false, 'message' => 'No work to release.'];
        }
        $bid = $job->assigned_bid_id ? JobBid::find((int) $job->assigned_bid_id) : null;
        if ($bid === null) return ['success' => false, 'message' => 'No assigned bid.'];
        $worker = User::find((int) $bid->worker_id);
        if ($worker === null) return ['success' => false, 'message' => 'Worker not found.'];

        $bidAmount = (float) $bid->amount;
        $escrowHeld = SettingService::escrowAmount($bidAmount);
        $commission = round($bidAmount * SettingService::commissionRate(), 4);
        $workerReceives = round($bidAmount - $commission, 4);
        // Excess from full_bid mode (if bid_amount > escrow_held) goes back to poster
        $excess = round($escrowHeld - $workerReceives - $commission, 4);

        $db = Database::connect();
        try {
            $db->beginTransaction();

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

            $db->commit();
        } catch (\Throwable $e) {
            $db->rollBack();
            return ['success' => false, 'message' => 'Release failed: ' . $e->getMessage()];
        }

        return ['success' => true, 'message' => 'Payment released. Worker credited ' . number_format($workerReceives, 2) . ' BDT.'];
    }

    /**
     * Poster flow: cancel an open or assigned job. Refunds frozen_balance.
     */
    public function cancelJob(User $poster, int $jobId, ?string $reason = null): array
    {
        $job = Job::find($jobId);
        if ($job === null) return ['success' => false, 'message' => 'Job not found.'];
        if ((int) $job->poster_id !== (int) $poster->id) {
            return ['success' => false, 'message' => 'Only the poster can cancel.'];
        }
        if (in_array($job->status, [Job::STATUS_COMPLETED, Job::STATUS_CANCELLED], true)) {
            return ['success' => false, 'message' => 'Job is already closed.'];
        }

        $db = Database::connect();
        try {
            $db->beginTransaction();

            // Refund only this job's escrow, not every escrow held by the poster.
            $assignedBid = $job->assigned_bid_id ? JobBid::find((int) $job->assigned_bid_id) : null;
            $frozen = $assignedBid
                ? min(
                    (float) $poster->frozen_balance,
                    SettingService::escrowAmount((float) $assignedBid->amount)
                )
                : 0.0;
            if ($frozen > 0) {
                $newWallet = round(((float) ($poster->wallet_balance ?? 0)) + $frozen, 4);
                Fluent::table('users')
                    ->where('id', '=', $poster->id)
                    ->update([
                        'wallet_balance' => $newWallet,
                        'frozen_balance' => 0,
                        'updated_at'     => date('Y-m-d H:i:s'),
                    ]);
                self::logTransaction(
                    $poster->id, $job->id, Transaction::TYPE_REFUND,
                    $frozen, $job->currency, $newWallet, 0,
                    'job:' . $job->id, 'Refund on cancel' . ($reason ? ': ' . $reason : '')
                );
            }

            Fluent::table('jobs')
                ->where('id', '=', $job->id)
                ->update(['status' => Job::STATUS_CANCELLED, 'updated_at' => date('Y-m-d H:i:s')]);
            // Mark any pending bids as rejected
            Fluent::table('job_bids')
                ->where('job_id', '=', $job->id)
                ->where('status', '=', JobBid::STATUS_PENDING)
                ->update([
                    'status'     => JobBid::STATUS_REJECTED,
                    'decided_at' => date('Y-m-d H:i:s'),
                    'decided_by' => $poster->id,
                    'updated_at' => date('Y-m-d H:i:s'),
                ]);

            $db->commit();
        } catch (\Throwable $e) {
            $db->rollBack();
            return ['success' => false, 'message' => 'Cancel failed: ' . $e->getMessage()];
        }

        return ['success' => true, 'message' => 'Job cancelled.'];
    }

    /**
     * Insert a transactions ledger row.
     */
    public static function logTransaction(?int $userId, ?int $jobId, string $type, float $amount, string $currency, ?float $balanceAfter, ?float $frozenAfter, ?string $reference, ?string $note): int
    {
        return (int) Fluent::table('transactions')->insert([
            'user_id'       => $userId,
            'job_id'        => $jobId,
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
