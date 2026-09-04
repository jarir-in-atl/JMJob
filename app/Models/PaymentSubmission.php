<?php
declare(strict_types=1);

namespace App\Models;

use Nemesis\Core\Model;
use Nemesis\Core\Fluent;

/**
 * PaymentSubmission — a user's TRXID-based deposit awaiting admin verification.
 *
 * Status flow:
 *   pending  → approved | rejected
 *   approved → balance credited, transaction logged
 *   rejected → admin_note captured, user notified
 */
class PaymentSubmission extends Model
{
    public function __construct(array $attributes = [])
    {
        $this->table = 'payment_submissions';
        parent::__construct($attributes);
    }

    protected $fillable = [
        'user_id', 'gateway', 'sender_number', 'amount', 'trxid',
        'status', 'admin_id', 'admin_note', 'verified_at',
    ];

    public const STATUS_PENDING  = 'pending';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_REJECTED = 'rejected';
    public const STATUS_EXPIRED  = 'expired';

    public const SUPPORTED_GATEWAYS = ['bkash', 'nagad', 'rocket', 'upay'];

    public function user(): ?User
    {
        return User::find((int) $this->user_id);
    }

    public function admin(): ?User
    {
        return $this->admin_id ? User::find((int) $this->admin_id) : null;
    }

    public function isPending(): bool
    {
        return ($this->status ?? '') === self::STATUS_PENDING;
    }

    public static function findByTrxid(string $trxid): ?self
    {
        $row = Fluent::table('payment_submissions')
            ->where('trxid', '=', $trxid)
            ->first();
        return $row ? new self((array) $row) : null;
    }

    public static function pendingForUser(int $userId): array
    {
        $rows = Fluent::table('payment_submissions')
            ->where('user_id', '=', $userId)
            ->where('status', '=', self::STATUS_PENDING)
            ->orderBy('created_at', 'desc')
            ->get()
            ->all();
        return array_map(fn($r) => new self((array) $r), $rows);
    }

    public static function allForUser(int $userId, int $limit = 50): array
    {
        $rows = Fluent::table('payment_submissions')
            ->where('user_id', '=', $userId)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get()
            ->all();
        return array_map(fn($r) => new self((array) $r), $rows);
    }

    public static function allPending(int $limit = 100): array
    {
        $rows = Fluent::table('payment_submissions')
            ->where('status', '=', self::STATUS_PENDING)
            ->orderBy('created_at', 'asc')
            ->limit($limit)
            ->get()
            ->all();
        return array_map(fn($r) => new self((array) $r), $rows);
    }

    public static function allFiltered(?string $status = null, int $limit = 200): array
    {
        $q = Fluent::table('payment_submissions')
            ->orderBy('created_at', 'desc')
            ->limit($limit);
        if ($status !== null && $status !== '') {
            $q->where('status', '=', $status);
        }
        $rows = $q->get()->all();
        return array_map(fn($r) => new self((array) $r), $rows);
    }
}
