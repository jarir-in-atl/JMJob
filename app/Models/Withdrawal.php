<?php
declare(strict_types=1);

namespace App\Models;

use Nemesis\Core\Model;
use Nemesis\Core\Fluent;

class Withdrawal extends Model
{
    public function __construct(array $attributes = [])
    {
        $this->table = 'withdrawals';
        parent::__construct($attributes);
    }


    protected $fillable = ['user_id', 'amount', 'gateway', 'wallet_address', 'status', 'admin_note', 'requested_at', 'processed_at', 'processed_by'];

    public const STATUS_PENDING  = 'pending';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_REJECTED = 'rejected';
    public const STATUS_PAID     = 'paid';

    public function user(): ?User
    {
        return User::find((int) $this->user_id);
    }

    public function isPending(): bool
    {
        return ($this->status ?? '') === self::STATUS_PENDING;
    }

    public static function pendingForUser(int $userId): array
    {
        return Fluent::table('withdrawals')
            ->where('user_id', '=', $userId)
            ->where('status', '=', self::STATUS_PENDING)
            ->get()
            ->all();
    }

    public static function totalWithdrawn(int $userId): float
    {
        $row = Fluent::table('withdrawals')
            ->select(['COALESCE(SUM(amount), 0) AS total'])
            ->where('user_id', '=', $userId)
            ->whereIn('status', [self::STATUS_APPROVED, self::STATUS_PAID])
            ->first();
        return (float) ($row['total'] ?? 0);
    }
}
