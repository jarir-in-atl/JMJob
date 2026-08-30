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

/** @var Router $router */

$router->group(['prefix' => 'api', 'middleware' => 'cors'], function (Router $r) {
    // Health check
    $r->get('/health', fn() => \Nemesis\Http\Response::json(['success' => true, 'data' => ['status' => 'ok']]));

    // Public auth
    $r->add('POST', '/auth/register', [AuthController::class, 'register']);
    $r->add('POST', '/auth/login',    [AuthController::class, 'login']);

    // Authenticated routes
    $r->group(['middleware' => 'auth.api'], function (Router $r) {
        $r->add('POST', '/auth/logout', [AuthController::class, 'logout']);
        $r->get('/auth/me', [AuthController::class, 'me'], 'auth.me');

        $r->get('/user',            [UserController::class, 'show']);
        $r->add('POST', '/user/reward',     [UserController::class, 'reward']);
        $r->add('POST', '/user/withdraw',   [UserController::class, 'withdraw']);
        $r->get('/user/withdrawals', [UserController::class, 'withdrawals'], 'user.withdrawals');
        $r->get('/user/referrals',   [UserController::class, 'referrals'],   'user.referrals');
        $r->get('/user/ads',         [UserController::class, 'ads'],         'user.ads');

        $r->get('/ads/config',       [AdController::class, 'config']);
        $r->get('/ads/next',         [AdController::class, 'next']);

        $r->get('/tasks/web',                [WebTaskController::class, 'index'], 'tasks.web.index');
        $r->add('POST', '/tasks/web/start',   [WebTaskController::class, 'start']);
        $r->add('POST', '/tasks/web/claim',   [WebTaskController::class, 'claim']);

        $r->get('/tasks/telegram',                  [TgTaskController::class, 'index'],  'tasks.tg.index');
        $r->add('POST', '/tasks/telegram/verify',   [TgTaskController::class, 'verify']);

        // Admin-only routes
        $r->group(['middleware' => 'admin'], function (Router $r) {
            $r->get('/admin/withdrawals',           [AdminController::class, 'withdrawals'], 'admin.withdrawals');
            $r->add('POST', '/admin/withdrawals/{id}/approve', [AdminController::class, 'approve']);
            $r->add('POST', '/admin/withdrawals/{id}/reject',  [AdminController::class, 'reject']);
            $r->add('POST', '/admin/withdrawals/{id}/pay',     [AdminController::class, 'pay']);
            $r->get('/admin/users',                 [AdminController::class, 'users'],     'admin.users');
            $r->get('/admin/stats',                 [AdminController::class, 'stats'],     'admin.stats');
            $r->get('/admin/ad-providers',          [AdminController::class, 'adProviders'], 'admin.providers');
            $r->add('POST', '/admin/ad-providers/{id}', [AdminController::class, 'updateAdProvider']);
        });
    });
});
