<?php
declare(strict_types=1);

namespace App\Http\Controllers\Api;

use Nemesis\Core\Controller;
use Nemesis\Http\Request;
use Nemesis\Http\Response;
use App\Models\Job;
use App\Models\JobBid;
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

        return Response::json([
            'success' => true,
            'data'    => [
                'job'        => $this->serializeJob($job, true),
                'bids'       => array_map(fn($b) => $this->serializeBid($b), $bids),
                'bid_count'  => count($bids),
                'my_bid'     => $myBid ? $this->serializeBid($myBid) : null,
            ],
        ]);
    }

    // -------------------------------------------------------------------
    // Bidding
    // -------------------------------------------------------------------

    public function bid(Request $request, int $id): Response
    {
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
        $user = $request->getMeta('auth.user');
        $result = $this->jobService->withdrawBid($user, $id);
        if (!$result['success']) return Response::json($result, 422);
        return Response::json(['success' => true, 'message' => $result['message']]);
    }

    public function myBids(Request $request): Response
    {
        $user = $request->getMeta('auth.user');
        $bids = JobBid::byWorker((int) $user->id, 100);
        return Response::json(['success' => true, 'data' => array_map(fn($b) => $this->serializeBid($b, true), $bids)]);
    }

    // -------------------------------------------------------------------
    // Active jobs + submissions
    // -------------------------------------------------------------------

    public function activeJobs(Request $request): Response
    {
        $user = $request->getMeta('auth.user');
        $jobs = Job::assignedTo((int) $user->id, 100);
        return Response::json(['success' => true, 'data' => array_map(fn($j) => $this->serializeJob($j, true), $jobs)]);
    }

    public function submit(Request $request, int $id): Response
    {
        $user = $request->getMeta('auth.user');
        $body = (array) $this->readJson($request);
        $description   = isset($body['description']) ? (string) $body['description'] : null;
        $externalLink  = isset($body['external_link']) ? (string) $body['external_link'] : null;

        $result = $this->jobService->submitWork($user, $id, $description, $externalLink);
        if (!$result['success']) return Response::json($result, 422);
        return Response::json([
            'success' => true,
            'message' => $result['message'],
            'data'    => $this->serializeSubmission($result['submission']),
        ]);
    }

    public function mySubmissions(Request $request): Response
    {
        $user = $request->getMeta('auth.user');
        $subs = JobSubmission::byWorker((int) $user->id, 100);
        return Response::json(['success' => true, 'data' => array_map(fn($s) => $this->serializeSubmission($s, true), $subs)]);
    }

    // -------------------------------------------------------------------
    // Categories (used by frontend "Post Job" / filter dropdown)
    // -------------------------------------------------------------------

    public function categories(Request $request): Response
    {
        $cats = Category::activeOrdered();
        return Response::json([
            'success' => true,
            'data'    => array_map(fn($c) => [
                'id'           => (int) $c->id,
                'name'         => $c->name,
                'slug'         => $c->slug,
                'description'  => $c->description,
                'icon_class'   => $c->icon_class,
                'display_order' => (int) $c->display_order,
            ], $cats),
        ]);
    }

    // -------------------------------------------------------------------
    // Serialization
    // -------------------------------------------------------------------

    private function serializeJob(Job $j, bool $withDetails = false): array
    {
        $category = $j->category();
        $poster   = $j->poster();
        $out = [
            'id'              => (int) $j->id,
            'slug'            => $j->slug,
            'title'           => $j->title,
            'description'     => $j->description,
            'requirements'    => $j->requirements,
            'budget'          => (float) $j->budget,
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
        }
        return $out;
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
            'description'    => $s->description,
            'external_link'  => $s->external_link,
            'status'         => $s->status,
            'reviewer_note'  => $s->reviewer_note,
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
}
