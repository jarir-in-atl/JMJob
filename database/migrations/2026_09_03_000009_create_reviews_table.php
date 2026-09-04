<?php

use Nemesis\Database\Migration;
use Nemesis\Core\Database;

/**
 * Phase 3 — `reviews` (worker + poster ratings after job completion).
 *
 * Bidirectional: each completed job generates up to two rows
 *   - poster reviews worker (rating 1-5, comment)
 *   - worker reviews poster (rating 1-5, comment)
 *
 * Used to compute users.rating (rolling average) and users.rating_count.
 */
class CreateReviewsTable extends Migration {
    public function up() {
        Database::connect()->exec("CREATE TABLE IF NOT EXISTS reviews (
            id INT AUTO_INCREMENT PRIMARY KEY,
            job_id INT NOT NULL,
            reviewer_id INT NOT NULL,
            reviewee_id INT NOT NULL,
            rating TINYINT NOT NULL,
            comment TEXT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY uq_review_per_job_per_reviewer (job_id, reviewer_id),
            INDEX idx_reviews_reviewee (reviewee_id),
            INDEX idx_reviews_reviewer (reviewer_id),
            INDEX idx_reviews_rating (rating)
        ) ENGINE=INNODB;");
    }

    public function down() {
        Database::connect()->exec("DROP TABLE IF EXISTS reviews;");
    }
}
