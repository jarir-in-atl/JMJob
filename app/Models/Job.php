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
    public const STATUS_OPEN        = 'open';
    public const STATUS_IN_REVIEW   = 'in_review';
    public const STATUS_ASSIGNED    = 'assigned';
    public const STATUS_SUBMITTED   = 'submitted';
    public const STATUS_REVISION    = 'revision';
    public const STATUS_COMPLETED   = 'completed';
    public const STATUS_CANCELLED   = 'cancelled';
    public const STATUS_DISPUTED    = 'disputed';
    public const STATUS_EXPIRED     = 'expired';

    public const OPEN_STATUSES = [
        self::STATUS_OPEN, self::STATUS_IN_REVIEW,
    ];

    public function __construct(array $attributes = [])
    {
        $this->table = 'jobs';
        parent::__construct($attributes);
    }

    protected $fillable = [
        'poster_id', 'category_id', 'title', 'slug', 'description', 'requirements',
        'budget', 'currency', 'deadline_at', 'bidding_closes_at', 'status',
        'assigned_bid_id', 'assigned_worker_id', 'bid_count', 'view_count',
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
        $rows = Fluent::table('jobs')
            ->where('assigned_worker_id', '=', $userId)
            ->whereIn('status', [self::STATUS_ASSIGNED, self::STATUS_SUBMITTED, self::STATUS_REVISION])
            ->orderBy('updated_at', 'desc')
            ->limit($limit)
            ->get()->all();
        return array_map(fn($r) => new self((array) $r), $rows);
    }

    public static function findBySlug(string $slug): ?self
    {
        $row = Fluent::table('jobs')->where('slug', '=', $slug)->first();
        return $row ? new self((array) $row) : null;
    }
}
