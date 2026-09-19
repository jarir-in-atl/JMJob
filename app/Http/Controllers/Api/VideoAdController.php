<?php
declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Models\User;
use App\Models\VideoAd;
use App\Models\VideoAdView;
use App\Services\RewardService;
use App\Services\SettingService;
use Nemesis\Core\Controller;
use Nemesis\Core\Database;
use Nemesis\Core\Fluent;
use Nemesis\Http\Request;
use Nemesis\Http\Response;

/** Server-timed first-party video ads and rewarded watch sessions. */
class VideoAdController extends Controller
{
    public function __construct(private RewardService $rewardService = new RewardService()) {}

    public function index(Request $request): Response
    {
        $user = $request->getMeta('auth.user');
        if (!SettingService::get('advertisement_system_enabled', true)) {
            return Response::json(['success' => true, 'data' => [], 'meta' => ['enabled' => false]]);
        }
        if (!SettingService::get('watch_earn_enabled', true)) {
            return Response::json(['success' => true, 'data' => [], 'meta' => ['enabled' => false, 'watch_earn_enabled' => false]]);
        }

        $items = [];
        try {
            foreach (VideoAd::active() as $ad) {
                $watchedToday = VideoAdView::countForUserToday((int) $ad->id, (int) $user->id);
                $dailyLimit = (int) ($ad->daily_limit ?? 0);
                $items[] = $this->serializeAd($ad, $watchedToday, $dailyLimit);
            }
        } catch (\Throwable $e) {
            // Keep the existing provider-based ad flow available while the
            // additive video-ad migration is being rolled out.
            $items = [];
        }

        return Response::json([
            'success' => true,
            'data' => $items,
            'meta' => [
                'enabled' => true,
                'watch_earn_enabled' => true,
                'ads_remaining_today' => $user->adsRemainingToday(),
            ],
        ]);
    }

