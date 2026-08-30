<?php
/**
 * Nemesis - A PHP Framework For LightWeight API Design
 *
 * @package  JarirAhmed
 * @author   Jarir Ahmed <jarircse16@gmail.com>
 */
// CORS is now handled by Nemesis\Http\Middleware\CorsMiddleware per route-group.
// Apply it to the 'api' group in routes/api.php via ->middleware('cors').
// Updated: 2026-04-03

require __DIR__ . "/../vendor/autoload.php";

use Nemesis\Core\Config;
use Nemesis\Core\Database;
use Nemesis\Core\View;
use Nemesis\Core\Container;

Config::load(__DIR__ . '/..');
View::addPath(__DIR__ . '/../views');

$container = \Nemesis\Core\Container::getInstance();
$container->singleton(\Nemesis\Http\Request::class);
$container->singleton(\Nemesis\Router\Router::class);

set_exception_handler(['Nemesis\Core\ErrorHandler', 'handleException']);
set_error_handler(['Nemesis\Core\ErrorHandler', 'handleError']);

$config = require __DIR__ . '/../config/config.php';
Database::connect($config['database']);

// Load plugins early in boot process
$pluginManager = \Nemesis\Core\PluginManager::getInstance();
$pluginManager->discover();

// Load routes
$router = require __DIR__ . "/../routes/route.php";
require __DIR__ . "/../routes/web.php";
require __DIR__ . "/../routes/api.php";

// Normalize URI by removing base folder (if any)
$uri = $_SERVER['REQUEST_URI'];
$scriptName = $_SERVER['SCRIPT_NAME'];

$basePath = str_replace('\\', '/', dirname($scriptName));

if ($basePath !== '/' && substr($basePath, -1) === '/') {
    $basePath = rtrim($basePath, '/');
}

if ($basePath !== '/' && strpos($uri, $basePath) === 0) {
    $uri = substr($uri, strlen($basePath));
}

if ($uri === '' || $uri[0] !== '/') {
    $uri = '/' . $uri;
}

$response = $router->dispatch($uri, $_SERVER['REQUEST_METHOD']);

if ($response instanceof \Nemesis\Http\Response) {
    $response->send();
} elseif (is_string($response)) {
    echo $response;
} elseif (is_numeric($response)) {
    echo (string) $response;
}
