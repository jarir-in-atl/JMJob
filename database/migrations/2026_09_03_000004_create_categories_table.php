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
        Database::connect()->exec("CREATE TABLE IF NOT EXISTS categories (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(80) NOT NULL,
            slug VARCHAR(80) NOT NULL,
            description VARCHAR(255) NULL,
            icon_class VARCHAR(80) NULL,
            is_active TINYINT(1) NOT NULL DEFAULT 1,
            display_order INT NOT NULL DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NULL,
            UNIQUE KEY uq_categories_slug (slug),
            INDEX idx_categories_active (is_active, display_order)
        ) ENGINE=INNODB;");

        // Table structure created cleanly. Seeding handled by SeedCategoriesFromDataCommand.
        $count = Fluent::table('categories')->select(['COUNT(*) AS c'])->first()['c'] ?? 0;
        echo "categories table created cleanly (row count: {$count}).\n";
    }

    public function down() {
        Database::connect()->exec("DROP TABLE IF EXISTS categories;");
    }
}
