<?php
declare(strict_types=1);

namespace App\Http\Controllers\Api;

use Nemesis\Core\Controller;
use Nemesis\Http\Request;
use Nemesis\Http\Response;
use App\Models\Job;
use App\Models\JobBid;
use App\Models\JobAssignment;
use App\Models\JobSubmission;
use App\Models\User;
use App\Services\JobService;

/**
 * PosterController — poster-side job endpoints.
 *
 *   POST /api/poster/jobs              — post a new job
 *   GET  /api/poster/jobs              — my posted jobs
 *   GET  /api/poster/jobs/{id}/bids    — bids on a specific job
 *   POST /api/poster/jobs/{id}/accept-bid — accept a bid
 *   POST /api/poster/jobs/{id}/request-revision — request changes to a submission
 *   POST /api/poster/jobs/{id}/release    — release payment (approve submission)
 *   POST /api/poster/jobs/{id}/cancel     — cancel the job
 *   GET  /api/poster/stats             — poster dashboard stats
 */
class PosterController extends Controller
{
    public function __construct(
        private JobService $jobService = new JobService()
    ) {}

    public function stats(Request $request): Response
    {
        if ($guard = $this->posterGuard($request)) return $guard;
        $user = $request->getMeta('auth.user');
        $jobs = Job::postedBy((int) $user->id, 200);
        $counts = [
            'total'     => count($jobs),
            'open'      => 0, 'in_review' => 0, 'assigned' => 0, 'submitted' => 0,
            'revision'  => 0, 'completed' => 0, 'cancelled' => 0, 'expired' => 0, 'disputed' => 0,
        ];
        foreach ($jobs as $j) {
            if (isset($counts[$j->status])) $counts[$j->status]++;
        }
        return Response::json([
            'success' => true,
            'data'    => [
                'counts'         => $counts,
                'wallet_balance' => (float) ($user->wallet_balance ?? 0),
                'frozen_balance' => (float) ($user->frozen_balance ?? 0),
                'total_spent'    => (float) ($user->total_spent ?? 0),
            ],
        ]);
    }

    public function createJob(Request $request): Response
    {
        if ($guard = $this->posterGuard($request)) return $guard;
        $user = $request->getMeta('auth.user');
        $body = (array) $this->readJson($request);
        $categoryId     = (int)    ($body['category_id'] ?? 0);
        $title          = (string) ($body['title'] ?? '');
        $subtitle       = trim((string) ($body['subtitle'] ?? ''));
        $description    = (string) ($body['description'] ?? '');
        $requirements   = isset($body['requirements']) ? (string) $body['requirements'] : null;
        $subcategoryId  = isset($body['subcategory_id']) ? (int) $body['subcategory_id'] : null;
        $proofReqs      = isset($body['proof_requirements']) ? (array) $body['proof_requirements'] : [];
        $workerCount    = isset($body['worker_count']) ? (int) $body['worker_count'] : 1;
        $costPerWorker  = isset($body['cost_per_worker']) ? (float) $body['cost_per_worker'] : 0;
        $budget         = isset($body['budget']) ? (float) $body['budget'] : 0;
        $deadlineAt     = !empty($body['deadline_at']) ? (string) $body['deadline_at'] : null;
        $windowHours    = isset($body['bidding_window_hours']) ? (int) $body['bidding_window_hours'] : null;

        if ($categoryId <= 0 || $title === '' || $description === '') {
            return Response::json(['success' => false, 'message' => 'category_id, title, and description are required.'], 422);
        }

        if ($workerCount > 0 && $costPerWorker > 0) {
            $deadline = $deadlineAt ?? date('Y-m-d H:i:s', time() + 7 * 86400);
            $result = $this->jobService->createWorkflowJob(
                $user, $categoryId, $subcategoryId, $title, $description,
                $proofReqs, $workerCount, $costPerWorker, $deadline,
                $subtitle, $user->name, $user->phone ?? null, $user->email
            );
        } else {
            if ($budget <= 0) {
                return Response::json(['success' => false, 'message' => 'budget is required.'], 422);
            }
            $result = $this->jobService->create($user, $categoryId, $title, $description, $requirements, $budget, $deadlineAt, $windowHours);
            if (($result['success'] ?? false) && $subtitle !== '') {
                try {
                    \Nemesis\Core\Fluent::table('jobs')->where('id', '=', $result['job']->id)->update([
                        'subtitle' => $subtitle,
                        'customer_name' => $user->name,
                        'customer_phone' => $user->phone ?? null,
                        'customer_email' => $user->email,
                        'updated_at' => date('Y-m-d H:i:s'),
                    ]);
                } catch (\Throwable $e) {}
            }
        }

        if (!$result['success']) return Response::json($result, 422);
        return Response::json(['success' => true, 'message' => $result['message'], 'data' => $result['job']]);
    }

