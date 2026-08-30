<?php
// Nemesis 4.0.0 | Web routes — browser/session/CSRF | Created: 2026-04-02
// EarnApp clone: serves a single Blade view that hosts the Ghost.js SPA.
// Middleware group: 'web' (StartSession + VerifyCsrfToken)

use Nemesis\Router\Router;
use Nemesis\Http\Response;

/** @var Router $router */

$router->get('/', function () {
    ob_start();
    \Nemesis\Core\View::render('app', []);
    return Response::make(ob_get_clean(), 200, ['Content-Type' => 'text/html; charset=UTF-8']);
})->name('home');

$router->get('/admin', function () {
    ob_start();
    \Nemesis\Core\View::render('app', []);
    return Response::make(ob_get_clean(), 200, ['Content-Type' => 'text/html; charset=UTF-8']);
});

$router->get('/admin/login', function () {
    ob_start();
    \Nemesis\Core\View::render('app', []);
    return Response::make(ob_get_clean(), 200, ['Content-Type' => 'text/html; charset=UTF-8']);
});

// Catch-all for SPA routes (client-side routing)
$router->fallback(function () {
    ob_start();
    \Nemesis\Core\View::render('app', []);
    return Response::make(ob_get_clean(), 200, ['Content-Type' => 'text/html; charset=UTF-8']);
});
