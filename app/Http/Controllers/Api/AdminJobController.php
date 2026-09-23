<?php
declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Models\Job;
use App\Models\JobAssignment;
use App\Models\JobBid;
use App\Models\JobSubmission;
use App\Models\Category;
use App\Models\Subcategory;
use App\Models\User;
use App\Services\JobService;
use App\Services\SettingService;
use Nemesis\Core\Controller;
use Nemesis\Core\Database;
use Nemesis\Core\Fluent;
use Nemesis\Http\Request;
use Nemesis\Http\Response;

/** Admin-created job posts and protected job detail management. */
class AdminJobController extends Controller
{
    public function __construct(private JobService $jobService = new JobService()) {}

    public function store(Request $request): Response
    {
        if ($guard = $this->adminGuard($request)) return $guard;
        $admin = $request->getMeta('auth.user');
        $body = $this->readJson($request);
        $error = $this->validateJobInput($body, true);
        if ($error !== null) return Response::json(['success' => false, 'message' => $error], 422);

        $proof = $this->normalizeProofRequirements($body['proof_requirements'] ?? []);
        $deadline = $this->dateValue($body['deadline_at'] ?? null) ?: date('Y-m-d H:i:s', time() + 7 * 86400);
        $result = $this->jobService->createWorkflowJob(
            $admin,
            (int) $body['category_id'],
            isset($body['subcategory_id']) && (int) $body['subcategory_id'] > 0 ? (int) $body['subcategory_id'] : null,
            trim((string) $body['title']),
            trim((string) $body['description']),
            $proof,
            (int) $body['worker_count'],
            (float) $body['cost_per_worker'],
            $deadline,
            trim((string) ($body['subtitle'] ?? '')) ?: null,
            trim((string) ($body['customer_name'] ?? '')) ?: $admin->name,
            trim((string) ($body['customer_phone'] ?? '')) ?: ($admin->phone ?? null),
            trim((string) ($body['customer_email'] ?? '')) ?: $admin->email
        );
        if (!($result['success'] ?? false)) return Response::json($result, 422);

        $jobId = (int) $result['job']->id;
        $publish = $this->truthy($body['publish'] ?? false);
        $metadata = [
            'requirements' => trim((string) ($body['requirements'] ?? '')) ?: null,
            'subtitle' => trim((string) ($body['subtitle'] ?? '')) ?: null,
            'customer_name' => trim((string) ($body['customer_name'] ?? '')) ?: $admin->name,
            'customer_phone' => trim((string) ($body['customer_phone'] ?? '')) ?: ($admin->phone ?? null),
            'customer_email' => trim((string) ($body['customer_email'] ?? '')) ?: $admin->email,
            'admin_notes' => trim((string) ($body['admin_notes'] ?? '')) ?: null,
            'created_by_admin_id' => (int) $admin->id,
            'status' => $publish ? Job::STATUS_OPEN : Job::STATUS_PENDING_APPROVAL,
            'updated_at' => date('Y-m-d H:i:s'),
        ];
        Fluent::table('jobs')->where('id', '=', $jobId)->update($metadata);
        if ($publish) {
            $publishedJob = Job::find($jobId);
            if ($publishedJob !== null) {
                $this->jobService->notifyWorkersAboutNewJob($publishedJob);
            }
        }
        $this->audit($admin, 'job.create', $jobId, ['publish' => $publish]);

        return Response::json([
            'success' => true,
            'message' => $publish ? 'Admin job created and activated.' : 'Admin job saved for review.',
            'data' => $this->detailPayload($jobId),
        ], 201);
    }

    public function show(Request $request, int $id): Response
    {
        if ($guard = $this->adminGuard($request)) return $guard;
        if (Job::find($id) === null) return Response::json(['success' => false, 'message' => 'Job not found.'], 404);
        return Response::json(['success' => true, 'data' => $this->detailPayload($id)]);
    }

