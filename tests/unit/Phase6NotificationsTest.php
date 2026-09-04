<?php
declare(strict_types=1);

/** Static and in-memory coverage for the Phase 6 notifications foundation. */

use Nemesis\Testing\TestCase;
use Nemesis\Notifications\Notification;
use Nemesis\Notifications\NotificationManager;
use Nemesis\Notifications\Notifiable;

class Phase6NotificationRecipient
{
    use Notifiable;
    public int $id = 42;
}

class Phase6TestNotification extends Notification
{
    public function via(object $notifiable): array { return ['database']; }
    public function toDatabase(object $notifiable): array { return ['title' => 'Test', 'message' => 'Hello']; }
}

class Phase6NotificationsTest extends TestCase
{
    public function testNotificationMigrationAndApiExist(): void
    {
        $migration = base_path('database/migrations/2026_09_04_000001_create_notifications_table.php');
        $this->assertTrue(file_exists($migration));
        $this->assertTrue(str_contains(file_get_contents($migration), 'CREATE TABLE IF NOT EXISTS notifications'));
        $routes = file_get_contents(base_path('routes/api.php'));
        foreach (['/notifications', '/notifications/read-all', '/notifications/{id}/read'] as $route) {
            $this->assertTrue(str_contains($routes, $route), "Missing notification route: {$route}");
        }
    }

    public function testNotificationStorageCanBeReadAndMarked(): void
    {
        NotificationManager::reset();
        $recipient = new Phase6NotificationRecipient();
        $recipient->notify(new Phase6TestNotification());
        $rows = $recipient->notifications();
        $this->assertCount(1, $rows);
        $this->assertNull($rows[0]['read_at']);
        $this->assertTrue(\Nemesis\Notifications\Channels\DatabaseChannel::markRead($recipient, $rows[0]['id']));
        $this->assertSame(0, $recipient->unreadNotificationCount());
        NotificationManager::reset();
    }

    public function testFrontendNotificationSurfaceExists(): void
    {
        $view = base_path('earnap-client/src/views/NotificationsPage.js');
        $loader = file_get_contents(base_path('earnap-client/src/route-loader.js'));
        $api = file_get_contents(base_path('earnap-client/src/api.js'));
        $this->assertTrue(file_exists($view));
        foreach (['NotificationsPage', 'notificationsReadAll', 'notificationRead', 'topbar-notification-badge'] as $marker) {
            $source = $marker === 'NotificationsPage' ? $loader : ($marker === 'topbar-notification-badge' ? file_get_contents(base_path('earnap-client/src/components/TopBar.js')) : $api);
            $this->assertTrue(str_contains($source, $marker), "Missing notification frontend marker: {$marker}");
        }
    }

    public function testPhase6SearchEmailAndMobileSurfaceExists(): void
    {
        $jobController = file_get_contents(base_path('app/Http/Controllers/Api/JobController.php'));
        $jobModel = file_get_contents(base_path('app/Models/Job.php'));
        $notification = file_get_contents(base_path('app/Notifications/PlatformNotification.php'));
        $service = file_get_contents(base_path('app/Services/NotificationService.php'));
        $jobsView = file_get_contents(base_path('earnap-client/src/views/JobsAvailablePage.js'));
        $sidebar = file_get_contents(base_path('earnap-client/src/components/Sidebar.js'));
        $mobileNav = file_get_contents(base_path('earnap-client/src/components/MobileNav.js'));

        foreach (['availablePage', 'min_budget', 'max_budget', 'last_page', 'per_page', 'Invalid job sort'] as $marker) {
            $this->assertTrue(str_contains($jobController . $jobModel, $marker), "Missing job browse marker: {$marker}");
        }
        foreach (['toMail', "['database', 'mail']"] as $marker) {
            $this->assertTrue(str_contains($notification, $marker), "Missing email notification marker: {$marker}");
        }
        $this->assertTrue(str_contains($service, 'emailEnabled'));
        foreach (['jobs-min-budget', 'jobs-max-budget', 'jobs-pagination', 'data-jobs-page'] as $marker) {
            $this->assertTrue(str_contains($jobsView, $marker), "Missing jobs UI marker: {$marker}");
        }
        $this->assertTrue(str_contains($sidebar, "'/notifications'"));
        $this->assertTrue(str_contains($mobileNav, "'/notifications'"));
    }
}
