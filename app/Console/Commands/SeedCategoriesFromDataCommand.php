<?php
declare(strict_types=1);

namespace App\Console\Commands;

use Nemesis\Console\Command;
use Nemesis\Core\Database;
use Nemesis\Core\Fluent;

class SeedCategoriesFromDataCommand extends Command
{
    protected string $signature = 'db:seed-categories';
    protected string $description = 'Seed Categories and Subcategories from cat-subcat-data/*.json with min_cost';

    public function handle(): int
    {
        $baseDir = base_path('cat-subcat-data');
        if (!is_dir($baseDir)) {
            $this->output->error("Directory cat-subcat-data not found at {$baseDir}");
            return self::FAILURE;
        }

        $files = glob($baseDir . '/*.json');
        if (empty($files)) {
            $this->output->warn("No JSON files found in {$baseDir}");
            return self::SUCCESS;
        }

        $pdo = Database::connect();
        $now = date('Y-m-d H:i:s');

        // Check if min_cost column exists in categories & subcategories, if not add it
        $this->ensureTablesAndColumns($pdo);

        $this->output->info("Clearing existing Categories & Subcategories...");
        $driver = strtolower((string) getenv('DB_DRIVER'));
        if ($driver === 'sqlite') {
            $pdo->exec("DELETE FROM subcategories");
            $pdo->exec("DELETE FROM categories");
            $pdo->exec("DELETE FROM sqlite_sequence WHERE name IN ('subcategories', 'categories')");
        } else {
            $pdo->exec("SET FOREIGN_KEY_CHECKS=0");
            $pdo->exec("TRUNCATE TABLE subcategories");
            $pdo->exec("TRUNCATE TABLE categories");
            $pdo->exec("SET FOREIGN_KEY_CHECKS=1");
        }

        $catOrder = 1;
        $totalCats = 0;
        $totalSubcats = 0;

        foreach ($files as $file) {
            $filename = basename($file, '.json');
            $categoryName = trim($filename);
            if ($categoryName === '') continue;

            $slug = strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', $categoryName));
            $slug = trim($slug, '-');

            $jsonContent = file_get_contents($file);
            $items = json_decode($jsonContent, true);
            if (!is_array($items)) {
                $items = [];
            }

            // Find minimum cost among items as default category min_cost
            $minCostCategory = 1.00;
            $costs = [];
            foreach ($items as $item) {
                if (isset($item['min_cost']) && is_numeric($item['min_cost'])) {
                    $costs[] = (float) $item['min_cost'];
                }
            }
            if (!empty($costs)) {
                $minCostCategory = min($costs);
            }

            // Create Category
            $stmt = $pdo->prepare("INSERT INTO categories (name, slug, description, icon_class, is_active, display_order, min_cost, created_at, updated_at) VALUES (:name, :slug, :desc, :icon, 1, :order, :min_cost, :created_at, :updated_at)");
            $stmt->execute([
                ':name'       => $categoryName,
                ':slug'       => $slug,
                ':desc'       => "Category for {$categoryName} tasks",
                ':icon'       => 'bi-tags-fill',
                ':order'      => $catOrder++,
                ':min_cost'   => $minCostCategory,
                ':created_at' => $now,
                ':updated_at' => $now,
            ]);
            $categoryId = (int) $pdo->lastInsertId();
            $totalCats++;

            // Create Subcategories
            $subOrder = 1;
            foreach ($items as $item) {
                $subName = trim((string) ($item['name'] ?? ''));
                if ($subName === '') continue;

                $subSlug = strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', $subName));
                $subSlug = trim($subSlug, '-');

                $minCost = isset($item['min_cost']) && is_numeric($item['min_cost']) ? (float) $item['min_cost'] : 1.00;

                $subStmt = $pdo->prepare("INSERT INTO subcategories (category_id, name, slug, description, is_active, display_order, min_cost, created_at, updated_at) VALUES (:cat_id, :name, :slug, :desc, 1, :order, :min_cost, :created_at, :updated_at)");
                $subStmt->execute([
                    ':cat_id'     => $categoryId,
                    ':name'       => $subName,
                    ':slug'       => $subSlug,
                    ':desc'       => "Subcategory {$subName}",
                    ':order'      => $subOrder++,
                    ':min_cost'   => $minCost,
                    ':created_at' => $now,
                    ':updated_at' => $now,
                ]);
                $totalSubcats++;
            }
        }

        $this->output->info("Successfully seeded {$totalCats} Categories and {$totalSubcats} Subcategories.");
        return self::SUCCESS;
    }

    private function ensureTablesAndColumns($pdo): void
    {
        $driver = strtolower((string) getenv('DB_DRIVER'));

        if ($driver === 'sqlite') {
            $pdo->exec("CREATE TABLE IF NOT EXISTS categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                slug TEXT NOT NULL,
                description TEXT NULL,
                icon_class TEXT NULL,
                is_active INTEGER NOT NULL DEFAULT 1,
                display_order INTEGER NOT NULL DEFAULT 0,
                min_cost REAL NOT NULL DEFAULT 1.00,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT NULL
            );");

            $pdo->exec("CREATE TABLE IF NOT EXISTS subcategories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                category_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                slug TEXT NOT NULL,
                description TEXT NULL,
                is_active INTEGER NOT NULL DEFAULT 1,
                display_order INTEGER NOT NULL DEFAULT 0,
                min_cost REAL NOT NULL DEFAULT 1.00,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT NULL
            );");
        } else {
            $pdo->exec("CREATE TABLE IF NOT EXISTS categories (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(80) NOT NULL,
                slug VARCHAR(80) NOT NULL,
                description VARCHAR(255) NULL,
                icon_class VARCHAR(80) NULL,
                is_active TINYINT(1) NOT NULL DEFAULT 1,
                display_order INT NOT NULL DEFAULT 0,
                min_cost DECIMAL(10,2) NOT NULL DEFAULT 1.00,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NULL,
                UNIQUE KEY uq_categories_slug (slug)
            ) ENGINE=INNODB;");

            $pdo->exec("CREATE TABLE IF NOT EXISTS subcategories (
                id INT AUTO_INCREMENT PRIMARY KEY,
                category_id INT NOT NULL,
                name VARCHAR(100) NOT NULL,
                slug VARCHAR(120) NOT NULL,
                description TEXT NULL,
                is_active TINYINT(1) NOT NULL DEFAULT 1,
                display_order INT NOT NULL DEFAULT 0,
                min_cost DECIMAL(10,2) NOT NULL DEFAULT 1.00,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NULL
            ) ENGINE=INNODB;");
        }

        // Add min_cost column if table already existed without it
        try {
            $catCols = array_column($pdo->query("SHOW COLUMNS FROM categories")->fetchAll(\PDO::FETCH_ASSOC), 'Field');
            if (!empty($catCols) && !in_array('min_cost', $catCols, true)) {
                $pdo->exec("ALTER TABLE categories ADD COLUMN min_cost DECIMAL(10,2) NOT NULL DEFAULT 1.00 AFTER display_order");
            }
        } catch (\Throwable $e) {}

        try {
            $subCols = array_column($pdo->query("SHOW COLUMNS FROM subcategories")->fetchAll(\PDO::FETCH_ASSOC), 'Field');
            if (!empty($subCols) && !in_array('min_cost', $subCols, true)) {
                $pdo->exec("ALTER TABLE subcategories ADD COLUMN min_cost DECIMAL(10,2) NOT NULL DEFAULT 1.00 AFTER display_order");
            }
        } catch (\Throwable $e) {}
    }
}