    public function start(Request $request): Response
    {
        $user = $request->getMeta('auth.user');
        if (!SettingService::get('advertisement_system_enabled', true) || !SettingService::get('watch_earn_enabled', true)) {
            return Response::json(['success' => false, 'message' => 'Watch-and-earn is currently disabled.'], 403);
        }

        $body = $this->readJson($request);
        $adId = (int) ($body['video_ad_id'] ?? $body['ad_id'] ?? 0);
        if ($adId <= 0) {
            return Response::json(['success' => false, 'message' => 'Invalid video_ad_id.'], 422);
        }

        $user->resetDailyCountersIfNeeded();
        if ($user->adsRemainingToday() <= 0) {
            return Response::json(['success' => false, 'message' => 'Daily ad limit reached. Try again tomorrow.'], 422);
        }

        $ad = VideoAd::find($adId);
        if ($ad === null || !$ad->isActive()) {
            return Response::json(['success' => false, 'message' => 'Video ad not found or inactive.'], 404);
        }

        $frequency = max(0, (int) SettingService::get('ad_frequency_seconds', 60));
        if ($frequency > 0) {
            $last = Fluent::table('video_ad_views')
                ->where('user_id', '=', $user->id)
                ->orderBy('started_at', 'desc')
                ->first();
            if ($last !== null) {
                $elapsed = time() - (strtotime((string) ($last['started_at'] ?? '')) ?: time());
                if ($elapsed < $frequency) {
                    return Response::json([
                        'success' => false,
                        'message' => 'Please wait before starting another ad.',
                        'retry_after_seconds' => $frequency - max(0, $elapsed),
                    ], 429);
                }
            }
        }

        $db = Database::connect();
        $now = date('Y-m-d H:i:s');
        try {
            Database::beginWriteTransaction($db);

            $sql = 'SELECT * FROM video_ads WHERE id = :id';
            if (Database::getDriverName() !== 'sqlite') $sql .= ' FOR UPDATE';
            $stmt = $db->prepare($sql);
            $stmt->execute([':id' => $adId]);
            $row = $stmt->fetch(\PDO::FETCH_ASSOC);
            if (!$row) {
                Database::rollbackWriteTransaction($db);
                return Response::json(['success' => false, 'message' => 'Video ad not found.'], 404);
            }

            $lockedAd = new VideoAd($row);
            if (!$lockedAd->isActive($now)) {
                Database::rollbackWriteTransaction($db);
                return Response::json(['success' => false, 'message' => 'Video ad is no longer available.'], 409);
            }

            $dailyLimit = (int) ($lockedAd->daily_limit ?? 0);
            $dailyCount = VideoAdView::countForUserToday((int) $lockedAd->id, (int) $user->id);
            if ($dailyLimit > 0 && $dailyCount >= $dailyLimit) {
                Database::rollbackWriteTransaction($db);
                return Response::json(['success' => false, 'message' => 'You have reached this ad\'s daily limit.'], 422);
            }

            // Reserve one lifetime view atomically while the ad row is locked.
            // This protects the total limit when multiple users start the last
            // available slot at the same time.
            $reserve = $db->prepare(
                'UPDATE video_ads
                 SET total_views = total_views + 1, updated_at = :updated_at
                 WHERE id = :id
                   AND (total_limit = 0 OR total_views < total_limit)'
            );
            $reserve->execute([':updated_at' => $now, ':id' => $lockedAd->id]);
            if ($reserve->rowCount() !== 1) {
                Database::rollbackWriteTransaction($db);
                return Response::json(['success' => false, 'message' => 'This video ad has reached its total view limit.'], 422);
            }

            $viewId = (int) Fluent::table('video_ad_views')->insert([
                'video_ad_id' => $lockedAd->id,
                'user_id' => $user->id,
                'reward_amount' => (float) $lockedAd->reward_amount,
                'started_at' => $now,
                'ip_address' => $_SERVER['REMOTE_ADDR'] ?? null,
                'user_agent' => substr((string) ($_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 250),
            ]);

            Database::commitWriteTransaction($db);

            return Response::json([
                'success' => true,
                'data' => [
                    'view_id' => $viewId,
                    'video_ad_id' => (int) $lockedAd->id,
                    'stream_url' => '/api/ads/videos/' . (int) $lockedAd->id . '/stream',
                    'started_at' => $now,
                    'started_at_unix' => time(),
                    'duration_seconds' => (int) $lockedAd->duration_seconds,
                    'reward_amount' => (float) $lockedAd->reward_amount,
                ],
            ], 201);
        } catch (\Throwable $e) {
            Database::rollbackWriteTransaction($db);
            return Response::json(['success' => false, 'message' => 'Unable to start this video ad.'], 500);
        }
    }

    public function claim(Request $request): Response
    {
        $user = $request->getMeta('auth.user');
        if (!SettingService::get('advertisement_system_enabled', true) || !SettingService::get('watch_earn_enabled', true)) {
            return Response::json(['success' => false, 'message' => 'Watch-and-earn is currently disabled.'], 403);
        }

        $body = $this->readJson($request);
        $viewId = (int) ($body['view_id'] ?? 0);
        if ($viewId <= 0) {
            return Response::json(['success' => false, 'message' => 'Invalid view_id.'], 422);
        }

        $db = Database::connect();
        try {
            Database::beginWriteTransaction($db);
            $sql = 'SELECT * FROM video_ad_views WHERE id = :id AND user_id = :user_id';
            if (Database::getDriverName() !== 'sqlite') $sql .= ' FOR UPDATE';
            $stmt = $db->prepare($sql);
            $stmt->execute([':id' => $viewId, ':user_id' => $user->id]);
            $view = $stmt->fetch(\PDO::FETCH_ASSOC);
            if (!$view) {
                Database::rollbackWriteTransaction($db);
                return Response::json(['success' => false, 'message' => 'Video view not found.'], 404);
            }
            if (!empty($view['claimed_at'])) {
                Database::commitWriteTransaction($db);
                return Response::json([
                    'success' => true,
                    'message' => 'Reward was already claimed.',
                    'data' => ['view_id' => $viewId, 'already_claimed' => true, 'reward' => (float) $view['reward_amount']],
                ]);
            }

            $ad = VideoAd::find((int) $view['video_ad_id']);
            if ($ad === null) {
                Database::rollbackWriteTransaction($db);
                return Response::json(['success' => false, 'message' => 'Video ad no longer exists.'], 404);
            }

            $startedAt = strtotime((string) $view['started_at']);
            $elapsed = $startedAt === false ? 0 : time() - $startedAt;
            $required = max(1, (int) $ad->duration_seconds);
            if ($elapsed < $required) {
                Database::rollbackWriteTransaction($db);
                return Response::json([
                    'success' => false,
                    'message' => "Watch for at least {$required} seconds before claiming.",
                    'elapsed_seconds' => max(0, $elapsed),
                    'required_seconds' => $required,
                ], 422);
            }

            $userLockSql = 'SELECT id FROM users WHERE id = :id';
            if (Database::getDriverName() !== 'sqlite') $userLockSql .= ' FOR UPDATE';
            $userLock = $db->prepare($userLockSql);
            $userLock->execute([':id' => $user->id]);
            $claimingUser = User::find((int) $user->id);
            if ($claimingUser === null) {
                Database::rollbackWriteTransaction($db);
                return Response::json(['success' => false, 'message' => 'User not found.'], 401);
            }
            $result = $this->rewardService->creditAdReward(
                $claimingUser,
                'video_ad',
                (float) $view['reward_amount'],
                $view['ip_address'] ?? ($_SERVER['REMOTE_ADDR'] ?? null),
                $view['user_agent'] ?? substr((string) ($_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 250)
            );
            if (!($result['success'] ?? false)) {
                Database::rollbackWriteTransaction($db);
                return Response::json($result, 422);
            }

            $now = date('Y-m-d H:i:s');
            $updated = $db->prepare('UPDATE video_ad_views SET completed_at = :completed_at, claimed_at = :claimed_at WHERE id = :id AND claimed_at IS NULL');
            $updated->execute([':completed_at' => $now, ':claimed_at' => $now, ':id' => $viewId]);
            if ($updated->rowCount() !== 1) {
                Database::rollbackWriteTransaction($db);
                return Response::json(['success' => false, 'message' => 'Reward claim could not be finalized.'], 409);
            }
            $completed = $db->prepare('UPDATE video_ads SET completed_views = completed_views + 1, updated_at = :updated_at WHERE id = :id');
            $completed->execute([':updated_at' => $now, ':id' => $ad->id]);
            Database::commitWriteTransaction($db);

            return Response::json([
                'success' => true,
                'message' => 'Reward credited successfully.',
                'data' => [
                    'view_id' => $viewId,
                    'reward' => (float) $result['reward'],
                    'user' => $this->serializeUser(User::find((int) $user->id)),
                ],
            ]);
        } catch (\Throwable $e) {
            Database::rollbackWriteTransaction($db);
            return Response::json(['success' => false, 'message' => 'Unable to claim this video reward.'], 500);
        }
    }

    public function stream(Request $request, int $id): Response
    {
        $user = $request->getMeta('auth.user');
        $ad = VideoAd::find($id);
        $hasPendingView = false;
        if ($ad !== null && $user !== null && !$user->isAdmin()) {
            // Starting the final lifetime slot increments total_views before
            // the client fetches the stream. Allow that same worker to finish
            // loading its already-reserved view without making an exhausted
            // ad generally streamable to other users.
            $pending = Database::connect()->prepare(
                'SELECT id FROM video_ad_views
                 WHERE video_ad_id = :video_ad_id
                   AND user_id = :user_id
                   AND claimed_at IS NULL
                 ORDER BY id DESC LIMIT 1'
            );
            $pending->execute([
                ':video_ad_id' => (int) $id,
                ':user_id' => (int) $user->id,
            ]);
            $hasPendingView = $pending->fetchColumn() !== false;
        }
        if ($ad === null || (!$user?->isAdmin() && !$ad->isActive() && !$hasPendingView)) {
            return Response::json(['success' => false, 'message' => 'Video ad not found or inactive.'], 404);
        }

        $relative = (string) ($ad->video_path ?? '');
        if (!str_starts_with($relative, 'video-ads/') || str_contains($relative, '..')) {
            return Response::json(['success' => false, 'message' => 'Invalid video path.'], 404);
        }
        $root = realpath(base_path('storage/video-ads'));
        $path = realpath(base_path('storage/' . $relative));
        if ($root === false || $path === false || !str_starts_with($path, rtrim($root, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR) || !is_file($path)) {
            return Response::json(['success' => false, 'message' => 'Video file not found.'], 404);
        }

        $mime = function_exists('finfo_file') ? (function () use ($path): string {
            $fi = finfo_open(FILEINFO_MIME_TYPE);
            $mime = $fi ? finfo_file($fi, $path) : false;
            if ($fi) finfo_close($fi);
            return is_string($mime) ? $mime : 'application/octet-stream';
        })() : 'application/octet-stream';
        if (!str_starts_with($mime, 'video/')) {
            return Response::json(['success' => false, 'message' => 'Stored file is not a video.'], 415);
        }

        return Response::stream(static function () use ($path): void {
            $handle = fopen($path, 'rb');
            if ($handle !== false) {
                fpassthru($handle);
                fclose($handle);
            }
        })->withHeader('Content-Type', $mime)
            ->withHeader('Content-Length', (string) filesize($path))
            ->withHeader('Content-Disposition', 'inline; filename="' . basename($path) . '"')
            ->withHeader('Accept-Ranges', 'bytes')
            ->withHeader('X-Content-Type-Options', 'nosniff');
    }

    private function serializeAd(VideoAd $ad, int $watchedToday = 0, int $dailyLimit = 0): array
    {
        return [
            'id' => (int) $ad->id,
            'title' => (string) $ad->title,
            'duration_seconds' => (int) $ad->duration_seconds,
            'reward_amount' => (float) $ad->reward_amount,
            'daily_limit' => $dailyLimit,
            'watched_today' => $watchedToday,
            'can_start' => $dailyLimit <= 0 || $watchedToday < $dailyLimit,
            'total_remaining' => (int) $ad->total_limit > 0 ? max(0, (int) $ad->total_limit - (int) $ad->total_views) : null,
        ];
    }

    private function serializeUser(?User $user): array
    {
        if ($user === null) return [];
        $user->resetDailyCountersIfNeeded();
        $data = $user->toArray();
        unset($data['password']);
        $data['ads_remaining'] = $user->adsRemainingToday();
        $data['is_admin'] = $user->isAdmin();
        return $data;
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
