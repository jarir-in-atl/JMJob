<?php
declare(strict_types=1);

namespace App\Http\Controllers\Api;

use Nemesis\Core\Controller;
use Nemesis\Http\Request;
use Nemesis\Http\Response;
use App\Models\Category;
use App\Services\AdConfigurationService;
use App\Services\SettingService;
use Nemesis\Core\Database;

/**
 * AdminSettingsController — admin-only endpoints for platform config.
 */
class AdminSettingsController extends Controller
{

    public function updateSettings(Request $request): Response
    {
        $body = (array) $this->readJson($request);
        $pdo = Database::connect();
        $changes = [];
        foreach ($body as $key => $value) {
            if (!is_string($key)) continue;
            $stmt = $pdo->prepare("SELECT `id`, `value_type`, `category`, `description` FROM platform_settings WHERE `setting_key` = :key LIMIT 1");
            $stmt->execute([':key' => $key]);
            $existing = $stmt->fetch(\PDO::FETCH_ASSOC);
            if ($existing === false) continue;
            $adError = AdConfigurationService::validate($key, $value);
            if ($adError !== null) {
                return Response::json(['success' => false, 'message' => $adError, 'error' => 'invalid_ad_configuration'], 422);
            }
            $type = $existing['value_type'];
            $category = $existing['category'];
            try {
                $stored = match ($type) {
                    'integer', 'percent' => (string) (int) $value,
                    'decimal'            => (string) (float) $value,
                    'boolean'            => $value ? '1' : '0',
                    'json'               => json_encode($value, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR),
                    default              => (string) $value,
                };
            } catch (\Throwable $e) {
                return Response::json(['success' => false, 'message' => "Invalid value for {$key}.", 'error' => 'invalid_setting_value'], 422);
            }
            $changes[] = [
                'key' => $key,
                'stored' => $stored,
                'type' => $type,
                'category' => $category,
                'description' => $existing['description'],
            ];
        }

        $updated = [];
        if ($changes !== []) {
            try {
                Database::beginWriteTransaction($pdo);
                $upd = $pdo->prepare("UPDATE platform_settings SET `value` = :val, `value_type` = :type, `category` = :cat, `description` = :desc, `updated_at` = :updated_at WHERE `setting_key` = :key");
                foreach ($changes as $change) {
                    $upd->execute([
                        ':val' => $change['stored'],
                        ':type' => $change['type'],
                        ':cat' => $change['category'],
                        ':desc' => $change['description'],
                        ':updated_at' => date('Y-m-d H:i:s'),
                        ':key' => $change['key'],
                    ]);
                    $updated[] = $change['key'];
                }
                Database::commitWriteTransaction($pdo);
            } catch (\Throwable $e) {
                Database::rollbackWriteTransaction($pdo);
                return Response::json(['success' => false, 'message' => 'Settings could not be saved atomically.', 'error' => 'settings_write_failed'], 500);
            }
        }
        if ($updated !== []) {
            SettingService::clearCache();
        }
        return Response::json(['success' => true, 'message' => count($updated) . ' setting(s) updated.', 'data' => ['updated' => $updated]]);
    }

    public function categories(Request $request): Response
    {
        $pdo = Database::connect();
        $stmt = $pdo->query("SELECT * FROM categories ORDER BY display_order, name");
        return Response::json(['success' => true, 'data' => $stmt->fetchAll(\PDO::FETCH_ASSOC)]);
    }

