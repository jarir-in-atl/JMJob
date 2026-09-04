<?php
declare(strict_types=1);

namespace App\Models;

use Nemesis\Core\Model;
use Nemesis\Core\Fluent;

/**
 * JobBid — a worker's bid on a job.
 */
class JobBid extends Model
{
    public const STATUS_PENDING   = 'pending';
    public const STATUS_ACCEPTED  = 'accepted';
    public const STATUS_REJECTED  = 'rejected';
    public const STATUS_WITHDRAWN = 'withdrawn';
    public const STATUS_EXPIRED   = 'expired';

    public function __construct(array $attributes = [])
    {
        $this->table = 'job_bids';
        parent::__construct($attributes);
    }

    protected $fillable = [
        'job_id', 'worker_id', 'amount', 'currency', 'delivery_days',
        'proposal', 'status', 'decided_at', 'decided_by',
    ];

    public function job(): ?Job
    {
        return Job::find((int) $this->job_id);
    }

    public function worker(): ?User
    {
        return User::find((int) $this->worker_id);
    }

    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    public function isAccepted(): bool
    {
        return $this->status === self::STATUS_ACCEPTED;
    }

    public static function forJob(int $jobId): array
    {
        $rows = Fluent::table('job_bids')
            ->where('job_id', '=', $jobId)
            ->orderBy('amount', 'asc')
            ->get()->all();
        return array_map(fn($r) => new self((array) $r), $rows);
    }

    public static function byWorker(int $workerId, int $limit = 50): array
    {
        $rows = Fluent::table('job_bids')
            ->where('worker_id', '=', $workerId)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get()->all();
        return array_map(fn($r) => new self((array) $r), $rows);
    }

    public static function findForWorker(int $jobId, int $workerId): ?self
    {
        $row = Fluent::table('job_bids')
            ->where('job_id', '=', $jobId)
            ->where('worker_id', '=', $workerId)
            ->first();
        return $row ? new self((array) $row) : null;
    }
}
