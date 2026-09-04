<?php
declare(strict_types=1);

namespace App\Services;

use App\Models\User;
use App\Notifications\PlatformNotification;
use Nemesis\Notifications\Channels\DatabaseChannel;

/** Application notification facade for delivery and API serialization. */
class NotificationService
{
    /** Email is used only when mail is explicitly configured for the app. */
    public static function emailEnabled(): bool
    {
        $override = getenv('NOTIFICATIONS_EMAIL_ENABLED');
        if ($override !== false && $override !== '') {
            return in_array(strtolower(trim((string) $override)), ['1', 'true', 'yes', 'on'], true);
        }

        $host = trim((string) (getenv('MAIL_HOST') ?: ''));
        $user = trim((string) (getenv('MAIL_USER') ?: getenv('MAIL_USERNAME') ?: ''));
        $pass = (string) (getenv('MAIL_PASS') ?: getenv('MAIL_PASSWORD') ?: '');
        $from = trim((string) (getenv('MAIL_FROM') ?: getenv('MAIL_FROM_ADDRESS') ?: ''));

        return $host !== '' && $user !== '' && $pass !== '' && $from !== '';
    }

    public static function send(
        ?User $user,
        string $title,
        string $message,
        string $tone = 'info',
        string $icon = 'bi-bell',
        ?string $actionUrl = null,
    ): void {
        if ($user === null || !(int) ($user->id ?? 0)) return;

        try {
            $user->notify(new PlatformNotification($title, $message, $tone, $icon, $actionUrl));
        } catch (\Throwable) {
            // Notification delivery must not break the financial/user action.
        }
    }

    public static function listFor(User $user, int $limit = 50, bool $unreadOnly = false): array
    {
        $rows = $unreadOnly ? $user->unreadNotifications() : $user->notifications();
        $limit = max(1, min(100, $limit));
        return array_map([self::class, 'serialize'], array_slice($rows, 0, $limit));
    }

    public static function unreadCount(User $user): int
    {
        return $user->unreadNotificationCount();
    }

    public static function markRead(User $user, string $notificationId): bool
    {
        return DatabaseChannel::markRead($user, $notificationId);
    }

    public static function markAllRead(User $user): void
    {
        $user->markNotificationsRead();
    }

    private static function serialize(array $row): array
    {
        $data = is_array($row['data'] ?? null) ? $row['data'] : [];
        return [
            'id'         => (string) ($row['id'] ?? ''),
            'type'       => (string) ($row['type'] ?? ''),
            'data'       => $data,
            'read_at'    => $row['read_at'] ?? null,
            'created_at' => $row['created_at'] ?? null,
            'read'       => ($row['read_at'] ?? null) !== null,
        ];
    }
}