    public function createCategory(Request $request): Response
    {
        $body = (array) $this->readJson($request);
        $name  = trim((string) ($body['name'] ?? ''));
        $slug  = trim((string) ($body['slug'] ?? ''));
        if ($name === '' || $slug === '') {
            return Response::json(['success' => false, 'message' => 'name and slug are required.'], 422);
        }
        $pdo = Database::connect();
        $stmt = $pdo->prepare("SELECT id FROM categories WHERE slug = :slug LIMIT 1");
        $stmt->execute([':slug' => $slug]);
        if ($stmt->fetch()) {
            return Response::json(['success' => false, 'message' => 'A category with that slug already exists.'], 422);
        }
        $now = date('Y-m-d H:i:s');
        $stmt = $pdo->prepare("INSERT INTO categories (name, slug, description, icon_class, is_active, display_order, min_cost, created_at, updated_at) VALUES (:name, :slug, :desc, :icon, :active, :order, :min_cost, :created_at, :updated_at)");
        $stmt->execute([
            ':name'     => $name,
            ':slug'     => $slug,
            ':desc'     => $body['description'] ?? null,
            ':icon'     => $body['icon_class'] ?? null,
            ':active'   => (int) ($body['is_active'] ?? 1),
            ':order'    => (int) ($body['display_order'] ?? 0),
            ':min_cost' => (float) ($body['min_cost'] ?? 1.00),
            ':created_at' => $now,
            ':updated_at' => $now,
        ]);
        $id = (int) $pdo->lastInsertId();
        $stmt = $pdo->prepare("SELECT * FROM categories WHERE id = :id");
        $stmt->execute([':id' => $id]);
        return Response::json(['success' => true, 'message' => 'Category created.', 'data' => $stmt->fetch(\PDO::FETCH_ASSOC)]);
    }

    public function updateCategory(Request $request, int $id): Response
    {
        $pdo = Database::connect();
        $stmt = $pdo->prepare("SELECT * FROM categories WHERE id = :id");
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch(\PDO::FETCH_ASSOC);
        if (!$row) return Response::json(['success' => false, 'message' => 'Category not found.'], 404);
        $body = (array) $this->readJson($request);
        $update = ['updated_at' => date('Y-m-d H:i:s')];
        if (isset($body['name']))          $update['name']          = (string) $body['name'];
        if (isset($body['slug'])) {
            $chk = $pdo->prepare("SELECT id FROM categories WHERE slug = :slug AND id != :id");
            $chk->execute([':slug' => $body['slug'], ':id' => $id]);
            if ($chk->fetch()) return Response::json(['success' => false, 'message' => 'Another category uses that slug.'], 422);
            $update['slug'] = (string) $body['slug'];
        }
        if (isset($body['description']))   $update['description']   = (string) $body['description'];
        if (isset($body['icon_class']))    $update['icon_class']    = (string) $body['icon_class'];
        if (isset($body['display_order'])) $update['display_order'] = (int) $body['display_order'];
        if (isset($body['is_active']))      $update['is_active']     = (int) (bool) $body['is_active'];
        if (isset($body['min_cost']))       $update['min_cost']      = (float) $body['min_cost'];

        $set = []; $vals = [];
        foreach ($update as $k => $v) { $set[] = "`$k` = :$k"; $vals[":$k"] = $v; }
        $vals[':id'] = $id;
        $stmt = $pdo->prepare("UPDATE categories SET " . implode(', ', $set) . " WHERE id = :id");
        $stmt->execute($vals);
        $stmt = $pdo->prepare("SELECT * FROM categories WHERE id = :id");
        $stmt->execute([':id' => $id]);
        return Response::json(['success' => true, 'message' => 'Category updated.', 'data' => $stmt->fetch(\PDO::FETCH_ASSOC)]);
    }

    public function deleteCategory(Request $request, int $id): Response
    {
        $pdo = Database::connect();
        $stmt = $pdo->prepare("SELECT * FROM categories WHERE id = :id");
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch(\PDO::FETCH_ASSOC);
        if (!$row) return Response::json(['success' => false, 'message' => 'Category not found.'], 404);
        $stmt = $pdo->prepare("SELECT COUNT(*) AS c FROM jobs WHERE category_id = :id");
        $stmt->execute([':id' => $id]);
        $jobCount = (int) $stmt->fetch(\PDO::FETCH_ASSOC)['c'];
        if ($jobCount > 0) {
            $pdo->prepare("UPDATE categories SET is_active = 0, updated_at = :updated_at WHERE id = :id")->execute([
                ':updated_at' => date('Y-m-d H:i:s'),
                ':id' => $id,
            ]);
            return Response::json(['success' => true, 'message' => "Category has {$jobCount} job(s) attached; deactivated instead of deleted."]);
        }
        $pdo->prepare("DELETE FROM categories WHERE id = :id")->execute([':id' => $id]);
        return Response::json(['success' => true, 'message' => 'Category deleted.']);
    }

