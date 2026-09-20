<?php
declare(strict_types=1);

namespace App\Http\Controllers\Api;

use Nemesis\Core\Controller;
use Nemesis\Core\Fluent;
use Nemesis\Http\Request;
use Nemesis\Http\Response;
use App\Models\Job;
use App\Models\JobBid;
use App\Models\JobAssignment;
use App\Models\JobSubmission;
use App\Models\Category;
use App\Models\User;
use App\Services\JobService;
use App\Services\SettingService;

/**
 * JobController — worker-facing job endpoints.
 *
 *   GET    /api/jobs                  — browse available jobs (filters + pagination)
 *   GET    /api/jobs/{id}             — job detail (with bids list)
 *   POST   /api/jobs/{id}/bid         — place a bid
 *   GET    /api/worker/bids           — my bids
 *   DELETE /api/bids/{id}             — withdraw a bid
 *   GET    /api/worker/active-jobs   — jobs I'm working on
 *   POST   /api/jobs/{id}/submit      — submit work
 *   GET    /api/worker/submissions    — submission history
 *   GET    /api/categories            — list active categories
 */
class JobController extends Controller
{
    public function __construct(
        private JobService $jobService = new JobService()
    ) {}

    // -------------------------------------------------------------------
    // Browse
    // -------------------------------------------------------------------

    public function index(Request $request): Response
    {
        if ($guard = $this->bannedGuard($request->getMeta('auth.user'))) return $guard;
        $categoryId = $request->query('category_id') !== null ? (int) $request->query('category_id') : null;
        $search     = trim((string) ($request->query('search') ?? ''));
        if (mb_strlen($search) > 80) {
            return Response::json(['success' => false, 'message' => 'Search text must be 80 characters or fewer.'], 422);
        }

        $page = max(1, min(1000000, (int) ($request->query('page') ?? 1)));
        $perPage = (int) ($request->query('per_page') ?? ($request->query('limit') ?? 20));
        $perPage = max(1, min(50, $perPage));
        $sort = strtolower(trim((string) ($request->query('sort') ?? 'latest')));
        if (!in_array($sort, ['latest', 'budget_low', 'budget_high', 'closing'], true)) {
            return Response::json(['success' => false, 'message' => 'Invalid job sort.'], 422);
        }

        $minBudget = $this->optionalMoney($request->query('min_budget'));
        $maxBudget = $this->optionalMoney($request->query('max_budget'));
        if (($request->query('min_budget') !== null && $minBudget === false)
            || ($request->query('max_budget') !== null && $maxBudget === false)) {
            return Response::json(['success' => false, 'message' => 'Budget filters must be valid non-negative numbers.'], 422);
        }
        if ($minBudget !== null && $maxBudget !== null && $minBudget > $maxBudget) {
            return Response::json(['success' => false, 'message' => 'Minimum budget cannot exceed maximum budget.'], 422);
        }

        $result = Job::availablePage(
            $categoryId,
            $search,
            $perPage,
            ($page - 1) * $perPage,
            $minBudget,
            $maxBudget,
            $sort
        );
        $total = $result['total'];
        return Response::json([
            'success' => true,
            'data'    => array_map(fn($j) => $this->serializeJob($j), $result['items']),
            'meta'    => [
                'page'        => $page,
                'per_page'    => $perPage,
                'total'       => $total,
                'last_page'   => max(1, (int) ceil($total / $perPage)),
                'has_previous'=> $page > 1,
                'has_more'    => ($page * $perPage) < $total,
            ],
        ]);
    }

    private function optionalMoney(mixed $value): float|false|null
    {
        if ($value === null || $value === '') return null;
        if (!is_numeric($value) || (float) $value < 0) return false;
        return round((float) $value, 4);
    }

