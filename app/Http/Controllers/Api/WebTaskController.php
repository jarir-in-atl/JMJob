<?php
declare(strict_types=1);

namespace App\Http\Controllers\Api;

use Nemesis\Core\Controller;
use Nemesis\Http\Request;
use Nemesis\Http\Response;
use App\Models\WebTask;
use App\Models\WebTaskCompletion;
use App\Models\User;
use Nemesis\Core\Fluent;
use App\Services\RewardService;

class WebTaskController extends Controller
{
    public function __construct(private RewardService $rewardService = new RewardService()) {}

    /**
     * GET /api/tasks/web (auth.api) — list active web tasks.
     */
    public function index(Request $request): Response
    {
        $user = $request->getMeta('auth.user');
        $rows = Fluent::table('web_tasks')
            ->where('active', '=', 1)
            ->orderBy('id', 'asc')
            ->get();

        $items = [];
        foreach ($rows as $row) {
            $task = WebTask::find((int) $row['id']);
            $completed = $task->completedByToday((int) $user->id);
            $items[] = [
                'id'                => (int) $row['id'],
                'title'             => $row['title'],
                'description'       => $row['description'],
                'target_url'        => $row['target_url'],
                'reward'            => (float) $row['reward'],
                'duration_seconds'  => (int) $row['duration_seconds'],
                'verification_type' => $row['verification_type'],
                'active'            => (bool) $row['active'],
                'daily_limit'       => (int) $row['daily_limit_per_user'],
                'completed_today'   => $completed,
                'can_claim'         => $completed < (int) $row['daily_limit_per_user'],
            ];
        }
        return Response::json([
            'success' => true,
            'data'    => $items,
        ]);
    }

    /**
     * POST /api/tasks/web/start (auth.api)
     * Body: { task_id }
     * Returns: { ad_view_id, started_at, expires_at }
     */
    public function start(Request $request): Response
    {
        $user = $request->getMeta('auth.user');
        $body = $this->readJson($request);
        $taskId = (int) ($body['task_id'] ?? 0);
        if ($taskId <= 0) {
            return Response::json(['success' => false, 'message' => 'Invalid task_id.'], 422);
        }

        $task = WebTask::find($taskId);
        if ($task === null || !$task->isActive()) {
            return Response::json(['success' => false, 'message' => 'Task not found or inactive.'], 404);
        }

        // Cap on daily completions
        $already = $task->completedByToday((int) $user->id);
        if ($already >= $task->daily_limit_per_user) {
            return Response::json([
                'success' => false,
                'message' => 'You have already completed this task today.',
            ], 422);
        }

        $startedAt = date('Y-m-d H:i:s');
        $id = Fluent::table('web_task_completions')->insert([
            'user_id'    => $user->id,
            'task_id'    => $taskId,
            'started_at' => $startedAt,
            'reward'     => (float) $task->reward,
        ]);

        $expiresAt = date('Y-m-d H:i:s', time() + (int) $task->duration_seconds);

        return Response::json([
            'success' => true,
            'data'    => [
                'completion_id'   => (int) $id,
                'started_at'      => $startedAt,
                'expires_at'      => $expiresAt,
                'duration_seconds'=> (int) $task->duration_seconds,
            ],
        ], 201);
    }

    /**
     * POST /api/tasks/web/claim (auth.api)
     * Body: { completion_id }
     */
    public function claim(Request $request): Response
    {
        $user = $request->getMeta('auth.user');
        $body = $this->readJson($request);
        $completionId = (int) ($body['completion_id'] ?? 0);
        if ($completionId <= 0) {
            return Response::json(['success' => false, 'message' => 'Invalid completion_id.'], 422);
        }

        $completion = WebTaskCompletion::find($completionId);
        if ($completion === null || (int) $completion->user_id !== (int) $user->id) {
            return Response::json(['success' => false, 'message' => 'Completion not found.'], 404);
        }
        if (!empty($completion->claimed_at)) {
            return Response::json(['success' => false, 'message' => 'Reward already claimed.'], 422);
        }

        $task = WebTask::find((int) $completion->task_id);
        if ($task === null) {
            return Response::json(['success' => false, 'message' => 'Task missing.'], 404);
        }

        $started = strtotime((string) $completion->started_at);
        $elapsed = time() - $started;
        if ($elapsed < (int) $task->duration_seconds) {
            return Response::json([
                'success' => false,
                'message' => "You need to wait at least {$task->duration_seconds}s before claiming. Only {$elapsed}s elapsed.",
            ], 422);
        }

        // Mark completion
        $reward = (float) $completion->reward;
        Fluent::table('web_task_completions')
            ->where('id', '=', $completionId)
            ->update([
                'completed_at' => date('Y-m-d H:i:s'),
                'claimed_at'   => date('Y-m-d H:i:s'),
            ]);

        // Credit reward
        $result = $this->rewardService->creditWebTaskReward($user, $reward, $completionId);

        $user = User::find($user->id);
        return Response::json([
            'success' => true,
            'data'    => [
                'reward'  => $result['reward'] ?? $reward,
                'commission'=> $result['commission'] ?? 0,
                'user'     => $this->serializeUser($user),
            ],
            'message' => 'Reward claimed successfully!',
        ]);
    }

    private function serializeUser(?User $user): array
    {
        if ($user === null) return [];
        $user->resetDailyCountersIfNeeded();
        $array = $user->toArray();
        unset($array['password']);
        $array['referral_count'] = $user->referralCount();
        $array['ads_remaining']  = $user->adsRemainingToday();
        $array['can_withdraw']   = $user->canWithdraw();
        $array['is_admin']       = $user->isAdmin();
        return $array;
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