    // -------------------------------------------------------------------
    // Subcategories Admin CRUD
    // -------------------------------------------------------------------

    public function subcategories(Request $request): Response
    {
        $pdo = Database::connect();
        $stmt = $pdo->query("SELECT s.*, c.name AS category_name FROM subcategories s LEFT JOIN categories c ON c.id = s.category_id ORDER BY c.display_order, s.display_order, s.name");
        return Response::json(['success' => true, 'data' => $stmt->fetchAll(\PDO::FETCH_ASSOC)]);
    }

    public function createSubcategory(Request $request): Response
    {
        $body = (array) $this->readJson($request);
        $catId = (int) ($body['category_id'] ?? 0);
        $name  = trim((string) ($body['name'] ?? ''));
        $slug  = trim((string) ($body['slug'] ?? ''));
        if ($catId <= 0 || $name === '' || $slug === '') {
            return Response::json(['success' => false, 'message' => 'category_id, name, and slug are required.'], 422);
        }
        $pdo = Database::connect();
        $now = date('Y-m-d H:i:s');
        $stmt = $pdo->prepare("INSERT INTO subcategories (category_id, name, slug, description, is_active, display_order, min_cost, created_at, updated_at) VALUES (:cat_id, :name, :slug, :desc, :active, :order, :min_cost, :created_at, :updated_at)");
        $stmt->execute([
            ':cat_id'   => $catId,
            ':name'     => $name,
            ':slug'     => $slug,
            ':desc'     => $body['description'] ?? null,
            ':active'   => (int) ($body['is_active'] ?? 1),
            ':order'    => (int) ($body['display_order'] ?? 0),
            ':min_cost' => (float) ($body['min_cost'] ?? 1.00),
            ':created_at' => $now,
            ':updated_at' => $now,
        ]);
        $id = (int) $pdo->lastInsertId();
        $stmt = $pdo->prepare("SELECT s.*, c.name AS category_name FROM subcategories s LEFT JOIN categories c ON c.id = s.category_id WHERE s.id = :id");
        $stmt->execute([':id' => $id]);
        return Response::json(['success' => true, 'message' => 'Subcategory created.', 'data' => $stmt->fetch(\PDO::FETCH_ASSOC)]);
    }

    public function updateSubcategory(Request $request, int $id): Response
    {
        $pdo = Database::connect();
        $stmt = $pdo->prepare("SELECT * FROM subcategories WHERE id = :id");
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch(\PDO::FETCH_ASSOC);
        if (!$row) return Response::json(['success' => false, 'message' => 'Subcategory not found.'], 404);

        $body = (array) $this->readJson($request);
        $update = ['updated_at' => date('Y-m-d H:i:s')];
        if (isset($body['category_id']))   $update['category_id']   = (int) $body['category_id'];
        if (isset($body['name']))          $update['name']          = (string) $body['name'];
        if (isset($body['slug']))          $update['slug']          = (string) $body['slug'];
        if (isset($body['description']))   $update['description']   = (string) $body['description'];
        if (isset($body['display_order'])) $update['display_order'] = (int) $body['display_order'];
        if (isset($body['is_active']))      $update['is_active']     = (int) (bool) $body['is_active'];
        if (isset($body['min_cost']))       $update['min_cost']      = (float) $body['min_cost'];

        $set = []; $vals = [];
        foreach ($update as $k => $v) { $set[] = "`$k` = :$k"; $vals[":$k"] = $v; }
        $vals[':id'] = $id;
        $stmt = $pdo->prepare("UPDATE subcategories SET " . implode(', ', $set) . " WHERE id = :id");
        $stmt->execute($vals);

        $stmt = $pdo->prepare("SELECT s.*, c.name AS category_name FROM subcategories s LEFT JOIN categories c ON c.id = s.category_id WHERE s.id = :id");
        $stmt->execute([':id' => $id]);
        return Response::json(['success' => true, 'message' => 'Subcategory updated.', 'data' => $stmt->fetch(\PDO::FETCH_ASSOC)]);
    }

