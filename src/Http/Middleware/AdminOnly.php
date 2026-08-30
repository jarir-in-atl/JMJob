<?php
declare(strict_types=1);

// Nemesis 7.1.1 | EarnApp — admin-only API middleware (depends on AuthenticateApi)

namespace Nemesis\Http\Middleware;

use Nemesis\Contracts\MiddlewareInterface;
use Nemesis\Http\Request;
use Nemesis\Http\Response;

class AdminOnly implements MiddlewareInterface
{
    public function handle(Request $request, callable $next): Response
    {
        $user = $request->getMeta('auth.user');
        if ($user === null) {
            return Response::json([
                'success' => false,
                'message' => 'Authentication required.',
                'error'   => 'unauthorized',
            ], 401);
        }
        if (!method_exists($user, 'isAdmin') || !$user->isAdmin()) {
            return Response::json([
                'success' => false,
                'message' => 'Admin access required.',
                'error'   => 'forbidden',
            ], 403);
        }
        return $next($request);
    }
}