    public function update(Request $request, int $id): Response
    {
        if ($guard = $this->adminGuard($request)) return $guard;
        $admin = $request->getMeta('auth.user');
        $job = Job::find($id);
        if ($job === null) return Response::json(['success' => false, 'message' => 'Job not found.'], 404);
        $body = $this->readJson($request);
        $error = $this->validateJobInput($body, false);
        if ($error !== null) return Response::json(['success' => false, 'message' => $error], 422);

        if (array_key_exists('category_id', $body) || array_key_exists('subcategory_id', $body)) {
            $categoryId = array_key_exists('category_id', $body)
                ? (int) $body['category_id']
                : (int) ($job->category_id ?? 0);
            $subcategoryId = array_key_exists('subcategory_id', $body)
                ? ((int) $body['subcategory_id'] > 0 ? (int) $body['subcategory_id'] : null)
                : (array_key_exists('category_id', $body)
                    ? null
                    : ((int) ($job->subcategory_id ?? 0) > 0 ? (int) $job->subcategory_id : null));
            $classificationError = $this->validateClassification($categoryId, $subcategoryId);
            if ($classificationError !== null) {
                return Response::json(['success' => false, 'message' => $classificationError], 422);
            }
        }

        $assignedCount = $this->activeAssignmentCount($id);
        $workerCount = array_key_exists('worker_count', $body) ? (int) $body['worker_count'] : (int) ($job->worker_count ?: 1);
        $costPerWorker = array_key_exists('cost_per_worker', $body) ? (float) $body['cost_per_worker'] : (float) ($job->cost_per_worker ?: $job->budget);
        if ($assignedCount > 0 && ($workerCount !== (int) ($job->worker_count ?: 1) || abs($costPerWorker - (float) ($job->cost_per_worker ?: $job->budget)) > 0.00001)) {
            return Response::json(['success' => false, 'message' => 'Worker count and payment cannot change after assignments exist.'], 422);
        }
        if ($workerCount < $assignedCount) {
            return Response::json(['success' => false, 'message' => 'Worker count cannot be lower than current assignments.'], 422);
        }

        $update = [];
        foreach (['title', 'subtitle', 'description', 'requirements', 'customer_name', 'customer_phone', 'customer_email', 'admin_notes'] as $field) {
            if (array_key_exists($field, $body)) $update[$field] = trim((string) ($body[$field] ?? '')) ?: null;
        }
        foreach (['category_id', 'subcategory_id'] as $field) {
            if (array_key_exists($field, $body)) $update[$field] = (int) $body[$field] > 0 ? (int) $body[$field] : null;
        }
        if (array_key_exists('proof_requirements', $body)) {
            $update['proof_requirements'] = json_encode($this->normalizeProofRequirements($body['proof_requirements']), JSON_UNESCAPED_UNICODE);
        }
        if (array_key_exists('deadline_at', $body)) {
            $deadline = $this->dateValue($body['deadline_at']);
            $update['deadline_at'] = $deadline;
            $update['bidding_closes_at'] = $deadline;
        }
        if (array_key_exists('worker_count', $body) || array_key_exists('cost_per_worker', $body)) {
            $feePercent = (float) ($job->system_fee_percent ?: SettingService::get('job_system_fee_percentage', 30.00));
            $budget = round($workerCount * $costPerWorker, 4);
            $fee = round($budget * $feePercent / 100, 4);
            $update += [
                'worker_count' => $workerCount,
                'cost_per_worker' => $costPerWorker,
                'budget' => $budget,
                'system_fee_percent' => $feePercent,
                'system_fee_amount' => $fee,
                'total_payable_amount' => round($budget + $fee, 4),
            ];
        }
        if (array_key_exists('category_id', $body) && !array_key_exists('subcategory_id', $body)) {
            $currentSubcategory = (int) ($job->subcategory_id ?? 0);
            if ($currentSubcategory > 0 && $this->validateClassification((int) $body['category_id'], $currentSubcategory) !== null) {
                $update['subcategory_id'] = null;
            }
        }
        if (array_key_exists('publish', $body)) {
            $update['status'] = $this->truthy($body['publish']) ? Job::STATUS_OPEN : Job::STATUS_PENDING_APPROVAL;
        } elseif (isset($body['status']) && in_array((string) $body['status'], [Job::STATUS_PENDING_APPROVAL, Job::STATUS_OPEN, Job::STATUS_DECLINED], true)) {
            $update['status'] = (string) $body['status'];
        }
        if (!$update) return Response::json(['success' => true, 'message' => 'No changes supplied.', 'data' => $this->detailPayload($id)]);

        $update['updated_at'] = date('Y-m-d H:i:s');
        $db = Database::connect();
        try {
            Database::beginWriteTransaction($db);
            $jobSql = 'SELECT * FROM jobs WHERE id = :id LIMIT 1';
            if (Database::getDriverName() !== 'sqlite') $jobSql .= ' FOR UPDATE';
            $jobStmt = $db->prepare($jobSql);
            $jobStmt->execute(['id' => $id]);
            $jobRow = $jobStmt->fetch(\PDO::FETCH_ASSOC);
            if (!$jobRow) throw new \RuntimeException('Job not found.');
            $lockedJob = new Job($jobRow);
            $assignmentStorageAvailable = JobAssignment::isAvailable();
            $lockedAssignedCount = $assignmentStorageAvailable
                ? $this->lockedActiveAssignmentCount($db, $id)
                : (((int) ($lockedJob->assigned_worker_id ?? 0) > 0 || (int) ($lockedJob->assigned_bid_id ?? 0) > 0) ? 1 : 0);
            $lockedWorkerCount = array_key_exists('worker_count', $body)
                ? (int) $body['worker_count']
                : (int) ($lockedJob->worker_count ?: 1);
            $lockedCostPerWorker = array_key_exists('cost_per_worker', $body)
                ? (float) $body['cost_per_worker']
                : (float) ($lockedJob->cost_per_worker ?: $lockedJob->budget);
            if ($lockedAssignedCount > 0
                && ($lockedWorkerCount !== (int) ($lockedJob->worker_count ?: 1)
                    || abs($lockedCostPerWorker - (float) ($lockedJob->cost_per_worker ?: $lockedJob->budget)) > 0.00001)) {
                throw new \RuntimeException('Worker count and payment cannot change after assignments exist.');
            }
            if ($lockedWorkerCount < $lockedAssignedCount) {
                throw new \RuntimeException('Worker count cannot be lower than current assignments.');
            }
            if (array_key_exists('status', $update)
                && (string) $update['status'] !== (string) $lockedJob->status) {
                if (in_array((string) $lockedJob->status, [Job::STATUS_COMPLETED, Job::STATUS_CANCELLED, Job::STATUS_DISPUTED], true)) {
                    throw new \RuntimeException('Closed jobs cannot be republished or reopened.');
                }
                if ($lockedAssignedCount > 0) {
                    throw new \RuntimeException('Job status cannot change after assignments exist.');
                }
            }
            if (array_key_exists('category_id', $body) || array_key_exists('subcategory_id', $body)) {
                $lockedCategoryId = array_key_exists('category_id', $body)
                    ? (int) $body['category_id']
                    : (int) ($lockedJob->category_id ?? 0);
                $lockedSubcategoryId = array_key_exists('subcategory_id', $body)
                    ? ((int) $body['subcategory_id'] > 0 ? (int) $body['subcategory_id'] : null)
                    : (array_key_exists('category_id', $body)
                        ? null
                        : ((int) ($lockedJob->subcategory_id ?? 0) > 0 ? (int) $lockedJob->subcategory_id : null));
                $lockedClassificationError = $this->validateClassification($lockedCategoryId, $lockedSubcategoryId);
                if ($lockedClassificationError !== null) {
                    throw new \RuntimeException($lockedClassificationError);
                }
            }
            Fluent::table('jobs')->where('id', '=', $id)->update($update);
            Database::commitWriteTransaction($db);
        } catch (\Throwable $e) {
            Database::rollbackWriteTransaction($db);
            $message = $e->getMessage();
            $knownMessages = [
                'Job not found.',
                'Worker count and payment cannot change after assignments exist.',
                'Worker count cannot be lower than current assignments.',
                'Closed jobs cannot be republished or reopened.',
                'Job status cannot change after assignments exist.',
            ];
            $status = in_array($message, $knownMessages, true) || str_contains($message, 'category') || str_contains($message, 'subcategory')
                ? ($message === 'Job not found.' ? 404 : 422)
                : 500;
            return Response::json([
                'success' => false,
                'message' => $status === 500 ? 'Job update failed.' : $message,
            ], $status);
        }
        $this->audit($admin, 'job.update', $id, ['fields' => array_keys($update)]);
        if (($update['status'] ?? null) === Job::STATUS_OPEN && $job->status !== Job::STATUS_OPEN) {
            $publishedJob = Job::find($id);
            if ($publishedJob !== null) {
                $this->jobService->notifyWorkersAboutNewJob($publishedJob);
            }
        }
        return Response::json(['success' => true, 'message' => 'Job updated.', 'data' => $this->detailPayload($id)]);
    }

