<?php
declare(strict_types=1);

namespace App\Models;

use Nemesis\Core\Model;
use Nemesis\Core\Fluent;

/**
 * Job — a listing posted by a poster, bid on by workers.
 */
class Job extends Model
{
    public const STATUS_PENDING_APPROVAL = 'pending_approval';
    public const STATUS_OPEN             = 'open';
    public const STATUS_DECLINED         = 'declined';
    public const STATUS_IN_REVIEW        = 'in_review';
    public const STATUS_ENGAGED          = 'engaged';
    public const STATUS_ASSIGNED         = 'assigned';
    public const STATUS_SUBMITTED        = 'submitted';
    public const STATUS_REVISION         = 'revision';
    public const STATUS_COMPLETED        = 'completed';
    public const STATUS_CANCELLED        = 'cancelled';
    public const STATUS_DISPUTED         = 'disputed';
    public const STATUS_EXPIRED          = 'expired';

    public const OPEN_STATUSES = [
        self::STATUS_OPEN, self::STATUS_IN_REVIEW,
    ];

    public function __construct(array $attributes = [])
    {
        $this->table = 'jobs';
        parent::__construct($attributes);
    }

    protected $fillable = [
        'poster_id', 'category_id', 'subcategory_id', 'title', 'subtitle', 'slug', 'description', 'requirements',
        'customer_name', 'customer_phone', 'customer_email', 'admin_notes', 'created_by_admin_id',
        'proof_requirements', 'budget', 'worker_count', 'cost_per_worker', 'system_fee_percent',
        'system_fee_amount', 'total_payable_amount', 'currency', 'deadline_at', 'bidding_closes_at',
        'status', 'decline_reason', 'assigned_bid_id', 'assigned_worker_id', 'bid_count', 'view_count',
        'is_featured', 'attachment_path',
    ];

    public function poster(): ?User
    {
        return User::find((int) $this->poster_id);
    }

    public function category(): ?Category
    {
        return $this->category_id ? Category::find((int) $this->category_id) : null;
    }

    public function assignedWorker(): ?User
    {
        return $this->assigned_worker_id ? User::find((int) $this->assigned_worker_id) : null;
    }

    public function isOpen(): bool
    {
        return in_array($this->status, self::OPEN_STATUSES, true);
    }

    public function isAssigned(): bool
    {
        return $this->status === self::STATUS_ASSIGNED;
    }

    public function isCompleted(): bool
    {
        return $this->status === self::STATUS_COMPLETED;
    }

    /** Return one legacy-compatible page of open jobs. */
    public static function available(?int $categoryId = null, ?string $search = null, int $limit = 50): array
    {
        return static::availablePage($categoryId, $search, $limit, 0)['items'];
    }

    /**
     * Browse open jobs with safe filters and pagination.
     *
     * @return array{items:list<self>,total:int}
     */
    public static function availablePage(
        ?int $categoryId = null,
        ?string $search = null,
        int $perPage = 20,
        int $offset = 0,
        ?float $minBudget = null,
        ?float $maxBudget = null,
        string $sort = 'latest'
    ): array {
        $q = static::availableQuery($categoryId, $search, $minBudget, $maxBudget);
        $total = $q->count();

        if ($sort === 'budget_low') {
            $q->orderBy('budget', 'asc');
        } elseif ($sort === 'budget_high') {
            $q->orderBy('budget', 'desc');
        } elseif ($sort === 'closing') {
            $q->orderBy('bidding_closes_at', 'asc');
        } else {
            $q->orderBy('is_featured', 'desc')->orderBy('created_at', 'desc');
        }

        $rows = $q->limit(max(1, $perPage))->offset(max(0, $offset))->get()->all();
        return [
            'items' => array_map(fn($r) => new self((array) $r), $rows),
            'total' => $total,
        ];
    }

