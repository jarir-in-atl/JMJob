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
use App\Models\JobAssignment;
use App\Models\VideoAd;
use App\Models\VideoAdView;
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

    public function testJobAssignmentStatusConstants(): void
    {
        $this->assertEquals('assigned', JobAssignment::STATUS_ASSIGNED);
        $this->assertEquals('in_progress', JobAssignment::STATUS_IN_PROGRESS);
        $this->assertEquals('submitted', JobAssignment::STATUS_SUBMITTED);
        $this->assertEquals('revision', JobAssignment::STATUS_REVISION);
        $this->assertEquals('completed', JobAssignment::STATUS_COMPLETED);
        $this->assertTrue(in_array(JobAssignment::STATUS_SUBMITTED, JobAssignment::ACTIVE_STATUSES, true));
        $this->assertFalse(in_array(JobAssignment::STATUS_COMPLETED, JobAssignment::ACTIVE_STATUSES, true));
    }

    public function testJobAssignmentTableName(): void
    {
        $assignment = new JobAssignment();
        $this->assertEquals('job_assignments', $assignment->getTable());
    }

    public function testVideoAdModels(): void
    {
        $this->assertEquals('video_ads', (new VideoAd())->getTable());
        $this->assertEquals('video_ad_views', (new VideoAdView())->getTable());
        $this->assertEquals('active', VideoAd::STATUS_ACTIVE);
        $this->assertEquals('paused', VideoAd::STATUS_PAUSED);
        $this->assertTrue((new VideoAd(['status' => 'active']))->isActive());
        $this->assertFalse((new VideoAd(['status' => 'paused']))->isActive());
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
            '2026_09_19_000001_create_job_assignments_table.php',
            '2026_09_19_000002_add_job_submission_review_fields.php',
            '2026_09_19_000003_add_user_bans_and_admin_audit.php',
            '2026_09_19_000004_create_video_ads_and_settings.php',
            '2026_09_19_000005_add_job_customer_details.php',
            '2026_09_19_000006_resolve_jobs_table_collision.php',
            '2026_09_19_000007_add_submission_risk_fields.php',
            '2026_09_19_000008_add_fraud_policy_settings.php',
            '2026_09_19_000009_reconcile_category_cost_fields.php',
            '2026_09_19_000010_add_ad_control_switches.php',
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
            '2026_09_19_000001_create_job_assignments_table.php',
            '2026_09_19_000002_add_job_submission_review_fields.php',
            '2026_09_19_000003_add_user_bans_and_admin_audit.php',
            '2026_09_19_000004_create_video_ads_and_settings.php',
            '2026_09_19_000005_add_job_customer_details.php',
            '2026_09_19_000006_resolve_jobs_table_collision.php',
            '2026_09_19_000007_add_submission_risk_fields.php',
            '2026_09_19_000008_add_fraud_policy_settings.php',
            '2026_09_19_000009_reconcile_category_cost_fields.php',
            '2026_09_19_000010_add_ad_control_switches.php',
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
        $this->assertTrue(str_contains($content, '/worker/assignments/{id}/cancel'));
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
        $this->assertTrue(str_contains($content, '/ads/videos'));
        $this->assertTrue(str_contains($content, '/ads/videos/start'));
        $this->assertTrue(str_contains($content, '/ads/videos/claim'));
        $this->assertTrue(str_contains($content, '/admin/video-ads'));
        $this->assertTrue(str_contains($content, '/admin/jobs/{id}/detail'));
        $this->assertTrue(str_contains($content, '/admin/jobs/{id}/edit'));
        $this->assertTrue(str_contains($content, '/admin/assignments/{id}/cancel'));
        $this->assertTrue(str_contains($content, '/admin/assignments/{id}/reassign'));
        $this->assertTrue(str_contains($content, '/admin/fraud/submissions'));
        $this->assertTrue(str_contains($content, '/admin/fraud/submissions/{id}/review'));
    }

    public function testControllerFilesSyntaxValid(): void
    {
        $files = [
            'app/Services/JobService.php',
            'app/Services/SettingService.php',
            'app/Http/Controllers/Api/JobController.php',
            'app/Http/Controllers/Api/PosterController.php',
            'app/Http/Controllers/Api/AdminSettingsController.php',
            'app/Http/Controllers/Api/VideoAdController.php',
            'app/Http/Controllers/Api/AdminVideoAdController.php',
            'app/Http/Controllers/Api/AdminJobController.php',
            'app/Services/NotificationService.php',
            'app/Notifications/PlatformNotification.php',
            'app/Console/Kernel.php',
            'tests/JobMarketplaceIntegrationTest.php',
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
        $settings = file_get_contents(base_path('earnap-client/src/views/AdminSettingsPage.js'));
        foreach (['Advertisement System', 'Video Ads', 'Reward System', 'External Ad Network'] as $label) {
            $this->assertTrue(str_contains($settings, $label), "Admin settings is missing {$label}.");
        }
    }

    public function testProofUploadTransportConfig(): void
    {
        $config = file_get_contents(base_path('public/.user.ini'));
        $this->assertTrue(str_contains($config, 'upload_max_filesize = 12M'));
        $this->assertTrue(str_contains($config, 'post_max_size = 14M'));
        $this->assertTrue(str_contains($config, 'max_file_uploads = 5'));
    }

    public function testDeploymentUsesIncrementalTokenFreeMigrationContract(): void
    {
        $script = file_get_contents(base_path('deploy.sh'));
        $this->assertTrue(str_contains($script, '--ignore-time'), 'FTP deployment must compare file sizes when timestamps are unreliable.');
        $this->assertTrue(str_contains($script, '--dry-run'), 'Deployment must expose a read-only FTP preflight.');
        $this->assertTrue(!preg_match('/^\s+--delete(?:\s|\\\\|$)/m', $script), 'Deployment must not delete unrelated hosting files.');
        $this->assertTrue(!str_contains($script, 'MIGRATION_TOKEN'), 'Migration deployment must not require the removed token gate.');
        $this->assertTrue(str_contains($script, 'SITE_URL="${SITE_URL:-https://jmjob.xyz}"'), 'Deployment must keep its production URL separate from APP_URL.');
        $this->assertTrue(str_contains($script, '127.0.0.1') && str_contains($script, 'loopback address'), 'Deployment must reject a local migration target.');
        $this->assertTrue(str_contains($script, 'jmjob-deploy.lock') && str_contains($script, 'flock -n 9'), 'Local deploys must not interleave FTP mirrors.');
        $this->assertTrue(str_contains($script, 'FTP_TIMEOUT_SECONDS') && str_contains($script, 'kill-after=15s'), 'FTP deployment must not hold its process lock indefinitely on a stalled host.');
        $this->assertTrue(str_contains($script, 'POST') && str_contains($script, 'migration_runner.php'), 'Deployment must invoke the idempotent migration runner.');
        $smoke = file_get_contents(base_path('scripts/live_smoke.sh'));
        $workflow = file_get_contents(base_path('.github/workflows/ci.yml'));
        $this->assertTrue(str_contains($smoke, "'/api/jobs' '401' 'application/json'")
            && str_contains($smoke, "'/api/admin/stats' '401' 'application/json'"), 'Live smoke must verify protected API boundaries, not only successful page loads.');
        $this->assertTrue(str_contains($workflow, "scripts/\n") && str_contains($workflow, 'bash deploy/scripts/live_smoke.sh'), 'GitHub deploy must carry and invoke the shared live smoke contract from its artifact.');
        $this->assertTrue(str_contains($workflow, 'test -f scripts/live_smoke.sh'), 'The build must fail if the shared live smoke script is absent from the artifact.');
    }

    public function testMigrationRunnerSerializesConcurrentCallers(): void
    {
        $runner = file_get_contents(base_path('migration_runner.php'));
        $this->assertTrue(str_contains($runner, "storage/framework") && str_contains($runner, "migration_runner.lock"), 'Migration runner must use a project-local lock outside the public deployment mirror.');
        $this->assertTrue(str_contains($runner, 'flock($lockHandle, LOCK_EX)'), 'Migration runner must serialize concurrent callers.');
        $this->assertTrue(str_contains($runner, 'flock($lockHandle, LOCK_UN)'), 'Migration runner must release its lock after completion or failure.');
        $this->assertTrue(str_contains($runner, "? 'status' : 'migrate'") && str_contains($runner, '$manager = $action === \'status\' ? null'), 'Web migration status checks must be read-only and must not construct the migration manager.');
    }

    public function testGitHubDeploymentDoesNotCancelLiveFtpMirrors(): void
    {
        $workflow = file_get_contents(base_path('.github/workflows/ci.yml'));
        $this->assertTrue(str_contains($workflow, 'cancel-in-progress: false'), 'CI must queue runs instead of cancelling a live deployment.');
        $this->assertTrue(str_contains($workflow, 'group: jmjob-production-deploy'), 'Production FTP deploys must share one concurrency group.');
    }

    public function testRouteLoaderIncludesJobRoutes(): void
    {
        $content = file_get_contents(base_path('earnap-client/src/route-loader.js'));
        $this->assertTrue(str_contains($content, '/jobs/available'));
        $this->assertTrue(str_contains($content, '/worker/bids'));
        $this->assertTrue(str_contains($content, '/worker/active-jobs'));
       $this->assertTrue(str_contains(file_get_contents(base_path('earnap-client/src/views/WorkerActiveJobsPage.js')), 'View job details'));
        $workerActive = file_get_contents(base_path('earnap-client/src/views/WorkerActiveJobsPage.js'));
        $this->assertTrue(str_contains($workerActive, 'assignment_status'));
        $this->assertTrue(str_contains($workerActive, 's.assignment_id') && str_contains($workerActive, 'j.assignment_id'), 'Active jobs must match submissions by assignment for multi-worker jobs.');
        $this->assertTrue(str_contains($workerActive, 'needsResubmission') && str_contains($workerActive, "'rejected'") && str_contains($workerActive, 'renderSubmitForm(j, mySub)'), 'Active jobs must render a resubmission form after revision or rejection.');
        $this->assertTrue(str_contains(file_get_contents(base_path('earnap-client/src/views/JobsAvailablePage.js')), 'job.remaining_workers'), 'Available jobs must render remaining worker capacity.');
        $this->assertTrue(str_contains(file_get_contents(base_path('earnap-client/src/views/JobDetailPage.js')), 'job.remaining_workers'), 'Job details must render remaining worker capacity.');
        $this->assertTrue(str_contains(file_get_contents(base_path('app/Http/Controllers/Api/PosterController.php')), 'workerSummary($job'), 'Poster job summaries must use assignment-backed worker counts.');
        $this->assertTrue(str_contains($workerActive, 'Available slots'));
        $this->assertTrue(str_contains($workerActive, 'summary.slice'));
        $jobDetail = file_get_contents(base_path('earnap-client/src/views/JobDetailPage.js'));
        foreach (['Submit Work', 'screenshot', 'submitWork', 'assignment_status', 'my_submission'] as $label) {
            $this->assertTrue(str_contains($jobDetail, $label), "Worker job detail is missing {$label}.");
        }
        $this->assertTrue(str_contains($content, '/admin/categories'));
        $this->assertTrue(str_contains($content, '/admin/settings'));
       $this->assertTrue(str_contains($content, '/admin/pending-jobs'));
        $this->assertTrue(str_contains($content, '/admin/active-jobs'));
        $this->assertTrue(str_contains($content, '/admin/advertisement'));
        $posterDetail = file_get_contents(base_path('earnap-client/src/views/PosterJobDetailPage.js'));
        $this->assertTrue(str_contains($posterDetail, "['submitted', 'revision'].includes(job.status)"), 'Poster detail must keep pending-submission actions visible for mixed revision-state jobs.');
        foreach (['PosterDashboardPage.js', 'PosterJobsPage.js', 'PosterJobDetailPage.js'] as $posterPage) {
            $posterContent = file_get_contents(base_path('earnap-client/src/views/' . $posterPage));
            $this->assertTrue(
                str_contains($posterContent, "!user || (!user.is_admin && user.role !== 'poster')")
                    || str_contains($posterContent, "!!user && (user.is_admin || user.role === 'poster')"),
                $posterPage . ' must enforce the poster/admin UI role boundary.'
            );
        }
        $horizontalNav = file_get_contents(base_path('earnap-client/src/components/HorizontalNav.js'));
        foreach (['/admin/pending-jobs', '/admin/admin-job-post', '/admin/active-jobs'] as $adminNavRoute) {
            $this->assertTrue(str_contains($horizontalNav, $adminNavRoute), "Horizontal admin navigation is missing {$adminNavRoute}.");
        }
        $advertisementPage = file_get_contents(base_path('earnap-client/src/views/AdminAdvertisementPage.js'));
        foreach (['Advertisement', 'Manage Video Ads', 'Manage Providers', 'Monetization Settings'] as $label) {
            $this->assertTrue(str_contains($advertisementPage, $label), "Advertisement hub is missing {$label}.");
        }
        $adminDetail = file_get_contents(base_path('earnap-client/src/views/AdminJobDetailPage.js'));
       foreach (['Total job amount', 'Completed amount', 'Pending amount', 'Remaining amount', 'Proof requirements', 'Start date'] as $label) {
           $this->assertTrue(str_contains($adminDetail, $label), "Admin job detail is missing {$label}.");
       }
        $this->assertTrue(str_contains($adminDetail, 'data-ban-worker'), 'Admin job submissions must expose the worker ban control.');
        $earnPage = file_get_contents(base_path('earnap-client/src/views/EarnPage.js'));
        foreach (['Available ads', 'Remaining limit', 'Today’s ad earnings', 'Total ad earnings'] as $label) {
            $this->assertTrue(str_contains($earnPage, $label), "Earn page is missing {$label}.");
        }
        $adminPage = file_get_contents(base_path('earnap-client/src/views/AdminPage.js'));
        foreach (['Total ad views', 'Completed ad views', 'Eligible rewards', 'User ad rewards'] as $label) {
            $this->assertTrue(str_contains($adminPage, $label), "Admin dashboard is missing {$label}.");
        }
       // Dynamic /jobs/{id} matcher
        $this->assertTrue(str_contains($content, "match(/^\\/jobs\\/(\\d+)$/)"));
        $this->assertTrue(str_contains($content, 'Dynamic routes return before the shared static-route gate'));
        $this->assertTrue(str_contains($content, 'if (!dynamicUser || !dynamicUser.is_admin)'));
    }

    public function testApiJsExposesMarketplaceMethods(): void
    {
        $content = file_get_contents(base_path('earnap-client/src/api.js'));
        foreach (['jobs', 'job', 'placeBid', 'workerBids', 'workerActiveJobs', 'submitWork',
                  'createWorkflowJob', 'applyForJob', 'extendDeadline',
                  'posterCreateJob', 'posterAcceptBid', 'posterReleasePayment',
                  'workerCancelAssignment', 'adminCategories', 'adminSettings', 'adminUpdateSettings',
                  'videoAds', 'videoAdStart', 'videoAdClaim', 'adminVideoAds',
                  'adminApproveApplication'] as $m) {
            $this->assertTrue(str_contains($content, $m), "Missing api method: $m");
        }
    }
}