    public function delete(Request $request, int $id): Response
    {
        if ($guard = $this->adminGuard($request)) return $guard;
        $admin = $request->getMeta('auth.user');
        $db = Database::connect();
        try {
            Database::beginWriteTransaction($db);

            $jobSql = 'SELECT * FROM jobs WHERE id = :id LIMIT 1';
            if (Database::getDriverName() !== 'sqlite') $jobSql .= ' FOR UPDATE';
            $jobStmt = $db->prepare($jobSql);
            $jobStmt->execute(['id' => $id]);
            $jobRow = $jobStmt->fetch(\PDO::FETCH_ASSOC);
            if (!$jobRow) throw new \RuntimeException('Job not found.');
            $job = new Job($jobRow);
            if (in_array((string) $job->status, [Job::STATUS_COMPLETED, Job::STATUS_DISPUTED], true)) {
                throw new \RuntimeException('Assigned or closed jobs cannot be deleted; cancel or resolve them first.');
            }

            $assignmentStorageAvailable = JobAssignment::isAvailable();
            if (!$assignmentStorageAvailable
                && ((int) ($job->assigned_worker_id ?? 0) > 0 || (int) ($job->assigned_bid_id ?? 0) > 0)) {
                throw new \RuntimeException('Assigned or closed jobs cannot be deleted; cancel or resolve them first.');
            }
            if ($assignmentStorageAvailable) {
                $assignmentSql = 'SELECT status, payment_status FROM job_assignments WHERE job_id = :job_id';
                if (Database::getDriverName() !== 'sqlite') $assignmentSql .= ' FOR UPDATE';
                $assignmentStmt = $db->prepare($assignmentSql);
                $assignmentStmt->execute(['job_id' => $id]);
                foreach ($assignmentStmt->fetchAll(\PDO::FETCH_ASSOC) as $assignmentRow) {
                    if ($assignmentRow['status'] !== JobAssignment::STATUS_CANCELLED
                        && $assignmentRow['payment_status'] !== JobAssignment::PAYMENT_REFUNDED) {
                        throw new \RuntimeException('Assigned or closed jobs cannot be deleted; cancel or resolve them first.');
                    }
                }
            }

            Fluent::table('job_submissions')->where('job_id', '=', $id)->delete();
            if ($assignmentStorageAvailable) {
                Fluent::table('job_assignments')->where('job_id', '=', $id)->delete();
            }
            Fluent::table('job_bids')->where('job_id', '=', $id)->delete();
            Fluent::table('jobs')->where('id', '=', $id)->delete();
            $this->audit($admin, 'job.delete', $id, ['title' => $job->title]);
            Database::commitWriteTransaction($db);
        } catch (\Throwable $e) {
            Database::rollbackWriteTransaction($db);
            $message = $e->getMessage();
            $status = $message === 'Job not found.' ? 404 : ($message === 'Assigned or closed jobs cannot be deleted; cancel or resolve them first.' ? 422 : 500);
            return Response::json([
                'success' => false,
                'message' => $status === 500 ? 'Job deletion failed.' : $message,
            ], $status);
        }
        return Response::json(['success' => true, 'message' => 'Job deleted.', 'data' => ['id' => $id]]);
    }

