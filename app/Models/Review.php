<?php
declare(strict_types=1);

namespace App\Models;

use Nemesis\Core\Model;
use Nemesis\Core\Fluent;

/**
 * Review — worker + poster rating after job completion.
 */
class Review extends Model
{
    public function __construct(array $attributes = [])
    {
        $this->table = 'reviews';
        parent::__construct($attributes);
    }

    protected $fillable = ['job_id', 'reviewer_id', 'reviewee_id', 'rating', 'comment'];

    public function job(): ?Job
    {
        return Job::find((int) $this->job_id);
    }

    public function reviewer(): ?User
    {
        return User::find((int) $this->reviewer_id);
    }

    public function reviewee(): ?User
    {
        return User::find((int) $this->reviewee_id);
    }

    public static function forUser(int $userId, int $limit = 20): array
    {
        $rows = Fluent::table('reviews')
            ->where('reviewee_id', '=', $userId)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get()->all();
        return array_map(fn($r) => new self((array) $r), $rows);
    }

    public static function findForJobAndReviewer(int $jobId, int $reviewerId): ?self
    {
        $row = Fluent::table('reviews')
            ->where('job_id', '=', $jobId)
            ->where('reviewer_id', '=', $reviewerId)
            ->first();
        return $row ? new self((array) $row) : null;
    }
}