    private static function availableQuery(
        ?int $categoryId,
        ?string $search,
        ?float $minBudget,
        ?float $maxBudget
    ): Fluent {
        $q = Fluent::table('jobs')->whereIn('status', self::OPEN_STATUSES);
        if ($categoryId !== null) $q->where('category_id', '=', $categoryId);
        if ($search !== null && $search !== '') {
            $term = '%' . $search . '%';
            $q->whereNested(function (Fluent $nested) use ($term): void {
                $nested->whereLike('title', $term)
                    ->orWhereLike('description', $term)
                    ->orWhereLike('requirements', $term);
            });
        }
        if ($minBudget !== null) $q->where('budget', '>=', $minBudget);
        if ($maxBudget !== null) $q->where('budget', '<=', $maxBudget);
        return $q;
    }

    public static function postedBy(int $userId, int $limit = 50): array
    {
        $rows = Fluent::table('jobs')
            ->where('poster_id', '=', $userId)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get()->all();
        return array_map(fn($r) => new self((array) $r), $rows);
    }

    public static function assignedTo(int $userId, int $limit = 50): array
    {
        $jobs = [];

        // New multi-worker assignments are the source of truth when present.
        try {
            $assignmentRows = Fluent::table('job_assignments')
                ->where('worker_id', '=', $userId)
                ->whereIn('status', JobAssignment::ACTIVE_STATUSES)
                ->orderBy('updated_at', 'desc')
                ->limit($limit)
                ->get()->all();
            foreach ($assignmentRows as $row) {
                $job = static::find((int) $row['job_id']);
                if ($job !== null) {
                    $job->worker_assignment_id = (int) $row['id'];
                    $job->worker_assignment_status = $row['status'];
                    $job->worker_assignment_payment_status = $row['payment_status'];
                    $jobs[(int) $job->id] = $job;
                }
            }
        } catch (\Throwable $e) {
            // Fall back to the legacy pointer while older hosts are upgraded.
        }

        try {
            $rows = Fluent::table('jobs')
                ->where('assigned_worker_id', '=', $userId)
                ->whereIn('status', [self::STATUS_ASSIGNED, self::STATUS_SUBMITTED, self::STATUS_REVISION])
                ->orderBy('updated_at', 'desc')
                ->limit($limit)
                ->get()->all();
            foreach ($rows as $row) {
                $job = new self((array) $row);
                // Prefer the assignment-backed instance when both the new
                // table and legacy pointer contain the same job.
                if (!isset($jobs[(int) $job->id])) $jobs[(int) $job->id] = $job;
            }
        } catch (\Throwable $e) {
            // The assignment query may still provide results.
        }

        return array_slice(array_values($jobs), 0, max(1, $limit));
    }

    public static function activeForWorker(int $userId, int $limit = 100): array
    {
        $jobs = [];

        foreach (static::assignedTo($userId, $limit) as $job) {
            $job->worker_listing_state = "assigned";
            $jobs[(int) $job->id] = $job;
        }

        try {
            $rows = Fluent::table("jobs")
                ->whereIn("status", self::OPEN_STATUSES)
                ->orderBy("is_featured", "desc")
                ->orderBy("updated_at", "desc")
                ->limit(max(1, $limit * 2))
                ->get()->all();
            foreach ($rows as $row) {
                if ((int) ($row["poster_id"] ?? 0) === $userId) continue;
                $id = (int) $row["id"];
                if (isset($jobs[$id])) continue;
                $job = new self((array) $row);
                $job->worker_listing_state = "available";
                $jobs[$id] = $job;
                if (count($jobs) >= max(1, $limit)) break;
            }
        } catch (\Throwable $e) {
            // Assigned jobs remain available even while an older host is upgraded.
        }

        return array_slice(array_values($jobs), 0, max(1, $limit));
    }

    public static function findBySlug(string $slug): ?self
    {
        $row = Fluent::table('jobs')->where('slug', '=', $slug)->first();
        return $row ? new self((array) $row) : null;
    }
}
