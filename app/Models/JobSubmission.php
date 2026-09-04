<?php
declare(strict_types=1);

namespace App\Models;

use Nemesis\Core\Model;
use Nemesis\Core\Fluent;

/**
 * JobSubmission — work delivered by a worker on an assigned job.
 */
class JobSubmission extends Model
{
    public const STATUS_PENDING_REVIEW = 'pending_review';
    public const STATUS_APPROVED       = 'approved';
    public const STATUS_REVISION       = 'revision';
    public const STATUS_REJECTED       = 'rejected';

    public function __construct(array $attributes = [])
    {
        $this->table = 'job_submissions';
        parent::__construct($attributes);
    }

    protected $fillable = [
        'job_id', 'worker_id', 'bid_id', 'description',
        'attachment_path', 'external_link', 'status',
        'reviewed_at', 'reviewed_by', 'reviewer_note',
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
        return $this->status === self::STATUS_PENDING_REVIEW;
    }

    public static function forJob(int $jobId): array
    {
        $rows = Fluent::table('job_submissions')
            ->where('job_id', '=', $jobId)
            ->orderBy('created_at', 'desc')
            ->get()->all();
        return array_map(fn($r) => new self((array) $r), $rows);
    }

    public static function byWorker(int $workerId, int $limit = 50): array
    {
        $rows = Fluent::table('job_submissions')
            ->where('worker_id', '=', $workerId)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get()->all();
        return array_map(fn($r) => new self((array) $r), $rows);
    }
}
