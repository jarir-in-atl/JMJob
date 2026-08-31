<?php
declare(strict_types=1);

// Nemesis 4.0.0 | Phase 3 — MiddlewareInterface | Updated: 2026-04-02

namespace Nemesis\Http\Middleware;

use Nemesis\Contracts\MiddlewareInterface;
use Nemesis\Http\Request;
use Nemesis\Http\Response;

class CheckForMaintenanceMode implements MiddlewareInterface
{
    public function handle(Request $request, callable $next): Response
    {
        // Use base_path() instead of a hardcoded relative path. The
        // original `__DIR__ . '/../../../../storage/framework/down'`
        // assumed this file lives at `app/Http/Middleware/`, but after
        // the flat structure refactor it lives at `src/Http/Middleware/`,
        // so 4 `..`s walk past the project root and hit the open_basedir
        // wall. base_path() always resolves to the project root
        // regardless of how the framework is laid out.
        $maintenanceFile = base_path('storage/framework/down');

        if (file_exists($maintenanceFile)) {
            return Response::json([
                'error'   => true,
                'message' => 'Application is down for maintenance. Please try again later.',
            ], 503)->withHeader('Retry-After', '3600');
        }

        return $next($request);
    }
}
