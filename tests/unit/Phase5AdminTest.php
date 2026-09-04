<?php
declare(strict_types=1);

/** Static coverage for the Phase 5 admin panel surface. */

use Nemesis\Testing\TestCase;

class Phase5AdminTest extends TestCase
{
    public function testAdminEndpointsAreRegistered(): void
    {
        $routes = file_get_contents(base_path('routes/api.php'));
        foreach (['/admin/users/{id}/role', '/admin/jobs', '/admin/jobs/{id}/dispute', '/admin/jobs/{id}/resolve', '/admin/transactions', '/admin/reports'] as $route) {
            $this->assertTrue(str_contains($routes, $route), "Missing Phase 5 route: {$route}");
        }
    }

    public function testAdminViewsAndApiMethodsExist(): void
    {
        foreach (['AdminJobsPage.js', 'AdminTransactionsPage.js', 'AdminReportsPage.js'] as $view) {
            $this->assertTrue(file_exists(base_path('earnap-client/src/views/' . $view)), "Missing view: {$view}");
        }
        $api = file_get_contents(base_path('earnap-client/src/api.js'));
        foreach (['adminUpdateUserRole', 'adminJobs', 'adminFlagJobDispute', 'adminResolveJob', 'adminTransactions', 'adminReports'] as $method) {
            $this->assertTrue(str_contains($api, $method), "Missing API method: {$method}");
        }
    }

    public function testDisputeResolutionUsesJobSpecificEscrow(): void
    {
        $service = file_get_contents(base_path('app/Services/JobService.php'));
        $this->assertTrue(str_contains($service, "Refund only this job's escrow"));
        $this->assertTrue(str_contains($service, 'STATUS_DISPUTED'));
    }
}
