<?php
// Nemesis 4.0.0 | API routes — stateless / JSON | Updated: 2026-08-30
// EarnApp clone: all API endpoints mounted under /api.

use Nemesis\Router\Router;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\AdController;
use App\Http\Controllers\Api\WebTaskController;
use App\Http\Controllers\Api\TgTaskController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\DailyBonusController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\JobController;
use App\Http\Controllers\Api\PosterController;
use App\Http\Controllers\Api\AdminSettingsController;
use App\Http\Controllers\Api\NotificationController;

/** @var Router $router */

$router->group(['prefix' => 'api', 'middleware' => 'cors'], function (Router $r) {
    // Health check
    $r->get('/health', fn() => \Nemesis\Http\Response::json(['success' => true, 'data' => ['status' => 'ok']]));

    // Public auth
    $r->add('POST', '/auth/register', [AuthController::class, 'register']);
    $r->add('POST', '/auth/login',    [AuthController::class, 'login']);
    $r->add('POST', '/auth/forgot-password', [AuthController::class, 'forgotPassword']);
    $r->add('POST', '/auth/reset-password',  [AuthController::class, 'resetPassword']);

    // Authenticated routes
    $r->group(['middleware' => 'auth.api'], function (Router $r) {
        $r->add('POST', '/auth/logout', [AuthController::class, 'logout']);
        $r->get('/auth/me', [AuthController::class, 'me'], 'auth.me');
        $r->add('POST', '/auth/change-password', [AuthController::class, 'changePassword']);

        // In-app notifications
        $r->get('/notifications', [NotificationController::class, 'index'], 'notifications.index');
        $r->add('POST', '/notifications/read-all', [NotificationController::class, 'markAllRead']);
        $r->add('POST', '/notifications/{id}/read', [NotificationController::class, 'markRead']);

        $r->get('/user',            [UserController::class, 'show']);
        $r->add('POST', '/user/reward',     [UserController::class, 'reward']);
        $r->add('POST', '/user/withdraw',   [UserController::class, 'withdraw']);
        $r->get('/user/withdrawals', [UserController::class, 'withdrawals'], 'user.withdrawals');
        $r->get('/user/referrals',   [UserController::class, 'referrals'],   'user.referrals');
        $r->get('/user/ads',         [UserController::class, 'ads'],         'user.ads');

        // Daily Bonus
        $r->add('POST', '/user/claim-daily-bonus', [DailyBonusController::class, 'claim']);
        $r->get('/user/daily-bonus-status', [DailyBonusController::class, 'status']);

        $r->get('/ads/config',       [AdController::class, 'config']);
        $r->get('/ads/next',         [AdController::class, 'next']);

        $r->get('/tasks/web',                [WebTaskController::class, 'index'], 'tasks.web.index');
        $r->add('POST', '/tasks/web/start',   [WebTaskController::class, 'start']);
        $r->add('POST', '/tasks/web/claim',   [WebTaskController::class, 'claim']);

        $r->get('/tasks/telegram',                  [TgTaskController::class, 'index'],  'tasks.tg.index');
        $r->add('POST', '/tasks/telegram/verify',   [TgTaskController::class, 'verify']);

        // Payments (deposit / TRXID)
        $r->get('/payment/gateways',    [PaymentController::class, 'gateways'],     'payment.gateways');
        $r->add('POST', '/payment/submit',     [PaymentController::class, 'submit']);
        $r->get('/payment/submissions', [PaymentController::class, 'submissions'], 'payment.submissions');

        // Jobs marketplace — public-ish (any authenticated user can browse + bid)
        $r->get('/categories',                 [JobController::class, 'categories'],   'jobs.categories');
        $r->get('/jobs',                       [JobController::class, 'index'],        'jobs.index');
        $r->get('/jobs/{id}',                  [JobController::class, 'show'],         'jobs.show');
        $r->add('POST', '/jobs/{id}/bid',       [JobController::class, 'bid']);
        $r->add('DELETE', '/bids/{id}',         [JobController::class, 'withdrawBid']);
        $r->get('/worker/bids',                [JobController::class, 'myBids'],       'worker.bids');
        $r->get('/worker/active-jobs',         [JobController::class, 'activeJobs'],   'worker.active-jobs');
        $r->add('POST', '/jobs/{id}/submit',    [JobController::class, 'submit']);
        $r->get('/worker/submissions',         [JobController::class, 'mySubmissions'], 'worker.submissions');

        // Poster endpoints
        $r->get('/poster/stats',               [PosterController::class, 'stats'],       'poster.stats');
        $r->add('POST', '/poster/jobs',         [PosterController::class, 'createJob']);
        $r->get('/poster/jobs',                [PosterController::class, 'myJobs'],      'poster.jobs');
        $r->get('/poster/jobs/{id}/bids',      [PosterController::class, 'jobBids'],     'poster.job-bids');
        $r->add('POST', '/poster/jobs/{id}/accept-bid', [PosterController::class, 'acceptBid']);
        $r->add('POST', '/poster/jobs/{id}/request-revision', [PosterController::class, 'requestRevision']);
        $r->add('POST', '/poster/jobs/{id}/release',    [PosterController::class, 'releasePayment']);
        $r->add('POST', '/poster/jobs/{id}/cancel',     [PosterController::class, 'cancelJob']);

        // Admin-only routes
        $r->group(['middleware' => 'admin'], function (Router $r) {
            $r->get('/admin/withdrawals',           [AdminController::class, 'withdrawals'], 'admin.withdrawals');
            $r->add('POST', '/admin/withdrawals/{id}/approve', [AdminController::class, 'approve']);
            $r->add('POST', '/admin/withdrawals/{id}/reject',  [AdminController::class, 'reject']);
            $r->add('POST', '/admin/withdrawals/{id}/pay',     [AdminController::class, 'pay']);
            $r->get('/admin/users',                 [AdminController::class, 'users'],     'admin.users');
            $r->add('POST', '/admin/users/{id}/role', [AdminController::class, 'updateRole']);
            $r->get('/admin/jobs',                  [AdminController::class, 'jobs'],      'admin.jobs');
            $r->add('POST', '/admin/jobs/{id}/dispute', [AdminController::class, 'flagDispute']);
            $r->add('POST', '/admin/jobs/{id}/resolve',  [AdminController::class, 'resolveJob']);
            $r->get('/admin/stats',                 [AdminController::class, 'stats'],     'admin.stats');
            $r->get('/admin/ad-providers',          [AdminController::class, 'adProviders'], 'admin.providers');
            $r->add('POST', '/admin/ad-providers/{id}', [AdminController::class, 'updateAdProvider']);

            // Daily Bonus Admin
            $r->add('POST', '/admin/reset-daily-counters', [DailyBonusController::class, 'resetCounters']);

            // Payments admin (TRXID verification)
            $r->get('/admin/payments',                              [PaymentController::class, 'adminList'],     'admin.payments');
            $r->add('POST', '/admin/payments/{id}/approve',          [PaymentController::class, 'adminApprove']);
            $r->add('POST', '/admin/payments/{id}/reject',           [PaymentController::class, 'adminReject']);

            // Categories admin
            $r->get('/admin/categories',                             [AdminSettingsController::class, 'categories'],      'admin.categories');
            $r->add('POST', '/admin/categories',                      [AdminSettingsController::class, 'createCategory']);
            $r->add('POST', '/admin/categories/{id}',                 [AdminSettingsController::class, 'updateCategory']);
            $r->add('POST', '/admin/categories/{id}/delete',          [AdminSettingsController::class, 'deleteCategory']);

            // Platform settings
            $r->get('/admin/settings',                               [AdminSettingsController::class, 'listSettings'],    'admin.settings');
            $r->add('POST', '/admin/settings',                        [AdminSettingsController::class, 'updateSettings']);

            // Transactions ledger + revenue stats
            $r->get('/admin/transactions',                           [AdminSettingsController::class, 'transactions'],    'admin.transactions');
            $r->get('/admin/revenue',                                [AdminSettingsController::class, 'revenue'],         'admin.revenue');
            $r->get('/admin/reports',                                [AdminSettingsController::class, 'reports'],         'admin.reports');
        });
    });
});