    public function cancelAssignment(Request $request, int $id): Response
    {
        if ($guard = $this->adminGuard($request)) return $guard;
        $admin = $request->getMeta('auth.user');
        $body = $this->readJson($request);
        $reason = trim((string) ($body['reason'] ?? 'Cancelled by administrator'));
        if ($reason === '') return Response::json(['success' => false, 'message' => 'A cancellation reason is required.'], 422);

        $result = $this->jobService->cancelAssignment($id, (int) $admin->id, $reason, 'admin');
        if (!($result['success'] ?? false)) return Response::json($result, 422);
        $assignment = $result['assignment'] ?? null;
        $jobId = $assignment ? (int) $assignment->job_id : 0;
        $this->audit($admin, 'assignment.cancel', $jobId, [
            'assignment_id' => $id,
            'reason' => $reason,
        ]);
        return Response::json([
            'success' => true,
            'message' => $result['message'],
            'data' => $jobId > 0 ? $this->detailPayload($jobId) : ['assignment_id' => $id],
        ]);
    }

    public function reassignAssignment(Request $request, int $id): Response
    {
        if ($guard = $this->adminGuard($request)) return $guard;
        $admin = $request->getMeta('auth.user');
        $body = $this->readJson($request);
        $bidId = (int) ($body['bid_id'] ?? 0);
        if ($bidId <= 0) return Response::json(['success' => false, 'message' => 'A pending bid is required for reassignment.'], 422);

        $assignment = JobAssignment::find($id);
        if ($assignment === null) return Response::json(['success' => false, 'message' => 'Assignment not found.'], 404);
        $jobId = (int) $assignment->job_id;
        $replacementBid = JobBid::find($bidId);
        if ($replacementBid === null || (int) $replacementBid->job_id !== $jobId || !$replacementBid->isPending()) {
            return Response::json(['success' => false, 'message' => 'Replacement bid must be a pending bid for the same job.'], 422);
        }
        $reason = trim((string) ($body['reason'] ?? 'Reassigned by administrator'));
        $result = $this->jobService->reassignAssignment($id, $bidId, (int) $admin->id, $reason);
        if (!($result['success'] ?? false)) return Response::json($result, 422);
        $this->audit($admin, 'assignment.reassign', $jobId, [
            'assignment_id' => $id,
            'replacement_bid_id' => $bidId,
            'reason' => $reason,
        ]);
        return Response::json([
            'success' => true,
            'message' => $result['message'],
            'data' => $this->detailPayload($jobId),
        ]);
    }

