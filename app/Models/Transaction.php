<?php
declare(strict_types=1);

namespace App\Models;

use Nemesis\Core\Model;
use Nemesis\Core\Fluent;

/**
 * Transaction — financial audit ledger entry.
 *
 * Created by services (PaymentService, JobService, WithdrawalService)
 * for every money movement. Read by admin reports and the user
 * wallet history views.
 */
class Transaction extends Model
{
    public const TYPE_DEPOSIT          = 'deposit';
    public const TYPE_WITHDRAWAL       = 'withdrawal';
    public const TYPE_ESCROW_HOLD      = 'escrow_hold';
    public const TYPE_ESCROW_RELEASE   = 'escrow_release';
    public const TYPE_COMMISSION       = 'commission';
    public const TYPE_REFUND           = 'refund';
    public const TYPE_ADJUSTMENT       = 'adjustment';

    public function __construct(array $attributes = [])
    {
        $this->table = 'transactions';
        parent::__construct($attributes);
    }

    protected $fillable = [
        'user_id', 'job_id', 'type', 'amount', 'currency',
        'balance_after', 'frozen_after', 'reference', 'note', 'admin_id',
    ];

    public function user(): ?User
    {
        return $this->user_id ? User::find((int) $this->user_id) : null;
    }

    public function isDebit(): bool
    {
        return in_array($this->type, [
            self::TYPE_WITHDRAWAL, self::TYPE_ESCROW_HOLD, self::TYPE_REFUND,
        ], true);
    }

    public static function forUser(int $userId, int $limit = 50): array
    {
        $rows = Fluent::table('transactions')
            ->where('user_id', '=', $userId)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get()->all();
        return array_map(fn($r) => new self((array) $r), $rows);
    }

    public static function platformRevenueTotal(): float
    {
        $row = Fluent::table('transactions')
            ->select(['COALESCE(SUM(amount), 0) AS total'])
            ->where('type', '=', self::TYPE_COMMISSION)
            ->first();
        return (float) ($row['total'] ?? 0);
    }
}
