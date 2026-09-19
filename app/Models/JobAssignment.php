<?php
declare(strict_types=1);

namespace App\Models;

use Nemesis\Core\Fluent;
use Nemesis\Core\Model;

/**
 * A worker's independent assignment within a job.
 */
class JobAssignment extends Model
{
    public const STATUS_ASSIGNED    = 'assigned';
    public const STATUS_IN_PROGRESS = 'in_progress';
    public const STATUS_SUBMITTED   = 'submitted';
    public const STATUS_REVISION    = 'revision';
    public const STATUS_APPROVED    = 'approved';
    public const STATUS_COMPLETED   = 'completed';
    public const STATUS_CANCELLED   = 'cancelled';

    public const PAYMENT_PENDING  = 'pending';
    public const PAYMENT_HELD     = 'held';
    public const PAYMENT_RELEASED = 'released';
    public const PAYMENT_REFUNDED = 'refunded';

    public const ACTIVE_STATUSES = [
        self::STATUS_ASSIGNED,
        self::STATUS_IN_PROGRESS,
        self::STATUS_SUBMITTED,
        self::STATUS_REVISION,
    ];

    protected $fillable = [
        'job_id', 'bid_id', 'worker_id', 'status', 'payment_status',
        'payment_amount', 'assigned_by', 'assigned_at', 'started_at',
        'submitted_at', 'completed_at', 'paid_at',
    ];

    public function __construct(array $attributes = [])
    {
        $this->table = 'job_assignments';
        parent::__construct($attributes);
    }

    public function job(): ?Job
    {
        return Job::find((int) $this->job_id);
    }

    public function bid(): ?JobBid
    {
        return JobBid::find((int) $this->bid_id);
    }

    public function worker(): ?User
    {
        return User::find((int) $this->worker_id);
    }

    public function isActive(): bool
    {
        return in_array((string) $this->status, self::ACTIVE_STATUSES, true);
    }

    public static function isAvailable(): bool
    {
        try {
            \Nemesis\Core\Database::connect()->query('SELECT 1 FROM job_assignments LIMIT 1');
            return true;
        } catch (\Throwable $e) {
            return false;
        }
    }

    public static function findForBid(int $bidId): ?self
    {
        if (!self::isAvailable()) return null;
        $row = Fluent::table('job_assignments')->where('bid_id', '=', $bidId)->first();
        return $row ? new self((array) $row) : null;
    }

    public static function findForJobWorker(int $jobId, int $workerId): ?self
    {
        if (!self::isAvailable()) return null;
        $row = Fluent::table('job_assignments')
            ->where('job_id', '=', $jobId)
            ->where('worker_id', '=', $workerId)
            ->first();
        return $row ? new self((array) $row) : null;
    }

    public static function forJob(int $jobId): array
    {
        if (!self::isAvailable()) return [];
        $rows = Fluent::table('job_assignments')
            ->where('job_id', '=', $jobId)
            ->orderBy('id', 'asc')
            ->get()->all();
        return array_map(fn($row) => new self((array) $row), $rows);
    }
}