    public function deleteSubcategory(Request $request, int $id): Response
    {
        $pdo = Database::connect();
        $stmt = $pdo->prepare("SELECT * FROM subcategories WHERE id = :id");
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch(\PDO::FETCH_ASSOC);
        if (!$row) return Response::json(['success' => false, 'message' => 'Subcategory not found.'], 404);

        $pdo->prepare("DELETE FROM subcategories WHERE id = :id")->execute([':id' => $id]);
        return Response::json(['success' => true, 'message' => 'Subcategory deleted.']);
    }

    public function transactions(Request $request): Response
    {
        $limit = max(1, min(500, (int) ($request->query('limit') ?? 100)));
        $type = strtolower(trim((string) ($request->query('type') ?? '')));
        $allowedTypes = ['deposit', 'withdrawal', 'escrow_hold', 'escrow_release', 'commission', 'refund', 'adjustment'];
        $pdo = Database::connect();
        $sql = "SELECT t.*, u.name AS user_name, u.email AS user_email, j.title AS job_title
                FROM transactions t
                LEFT JOIN users u ON u.id = t.user_id
                LEFT JOIN jobs j ON j.id = t.job_id";
        if (in_array($type, $allowedTypes, true)) $sql .= " WHERE t.type = :type";
        $sql .= " ORDER BY t.created_at DESC, t.id DESC LIMIT :limit";
        $stmt = $pdo->prepare($sql);
        if (in_array($type, $allowedTypes, true)) $stmt->bindValue(':type', $type);
        $stmt->bindValue(':limit', $limit, \PDO::PARAM_INT);
        $stmt->execute();
        $items = array_map(static function (array $row): array {
            $row['id'] = (int) $row['id'];
            $row['user_id'] = $row['user_id'] !== null ? (int) $row['user_id'] : null;
            $row['job_id'] = $row['job_id'] !== null ? (int) $row['job_id'] : null;
            $row['amount'] = (float) $row['amount'];
            return $row;
        }, $stmt->fetchAll(\PDO::FETCH_ASSOC));
        return Response::json(['success' => true, 'data' => $items]);
    }

    public function revenue(Request $request): Response
    {
        $pdo = Database::connect();
        $totalStmt = $pdo->prepare("SELECT COALESCE(SUM(amount), 0) AS t FROM transactions WHERE type = 'commission'");
        $totalStmt->execute();
        $total = (float) ($totalStmt->fetch(\PDO::FETCH_ASSOC)['t'] ?? 0);

        $jobCountStmt = $pdo->prepare("SELECT COUNT(*) AS c FROM jobs");
        $jobCountStmt->execute();
        $jobCount = (int) ($jobCountStmt->fetch(\PDO::FETCH_ASSOC)['c'] ?? 0);

        $completedStmt = $pdo->prepare("SELECT COUNT(*) AS c FROM jobs WHERE status = 'completed'");
        $completedStmt->execute();
        $completed = (int) ($completedStmt->fetch(\PDO::FETCH_ASSOC)['c'] ?? 0);

        $activeStmt = $pdo->prepare("SELECT COUNT(*) AS c FROM jobs WHERE status IN ('assigned', 'submitted', 'revision')");
        $activeStmt->execute();
        $active = (int) ($activeStmt->fetch(\PDO::FETCH_ASSOC)['c'] ?? 0);

        $userCountStmt = $pdo->prepare("SELECT COUNT(*) AS c FROM users");
        $userCountStmt->execute();
        $userCount = (int) ($userCountStmt->fetch(\PDO::FETCH_ASSOC)['c'] ?? 0);

        $pendingPaymentsStmt = $pdo->prepare("SELECT COUNT(*) AS c FROM payment_submissions WHERE status = 'pending'");
        $pendingPaymentsStmt->execute();
        $pendingPayments = (int) ($pendingPaymentsStmt->fetch(\PDO::FETCH_ASSOC)['c'] ?? 0);

        $escrowStmt = $pdo->prepare("SELECT COALESCE(SUM(frozen_balance), 0) AS t FROM users");
        $escrowStmt->execute();
        $escrow = (float) ($escrowStmt->fetch(\PDO::FETCH_ASSOC)['t'] ?? 0);

        return Response::json([
            'success' => true,
            'data'    => [
                'platform_revenue' => $total,
                'currency'         => SettingService::currencyCode(),
                'currency_symbol'  => SettingService::currencySymbol(),
                'commission_rate'  => SettingService::commissionRate(),
                'total_jobs'       => $jobCount,
                'completed_jobs'   => $completed,
                'active_jobs'      => $active,
                'total_users'      => $userCount,
                'pending_payments' => $pendingPayments,
                'escrow_total'     => $escrow,
                'escrow_mode'      => SettingService::get('escrow_mode', 'full_bid'),
            ],
        ]);
    }

