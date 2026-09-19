<?php
declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Models\VideoAd;
use App\Models\User;
use Nemesis\Core\Controller;
use Nemesis\Core\Database;
use Nemesis\Core\Fluent;
use Nemesis\Http\Request;
use Nemesis\Http\Response;
use Nemesis\Support\FileValidator;

/** Admin CRUD for first-party rewarded video ads. */
class AdminVideoAdController extends Controller
{
    public function index(Request $request): Response
    {
        if ($guard = $this->adminGuard($request)) return $guard;
        $rows = Fluent::table('video_ads')->orderBy('id', 'desc')->get();
        return Response::json(['success' => true, 'data' => array_map(fn($row) => $this->serialize((array) $row), $rows->all())]);
    }

    public function store(Request $request): Response
    {
        if ($guard = $this->adminGuard($request)) return $guard;
        $admin = $request->getMeta('auth.user');
        $body = $request->all();
        $file = $request->file('video') ?? $request->file('file');
        $error = $this->validateFields($body, true, $file);
        if ($error !== null) return Response::json(['success' => false, 'message' => $error], 422);

        $upload = FileValidator::video($file, base_path('storage/video-ads'), (int) $admin->id, 500, 'video');
        if ($upload->failed()) return Response::json(['success' => false, 'message' => $upload->error ?: 'Video upload failed.'], 422);
        $path = 'video-ads/' . basename((string) $upload->path);

        try {
            $id = (int) Fluent::table('video_ads')->insert($this->fields($body, $path, (int) $admin->id));
        } catch (\Throwable $e) {
            $this->deleteStoredFile($path);
            return Response::json(['success' => false, 'message' => 'Video ad could not be created.'], 500);
        }
        $this->audit($admin, 'video_ad.create', $id, ['title' => (string) ($body['title'] ?? '')]);

        return Response::json(['success' => true, 'message' => 'Video ad created.', 'data' => $this->findSerialized($id)], 201);
    }

    public function update(Request $request, int $id): Response
    {
        if ($guard = $this->adminGuard($request)) return $guard;
        $ad = VideoAd::find($id);
        if ($ad === null) return Response::json(['success' => false, 'message' => 'Video ad not found.'], 404);
        $body = $request->all();
        $file = $request->file('video') ?? $request->file('file');
        $error = $this->validateFields($body, false, $file);
        if ($error !== null) return Response::json(['success' => false, 'message' => $error], 422);

        $newPath = null;
        if ($file !== null) {
            $upload = FileValidator::video($file, base_path('storage/video-ads'), $id, 500, 'video');
            if ($upload->failed()) return Response::json(['success' => false, 'message' => $upload->error ?: 'Video upload failed.'], 422);
            $newPath = 'video-ads/' . basename((string) $upload->path);
        }

        $fields = $this->fields($body, $newPath, null, false);
        if ($fields === []) {
            if ($newPath !== null) $this->deleteStoredFile($newPath);
            return Response::json(['success' => true, 'message' => 'No changes supplied.', 'data' => $this->serialize($ad)]);
        }
        try {
            Fluent::table('video_ads')->where('id', '=', $id)->update($fields + ['updated_at' => date('Y-m-d H:i:s')]);
        } catch (\Throwable $e) {
            if ($newPath !== null) $this->deleteStoredFile($newPath);
            return Response::json(['success' => false, 'message' => 'Video ad could not be updated.'], 500);
        }
        if ($newPath !== null && !empty($ad->video_path)) $this->deleteStoredFile((string) $ad->video_path);
        $this->audit($request->getMeta('auth.user'), 'video_ad.update', $id, ['fields' => array_keys($fields)]);
        return Response::json(['success' => true, 'message' => 'Video ad updated.', 'data' => $this->findSerialized($id)]);
    }

    public function delete(Request $request, int $id): Response
    {
        if ($guard = $this->adminGuard($request)) return $guard;
        $ad = VideoAd::find($id);
        if ($ad === null) return Response::json(['success' => false, 'message' => 'Video ad not found.'], 404);
        Fluent::table('video_ads')->where('id', '=', $id)->delete();
        if (!empty($ad->video_path)) $this->deleteStoredFile((string) $ad->video_path);
        $this->audit($request->getMeta('auth.user'), 'video_ad.delete', $id, ['title' => (string) ($ad->title ?? '')]);
        return Response::json(['success' => true, 'message' => 'Video ad deleted.']);
    }