    public function show(Request $request, int $id): Response
    {
        if ($guard = $this->bannedGuard($request->getMeta('auth.user'))) return $guard;
        $job = Job::find($id);
        if ($job === null) return Response::json(['success' => false, 'message' => 'Job not found.'], 404);
        // Increment view_count
        \Nemesis\Core\Fluent::table('jobs')
            ->where('id', '=', $job->id)
            ->update(['view_count' => (int) $job->view_count + 1]);
        $job->view_count = (int) $job->view_count + 1;

        $bids = JobBid::forJob($id);
        $user = $request->getMeta('auth.user');
        $myBid = $user ? JobBid::findForWorker($id, (int) $user->id) : null;
        $assignment = ($user && $user->isWorker() && JobAssignment::isAvailable())
            ? JobAssignment::findForJobWorker($id, (int) $user->id)
            : null;
        $mySubmission = null;
        if ($assignment !== null) {
            $job->worker_assignment_id = (int) $assignment->id;
            $job->worker_assignment_status = $assignment->status;
            $job->worker_assignment_payment_status = $assignment->payment_status;
            $mySubmission = JobSubmission::latestForAssignment((int) $assignment->id);
        } elseif ($user && $user->isWorker() && (int) $job->assigned_worker_id === (int) $user->id) {
            $mySubmission = JobSubmission::latestForJobWorker($id, (int) $user->id);
        }

        return Response::json([
            'success' => true,
            'data'    => [
                'job'        => $this->serializeJob($job, true),
                'bids'       => array_map(fn($b) => $this->serializeBid($b), $bids),
                'bid_count'  => count($bids),
                'my_bid'     => $myBid ? $this->serializeBid($myBid) : null,
                'my_submission' => $mySubmission ? $this->serializeSubmission($mySubmission) : null,
            ],
        ]);
    }

    // -------------------------------------------------------------------
    // Bidding
    // -------------------------------------------------------------------

    public function bid(Request $request, int $id): Response
    {
        if ($guard = $this->workerGuard($request)) return $guard;
        $user = $request->getMeta('auth.user');
        $body = (array) $this->readJson($request);
        $amount        = (float)  ($body['amount'] ?? 0);
        $deliveryDays  = (int)    ($body['delivery_days'] ?? 7);
        $proposal      = (string) ($body['proposal'] ?? '');

        if ($amount <= 0 || trim($proposal) === '') {
            return Response::json(['success' => false, 'message' => 'amount and proposal are required.'], 422);
        }
        $result = $this->jobService->placeBid($user, $id, $amount, $deliveryDays, $proposal);
        if (!$result['success']) return Response::json($result, 422);
        return Response::json(['success' => true, 'message' => $result['message'], 'data' => $this->serializeBid($result['bid'])]);
    }

    public function withdrawBid(Request $request, int $id): Response
    {
        if ($guard = $this->workerGuard($request)) return $guard;
        $user = $request->getMeta('auth.user');
        $result = $this->jobService->withdrawBid($user, $id);
        if (!$result['success']) return Response::json($result, 422);
        return Response::json(['success' => true, 'message' => $result['message']]);
    }

    public function myBids(Request $request): Response
    {
        if ($guard = $this->workerGuard($request)) return $guard;
        $user = $request->getMeta('auth.user');
        $bids = JobBid::byWorker((int) $user->id, 100);
        return Response::json(['success' => true, 'data' => array_map(fn($b) => $this->serializeBid($b, true), $bids)]);
    }

    // -------------------------------------------------------------------
    // Active jobs + submissions
    // -------------------------------------------------------------------

    public function activeJobs(Request $request): Response
    {
        if ($guard = $this->workerGuard($request)) return $guard;
        $user = $request->getMeta('auth.user');
        $jobs = Job::assignedTo((int) $user->id, 100);
        return Response::json(['success' => true, 'data' => array_map(fn($j) => $this->serializeJob($j, true), $jobs)]);
    }

    public function cancelAssignment(Request $request, int $id): Response
    {
        if ($guard = $this->workerGuard($request)) return $guard;
        $user = $request->getMeta('auth.user');
        $body = (array) $this->readJson($request);
        $reason = trim((string) ($body['reason'] ?? 'Worker requested cancellation'));
        if ($reason === '') return Response::json(['success' => false, 'message' => 'A cancellation reason is required.'], 422);

        $result = $this->jobService->cancelAssignment($id, (int) $user->id, $reason, 'worker');
        if (!($result['success'] ?? false)) return Response::json($result, 422);
        return Response::json([
            'success' => true,
            'message' => $result['message'],
            'data' => $result['assignment'] ?? null,
        ]);
    }

    public function submit(Request $request, int $id): Response
    {
        if ($guard = $this->workerGuard($request)) return $guard;
        $user = $request->getMeta('auth.user');
        $body = (array) $this->readJson($request);
        $description   = isset($body['description']) ? (string) $body['description'] : null;
        $externalLink  = isset($body['external_link']) ? (string) $body['external_link'] : null;
        $proofFile     = $request->file('screenshot') ?? $request->file('attachment');

        $result = $this->jobService->submitWork(
            $user,
            $id,
            $description,
            $externalLink,
            $proofFile,
            $_SERVER['REMOTE_ADDR'] ?? null,
            $_SERVER['HTTP_USER_AGENT'] ?? null
        );
        if (!$result['success']) return Response::json($result, 422);
        return Response::json([
            'success' => true,
            'message' => $result['message'],
            'data'    => $this->serializeSubmission($result['submission']),
        ]);
    }