    public function myJobs(Request $request): Response
    {
        if ($guard = $this->posterGuard($request)) return $guard;
        $user = $request->getMeta('auth.user');
        $jobs = Job::postedBy((int) $user->id, 100);
        return Response::json(['success' => true, 'data' => array_map(fn($job) => $this->serializeJob($job), $jobs)]);
    }

    public function jobBids(Request $request, int $id): Response
    {
        if ($guard = $this->posterGuard($request)) return $guard;
        $user = $request->getMeta('auth.user');
        $job = Job::find($id);
        if ($job === null) return Response::json(['success' => false, 'message' => 'Job not found.'], 404);
        if ((int) $job->poster_id !== (int) $user->id) {
            return Response::json(['success' => false, 'message' => 'Not your job.'], 403);
        }
        $bids = JobBid::forJob($id);
        $submissions = JobSubmission::forJob($id);
        return Response::json([
            'success' => true,
            'data'    => [
                'job'         => $this->serializeJob($job),
                'bids'        => array_map(fn($bid) => $this->serializeBid($bid), $bids),
                'submissions' => array_map(fn($submission) => $this->serializeSubmission($submission), $submissions),
            ],
        ]);
    }

    public function acceptBid(Request $request, int $id): Response
    {
        if ($guard = $this->posterGuard($request)) return $guard;
        $user = $request->getMeta('auth.user');
        $body = (array) $this->readJson($request);
        $bidId = (int) ($body['bid_id'] ?? 0);
        if ($bidId <= 0) return Response::json(['success' => false, 'message' => 'bid_id is required.'], 422);
        $bid = JobBid::find($bidId);
        if ($bid === null || (int) $bid->job_id !== $id) {
            return Response::json(['success' => false, 'message' => 'Bid not found for this job.'], 422);
        }
        $result = $this->jobService->acceptBid($user, $bidId);
        if (!$result['success']) return Response::json($result, 422);
        return Response::json(['success' => true, 'message' => $result['message']]);
    }

    public function requestRevision(Request $request, int $id): Response
    {
        if ($guard = $this->posterGuard($request)) return $guard;
        $user = $request->getMeta('auth.user');
        $body = (array) $this->readJson($request);
        $submissionId = (int) ($body['submission_id'] ?? 0);
        $note = trim((string) ($body['note'] ?? ''));
        if ($submissionId <= 0 || $note === '') {
            return Response::json(['success' => false, 'message' => 'submission_id and note are required.'], 422);
        }
        $result = $this->jobService->requestRevision($user, $id, $submissionId, $note);
        if (!$result['success']) return Response::json($result, 422);
        return Response::json(['success' => true, 'message' => $result['message']]);
    }

    public function releasePayment(Request $request, int $id): Response
    {
        if ($guard = $this->posterGuard($request)) return $guard;
        $user = $request->getMeta('auth.user');
        $body = (array) $this->readJson($request);
        $submissionId = isset($body['submission_id']) ? (int) $body['submission_id'] : null;
        $result = $this->jobService->releasePayment($user, $id, $submissionId);
        if (!$result['success']) return Response::json($result, 422);
        return Response::json(['success' => true, 'message' => $result['message']]);
    }

    public function cancelJob(Request $request, int $id): Response
    {
        if ($guard = $this->posterGuard($request)) return $guard;
        $user = $request->getMeta('auth.user');
        $body = (array) $this->readJson($request);
        $reason = isset($body['reason']) ? (string) $body['reason'] : null;
        $result = $this->jobService->cancelJob($user, $id, $reason);
        if (!$result['success']) return Response::json($result, 422);
        return Response::json(['success' => true, 'message' => $result['message']]);
    }

