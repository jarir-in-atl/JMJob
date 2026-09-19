<?php
declare(strict_types=1);

namespace App\Http\Controllers\Api;

use Nemesis\Core\Controller;
use Nemesis\Http\Request;
use Nemesis\Http\Response;
use App\Models\TgTask;
use App\Models\TgTaskCompletion;
use App\Models\User;
use Nemesis\Core\Database;
use Nemesis\Core\Fluent;
use App\Services\RewardService;
use App\Services\SettingService;

class TgTaskController extends Controller
{
    public function __construct(private RewardService $rewardService = new RewardService()) {}

    /**
     * GET /api/tasks/telegram (auth.api)
     */
    public function index(Request $request): Response
    {
        $user = $request->getMeta('auth.user');
        if ($guard = $this->bannedGuard($user)) return $guard;
        $rows = Fluent::table('telegram_tasks')
            ->where('active', '=', 1)
            ->orderBy('id', 'asc')
            ->get();

        $items = [];
        foreach ($rows as $row) {
            $task = TgTask::find((int) $row['id']);
            $items[] = [
                'id'                => (int) $row['id'],
                'channel_username'  => $row['channel_username'],
                'channel_name'      => $row['channel_name'],
                'description'       => $row['description'],
                'reward'            => (float) $row['reward'],
                'active'            => (bool) $row['active'],
                'completed'         => $task ? $task->hasCompletedBy((int) $user->id) : false,
            ];
        }
        return Response::json([
            'success' => true,
            'data'    => $items,
            'meta'    => ['reward_system_enabled' => SettingService::rewardSystemEnabled()],
        ]);
    }

    /**
     * POST /api/tasks/telegram/verify (auth.api)
     * Body: { task_id }
     *
     * In a real system this would call the Telegram API to confirm the
     * user is a member of the channel. For the clone, we trust the
     * client (with a server-side check for non-completion).
     */
    public function verify(Request $request): Response
    {
        $user = $request->getMeta('auth.user');
        if ($guard = $this->bannedGuard($user)) return $guard;
        if (!SettingService::rewardSystemEnabled()) {
            return Response::json(['success' => false, 'message' => 'The reward system is currently disabled.'], 403);
        }
        $body = $this->readJson($request);
        $taskId = (int) ($body['task_id'] ?? 0);
        if ($taskId <= 0) {
            return Response::json(['success' => false, 'message' => 'Invalid task_id.'], 422);
        }

        $task = TgTask::find($taskId);
        if ($task === null || !$task->isActive()) {
            return Response::json(['success' => false, 'message' => 'Task not found or inactive.'], 404);
        }

        $db = Database::connect();
        try {
            Database::beginWriteTransaction($db);
            if ($task->hasCompletedBy((int) $user->id)) {
                Database::rollbackWriteTransaction($db);
                return Response::json(['success' => false, 'message' => 'Already completed.'], 422);
            }

            $id = Fluent::table('telegram_task_completions')->insert([
                'user_id'    => $user->id,
                'task_id'    => $taskId,
                'verified_at'=> date('Y-m-d H:i:s'),
                'reward'     => (float) $task->reward,
            ]);
            if (!$id) throw new \RuntimeException('Telegram task completion could not be recorded.');

            $result = $this->rewardService->creditTgTaskReward($user, (float) $task->reward, (int) $id);
            if (!($result['success'] ?? false)) {
                Database::rollbackWriteTransaction($db);
                return Response::json($result, 422);
            }
            Database::commitWriteTransaction($db);
        } catch (\Throwable $e) {
            Database::rollbackWriteTransaction($db);
            $message = strtolower($e->getMessage());
            if (str_contains($message, 'unique') || str_contains($message, 'duplicate') || str_contains($message, 'already completed')) {
                return Response::json(['success' => false, 'message' => 'Already completed.'], 422);
            }
            return Response::json(['success' => false, 'message' => 'Unable to verify Telegram task right now.'], 500);
        }

        $user = User::find($user->id);

        return Response::json([
            'success' => true,
            'data'    => [
                'reward'  => (float) $task->reward,
                'user'    => $this->serializeUser($user),
            ],
            'message' => 'Telegram task verified!',
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

    private function bannedGuard(?User $user): ?Response
    {
        if ($user !== null && $user->isBanned()) {
            return Response::json(['success' => false, 'error' => 'banned', 'message' => 'Banned accounts cannot access tasks.'], 403);
        }
        return null;
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