    public function mySubmissions(Request $request): Response
    {
        if ($guard = $this->workerGuard($request)) return $guard;
        $user = $request->getMeta('auth.user');
        $subs = JobSubmission::byWorker((int) $user->id, 100);
        return Response::json(['success' => true, 'data' => array_map(fn($s) => $this->serializeSubmission($s, true), $subs)]);
    }

    public function submissionAttachment(Request $request, int $id): Response
    {
        $user = $request->getMeta('auth.user');
        if ($guard = $this->bannedGuard($user)) return $guard;
        $submission = JobSubmission::find($id);
        if ($submission === null) return Response::json(['success' => false, 'message' => 'Submission not found.'], 404);

        $job = $submission->job();
        $allowed = $user && $job && (
            $user->isAdmin()
            || (int) $submission->worker_id === (int) $user->id
            || (int) $job->poster_id === (int) $user->id
        );
        if (!$allowed) return Response::json(['success' => false, 'message' => 'You are not allowed to view this proof.'], 403);

        $relative = ltrim((string) $submission->attachment_path, '/');
        if ($relative === '' || !str_starts_with($relative, 'job-proofs/')) {
            return Response::json(['success' => false, 'message' => 'Proof attachment not found.'], 404);
        }

        $root = realpath(base_path('storage/job-proofs'));
        $path = realpath(base_path('storage/' . $relative));
        if ($root === false || $path === false || !str_starts_with($path, $root . DIRECTORY_SEPARATOR) || !is_file($path)) {
            return Response::json(['success' => false, 'message' => 'Proof attachment not found.'], 404);
        }

        $mime = function_exists('mime_content_type')
            ? (mime_content_type($path) ?: 'application/octet-stream')
            : 'application/octet-stream';
        return Response::stream(static function () use ($path): void {
            readfile($path);
        })
            ->withHeader('Content-Type', $mime)
            ->withHeader('Content-Length', (string) filesize($path))
            ->withHeader('Content-Disposition', 'inline; filename="' . addslashes(basename($path)) . '"')
            ->withHeader('X-Content-Type-Options', 'nosniff');
    }

    // -------------------------------------------------------------------
    // Categories (used by frontend "Post Job" / filter dropdown)
    // -------------------------------------------------------------------

    public function categories(Request $request): Response
    {
        if ($guard = $this->bannedGuard($request->getMeta('auth.user'))) return $guard;
        $cats = Category::activeOrdered();
        return Response::json([
            'success' => true,
            'data'    => array_map(fn($c) => [
                'id'            => (int) $c->id,
                'name'          => $c->name,
                'slug'          => $c->slug,
                'description'   => $c->description,
                'icon_class'    => $c->icon_class,
                'display_order' => (int) $c->display_order,
                'min_cost'      => (float) ($c->min_cost ?? 1.00),
                'subcategories' => array_map(fn($s) => [
                    'id'       => (int) $s->id,
                    'name'     => $s->name,
                    'slug'     => $s->slug,
                    'min_cost' => (float) ($s->min_cost ?? 1.00),
                ], \App\Models\Subcategory::forCategory((int) $c->id)),
            ], $cats),
        ]);
    }

    public function createWorkflowJob(Request $request): Response
    {
        if ($guard = $this->posterGuard($request)) return $guard;
        $user = $request->getMeta('auth.user');
        $body = (array) $this->readJson($request);

        $categoryId       = (int) ($body['category_id'] ?? 0);
        $subcategoryId    = isset($body['subcategory_id']) ? (int) $body['subcategory_id'] : null;
        $title            = (string) ($body['title'] ?? '');
        $subtitle         = trim((string) ($body['subtitle'] ?? ''));
        $description      = (string) ($body['description'] ?? '');
        $proofRequirements= (array) ($body['proof_requirements'] ?? []);
        $workerCount      = (int) ($body['worker_count'] ?? 1);
        $costPerWorker    = (float) ($body['cost_per_worker'] ?? 0);
        $deadlineAt       = (string) ($body['deadline_at'] ?? date('Y-m-d H:i:s', time() + 7 * 86400));

        $result = $this->jobService->createWorkflowJob(
            $user,
            $categoryId,
            $subcategoryId,
            $title,
            $description,
            $proofRequirements,
            $workerCount,
            $costPerWorker,
            $deadlineAt,
            $subtitle,
            $user->name,
            $user->phone ?? null,
            $user->email
        );

        if (!$result['success']) {
            return Response::json($result, 422);
        }

        return Response::json([
            'success' => true,
            'message' => $result['message'],
            'data'    => $this->serializeJob($result['job'], true),
        ]);
    }