    private function detailPayload(int $id): array
    {
        $job = Job::find($id);
        if ($job === null) return [];
        $assignments = [];
        foreach (JobAssignment::forJob($id) as $assignment) {
            $worker = $assignment->worker();
            $latest = JobSubmission::latestForAssignment((int) $assignment->id);
            $assignments[] = [
                'id' => (int) $assignment->id,
                'bid_id' => (int) $assignment->bid_id,
                'worker_id' => (int) $assignment->worker_id,
                'status' => $assignment->status,
                'payment_status' => $assignment->payment_status,
                'payment_amount' => (float) $assignment->payment_amount,
                'assigned_at' => $assignment->assigned_at,
                'submitted_at' => $assignment->submitted_at,
                'completed_at' => $assignment->completed_at,
                'worker' => $worker ? [
                    'id' => (int) $worker->id,
                    'name' => $worker->name,
                    'username' => $worker->username,
                    'phone' => $worker->phone ?? null,
                    'email' => $worker->email,
                    'is_banned' => $worker->isBanned(),
                ] : null,
                'latest_submission_id' => $latest ? (int) $latest->id : null,
                'latest_submission_status' => $latest?->status,
            ];
        }
        $submissions = [];
        foreach (JobSubmission::forJob($id) as $submission) {
            $worker = $submission->worker();
            $submissions[] = [
                'id' => (int) $submission->id,
                'assignment_id' => $submission->assignment_id ? (int) $submission->assignment_id : null,
                'worker_id' => (int) $submission->worker_id,
                'status' => $submission->status,
                'description' => $submission->description,
                'external_link' => $submission->external_link,
                'attachment_url' => $submission->attachment_path ? '/api/jobs/submissions/' . (int) $submission->id . '/attachment' : null,
                'attempt_number' => (int) ($submission->attempt_number ?: 1),
                'submitted_at' => $submission->submitted_at ?: $submission->created_at,
                'reviewed_at' => $submission->reviewed_at,
                'reviewer_note' => $submission->reviewer_note,
                'rejection_reason' => $submission->rejection_reason,
                'risk_score' => (float) ($submission->risk_score ?? 0),
                'risk_status' => $submission->risk_status ?? 'clear',
                'risk_flags' => is_string($submission->risk_flags ?? null)
                    ? (json_decode((string) $submission->risk_flags, true) ?: [])
                    : ((array) ($submission->risk_flags ?? [])),
                'worker' => $worker ? [
                    'id' => (int) $worker->id,
                    'name' => $worker->name,
                    'phone' => $worker->phone ?? null,
                    'email' => $worker->email,
                    'is_banned' => $worker->isBanned(),
                ] : null,
            ];
        }
        $bids = [];
        foreach (JobBid::forJob($id) as $bid) {
            $worker = $bid->worker();
            $bids[] = [
                'id' => (int) $bid->id,
                'worker_id' => (int) $bid->worker_id,
                'amount' => (float) $bid->amount,
                'currency' => $bid->currency,
                'proposal' => $bid->proposal,
                'status' => $bid->status,
                'created_at' => $bid->created_at,
                'worker' => $worker ? [
                    'id' => (int) $worker->id,
                    'name' => $worker->name,
                    'email' => $worker->email,
                    'phone' => $worker->phone ?? null,
                    'is_banned' => $worker->isBanned(),
                ] : null,
            ];
        }
        $customerName = $job->customer_name ?: ($job->poster()?->name ?? null);
        return [
            'job' => [
                'id' => (int) $job->id,
                'title' => $job->title,
                'subtitle' => $job->subtitle ?? null,
                'description' => $job->description,
                'requirements' => $job->requirements,
                'proof_requirements' => is_string($job->proof_requirements ?? null) ? (json_decode($job->proof_requirements, true) ?: []) : ((array) ($job->proof_requirements ?? [])),
                'status' => $job->status,
                'category_id' => $job->category_id ? (int) $job->category_id : null,
                'subcategory_id' => $job->subcategory_id ? (int) $job->subcategory_id : null,
                'customer_name' => $customerName,
                'customer_phone' => $job->customer_phone ?? ($job->poster()?->phone ?? null),
                'customer_email' => $job->customer_email ?? ($job->poster()?->email ?? null),
                'budget' => (float) $job->budget,
                'currency' => $job->currency,
                'worker_count' => (int) ($job->worker_count ?: 1),
                'cost_per_worker' => (float) ($job->cost_per_worker ?: $job->budget),
                'total_payable_amount' => (float) ($job->total_payable_amount ?: $job->budget),
                'deadline_at' => $job->deadline_at,
                'created_at' => $job->created_at,
                'updated_at' => $job->updated_at,
                'admin_notes' => $job->admin_notes ?? null,
                'created_by_admin_id' => $job->created_by_admin_id ? (int) $job->created_by_admin_id : null,
            ],
            'assignments' => $assignments,
            'bids' => $bids,
            'submissions' => $submissions,
            'progress' => $this->progress($job, $assignments),
        ];
    }

