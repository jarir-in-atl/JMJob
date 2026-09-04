<?php
declare(strict_types=1);

namespace App\Notifications;

use App\Services\NotificationService;
use Nemesis\Notifications\Notification;

/** Small database-backed notification used by platform events. */
class PlatformNotification extends Notification
{
    public function __construct(
        private string $title,
        private string $message,
        private string $tone = 'info',
        private string $icon = 'bi-bell',
        private ?string $actionUrl = null,
    ) {}

    public function via(object $notifiable): array
    {
        return NotificationService::emailEnabled() ? ['database', 'mail'] : ['database'];
    }

    public function toMail(object $notifiable): array
    {
        $title = htmlspecialchars($this->title, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
        $message = nl2br(htmlspecialchars($this->message, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'));
        $from = getenv('MAIL_FROM') ?: getenv('MAIL_FROM_ADDRESS') ?: null;

        return [
            'subject' => 'JMJob - ' . $this->title,
            'body'    => '<h2>' . $title . '</h2><p>' . $message . '</p>',
            'from'    => $from,
        ];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'title'      => $this->title,
            'message'    => $this->message,
            'tone'       => $this->tone,
            'icon'       => $this->icon,
            'action_url' => $this->actionUrl,
        ];
    }
}
