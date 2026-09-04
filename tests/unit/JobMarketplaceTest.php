<?php
declare(strict_types=1);

/**
 * JobMarketplaceTest — unit tests for the Phase 3 job marketplace.
 *
 * Covers:
 *   - Model constants + table names
 *   - SettingService encode/decode (type safety)
 *   - Migration files exist + are syntactically valid
 *   - Controllers / routes registered
 *   - Frontend pages built
 *
 * The actual JobService transactional flows (create/acceptBid/release)
 * need a real DB and are covered in the manual test plan
 * (TEST_PLAN_PHASE_3.md) — they'd require too much mocking here.
 */

use Nemesis\Testing\TestCase;
use App\Models\Job;
use App\Models\JobBid;
use App\Models\JobSubmission;
use App\Models\Transaction;
use App\Models\Category;
use App\Models\PlatformSetting;

class JobMarketplaceTest extends TestCase
{
    // -------------------------------------------------------------------
    // Job model
    // -------------------------------------------------------------------

    public function testJobStatusConstants(): void
    {
        $this->assertEquals('open',        Job::STATUS_OPEN);
        $this->assertEquals('in_review',   Job::STATUS_IN_REVIEW);
        $this->assertEquals('assigned',    Job::STATUS_ASSIGNED);
        $this->assertEquals('submitted',   Job::STATUS_SUBMITTED);
        $this->assertEquals('revision',    Job::STATUS_REVISION);
        $this->assertEquals('completed',   Job::STATUS_COMPLETED);
        $this->assertEquals('cancelled',   Job::STATUS_CANCELLED);
        $this->assertEquals('disputed',    Job::STATUS_DISPUTED);
        $this->assertEquals('expired',     Job::STATUS_EXPIRED);
    }

    public function testJobOpenStatuses(): void
    {
        $this->assertTrue(in_array(Job::STATUS_OPEN, Job::OPEN_STATUSES, true));
        $this->assertTrue(in_array(Job::STATUS_IN_REVIEW, Job::OPEN_STATUSES, true));
        $this->assertFalse(in_array(Job::STATUS_ASSIGNED, Job::OPEN_STATUSES, true));
        $this->assertFalse(in_array(Job::STATUS_COMPLETED, Job::OPEN_STATUSES, true));
    }

    public function testJobTableName(): void
    {
        $j = new Job();
        $this->assertEquals('jobs', $j->getTable());
    }

    // -------------------------------------------------------------------
    // JobBid model
    // -------------------------------------------------------------------

    public function testJobBidStatusConstants(): void
    {
        $this->assertEquals('pending',   JobBid::STATUS_PENDING);
        $this->assertEquals('accepted',  JobBid::STATUS_ACCEPTED);
        $this->assertEquals('rejected',  JobBid::STATUS_REJECTED);
        $this->assertEquals('withdrawn', JobBid::STATUS_WITHDRAWN);
        $this->assertEquals('expired',   JobBid::STATUS_EXPIRED);
    }

    public function testJobBidTableName(): void
    {
        $b = new JobBid();
        $this->assertEquals('job_bids', $b->getTable());
    }

    // -------------------------------------------------------------------
    // JobSubmission model
    // -------------------------------------------------------------------

    public function testJobSubmissionStatusConstants(): void
    {
        $this->assertEquals('pending_review', JobSubmission::STATUS_PENDING_REVIEW);
        $this->assertEquals('approved',       JobSubmission::STATUS_APPROVED);
        $this->assertEquals('revision',       JobSubmission::STATUS_REVISION);
        $this->assertEquals('rejected',       JobSubmission::STATUS_REJECTED);
    }

    public function testJobSubmissionTableName(): void
    {
        $s = new JobSubmission();
        $this->assertEquals('job_submissions', $s->getTable());
    }

    // -------------------------------------------------------------------
    // Transaction model
    // -------------------------------------------------------------------

    public function testTransactionTypeConstants(): void
    {
        $expected = ['deposit', 'withdrawal', 'escrow_hold', 'escrow_release',
                     'commission', 'refund', 'adjustment'];
        // Make sure the class is loaded (autoloader should handle it, but
        // we touch the class explicitly to be safe).
        new \App\Models\Transaction();
        foreach ($expected as $t) {
            $const = 'App\Models\Transaction::TYPE_' . strtoupper($t);
            $this->assertTrue(defined($const), "Missing constant $const");
        }
    }

    public function testTransactionTableName(): void
    {
        $t = new Transaction();
        $this->assertEquals('transactions', $t->getTable());
    }

    public function testTransactionIsDebit(): void
    {
        $this->assertTrue((new Transaction(['type' => 'withdrawal']))->isDebit());
        $this->assertTrue((new Transaction(['type' => 'escrow_hold']))->isDebit());
        $this->assertTrue((new Transaction(['type' => 'refund']))->isDebit());
        $this->assertFalse((new Transaction(['type' => 'deposit']))->isDebit());
        $this->assertFalse((new Transaction(['type' => 'escrow_release']))->isDebit());
        $this->assertFalse((new Transaction(['type' => 'commission']))->isDebit());
    }

