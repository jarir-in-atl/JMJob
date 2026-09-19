<?php

use Nemesis\Database\Migration;
use Nemesis\Core\Database;
use Nemesis\Core\Fluent;

/**
 * Phase 3 — `categories` (job categories with admin CRUD).
 *
 * Used by the "Post Job" form's category dropdown. Categories can be
 * toggled inactive without losing their historical job associations.
 * Seeds 8 starter categories on first create.
 */
class CreateCategoriesTable extends Migration {
    public function up() {
        $db = Database::connect();
        if (Database::getDriverName() === 'sqlite') {
            $db->exec("CREATE TABLE IF NOT EXISTS categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                slug TEXT NOT NULL UNIQUE,
                description TEXT NULL,
                icon_class TEXT NULL,
                is_active INTEGER NOT NULL DEFAULT 1,
                display_order INTEGER NOT NULL DEFAULT 0,
                min_cost NUMERIC NOT NULL DEFAULT 1.00,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT NULL
            )");
            $db->exec('CREATE INDEX IF NOT EXISTS idx_categories_active ON categories (is_active, display_order)');
        } else {
        $db->exec("CREATE TABLE IF NOT EXISTS categories (
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
            UNIQUE KEY uq_categories_slug (slug),
            INDEX idx_categories_active (is_active, display_order)
        ) ENGINE=INNODB;");
        }

        // Keep a small usable starter catalog available immediately after a
        // fresh migration. The JSON seeder may later replace this list with
        // the full catalog, so inserts are intentionally idempotent.
        $starterCategories = [
            'Logo Design',
            'Web Development',
            'Content Writing',
            'Data Entry',
            'Graphic Design',
            'Video Editing',
            'Mobile App Development',
            'Digital Marketing',
        ];
        $seedSql = Database::getDriverName() === 'sqlite'
            ? 'INSERT OR IGNORE INTO categories (name, slug, description, icon_class, is_active, display_order, created_at) VALUES (?,?,?,?,?,?,?)'
            : 'INSERT IGNORE INTO categories (name, slug, description, icon_class, is_active, display_order, created_at) VALUES (?,?,?,?,?,?,?)';
        $seed = $db->prepare($seedSql);
        foreach ($starterCategories as $order => $name) {
            $slug = strtolower(trim((string) preg_replace('/[^a-zA-Z0-9]+/', '-', $name), '-'));
            $seed->execute([$name, $slug, "Category for {$name} tasks", 'bi-tags-fill', 1, $order + 1, date('Y-m-d H:i:s')]);
        }

        $count = Fluent::table('categories')->select(['COUNT(*) AS c'])->first()['c'] ?? 0;
        echo "categories table created cleanly (row count: {$count}).\n";
    }

    public function down() {
        Database::connect()->exec("DROP TABLE IF EXISTS categories;");
    }
}
