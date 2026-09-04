<?php
declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Services\NotificationService;
use Nemesis\Core\Controller;
use Nemesis\Http\Request;
use Nemesis\Http\Response;

/** Authenticated in-app notification endpoints. */
class NotificationController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->getMeta('auth.user');
        $limit = (int) ($request->query('limit') ?: 50);
        $unreadOnly = in_array(strtolower((string) $request->query('unread')), ['1', 'true', 'yes'], true);

        return Response::json([
            'success' => true,
            'data'    => NotificationService::listFor($user, $limit, $unreadOnly),
            'meta'    => ['unread_count' => NotificationService::unreadCount($user)],
        ]);
    }

    public function markRead(Request $request, string $id): Response
    {
        $user = $request->getMeta('auth.user');
        if ($id === '' || strlen($id) > 64 || !preg_match('/^[A-Za-z0-9-]+$/', $id)) {
            return Response::json(['success' => false, 'message' => 'Invalid notification id.'], 422);
        }
        if (!NotificationService::markRead($user, $id)) {
            return Response::json(['success' => false, 'message' => 'Notification not found.'], 404);
        }
        return Response::json(['success' => true, 'message' => 'Notification marked as read.']);
    }

    public function markAllRead(Request $request): Response
    {
        $user = $request->getMeta('auth.user');
        NotificationService::markAllRead($user);
        return Response::json(['success' => true, 'message' => 'All notifications marked as read.']);
    }
}