    // -------------------------------------------------------------------
    // Category model
    // -------------------------------------------------------------------

    public function testCategoryTableName(): void
    {
        $c = new Category();
        $this->assertEquals('categories', $c->getTable());
    }

    public function testCategoryIsActive(): void
    {
        $this->assertTrue((new Category(['is_active' => 1]))->isActive());
        $this->assertTrue((new Category(['is_active' => '1']))->isActive());
        $this->assertFalse((new Category(['is_active' => 0]))->isActive());
    }

    // -------------------------------------------------------------------
    // PlatformSetting model
    // -------------------------------------------------------------------

    public function testPlatformSettingTableName(): void
    {
        $p = new PlatformSetting();
        $this->assertEquals('platform_settings', $p->getTable());
    }

    public function testPlatformSettingTypeConstants(): void
    {
        $this->assertEquals('string',  PlatformSetting::TYPE_STRING);
        $this->assertEquals('integer', PlatformSetting::TYPE_INTEGER);
        $this->assertEquals('decimal', PlatformSetting::TYPE_DECIMAL);
        $this->assertEquals('percent', PlatformSetting::TYPE_PERCENT);
        $this->assertEquals('boolean', PlatformSetting::TYPE_BOOLEAN);
        $this->assertEquals('json',    PlatformSetting::TYPE_JSON);
    }

    public function testPlatformSettingCastValue(): void
    {
        $this->assertSame(0.10, (new PlatformSetting(['value' => '0.10', 'value_type' => 'decimal']))->castValue());
        $this->assertSame(72,   (new PlatformSetting(['value' => '72',   'value_type' => 'integer']))->castValue());
        $this->assertSame(true, (new PlatformSetting(['value' => '1',    'value_type' => 'boolean']))->castValue());
        $this->assertSame(false,(new PlatformSetting(['value' => '0',    'value_type' => 'boolean']))->castValue());
        $this->assertSame('BDT',(new PlatformSetting(['value' => 'BDT',  'value_type' => 'string']))->castValue());
        $this->assertEquals(['a' => 1], (new PlatformSetting(['value' => '{"a":1}', 'value_type' => 'json']))->castValue());
    }

    // -------------------------------------------------------------------
    // Migration files
    // -------------------------------------------------------------------

    public function testMigrationsExist(): void
    {
        $expected = [
            '2026_09_03_000002_alter_users_add_role_and_wallet.php',
            '2026_09_03_000003_create_platform_settings_table.php',
            '2026_09_03_000004_create_categories_table.php',
            '2026_09_03_000005_create_jobs_table.php',
            '2026_09_03_000006_create_job_bids_table.php',
            '2026_09_03_000007_create_job_submissions_table.php',
            '2026_09_03_000008_create_transactions_table.php',
            '2026_09_03_000009_create_reviews_table.php',
        ];
        foreach ($expected as $f) {
            $path = base_path('database/migrations/' . $f);
            $this->assertTrue(file_exists($path), "Missing migration: $f");
        }
    }

    public function testMigrationsSyntaxValid(): void
    {
        $files = [
            '2026_09_03_000002_alter_users_add_role_and_wallet.php',
            '2026_09_03_000003_create_platform_settings_table.php',
            '2026_09_03_000004_create_categories_table.php',
            '2026_09_03_000005_create_jobs_table.php',
            '2026_09_03_000006_create_job_bids_table.php',
            '2026_09_03_000007_create_job_submissions_table.php',
            '2026_09_03_000008_create_transactions_table.php',
            '2026_09_03_000009_create_reviews_table.php',
        ];
        foreach ($files as $f) {
            $path = base_path('database/migrations/' . $f);
            $output = shell_exec('php -l ' . escapeshellarg($path) . ' 2>&1');
            $this->assertTrue(str_contains((string) $output, 'No syntax errors'), "Syntax error in $f: $output");
        }
    }

    public function testPlatformSettingsMigrationSeedsDefaults(): void
    {
        $path = base_path('database/migrations/2026_09_03_000003_create_platform_settings_table.php');
        $content = file_get_contents($path);
        // Commission rate 0.10
        $this->assertTrue(str_contains($content, "'commission_rate'") && str_contains($content, "'0.10'"),
            'commission_rate default 0.10 missing');
        // Currency BDT
        $this->assertTrue(str_contains($content, "'default_currency'") && str_contains($content, "'BDT'"),
            'default_currency BDT missing');
        // Escrow full_bid
        $this->assertTrue(str_contains($content, "'escrow_mode'") && str_contains($content, "'full_bid'"),
            'escrow_mode full_bid default missing');
    }