    private function posterGuard(Request $request): ?Response
    {
        $user = $request->getMeta('auth.user');
        if ($user === null) {
            return Response::json([
                'success' => false,
                'message' => 'Authentication required.',
            ], 401);
        }
        if (!$user->isAdmin() && !$user->isPoster()) {
            return Response::json([
                'success' => false,
                'message' => 'Poster access required.',
                'error' => 'forbidden',
            ], 403);
        }
        if ($user->isBanned()) {
            return Response::json([
                'success' => false,
                'message' => 'This account is banned.',
                'error' => 'banned',
            ], 403);
        }
        return null;
    }

    private function serializeJob(Job $job): array
    {
        $now = time();
        $workerCount = (int) ($job->worker_count ?: 1);
        $bidCount    = (int) ($job->bid_count ?: 0);
        [$assignedWorkers, $activeWorkers, $completedWorkers, $remainingTasks, $inProgressWorkers, $pendingReviewWorkers, $revisionWorkers, $rejectedWorkers, $cancelledWorkers] = $this->workerSummary($job, $workerCount);

        $deadlineStr = $job->deadline_at ?: $job->bidding_closes_at;
        $daysRemaining = 'No deadline';
        if ($deadlineStr) {
            $target = strtotime($deadlineStr);
            $diff = $target - $now;
            if ($diff <= 0) {
                $daysRemaining = 'Expired';
            } else {
                $days = (int) ceil($diff / 86400);
                $daysRemaining = $days === 1 ? '1 day remaining' : "{$days} days remaining";
            }
        }

        return [
            'id'                   => (int) $job->id,
            'title'                => $job->title,
            'subtitle'             => $job->subtitle ?? null,
            'description'          => $job->description,
            'customer_name'        => $job->customer_name ?? null,
            'customer_phone'       => $job->customer_phone ?? null,
            'customer_email'       => $job->customer_email ?? null,
            'requirements'         => $job->requirements,
            'budget'               => (float) $job->budget,
            'currency'             => $job->currency,
            'category_id'          => (int) $job->category_id,
            'status'               => $job->status,
            'bid_count'            => $bidCount,
            'view_count'           => (int) $job->view_count,
            'deadline_at'          => $job->deadline_at,
            'bidding_closes_at'    => $job->bidding_closes_at,
            'worker_count'         => $workerCount,
            'cost_per_worker'      => (float) ($job->cost_per_worker ?: 0),
            'total_payable_amount' => (float) ($job->total_payable_amount ?: $job->budget),
            'proof_requirements'   => $job->proof_requirements ? json_decode((string) $job->proof_requirements, true) : [],
            'decline_reason'       => $job->decline_reason,
            'days_remaining'       => $daysRemaining,
            'active_workers_count' => $activeWorkers,
            'assigned_workers_count' => $assignedWorkers,
            'in_progress_workers' => $inProgressWorkers,
            'completed_workers_count' => $completedWorkers,
            'pending_review_workers' => $pendingReviewWorkers,
            'revision_workers' => $revisionWorkers,
            'rejected_workers' => $rejectedWorkers,
            'cancelled_workers' => $cancelledWorkers,
            'remaining_tasks_count'=> $remainingTasks,
            'assigned_worker_id'   => $job->assigned_worker_id ? (int) $job->assigned_worker_id : null,
            'created_at'           => $job->created_at,
            'updated_at'           => $job->updated_at,
        ];
    }