    private function adminGuard(Request $request): ?Response
    {
        $admin = $request->getMeta('auth.user');
        if ($admin === null) {
            return Response::json([
                'success' => false,
                'message' => 'Authentication required.',
            ], 401);
        }
        if (method_exists($admin, 'isBanned') && $admin->isBanned()) {
            return Response::json([
                'success' => false,
                'message' => 'This account is banned.',
                'error' => 'banned',
            ], 403);
        }
        if (!$admin->isAdmin()) {
            return Response::json([
                'success' => false,
                'message' => 'Administrator access required.',
                'error' => 'forbidden',
            ], 403);
        }
        return null;
    }

    private function progress(Job $job, array $assignments): array
    {
        $assigned = 0; $active = 0; $inProgress = 0; $pendingReview = 0;
        $revision = 0; $cancelled = 0; $completed = 0; $rejected = 0;
        $completedAmount = 0.0; $pendingAmount = 0.0;

        foreach ($assignments as $assignment) {
            $status = (string) ($assignment["status"] ?? "");
            $paymentStatus = (string) ($assignment["payment_status"] ?? "");
            $submissionStatus = (string) ($assignment["latest_submission_status"] ?? "");
            $amount = (float) ($assignment["payment_amount"] ?? 0);
            if ($status === JobAssignment::STATUS_CANCELLED || $paymentStatus === JobAssignment::PAYMENT_REFUNDED) {
                $cancelled++;
                continue;
            }
            $assigned++;
            if ($paymentStatus === JobAssignment::PAYMENT_RELEASED && $status === JobAssignment::STATUS_COMPLETED) {
                $completed++;
                $completedAmount += $amount;
                continue;
            }
            $active++;
            $pendingAmount += $amount;
            if ($submissionStatus === JobSubmission::STATUS_PENDING_REVIEW || $status === JobAssignment::STATUS_SUBMITTED) {
                $pendingReview++;
            } elseif ($submissionStatus === JobSubmission::STATUS_REVISION || $status === JobAssignment::STATUS_REVISION) {
                $revision++;
            } elseif ($submissionStatus === JobSubmission::STATUS_REJECTED) {
                $rejected++;
            } else {
                $inProgress++;
            }
        }

        $total = (int) ($job->worker_count ?: 1);
        // Assignment amounts represent worker compensation. Keep the
        // platform fee visible separately so a completed job does not appear
        // to have an unexplained balance remaining.
        $workerBudget = (float) ($job->budget ?: $job->total_payable_amount);
        $totalPayable = (float) ($job->total_payable_amount ?: $job->budget);
        return [
            "total_workers" => $total,
            "assigned_workers" => $assigned,
            "in_progress_workers" => $inProgress,
            "active_workers_count" => $active,
            "pending_review_workers" => $pendingReview,
            "revision_workers" => $revision,
            "cancelled_workers" => $cancelled,
            "completed_workers" => $completed,
            "pending_workers" => $pendingReview,
            "rejected_workers" => $rejected,
            "remaining_workers" => max(0, $total - $assigned),
            "total_amount" => $workerBudget,
            "total_payable_amount" => $totalPayable,
            "completed_amount" => round($completedAmount, 4),
            "pending_amount" => round($pendingAmount, 4),
            "remaining_amount" => max(0, round($workerBudget - $completedAmount - $pendingAmount, 4)),
        ];
    }