    public function reports(Request $request): Response
    {
        $pdo = Database::connect();
        $transactionRows = $pdo->query(
            "SELECT type, COUNT(*) AS transaction_count, COALESCE(SUM(amount), 0) AS amount
             FROM transactions GROUP BY type ORDER BY type"
        )->fetchAll(\PDO::FETCH_ASSOC);
        $jobRows = $pdo->query(
            "SELECT status, COUNT(*) AS job_count, COALESCE(SUM(budget), 0) AS budget
             FROM jobs GROUP BY status ORDER BY status"
        )->fetchAll(\PDO::FETCH_ASSOC);
        $totals = $pdo->query(
            "SELECT
                (SELECT COUNT(*) FROM transactions) AS transaction_count,
                (SELECT COALESCE(SUM(amount), 0) FROM transactions) AS transaction_volume,
                (SELECT COUNT(*) FROM jobs) AS job_count,
                (SELECT COALESCE(SUM(budget), 0) FROM jobs) AS job_value"
        )->fetch(\PDO::FETCH_ASSOC) ?: [];

        $assignmentRows = [];
        $submissionRows = [];
        $assignmentTotals = [
            'assignment_count' => 0,
            'held_amount' => 0.0,
            'released_amount' => 0.0,
        ];
        $submissionTotals = [
            'submission_count' => 0,
            'flagged_submission_count' => 0,
        ];
        try {
            $assignmentRows = $pdo->query(
                "SELECT status, payment_status, COUNT(*) AS assignment_count,
                        COALESCE(SUM(payment_amount), 0) AS amount
                 FROM job_assignments
                 GROUP BY status, payment_status
                 ORDER BY status, payment_status"
            )->fetchAll(\PDO::FETCH_ASSOC);
            foreach ($assignmentRows as $row) {
                $assignmentTotals['assignment_count'] += (int) ($row['assignment_count'] ?? 0);
                if (($row['payment_status'] ?? '') === 'held') {
                    $assignmentTotals['held_amount'] += (float) ($row['amount'] ?? 0);
                }
                if (($row['payment_status'] ?? '') === 'released') {
                    $assignmentTotals['released_amount'] += (float) ($row['amount'] ?? 0);
                }
            }
        } catch (\Throwable) {
            // Assignment reporting is additive; older hosts can still use
            // the original jobs/transactions report before its migration.
        }
        try {
            $submissionRows = $pdo->query(
                "SELECT status, COALESCE(risk_status, 'clear') AS risk_status,
                        COUNT(*) AS submission_count
                 FROM job_submissions
                 GROUP BY status, risk_status
                 ORDER BY status, risk_status"
            )->fetchAll(\PDO::FETCH_ASSOC);
            foreach ($submissionRows as $row) {
                $submissionTotals['submission_count'] += (int) ($row['submission_count'] ?? 0);
                if (($row['risk_status'] ?? '') === 'flagged') {
                    $submissionTotals['flagged_submission_count'] += (int) ($row['submission_count'] ?? 0);
                }
            }
        } catch (\Throwable) {
            // Risk columns are optional during staged migration rollout.
        }

        $data = [
            'totals' => [
                'transaction_count' => (int) ($totals['transaction_count'] ?? 0),
                'transaction_volume' => (float) ($totals['transaction_volume'] ?? 0),
                'job_count' => (int) ($totals['job_count'] ?? 0),
                'job_value' => (float) ($totals['job_value'] ?? 0),
                ...$assignmentTotals,
                ...$submissionTotals,
            ],
            'transactions' => array_map(static fn(array $row): array => [
                'type' => (string) $row['type'],
                'transaction_count' => (int) $row['transaction_count'],
                'amount' => (float) $row['amount'],
            ], $transactionRows),
            'jobs' => array_map(static fn(array $row): array => [
                'status' => (string) $row['status'],
                'job_count' => (int) $row['job_count'],
                'budget' => (float) $row['budget'],
            ], $jobRows),
            'assignments' => array_map(static fn(array $row): array => [
                'status' => (string) $row['status'],
                'payment_status' => (string) $row['payment_status'],
                'assignment_count' => (int) $row['assignment_count'],
                'amount' => (float) $row['amount'],
            ], $assignmentRows),
            'submissions' => array_map(static fn(array $row): array => [
                'status' => (string) $row['status'],
                'risk_status' => (string) $row['risk_status'],
                'submission_count' => (int) $row['submission_count'],
            ], $submissionRows),
        ];

        if (strtolower(trim((string) $request->query('format', ''))) === 'csv') {
            $handle = fopen('php://temp', 'r+');
            if ($handle === false) {
                return Response::json(['success' => false, 'message' => 'Report export could not be created.'], 500);
            }
            fputcsv($handle, ['section', 'key', 'subkey', 'count', 'amount']);
            foreach ($data['transactions'] as $row) {
                fputcsv($handle, ['transactions', $row['type'], '', $row['transaction_count'], $row['amount']]);
            }
            foreach ($data['jobs'] as $row) {
                fputcsv($handle, ['jobs', $row['status'], '', $row['job_count'], $row['budget']]);
            }
            foreach ($data['assignments'] as $row) {
                fputcsv($handle, ['assignments', $row['status'], $row['payment_status'], $row['assignment_count'], $row['amount']]);
            }
            foreach ($data['submissions'] as $row) {
                fputcsv($handle, ['submissions', $row['status'], $row['risk_status'], $row['submission_count'], '']);
            }
            rewind($handle);
            $csv = stream_get_contents($handle);
            fclose($handle);
            return Response::text((string) $csv)
                ->withHeader('Content-Type', 'text/csv; charset=UTF-8')
                ->withHeader('Content-Disposition', 'attachment; filename="jmjob-report.csv"')
                ->withHeader('X-Content-Type-Options', 'nosniff');
        }

        return Response::json([
            'success' => true,
            'data'    => $data,
        ]);
    }

