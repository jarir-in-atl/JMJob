<?php
declare(strict_types=1);

// Nemesis 7.1.1 | EarnApp — API auth middleware (Bearer token in `sessions` table)

namespace Nemesis\Http\Middleware;

use Nemesis\Contracts\MiddlewareInterface;
use Nemesis\Http\Request;
use Nemesis\Http\Response;
use App\Models\Session as UserSession;
use App\Models\User;

class AuthenticateApi implements MiddlewareInterface
{
    public function handle(Request $request, callable $next): Response
    {
        $token = (string) $request->bearerToken();

        // Fallback: ?token=... query param
        if ($token === '') {
            $queryStr = $request->uri();
            $parsed = parse_url($queryStr, PHP_URL_QUERY);
            if (is_string($parsed)) {
                parse_str($parsed, $q);
                if (isset($q['token']) && is_string($q['token']) && $q['token'] !== '') {
                    $token = $q['token'];
                }
            }
        }

        if ($token === '') {
            return self::unauthorized('Missing Authorization header or ?token=... query param.');
        }

        $session = UserSession::findValid($token);
        if ($session === null) {
            return self::unauthorized('Invalid or expired token.');
        }

        $user = $session->user();
        if ($user === null) {
            return self::unauthorized('User no longer exists.');
        }

        // Stash user + session on the request for downstream controllers.
        $request->setMeta('auth.user', $user);
        $request->setMeta('auth.session', $session);

        return $next($request);
    }

    private static function unauthorized(string $message): Response
    {
        return Response::json([
            'success' => false,
            'message' => $message,
            'error'   => 'unauthorized',
        ], 401);
    }
}
