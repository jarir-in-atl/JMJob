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

        // Seed starter list (matches §10.0.1 of PLAN.md). Uses Fluent::insert
        // (which handles binding correctly) and swallows duplicate-key errors
        // so re-running the migration is safe.
        $now = date('Y-m-d H:i:s');
        $seed = [
            ['Logo Design',            'logo-design',            'Brand marks, wordmarks, monograms, and full identity systems.', 'bi-palette-fill',          1],
            ['Web Development',        'web-development',        'Frontend, backend, full-stack, and WordPress / Shopify builds.',  'bi-code-slash',           2],
            ['Content Writing',       'content-writing',        'Articles, blog posts, copywriting, technical docs.',                  'bi-pencil-square',         3],
            ['Data Entry',             'data-entry',             'Spreadsheet work, form filling, copy-paste, data cleaning.',          'bi-table',                 4],
            ['Graphic Design',         'graphic-design',         'Social posts, posters, brochures, infographics.',                      'bi-image-alt',             5],
            ['Video Editing',          'video-editing',          'Shorts, reels, YouTube videos, color grading, captions.',              'bi-film',                  6],
            ['Mobile App Development', 'mobile-app-development', 'iOS, Android, React Native, Flutter.',                                  'bi-phone',                 7],
            ['Digital Marketing',      'digital-marketing',      'SEO, social ads, email campaigns, influencer outreach.',               'bi-megaphone-fill',        8],
        ];

        $errors = [];
        foreach ($seed as [$name, $slug, $desc, $icon, $order]) {
            try {
                Fluent::table('categories')->insert([
                    'name'          => $name,
                    'slug'          => $slug,
                    'description'   => $desc,
                    'icon_class'    => $icon,
                    'is_active'     => 1,
                    'display_order' => $order,
                    'created_at'    => $now,
                ]);
            } catch (Throwable $e) {
                $errors[] = "{$slug}: " . $e->getMessage();
            }
        }
        if (!empty($errors)) {
            echo "categories seed errors:\n  " . implode("\n  ", $errors) . "\n";
        }
        $count = Fluent::table('categories')->select(['COUNT(*) AS c'])->first()['c'] ?? 0;
        echo "categories row count: {$count}\n";
    }

    public function down() {
        Database::connect()->exec("DROP TABLE IF EXISTS categories;");
    }
}