    private function readJson(Request $request): array
    {
        $body = file_get_contents('php://input');
        if ($body !== false && $body !== '') {
            $data = json_decode($body, true);
            if (is_array($data)) return $data;
        }
        return $request->all();
    }
    public function listSettings(Request $request): Response
    {
        $pdo = Database::connect();
        $stmt = $pdo->prepare("SELECT `setting_key`, `value`, `value_type`, `category`, `description` FROM platform_settings ORDER BY `category`, `setting_key`");
        $stmt->execute();
        $rows = $stmt->fetchAll(\PDO::FETCH_ASSOC);
        $grouped = [];
        foreach ($rows as $r) {
            $cat = (string) ($r['category'] ?? 'general');
            $cast = match ($r['value_type']) {
                'integer', 'percent' => (int) $r['value'],
                'decimal'            => (float) $r['value'],
                'boolean'            => in_array(strtolower((string) $r['value']), ['1','true','yes'], true),
                'json'               => json_decode($r['value'], true),
                default              => $r['value'],
            };
            $grouped[$cat][] = [
                'key'         => $r['setting_key'],
                'value'       => $cast,
                'value_type'  => $r['value_type'],
                'description' => $r['description'],
            ];
        }
        return Response::json(['success' => true, 'data' => $grouped]);
    }

}