    private function activeAssignmentCount(int $jobId): int
    {
        $count = 0;
        foreach (JobAssignment::forJob($jobId) as $assignment) {
            if ($assignment->status !== JobAssignment::STATUS_CANCELLED && $assignment->payment_status !== JobAssignment::PAYMENT_REFUNDED) $count++;
        }
        return $count;
    }

    private function lockedActiveAssignmentCount(\PDO $db, int $jobId): int
    {
        $sql = 'SELECT status, payment_status FROM job_assignments WHERE job_id = :job_id';
        if (Database::getDriverName() !== 'sqlite') $sql .= ' FOR UPDATE';
        $stmt = $db->prepare($sql);
        $stmt->execute(['job_id' => $jobId]);
        $count = 0;
        foreach ($stmt->fetchAll(\PDO::FETCH_ASSOC) as $row) {
            if ($row['status'] !== JobAssignment::STATUS_CANCELLED
                && $row['payment_status'] !== JobAssignment::PAYMENT_REFUNDED) {
                $count++;
            }
        }
        return $count;
    }

    private function validateJobInput(array $body, bool $required): ?string
    {
        foreach (['category_id', 'title', 'description', 'worker_count', 'cost_per_worker'] as $field) {
            if ($required && (!array_key_exists($field, $body) || trim((string) $body[$field]) === '')) return $field . ' is required.';
        }
        if (isset($body['category_id']) && (int) $body['category_id'] <= 0) return 'category_id is invalid.';
        if (isset($body['title']) && (trim((string) $body['title']) === '' || mb_strlen((string) $body['title']) > 160)) return 'title must be 1-160 characters.';
        if (isset($body['worker_count']) && ((int) $body['worker_count'] < 1 || (int) $body['worker_count'] > 100000)) return 'worker_count is invalid.';
        if (isset($body['cost_per_worker']) && (float) $body['cost_per_worker'] <= 0) return 'cost_per_worker must be positive.';
        if (isset($body['customer_email']) && trim((string) $body['customer_email']) !== '' && filter_var($body['customer_email'], FILTER_VALIDATE_EMAIL) === false) return 'customer_email is invalid.';
        if (isset($body['deadline_at']) && trim((string) $body['deadline_at']) !== '' && strtotime((string) $body['deadline_at']) === false) return 'deadline_at is invalid.';
        return null;
    }

