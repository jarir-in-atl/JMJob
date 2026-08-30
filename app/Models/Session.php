<?php
declare(strict_types=1);

namespace App\Models;

use Nemesis\Core\Model;
use Nemesis\Core\Fluent;

/**
 * Session model — represents an auth token issued to a logged-in user.
 * Used by the API's `auth.api` middleware to validate Bearer tokens.
 */
class Session extends Model
{
    public function __construct(array $attributes = [])
    {
        $this->table = 'sessions';
        parent::__construct($attributes);
    }



    protected $fillable = ['user_id', 'token', 'ip_address', 'user_agent', 'expires_at'];
    protected $hidden = ['token'];

    public static function createForUser(int $userId, ?string $ip = null, ?string $ua = null, int $ttlDays = 30): self
    {
        $token = bin2hex(random_bytes(32));
        $expires = date('Y-m-d H:i:s', time() + $ttlDays * 86400);

        $id = Fluent::table('sessions')->insert([
            'user_id'    => $userId,
            'token'      => $token,
            'ip_address' => $ip,
            'user_agent' => $ua !== null ? substr($ua, 0, 250) : null,
            'expires_at' => $expires,
        ]);
        $session = self::find((int) $id);
        return $session;
    }

    public static function findValid(string $token): ?self
    {
        if ($token === '') {
            return null;
        }
        $row = Fluent::table('sessions')
            ->where('token', '=', $token)
            ->first();
        if (!$row) {
            return null;
        }
        $session = self::find((int) $row['id']);
        if (!$session) {
            return null;
        }
        if ($session->expires_at && strtotime((string) $session->expires_at) < time()) {
            $session->delete();
            return null;
        }
        return $session;
    }

    public function user(): ?User
    {
        return User::find((int) $this->user_id);
    }

    public function isExpired(): bool
    {
        return $this->expires_at && strtotime((string) $this->expires_at) < time();
    }
}