    public function applyForJob(Request $request, int $id): Response
    {
        if ($guard = $this->workerGuard($request)) return $guard;
        $user = $request->getMeta('auth.user');
        $body = (array) $this->readJson($request);
        $proposal    = isset($body['proposal']) ? (string) $body['proposal'] : null;
        $bkashNumber = isset($body['bkash_number']) ? (string) $body['bkash_number'] : null;

        $result = $this->jobService->applyForJob($user, $id, $proposal, $bkashNumber);
        if (!$result['success']) {
            return Response::json($result, 422);
        }

        return Response::json([
            'success' => true,
            'message' => $result['message'],
            'data'    => $this->serializeBid($result['bid']),
        ]);
    }

    public function extendDeadline(Request $request, int $id): Response
    {
        if ($guard = $this->posterGuard($request)) return $guard;
        $user = $request->getMeta('auth.user');
        $body = (array) $this->readJson($request);
        $days = (int) ($body['days'] ?? 7);

        $result = $this->jobService->extendDeadline($user, $id, $days);
        if (!$result['success']) {
            return Response::json($result, 422);
        }

        return Response::json([
            'success' => true,
            'message' => $result['message'],
            'data'    => $this->serializeJob($result['job'], true),
        ]);
    }

    // -------------------------------------------------------------------
    // Serialization
    // -------------------------------------------------------------------

    private function serializeJob(Job $j, bool $withDetails = false): array
    {
        $category = $j->category();
        $poster   = $j->poster();
        [$activeWorkers, $remainingWorkers] = $this->workerSlotSummary($j);
        $out = [
            'id'              => (int) $j->id,
            'slug'            => $j->slug,
            'title'           => $j->title,
            'subtitle'        => $j->subtitle ?? null,
            'description'     => $j->description,
            'requirements'    => $j->requirements,
            'customer_name'   => $j->customer_name ?? null,
            'customer_phone'  => $j->customer_phone ?? null,
            'customer_email'  => $j->customer_email ?? null,
            'budget'          => (float) $j->budget,
            'worker_count'    => (int) ($j->worker_count ?? 1),
            'active_workers_count' => $activeWorkers,
            'remaining_workers' => $remainingWorkers,
            'available_workers' => $remainingWorkers,
            'cost_per_worker' => (float) ($j->cost_per_worker ?? $j->budget),
            'proof_requirements' => is_string($j->proof_requirements ?? null)
                ? (json_decode((string) $j->proof_requirements, true) ?: [])
                : ((array) ($j->proof_requirements ?? [])),
            'currency'        => $j->currency,
            'category_id'     => (int) $j->category_id,
            'category'        => $category ? ['id' => (int) $category->id, 'name' => $category->name, 'icon_class' => $category->icon_class] : null,
            'status'          => $j->status,
            'bid_count'       => (int) $j->bid_count,
            'view_count'      => (int) $j->view_count,
            'is_featured'     => (bool) $j->is_featured,
            'bidding_closes_at' => $j->bidding_closes_at,
            'deadline_at'     => $j->deadline_at,
            'created_at'      => $j->created_at,
            'poster'          => $poster ? [
                'id'    => (int) $poster->id,
                'name'  => $poster->name,
                'username' => $poster->username,
            ] : null,
        ];
        if ($withDetails) {
            $out['assigned_worker_id'] = (int) ($j->assigned_worker_id ?? 0);
            $out['assigned_worker'] = $j->assignedWorker() ? [
                'id'   => (int) $j->assignedWorker()->id,
                'name' => $j->assignedWorker()->name,
            ] : null;
            $out['assignment_id'] = $j->worker_assignment_id ? (int) $j->worker_assignment_id : null;
            $out['assignment_status'] = $j->worker_assignment_status ?? null;
            $out['assignment_payment_status'] = $j->worker_assignment_payment_status ?? null;
        }
        return $out;
    }