    /**
     * Count worker capacity from assignment rows instead of total bids.
     * Legacy jobs fall back to accepted bids and the old assigned-worker
     * pointer while additive assignment storage is being rolled out.
     *
     * @return array{0:int,1:int,2:int,3:int}
     */
    private function workerSummary(Job $job, int $workerCount): array
    {
        $assignedWorkers = 0; $completedWorkers = 0; $activeWorkers = 0;
        $inProgressWorkers = 0; $pendingReviewWorkers = 0; $revisionWorkers = 0;
        $rejectedWorkers = 0; $cancelledWorkers = 0;
        $assignments = JobAssignment::forJob((int) $job->id);

        foreach ($assignments as $assignment) {
            $status = (string) ($assignment->status ?? "");
            $paymentStatus = (string) ($assignment->payment_status ?? "");
            $submission = JobSubmission::latestForAssignment((int) $assignment->id);
            $submissionStatus = (string) ($submission?->status ?? "");
            if ($status === JobAssignment::STATUS_CANCELLED || $paymentStatus === JobAssignment::PAYMENT_REFUNDED) {
                $cancelledWorkers++;
                continue;
            }
            $assignedWorkers++;
            if ($status === JobAssignment::STATUS_COMPLETED && $paymentStatus === JobAssignment::PAYMENT_RELEASED) {
                $completedWorkers++;
                continue;
            }
            $activeWorkers++;
            if ($submissionStatus === JobSubmission::STATUS_PENDING_REVIEW || $status === JobAssignment::STATUS_SUBMITTED) {
                $pendingReviewWorkers++;
            } elseif ($submissionStatus === JobSubmission::STATUS_REVISION || $status === JobAssignment::STATUS_REVISION) {
                $revisionWorkers++;
            } elseif ($submissionStatus === JobSubmission::STATUS_REJECTED) {
                $rejectedWorkers++;
            } else {
                $inProgressWorkers++;
            }
        }

        if ($assignedWorkers === 0) {
            foreach (JobBid::forJob((int) $job->id) as $bid) {
                if ($bid->status === JobBid::STATUS_ACCEPTED) $assignedWorkers++;
            }
            if ($assignedWorkers === 0
                && (int) ($job->assigned_worker_id ?? 0) > 0
                && in_array($job->status, [Job::STATUS_ASSIGNED, Job::STATUS_SUBMITTED, Job::STATUS_REVISION], true)) {
                $assignedWorkers = 1;
            }
            $activeWorkers = max(0, $assignedWorkers - $completedWorkers);
            $inProgressWorkers = $activeWorkers;
        }

        return [
            $assignedWorkers,
            $activeWorkers,
            $completedWorkers,
            max(0, $workerCount - $assignedWorkers),
            $inProgressWorkers,
            $pendingReviewWorkers,
            $revisionWorkers,
            $rejectedWorkers,
            $cancelledWorkers,
        ];
    }

    private function serializeBid(JobBid $bid): array
    {
        $worker = $bid->worker();
        return [
            'id'            => (int) $bid->id,
            'job_id'        => (int) $bid->job_id,
            'worker_id'     => (int) $bid->worker_id,
            'amount'        => (float) $bid->amount,
            'currency'      => $bid->currency,
            'delivery_days' => (int) $bid->delivery_days,
            'proposal'      => $bid->proposal,
            'status'        => $bid->status,
            'created_at'    => $bid->created_at,
            'worker'        => $worker ? [
                'id'       => (int) $worker->id,
                'name'     => $worker->name,
                'email'    => $worker->email,
                'username' => $worker->username,
                'rating'   => (float) ($worker->rating ?? 0),
            ] : null,
        ];
    }

    private function serializeSubmission(JobSubmission $submission): array
    {
        $worker = $submission->worker();
        return [
            'id'            => (int) $submission->id,
            'job_id'        => (int) $submission->job_id,
            'worker_id'     => (int) $submission->worker_id,
            'bid_id'        => (int) $submission->bid_id,
            'description'   => $submission->description,
            'external_link' => $submission->external_link,
            'status'        => $submission->status,
            'reviewer_note' => $submission->reviewer_note,
            'created_at'    => $submission->created_at,
            'reviewed_at'   => $submission->reviewed_at,
            'worker'        => $worker ? [
                'id'   => (int) $worker->id,
                'name' => $worker->name,
            ] : null,
        ];
    }

    private function readJson(Request $request): array
    {
        $body = file_get_contents('php://input');
        if ($body !== false && $body !== '') {
            $data = json_decode($body, true);
            if (is_array($data)) {
                return $data;
            }
        }
        return $request->all();
    }
}