    public function testCategoriesMigrationSeedsStarterList(): void
    {
        $path = base_path('database/migrations/2026_09_03_000004_create_categories_table.php');
        $content = file_get_contents($path);
        foreach (['Logo Design', 'Web Development', 'Content Writing', 'Data Entry',
                  'Graphic Design', 'Video Editing', 'Mobile App Development', 'Digital Marketing'] as $name) {
            $this->assertTrue(str_contains($content, "'$name'"), "Seed category '$name' missing");
        }
    }

    // -------------------------------------------------------------------
    // Routes
    // -------------------------------------------------------------------

    public function testApiRoutesIncludeJobEndpoints(): void
    {
        $content = file_get_contents(base_path('routes/api.php'));
        // Worker
        $this->assertTrue(str_contains($content, '/categories'));
        $this->assertTrue(str_contains($content, '/jobs'));
        $this->assertTrue(str_contains($content, '/jobs/{id}/bid'));
        $this->assertTrue(str_contains($content, '/bids/{id}'));
        $this->assertTrue(str_contains($content, '/worker/bids'));
        $this->assertTrue(str_contains($content, '/worker/active-jobs'));
        $this->assertTrue(str_contains($content, '/jobs/{id}/submit'));
        $this->assertTrue(str_contains($content, '/worker/submissions'));
        // Poster
        $this->assertTrue(str_contains($content, '/poster/jobs'));
        $this->assertTrue(str_contains($content, '/poster/jobs/{id}/accept-bid'));
        $this->assertTrue(str_contains($content, '/poster/jobs/{id}/release'));
        $this->assertTrue(str_contains($content, '/poster/jobs/{id}/cancel'));
        $this->assertTrue(str_contains($content, '/poster/stats'));
        // Admin
        $this->assertTrue(str_contains($content, '/admin/categories'));
        $this->assertTrue(str_contains($content, '/admin/settings'));
        $this->assertTrue(str_contains($content, '/admin/transactions'));
        $this->assertTrue(str_contains($content, '/admin/revenue'));
    }

    public function testControllerFilesSyntaxValid(): void
    {
        $files = [
            'app/Services/JobService.php',
            'app/Services/SettingService.php',
            'app/Http/Controllers/Api/JobController.php',
            'app/Http/Controllers/Api/PosterController.php',
            'app/Http/Controllers/Api/AdminSettingsController.php',
            'routes/api.php',
        ];
        foreach ($files as $f) {
            $path = base_path($f);
            $output = shell_exec('php -l ' . escapeshellarg($path) . ' 2>&1');
            $this->assertTrue(str_contains((string) $output, 'No syntax errors'), "Syntax error in $f: $output");
        }
    }

    // -------------------------------------------------------------------
    // Frontend pages
    // -------------------------------------------------------------------

    public function testWorkerPagesExist(): void
    {
        $pages = [
            'JobsAvailablePage',
            'JobDetailPage',
            'WorkerBidsPage',
            'WorkerActiveJobsPage',
        ];
        $dir = base_path('earnap-client/src/views');
        foreach ($pages as $p) {
            $found = false;
            foreach (glob("$dir/*.js") as $f) {
                if (str_contains(basename($f), str_replace('Page', '', $p))) {
                    $found = true;
                    break;
                }
            }
            $this->assertTrue($found, "Missing worker page containing $p");
        }
    }

    public function testAdminPagesExist(): void
    {
        $this->assertTrue(file_exists(base_path('earnap-client/src/views/AdminCategoriesPage.js')));
        $this->assertTrue(file_exists(base_path('earnap-client/src/views/AdminSettingsPage.js')));
    }

    public function testRouteLoaderIncludesJobRoutes(): void
    {
        $content = file_get_contents(base_path('earnap-client/src/route-loader.js'));
        $this->assertTrue(str_contains($content, '/jobs/available'));
        $this->assertTrue(str_contains($content, '/worker/bids'));
        $this->assertTrue(str_contains($content, '/worker/active-jobs'));
        $this->assertTrue(str_contains($content, '/admin/categories'));
        $this->assertTrue(str_contains($content, '/admin/settings'));
        // Dynamic /jobs/{id} matcher
        $this->assertTrue(str_contains($content, "match(/^\\/jobs\\/(\\d+)$/)"));
    }

    public function testApiJsExposesMarketplaceMethods(): void
    {
        $content = file_get_contents(base_path('earnap-client/src/api.js'));
        foreach (['jobs', 'job', 'placeBid', 'workerBids', 'workerActiveJobs', 'submitWork',
                  'posterCreateJob', 'posterAcceptBid', 'posterReleasePayment',
                  'adminCategories', 'adminSettings', 'adminUpdateSettings'] as $m) {
            $this->assertTrue(str_contains($content, $m), "Missing api method: $m");
        }
    }
}
