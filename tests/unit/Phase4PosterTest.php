<?php
declare(strict_types=1);

/** Static coverage for the completed Phase 4 poster workflow. */

use Nemesis\Testing\TestCase;

class Phase4PosterTest extends TestCase
{
    public function testPosterApiWorkflowIsRegistered(): void
    {
        $routes = file_get_contents(base_path('routes/api.php'));
        foreach (['/poster/stats', '/poster/jobs', '/poster/jobs/{id}/bids', '/poster/jobs/{id}/accept-bid', '/poster/jobs/{id}/request-revision', '/poster/jobs/{id}/release', '/poster/jobs/{id}/cancel'] as $route) {
            $this->assertTrue(str_contains($routes, $route), "Missing poster route: {$route}");
        }
    }

    public function testPosterPagesAndApiMethodsExist(): void
    {
        foreach (['PostJobPage.js', 'PosterJobsPage.js', 'PosterJobDetailPage.js', 'PosterWalletPage.js'] as $view) {
            $this->assertTrue(file_exists(base_path('earnap-client/src/views/' . $view)), "Missing poster view: {$view}");
        }
        $api = file_get_contents(base_path('earnap-client/src/api.js'));
        foreach (['posterCreateJob', 'posterMyJobs', 'posterJobBids', 'posterAcceptBid', 'posterRequestRevision', 'posterReleasePayment', 'posterCancelJob'] as $method) {
            $this->assertTrue(str_contains($api, $method), "Missing poster API method: {$method}");
        }
    }

    public function testPosterWalletAccountingUsesRoleSpecificWallet(): void
    {
        $payments = file_get_contents(base_path('app/Services/PaymentService.php'));
        $jobs = file_get_contents(base_path('app/Services/JobService.php'));
        $this->assertTrue(str_contains($payments, "'wallet_balance' => \$newWallet"));
        $this->assertTrue(str_contains($jobs, "'wallet_balance' => \$pNewWallet"));
        $this->assertTrue(str_contains($jobs, "'wallet_balance' => \$newWallet"));
    }

    public function testPosterControllerGuardsEveryWorkflowAction(): void
    {
        $controller = file_get_contents(base_path('app/Http/Controllers/Api/PosterController.php'));
        foreach (['stats', 'createJob', 'myJobs', 'jobBids', 'acceptBid', 'requestRevision', 'releasePayment', 'cancelJob'] as $method) {
            $this->assertTrue(str_contains($controller, "public function {$method}"));
        }
        $this->assertTrue(substr_count($controller, 'posterGuard($request)') >= 8);
    }
}