    private function validateFields(array $body, bool $requiresFile, mixed $file): ?string
    {
        $title = trim((string) ($body['title'] ?? ''));
        if ($requiresFile && $file === null) return 'A video file is required.';
        if (($requiresFile || array_key_exists('title', $body)) && ($title === '' || strlen($title) > 160)) {
            return 'title is required and must be 160 characters or fewer.';
        }
        if (isset($body['duration_seconds']) && ((int) $body['duration_seconds'] < 1 || (int) $body['duration_seconds'] > 86400)) return 'duration_seconds must be between 1 and 86400.';
        if (isset($body['reward_amount']) && ((float) $body['reward_amount'] < 0 || (float) $body['reward_amount'] > 1000000)) return 'reward_amount is invalid.';
        foreach (['daily_limit', 'total_limit'] as $key) {
            if (isset($body[$key]) && (int) $body[$key] < 0) return $key . ' cannot be negative.';
        }
        if (isset($body['status']) && !in_array((string) $body['status'], [VideoAd::STATUS_ACTIVE, VideoAd::STATUS_PAUSED], true)) return 'status must be active or paused.';
        foreach (['starts_at', 'ends_at'] as $key) {
            if (isset($body[$key]) && trim((string) $body[$key]) !== '' && strtotime((string) $body[$key]) === false) return $key . ' is invalid.';
        }
        return null;
    }

    private function fields(array $body, ?string $path, ?int $adminId, bool $create = true): array
    {
        $fields = [];
        foreach (['title', 'status'] as $key) {
            if ($create || array_key_exists($key, $body)) $fields[$key] = trim((string) ($body[$key] ?? ($key === 'status' ? VideoAd::STATUS_ACTIVE : '')));
        }
        foreach (['duration_seconds', 'daily_limit', 'total_limit'] as $key) {
            if ($create || array_key_exists($key, $body)) $fields[$key] = (int) ($body[$key] ?? ($key === 'duration_seconds' ? 10 : 0));
        }
        if ($create || array_key_exists('reward_amount', $body)) $fields['reward_amount'] = (float) ($body['reward_amount'] ?? 0);
        foreach (['starts_at', 'ends_at'] as $key) {
            if ($create || array_key_exists($key, $body)) $fields[$key] = $this->dateValue($body[$key] ?? null);
        }
        if ($path !== null) $fields['video_path'] = $path;
        if ($create && $adminId !== null) $fields['created_by'] = $adminId;
        if ($create) $fields['created_at'] = date('Y-m-d H:i:s');
        return $fields;
    }

    private function dateValue(mixed $value): ?string
    {
        $value = trim((string) ($value ?? ''));
        return $value === '' ? null : date('Y-m-d H:i:s', (int) strtotime($value));
    }

    private function findSerialized(int $id): array
    {
        $ad = VideoAd::find($id);
        return $ad ? $this->serialize($ad) : [];
    }

    private function serialize(VideoAd|array $ad): array
    {
        $get = static fn(string $key, mixed $default = null): mixed => is_array($ad) ? ($ad[$key] ?? $default) : ($ad->{$key} ?? $default);
        return [
            'id' => (int) $get('id', 0),
            'title' => (string) $get('title', ''),
            'video_path' => (string) $get('video_path', ''),
            'stream_url' => '/api/ads/videos/' . (int) $get('id', 0) . '/stream',
            'duration_seconds' => (int) $get('duration_seconds', 0),
            'status' => (string) $get('status', VideoAd::STATUS_PAUSED),
            'reward_amount' => (float) $get('reward_amount', 0),
            'starts_at' => $get('starts_at'),
            'ends_at' => $get('ends_at'),
            'daily_limit' => (int) $get('daily_limit', 0),
            'total_limit' => (int) $get('total_limit', 0),
            'total_views' => (int) $get('total_views', 0),
            'completed_views' => (int) $get('completed_views', 0),
            'created_by' => $get('created_by') !== null ? (int) $get('created_by') : null,
            'created_at' => $get('created_at'),
            'updated_at' => $get('updated_at'),
        ];
    }

    private function deleteStoredFile(string $relative): void
    {
        if (!str_starts_with($relative, 'video-ads/') || str_contains($relative, '..')) return;
        $root = realpath(base_path('storage/video-ads'));
        $path = realpath(base_path('storage/' . $relative));
        if ($root !== false && $path !== false && str_starts_with($path, rtrim($root, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR) && is_file($path)) @unlink($path);
    }

    private function audit(?User $admin, string $action, int $adId, array $details = []): void
    {
        if ($admin === null || !(int) ($admin->id ?? 0)) return;
        try {
            Fluent::table('admin_action_logs')->insert([
                'admin_id' => (int) $admin->id,
                'action' => $action,
                'entity_type' => 'video_ad',
                'entity_id' => $adId,
                'details' => json_encode($details, JSON_UNESCAPED_UNICODE),
                'created_at' => date('Y-m-d H:i:s'),
            ]);
        } catch (\Throwable) {
            // Audit storage is additive and must not break ad management.
        }
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
        if (!$admin->isAdmin()) {
            return Response::json([
                'success' => false,
                'message' => 'Administrator access required.',
                'error' => 'forbidden',
            ], 403);
        }
        return null;
    }
}