    private function validateClassification(int $categoryId, ?int $subcategoryId): ?string
    {
        $category = Category::find($categoryId);
        if ($category === null || !$category->isActive()) {
            return 'category_id must refer to an active category.';
        }
        if ($subcategoryId === null) return null;

        $subcategory = Subcategory::find($subcategoryId);
        if ($subcategory === null || !$subcategory->isActive() || (int) $subcategory->category_id !== $categoryId) {
            return 'subcategory_id must refer to an active subcategory of the selected category.';
        }
        return null;
    }

    private function normalizeProofRequirements(mixed $requirements): array
    {
        if (is_string($requirements)) $requirements = json_decode($requirements, true) ?: [];
        $out = [];
        foreach ((array) $requirements as $requirement) {
            if (!is_array($requirement)) continue;
            $type = ($requirement['type'] ?? 'text') === 'screenshot' ? 'screenshot' : 'text';
            $title = trim((string) ($requirement['title'] ?? ($type === 'screenshot' ? 'Screenshot proof' : 'Written proof')));
            if ($title !== '') $out[] = ['title' => mb_substr($title, 0, 160), 'type' => $type];
        }
        return $out;
    }

    private function dateValue(mixed $value): ?string
    {
        $value = trim((string) ($value ?? ''));
        return $value === '' ? null : date('Y-m-d H:i:s', (int) strtotime($value));
    }

    private function truthy(mixed $value): bool
    {
        return in_array(strtolower(trim((string) $value)), ['1', 'true', 'yes', 'on'], true) || $value === true;
    }

    private function audit(User $admin, string $action, int $jobId, array $details): void
    {
        try {
            Fluent::table('admin_action_logs')->insert([
                'admin_id' => (int) $admin->id,
                'action' => $action,
                'entity_type' => 'job',
                'entity_id' => $jobId,
                'details' => json_encode($details, JSON_UNESCAPED_UNICODE),
                'created_at' => date('Y-m-d H:i:s'),
            ]);
        } catch (\Throwable $e) {
            // Audit storage is additive; it must not break the job workflow.
        }
    }

    private function readJson(Request $request): array
    {
        $body = file_get_contents('php://input');
        if ($body !== false && $body !== '') {
            $data = json_decode($body, true);
            if (is_array($data)) return $data;
        }
        return $request->all();
    }
}