    /**
     * Return assignment-backed capacity while retaining the legacy pointer
     * fallback for hosts that have not completed the additive migration.
     *
     * @return array{0:int,1:int}
     */
    private function workerSlotSummary(Job $job): array
    {
        $totalWorkers = max(1, (int) ($job->worker_count ?? 1));
        $assignedWorkers = 0;
        $completedWorkers = 0;

        try {
            $assignments = Fluent::table('job_assignments')
                ->where('job_id', '=', $job->id)
                ->whereNotIn('status', [JobAssignment::STATUS_CANCELLED])
                ->whereNotIn('payment_status', [JobAssignment::PAYMENT_REFUNDED])
                ->get()->all();
            foreach ($assignments as $assignment) {
                $assignedWorkers++;
                if (($assignment['status'] ?? '') === JobAssignment::STATUS_COMPLETED
                    && ($assignment['payment_status'] ?? '') === JobAssignment::PAYMENT_RELEASED) {
                    $completedWorkers++;
                }
            }
        } catch (\Throwable) {
            // Older deployments may not have the additive assignment table.
        }

        if ($assignedWorkers === 0
            && (int) ($job->assigned_worker_id ?? 0) > 0
            && in_array($job->status, [Job::STATUS_ASSIGNED, Job::STATUS_SUBMITTED, Job::STATUS_REVISION], true)) {
            $assignedWorkers = 1;
        }

        return [
            max(0, $assignedWorkers - $completedWorkers),
            max(0, $totalWorkers - $assignedWorkers),
        ];
    }

    private function serializeBid(JobBid $b, bool $withJob = false): array
    {
        $worker = $b->worker();
        $out = [
            'id'            => (int) $b->id,
            'job_id'        => (int) $b->job_id,
            'worker_id'     => (int) $b->worker_id,
            'amount'        => (float) $b->amount,
            'currency'      => $b->currency,
            'delivery_days' => (int) $b->delivery_days,
            'proposal'      => $b->proposal,
            'status'        => $b->status,
            'created_at'    => $b->created_at,
            'decided_at'    => $b->decided_at,
            'worker'        => $worker ? [
                'id'       => (int) $worker->id,
                'name'     => $worker->name,
                'username' => $worker->username,
                'rating'   => (float) ($worker->rating ?? 0),
            ] : null,
        ];
        if ($withJob) {
            $job = $b->job();
            $out['job'] = $job ? [
                'id'    => (int) $job->id,
                'title' => $job->title,
                'status' => $job->status,
            ] : null;
        }
        return $out;
    }

    private function serializeSubmission(JobSubmission $s, bool $withJob = false): array
    {
        $out = [
            'id'             => (int) $s->id,
            'job_id'         => (int) $s->job_id,
            'worker_id'      => (int) $s->worker_id,
            'bid_id'         => (int) $s->bid_id,
            'assignment_id'  => $s->assignment_id !== null ? (int) $s->assignment_id : null,
            'description'    => $s->description,
            'attachment_path'=> $s->attachment_path,
            'attachment_url' => $s->attachment_path ? '/api/jobs/submissions/' . (int) $s->id . '/attachment' : null,
            'external_link'  => $s->external_link,
            'status'         => $s->status,
            'attempt_number' => (int) ($s->attempt_number ?: 1),
            'submitted_at'   => $s->submitted_at,
            'reviewer_note'  => $s->reviewer_note,
            'rejection_reason' => $s->rejection_reason,
            'risk_score'     => (float) ($s->risk_score ?? 0),
            'risk_status'    => $s->risk_status ?? 'clear',
            'risk_flags'     => is_string($s->risk_flags ?? null)
                ? (json_decode((string) $s->risk_flags, true) ?: [])
                : ((array) ($s->risk_flags ?? [])),
            'created_at'     => $s->created_at,
            'reviewed_at'    => $s->reviewed_at,
        ];
        if ($withJob) {
            $job = $s->job();
            $out['job'] = $job ? ['id' => (int) $job->id, 'title' => $job->title, 'status' => $job->status] : null;
        }
        return $out;
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

    private function workerGuard(Request $request): ?Response
    {
        $user = $request->getMeta('auth.user');
        if ($user === null) {
            return Response::json([
                'success' => false,
                'message' => 'Authentication required.',
            ], 401);
        }
        if (!$user->isWorker()) {
            return Response::json([
                'success' => false,
                'message' => 'Worker access required.',
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

    private function bannedGuard(?User $user): ?Response
    {
        if ($user === null) {
            return Response::json([
                'success' => false,
                'message' => 'Authentication required.',
            ], 401);
        }
        if ($user !== null && $user->isBanned()) {
            return Response::json([
                'success' => false,
                'message' => 'This account is banned.',
                'error' => 'banned',
            ], 403);
        }
        return null;
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
}
