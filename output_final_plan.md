The initial code audit found that the current code was not a complete match for `upgrade_plan.txt`. It was an earlier single-worker marketplace foundation with basic ads, payments, admin oversight, and notifications. The implementation slice below records what has since been added and what is still outstanding.

| Plan area | Status | Current match |
|---|---|---|
| User jobs and submissions (§§1–8) | Partial | Browsing, bidding, active jobs, text/link submissions, screenshot upload, protected proof streaming, Admin Job Post CRUD/detail pages, admin approve/reject actions, deadline reminders, dispute notifications, and approval/decline notifications now exist. Full browser and production-flow verification remain. |
| Multi-worker payment flow (§9) | Partial | Assignment rows, per-worker escrow/payment state, assignment-aware submissions, atomic release/refund paths, progress counters, admin cancellation/refund, worker cancellation requests, capacity rechecks, idempotent payment release, transactional reassignment, and passing two-process capacity/submission-race checks now exist alongside legacy pointers. Broader rollback coverage and production verification remain. |
| Fraud detection and rejection (§10) | Partial | Rejection reasons, reviewer notes, duplicate pending-submission protection, configurable advisory content/velocity/IP/fingerprint thresholds, risk fields, a fraud review queue, explicit clear/dismiss/confirm decisions, optional confirmed-fraud ban escalation, and concurrent submission claiming now exist. Fraud-specific duplicate-content/concurrency regression coverage now passes; production policy rollout remains. |
| User ban system (§11) | Implemented foundation | Ban fields, history, admin audit records, login/session/API enforcement, admin endpoints, UI controls, and service-layer gates for jobs, submissions, rewards, and withdrawals now exist. Production migration/live verification and broader endpoint regression coverage remain. |
| Ads and video earning (§§12–18) | Partial | First-party video ads, server-timed start/claim, duplicate-claim protection, daily/total limits, upload validation, admin CRUD, website/app settings, publisher/ad-unit fields, separate advertisement/video/reward/external-network switches, and user/admin UI now exist. External compliant ad-network integration and production/live verification remain. |
| Dashboard statistics (§19) | Partial | Admin stats/UI now include job status, worker, submission-risk, escrow, commission, worker-earning, and ad-earning metrics in addition to existing user, withdrawal, and ad counters; Reports now include assignment/payment and submission-risk drill-down groups plus CSV export. Live/reporting verification remains. |
| Notifications (§20) | Partial | Notification storage and UI exist, job/application/bid/submission/revision/assignment/payment/cancellation/deadline/dispute/approval/decline/ban/unban/job-completion events are wired with scheduler-safe deadline deduplication, and database delivery/read-state plus opt-in mail-channel routing are covered with fake delivery. Real configured email delivery and broader regression coverage remain. |
| Complete admin flow and security (§§21–24) | Partial | Admin job approval/dispute, Admin Job Post CRUD, active-job detail management, assignment cancel/reassign, submission/fraud review, ban controls, and audit records exist; the full endpoint security contract and production verification remain. |

Initial audit evidence (before the implementation slices):

- Current job routes provide worker, poster, and basic admin actions, but no Admin Job Post, submission review, ban, or video-ad routes: [routes/api.php:75](/home/jarir-ahmed/Downloads/JMJob/routes/api.php:75).
- The current job service assigns one worker and changes the whole job to submitted/completed: [JobService.php:350](/home/jarir-ahmed/Downloads/JMJob/app/Services/JobService.php:350), [JobService.php:434](/home/jarir-ahmed/Downloads/JMJob/app/Services/JobService.php:434).
- Before the implementation slices, worker submission UI accepted only description and external link; the current UI now includes the required/optional screenshot upload at [WorkerActiveJobsPage.js:75](/home/jarir-ahmed/Downloads/JMJob/earnap-client/src/views/WorkerActiveJobsPage.js:75).
- Admin currently views submissions but has no approve/reject actions: [AdminJobsPage.js:184](/home/jarir-ahmed/Downloads/JMJob/earnap-client/src/views/AdminJobsPage.js:184).
- Existing admin job metrics use bid counts, not completed/pending/rejected worker counts: [AdminController.php:261](/home/jarir-ahmed/Downloads/JMJob/app/Http/Controllers/Api/AdminController.php:261).
- Ad functionality is provider rotation and timed reward claiming, not the planned video-ad management system: [AdController.php:22](/home/jarir-ahmed/Downloads/JMJob/app/Http/Controllers/Api/AdController.php:22), [WebTaskController.php:54](/home/jarir-ahmed/Downloads/JMJob/app/Http/Controllers/Api/WebTaskController.php:54).
- The user schema has no phone, ban, or status fields: [users migration](/home/jarir-ahmed/Downloads/JMJob/database/migrations/2026_02_04_081846_create_users_table.php:8).

Original target plan (historical):

1. Define the target data model: multi-worker assignments, job statuses, per-worker payment states, customer/admin-created jobs, proof requirements, and idempotent reward rules.

2. Add migrations and models for:
   - job subtitles/customer details and lifecycle fields;
   - worker assignments/progress;
   - screenshot/file proofs and review reasons;
   - user ban status and ban history;
   - admin action/audit logs;
   - video ads and website/app monetization configuration.

3. Implement backend workflows:
   - Admin Job Post CRUD;
   - job edit/delete;
   - multi-worker activation and assignment;
   - active-job summaries;
   - admin submission approve/reject;
   - atomic per-worker balance updates;
   - duplicate-submission protection.

4. Implement secure proof uploads with MIME, size, storage, authorization, and cleanup rules.

5. Implement ban/unban enforcement across login, jobs, submissions, rewards, withdrawals, and active sessions.

6. Build the planned ad system: video-ad CRUD, compliant rewarded-ad integration, daily/total limits, website/app settings, publisher/ad-unit fields, and separate advertisement/watch-and-earn master switches.

7. Complete frontend panels: worker job details with screenshot upload, Admin Job Post, Active Job detail page, submission review actions, user ban controls, ad management, and dashboard statistics.

8. Wire all required notifications and add regression/integration tests for multi-worker accounting, moderation, bans, uploads, ads, duplicate protection, and permissions.

## Implementation progress

### Completed in the implementation slices so far

- [x] Added `job_assignments` with per-worker lifecycle and payment-state fields, while retaining legacy `jobs.assigned_*` compatibility pointers.
- [x] Added assignment-aware submission metadata: assignment ID, attempt number, submitted timestamp, and rejection reason.
- [x] Added assignment model/query support and updated active-job lookup to include multi-worker assignments.
- [x] Updated admin application approval and poster bid acceptance to create assignments when the new table is available.
- [x] Added admin submission review API and UI actions for approve/reject decisions with required rejection reasons.
- [x] Added per-worker escrow hold/release/refund behavior with idempotent payment transitions and job progress refresh.
- [x] Added secure screenshot upload, logical-path storage, authorization-checked proof streaming, and cleanup on failed submission transactions.
- [x] Added user ban/unban fields, history, admin audit records, login/session/API enforcement, admin endpoints, and controls.
- [x] Enforced the separate worker/poster/admin role boundary in poster navigation, poster controllers, and the job service; admin-only assignment, moderation, and payment service actions now validate the acting administrator even when called outside route middleware.
- [x] Verified the upload wrapper through a real multipart HTTP request: a valid PNG was accepted and moved to the temporary destination, while a text file renamed as PNG was rejected by server-side MIME detection; the probe is isolated under `tests/MultipartUploadProbe.php` and is not an application route.
- [x] Verified the real `/api/jobs/{id}/submit` multipart endpoint with disposable migrated data: an authenticated worker upload persisted a pending submission, and an authenticated admin review approved it, completed the assignment, released escrow, and credited the worker.
- [x] Added video-ad/settings migrations, models, server-timed start/claim endpoints, daily/total limits, stream protection, admin CRUD, user watch UI, admin management UI, and a provider-neutral typed website/app ad configuration contract with bounded publisher/unit validation.
- [x] Enforced the advertisement and watch-and-earn master switches at the legacy provider-rotation and standard reward endpoints as well as the first-party video-ad endpoints.
- [x] Added separate default-on Advertisement System, Video Ads, Reward System, and External Ad Network controls, exposed them through the admin settings surface, and enforced them at provider, video, task, daily-bonus, and central reward boundaries without changing existing defaults.
- [x] Added job subtitle/customer metadata migration, fixed the poster creation variable contract, and preserved customer details through worker/admin job serialization.
- [x] Added Admin Job Post create/edit/delete APIs, protected job detail/assignment views, admin job-post and active-job detail pages, and worker-facing subtitle/pay/availability details.
- [x] Resolved the legacy queue/marketplace `jobs` table collision, added driver-aware SQLite migration branches for the existing chain, added idempotent starter categories for fresh installs, and verified the complete migration set plus a second idempotent run on disposable databases.
- [x] Added a proper SQLite auto-increment users migration branch so fresh disposable databases preserve model IDs and lookup behavior.
- [x] Added assignment cancellation/refund, worker cancellation requests, admin reassignment controls, and assignment-aware admin detail actions.
- [x] Added submission risk metadata/signals, fraud queue/review decisions, confirmed-fraud payment/moderation gates, and admin fraud UI.
- [x] Expanded admin dashboard metrics for job progress, submissions, risk flags, escrow, commissions, worker earnings, and ad earnings.
- [x] Added banned-worker assignment gates, transactional assignment reassignment with escrow refund/re-hold, and idempotent payment-release response payloads.
- [x] Extended poster-side bid acceptance for multi-worker jobs: pending bids remain available, capacity is rechecked in-transaction, and job status transitions through `in_review` to `engaged` without changing the single-worker path.
- [x] Kept poster revision and payment actions assignment-scoped when a multi-worker job has mixed review states: a pending submission can still be revised or released while another assignment remains in revision; invalid cross-job submission IDs are rejected before payment fallback.
- [x] Made assignment-backed submissions claim their assignment conditionally inside the submission transaction, preventing duplicate pending submissions and refreshing aggregate job progress instead of unconditionally marking the whole job submitted.
- [x] Made non-approval moderation conditional on the pending submission state, preventing a concurrent rejection from reverting an assignment after an approval/payment release.
- [x] Made assignment payment release conditionally claim pending-review submissions before committing escrow release, so a concurrent rejection rolls back the complete payment transaction.
- [x] Added additive fraud-policy settings for description length, submission velocity, shared identity, review threshold, and explicit ban-confirmation policy; cleared/dismissed reviews now notify workers.
- [x] Hardened withdrawal creation with a transactional user-balance lock, banned-user guard, and one-pending-request race protection; deposit approval/rejection now use the same write boundary and conditional pending-state transition.
- [x] Hardened admin withdrawal transitions to a one-way pending/approved/paid state machine with an atomic rejection refund, preventing repeated rejection or payment actions from mutating balances twice.
- [x] Added service-layer banned-account gates for job creation/editing, applications/bids, submissions, payment actions, and ad/web/Telegram rewards, with disposable regression coverage alongside the existing login/session/withdrawal enforcement.
- [x] Added admin audit entries for withdrawal state, role, job moderation, submission review, provider, video-ad, ban, fraud, dispute, and assignment actions.
- [x] Wired non-blocking lifecycle notifications for job creation, applications/bids, submissions, revisions, assignments, assignment cancellation/reassignment, payment release, job cancellation/completion, deadline reminders, disputes, approval/decline, and ban/unban.
- [x] Verified disposable SQLite fraud flagging plus assignment cancellation/refund and submission-approval/payment-release accounting flows.
- [x] Added disposable-database integration coverage for assignment reassignment, payment idempotency, explicit fraud-ban escalation, deadline reminder deduplication, ownership permissions, and cleanup.
- [x] Added disposable coverage for admin job edit/detail/delete behavior, including the guard that blocks deletion while an assignment remains active.
- [x] Added disposable coverage for poster-side multi-worker bid acceptance, atomic video-ad total limits, and database notification delivery/read-state behavior.
- [x] Added a shared SQLite busy timeout, transient-lock retry, and `BEGIN IMMEDIATE` write boundary for marketplace, deposit approval, withdrawal, rewarded-video, and admin mutation transactions, plus passing disposable two-process capacity/submission, one-deposit-approval, one-pending-withdrawal, and idempotent-video-claim race checks.
- [x] Rechecked duplicate-content risk after acquiring the submission write boundary and added a passing two-process test where two workers submit identical content to separate assignments and the later submission is flagged without rejecting either valid submission.
- [x] Added integration assertions for moderator rejection reasons, assignment return-to-revision with escrow held, repeated deadline-reminder execution, opt-in notification email routing through the fake mail channel, and atomic provider-settings validation/write behavior.
- [x] Added proof-path traversal regression coverage and wired the idempotent web migration runner into deployment; deployment invokes pending migrations automatically without changing application data beyond the migration set.
- [x] Expanded admin Reports with assignment/payment-state and submission-risk aggregates, per-report totals, and an authenticated CSV export; the disposable integration check verifies both JSON drill-down data and CSV headers.
- [x] Reconciled category/subcategory `min_cost` schema fields for fresh and upgraded databases, replaced SQLite-incompatible admin CRUD timestamps, and added disposable category/subcategory create/update/delete coverage.
- [x] Added focused regression coverage, PHP/JS syntax checks, endpoint idempotency checks, provider-neutral ad configuration validation, real-browser shell verification, and rebuilt `public/js/app.js`.
- [x] Wired the idempotent migration runner into both `deploy.sh` and the GitHub `main` deployment job; both paths now fail when the migration request fails instead of silently continuing.
- [x] Documented the initial fraud thresholds and moderator false-positive/confirmed-fraud procedure in the tracked README; production tuning and observation remain operational decisions.
- [x] Restored incremental FTP deployment comparison with `--ignore-time` so unchanged remote files are skipped despite unreliable hosting timestamps; the token-free migration runner remains idempotent and verified remotely with no pending migrations.
- [x] Fixed the PHP built-in development-server router so existing frontend assets are served directly while API and application requests continue through the front controller.
- [x] Fixed the final-slot video stream race: the worker who reserved the last lifetime slot may still load that pending stream, while unrelated users remain blocked after exhaustion.
- [x] Fixed status-only admin video-ad updates so the UI can pause and reactivate an existing ad without resubmitting its title or video file.
- [x] Completed the admin submission-detail contract: proof views now show worker ID, phone, email, submission time, attempt number, delivery link, attachment, review note, and risk state where available.
- [x] Completed the admin job-detail summary contract: progress amounts, start/deadline dates, structured proof requirements, and worker-count states are now rendered alongside assignment and submission management.
- [x] Exposed completed video-ad counts in the admin dashboard alongside the existing ad rewards, marketplace payment, and submission-risk metrics.
- [x] Reconciled dashboard ad-view semantics: total and completed ad-view counters now include both legacy provider views and first-party video views while retaining the video-specific breakdown.
- [x] Added explicit active-user, eligible-reward, and user-ad-reward dashboard metrics required by the upgrade plan while preserving the existing statistics contract.
- [x] Completed the user Watch Ads & Earn summary contract with available-ad count, remaining daily limit, today’s ad earnings, and total ad earnings metadata.
- [x] Synchronized desktop/mobile admin navigation and the static route map for Job Post, Admin Job Post, and Active Job, including the poster-only navigation boundary.
- [x] Added the requested administrator Advertisement menu section with links to video-ad campaigns, provider rotation, and website/app monetization settings, while reusing the existing dashboard controls.
- [x] Closed the dynamic frontend route gate bypass: worker and admin job-detail URLs now enforce authentication, with admin details also enforcing administrator access before rendering.
- [x] Added a direct worker Active Job details link so assigned workers can review requirements and proof instructions before submitting.
- [x] Completed the worker Active Jobs card contract with job summary text, pay, available-slot count, deadline, and the full details link.
- [x] Completed assignment-scoped worker job details: the API now returns the current worker's assignment/submission, the detail page renders assignment status and revision feedback with screenshot/report submission, and Active Job cards no longer use aggregate status for multi-worker assignments.
- [x] Closed the remaining worker-role bypass: worker-only controllers now return 403 for posters/admins, and the service layer validates worker roles for applications, bids, withdrawals, submissions, cancellations, and assignment replacement targets while preserving legacy empty-role workers.
- [x] Added explicit administrator guards to admin job and rewarded-video controllers, so direct controller calls cannot bypass the route-level admin middleware.
- [x] Added the same explicit administrator boundary to platform settings, category/subcategory CRUD, transaction, revenue, report, and settings-list controller actions.
- [x] Added explicit administrator guards to the main admin controller's withdrawal, user/ban, job, moderation, fraud, dispute, statistics, and provider actions, rather than relying solely on route middleware.
- [x] Closed the remaining direct-controller admin bypasses in payment verification/listing, daily-counter reset, social-link updates, notice updates, and banner upload; authenticated admin list/reset flows remain available.
- [x] Expanded poster lifecycle integration coverage: every poster controller action rejects direct worker calls, and admin callers cannot read or accept bids for jobs they do not own.
- [x] Added direct-controller ban guards for worker and poster marketplace endpoints, complementing the authentication middleware and service-layer ban enforcement.
- [x] Added direct-controller ban guards for video-ad listing, start, stream, claim, and standard reward endpoints before any ad or balance mutation.
- [x] Added direct-controller ban guards to the legacy ad configuration and provider-rotation endpoints so banned users cannot enter either advertising flow.
- [x] Added direct-controller ban guards for legacy web-task and Telegram-task listing, start, claim, and verification endpoints before task or reward mutations.
- [x] Added direct-controller ban guards for daily-bonus claim and status endpoints before reward mutation or eligibility disclosure.
- [x] Added a serialized daily-bonus claim boundary so concurrent requests can credit at most one daily reward and audit row per user/date.
- [x] Added serialized one-time reward boundaries for legacy web-task claims and Telegram-task verification, preserving their existing response flows while preventing duplicate credits.
- [x] Rechecked the legacy web-task daily limit inside the claim transaction so extra eligible completions cannot bypass the configured per-user cap.
- [x] Added a locked, transaction-aware legacy provider reward path so concurrent ad credits preserve both balance and daily-ad counters, including referral commission writes.
- [x] Closed the remaining banned-payment paths: banned users cannot submit deposits, and pending deposits are not credited after a user is banned.
- [x] Prevented assignment-aware and legacy job-payment release from crediting workers who were banned after submitting work.
- [x] Added worker-facing “New job available” notifications when an administrator activates a pending job, excluding banned accounts and non-worker roles.
- [x] Closed the remaining job read-side ban paths: banned accounts are rejected before job browsing, job details, category listings, and proof-attachment reads, in addition to the existing marketplace mutation and active-job guards.
- [x] Bound poster bid acceptance to the job route resource, preventing a valid bid from one job being accepted through another job's endpoint URL.
- [x] Made poster revision requests conditionally claim `pending_review` submissions inside the write transaction, preventing a stale revision request from overwriting a concurrent approval or payment release.
- [x] Added disposable admin video-ad listing and delete lifecycle coverage alongside the existing status-only update and rewarded-view checks.
- [x] Added disposable admin dispute flag-and-resolve coverage, verifying that cancellation closes the disputed job and refunds only its held assignment escrow.
- [x] Synchronized the horizontal admin navigation with the Sidebar and MobileNav so Job Post, Admin Job Post, and Active Job are available from every admin navigation surface.
- [x] Restored frontend API wrappers for the registered workflow-job, worker-application, deadline-extension, and admin-application-approval endpoints, with disposable controller coverage for successful creation, application, assignment, escrow hold, and deadline update.

### Validation notes

- Passed: changed PHP lint, deploy-script shell syntax, frontend build, JavaScript syntax checks, `JobWorkflowUnitTest`, full `JobMarketplaceTest` reflection run including starter-category assertions, focused marketplace checks, worker/poster/admin role-boundary checks, real multipart upload acceptance and MIME-spoof rejection, banned-session middleware, ban/video/admin-job/fraud/assignment route checks, isolated new-migration checks, fresh migration plus idempotent rerun with eight starter categories and reconciled category fields, category/subcategory admin CRUD, admin settings update/cache invalidation, provider-neutral ad configuration validation and master-switch behavior including legacy provider-rotation and standard reward gates, atomic mixed-settings rollback behavior, local `php nemesis schedule:run` execution, admin job create/detail simulation, video start/claim/duplicate-claim/total-limit simulation, fraud-policy/false-positive/path-traversal submission simulation, assignment cancellation/reassignment/release accounting simulation, poster-side multi-worker acceptance and mixed revision/payment-state regression coverage, real poster/worker controller acceptance-submission-revision-resubmission-release plus worker-cancellation/admin-reassignment coverage, one-way admin withdrawal/rejection-refund coverage, notification delivery/read-state/email-routing/rejection-path checks, transactional deposit/withdrawal/duplicate-request checks, sequential two-process marketplace/financial/fraud race checks, `tests/JobMarketplaceIntegrationTest.php`, `tests/JobMarketplaceConcurrencyTest.php`, and `tests/JobMarketplaceFinancialConcurrencyTest.php`.
- The complete `JobMarketplaceTest` reflection run now passes, including the `Logo Design` starter-category assertion after the fresh-install seed was added.
- The complete migration runner now passes on fresh disposable SQLite databases, including the new migrations; a second run reports no pending migrations. The category reconciliation migration was also exercised against pre-existing tables without `min_cost`. The legacy queue-as-`jobs` upgrade path was also verified separately and preserves the queue schema as `queue_jobs` while creating marketplace `jobs`.
- The ad-control migration was applied on a fresh disposable SQLite database and a second run reported no pending migrations; integration checks verified each switch's disabled behavior and restored the disposable settings afterward.
- The fraud scenario stored a flagged short-description submission with IP/fingerprint metadata; the accounting scenario verified one cancellation refund and one assignment payment release with the expected assignment/payment states.
- The updated worker/poster/admin boundary checks passed through both direct service calls and direct controller calls in `tests/JobMarketplaceIntegrationTest.php`; fresh disposable migrations also completed before that integration run.
- Fresh disposable migration runs followed by the marketplace integration and capacity/submission/fraud race suites passed after the conditional assignment-payment moderation guard was added.
- Direct worker calls to every admin job/video controller action now return 403 in the disposable integration suite, while authenticated admin job detail/edit/delete flows continue to pass.
- Direct worker calls to every admin settings action now return 403, and authenticated category/subcategory CRUD, report/CSV, and provider-neutral settings checks continue to pass.
- The disposable integration suite now also verifies anonymous API requests are rejected by the authentication middleware before controller dispatch.
- Direct worker calls to every main admin-controller action now return 403; authenticated admin moderation, withdrawal, fraud, ban, and provider flows continue to pass.
- Direct worker calls to payment, daily-counter, social-link, notice, and banner-upload admin actions now return 403; authenticated admin payment-list and counter-reset calls continue to pass.
- Direct worker poster-endpoint checks and cross-owner poster bid checks now pass alongside the existing acceptance, revision, release, cancellation, and rollback flows.
- Direct banned-worker controller calls to active jobs and submission routes now return 403 before any marketplace mutation.
- Direct banned-worker calls to all video-ad actions and the standard reward endpoint now return 403 before ad reservation, streaming, or balance work.
- Direct banned-worker calls to legacy ad configuration and provider rotation now return 403 before provider selection or ad metadata is exposed.
- Direct banned-worker calls to all legacy web-task and Telegram-task actions now return 403 before task lookup, completion, or reward work.
- Direct banned-worker calls to daily-bonus claim and status now return 403 before reward mutation or eligibility disclosure.
- Direct banned-worker calls to job browsing, job details, categories, and proof-attachment reads now return 403 before marketplace data or proof files are exposed.
- Poster lifecycle integration now verifies that cross-job bid acceptance is rejected before the existing successful acceptance flow.
- Admin video-ad integration now verifies that a seeded campaign is listed and can be deleted through the protected controller path.
- Admin dispute integration now verifies the protected flag/resolve controller flow and per-assignment escrow rollback.
- Frontend navigation regression coverage now verifies the three required admin job destinations in the horizontal navigation as well as the existing sidebar/mobile routes.
- Submission moderation now uses conditional revision claiming alongside conditional approval/payment claiming, so concurrent decisions cannot revert a finalized submission.
- The financial concurrency suite now verifies that simultaneous daily-bonus claims produce one credit and one audit row, alongside the existing withdrawal, deposit-approval, and video-claim race checks.
- The financial concurrency suite now also verifies one-time web-task and Telegram-task reward credits under two-process races.
- The financial concurrency suite now verifies the web-task daily limit rejects an additional eligible completion after the allowed claim.
- The financial concurrency suite now verifies concurrent legacy provider rewards preserve two credits, two audit rows, and both daily-ad counter increments.
- The disposable integration suite now verifies direct banned payment submission and approval paths return failure without changing the pending deposit state.
- The two-process marketplace race suite now verifies that concurrent poster revision and administrator approval produce exactly one winning moderation decision, preserving either released payment or held escrow with assignment revision.
- The fraud-ban integration path now verifies a previously submitted assignment cannot be approved for payment after the worker is banned.
- Submission moderation integration now verifies a reviewed assignment rejects a conflicting second moderation decision after payment release.
- Notification integration coverage now verifies that pending-job activation reaches eligible workers with an actionable job link.
- Admin submission-detail and proof-list payload checks now verify worker contact data and submission timestamps, and both admin proof views render those fields alongside the existing moderation controls.
- Admin job-detail integration and frontend checks now verify the complete worker/progress amount contract and the rendered proof/date summary fields.
- Admin dashboard regression coverage now verifies completed-video, remaining-payment, and flagged-submission metric keys are present.
- Admin dashboard regression coverage now verifies unified total/completed ad-view metric keys alongside the video-specific counters.
- Admin dashboard regression coverage now verifies active-user, eligible-reward, and user-ad-reward metric keys are present.
- User ad-history and Earn-page checks now verify today/total ad earnings and view-summary metadata while preserving the existing video-ad flow if history loading is unavailable.
- Frontend route/navigation checks now cover the admin pending/active job aliases and mobile admin menu entries.
- Frontend route/navigation checks now cover the administrator Advertisement hub and its existing ad-management destinations.
- Frontend route-loader checks now cover authentication for dynamic worker job details and administrator authorization for dynamic admin job details.
- Frontend API contract checks now cover the legacy workflow-job, worker-application, deadline-extension, and admin-application-approval endpoints that remain registered alongside the current bid workflow.
- Disposable marketplace integration now exercises successful workflow-job creation, poster deadline extension, worker application, and administrator application approval through their controller endpoints.
- Worker frontend checks now cover the Active Job details link into the full job/proof-requirements page.
- Worker frontend checks now cover the Active Jobs summary, available-slot count, pay/deadline metadata, and details link.
- Worker job-detail checks now cover assignment-specific status, current-worker submission data, screenshot proof, revision feedback, and the Submit Work flow; JavaScript syntax/build validation passed.
- Disposable marketplace integration now verifies that two workers viewing the same multi-worker job receive independent assignment status and submission payloads.
- Disposable marketplace integration now exercises the successful poster controller create/list/cancel lifecycle using the legacy budget input shape.
- The disposable integration suite now covers status-only admin video-ad pause/reactivate updates. Data-backed browser runs verified worker video watch/claim on a final lifetime slot, the resulting balance refresh, admin video-ad listing and pause/reactivate UI actions, screenshot proof upload, admin submission review with escrow release, assignment completion/worker credit, and admin ban/unban UI actions; all temporary fixtures were removed afterward.
- Local HTTP/DOM smoke verification passed: the PHP server returned `/` and `/api/health` with HTTP 200, served the compiled JavaScript with `application/javascript`, and headless Chrome rendered the JMJob login shell. Authenticated route smoke also passed with disposable seeded accounts for worker dashboard/jobs/active jobs/earnings/post-job/notifications/settings and admin overview/jobs/settings; the available Playwright/Chrome fallback was used because the prescribed `agent-browser` executable is not installed. A data-backed multipart `/api/jobs/{id}/submit` plus admin review/payment flow passed against a freshly migrated disposable database, and an 11.01 MiB multipart proof returned HTTP 422 without persisting a submission or file; the PHP transport limits must be configured above the application’s 10 MiB validator in production. The later browser run also passed worker video watch/claim, admin video-ad pause/reactivate, screenshot proof upload/review/payment release, assignment completion, and user ban/unban. The local `public/` docroot also does not contain the flattened production-root favicon asset; the deployment mirror supplies `favicon.jpeg` at the hosting root.
- Production checkpoint: the user's FTP deployment reached the migration step and uploaded the application; the corrected no-token runner and MariaDB-compatible migrations were then restored to `/public_html`, and all eight pending migrations completed successfully on 2026-09-19. The live homepage and `/api/health` both returned HTTP 200 afterward. A pre-deploy database backup, live marketplace reads/writes, commit, and push were not performed.

### Still remaining

The remaining work is now:

1. Finish the production rollout safely: take the required database backup, confirm queue/jobs repair and migration state from the hosting control plane, and verify live marketplace reads/writes during a controlled rollout. The automatic migration call and pending migrations have completed successfully.
2. Add broader end-to-end poster/worker edit/delete and rollback tests; controller acceptance/submission/revision/resubmission/release/cancellation/reassignment, multi-process capacity/submission races, poster-side multi-worker acceptance, admin edit/detail/delete guards, assignment submission claiming, cancellation/reassignment rollback, and repeated/idempotent payment actions now have disposable-database coverage.
3. Complete fraud policy rollout: review and tune the documented baseline thresholds against production behavior. Fraud-specific concurrent/duplicate-content coverage, the general concurrent assignment-submission race, and the initial moderator procedure are covered locally.
4. Validate dashboard/reporting semantics against production data and confirm the new assignment/payment and submission-risk CSV/report drill-downs against live data.
5. Verify the now-wired lifecycle notifications against the real scheduler command and intentionally configured external email delivery. The real `php nemesis schedule:run` command and the local scheduler registration now run successfully; scheduler-safe repeat behavior, database delivery/read state, fake mail routing, and rejection-path assertions are covered locally. A production SMTP delivery test remains intentionally external.
6. Add broader integration/security tests for every new endpoint: permissions, banned users, transaction rollback, fraud review, withdrawals, and multi-worker accounting. Worker/poster/admin role boundaries including anonymous/worker/admin middleware checks, the upload wrapper's real multipart MIME checks, the real submission/review/payment endpoint path, application-level multipart size rejection, category/subcategory CRUD, path traversal, concurrent capacity/submission, one-deposit-approval, one-pending-withdrawal, idempotent video-claim protections, advertisement-control off-state behavior, and frontend wrappers for the remaining workflow/application/deadline/admin-approval endpoints now have focused coverage; full endpoint/browser coverage and production PHP upload-limit verification remain.
7. Select the approved production ad-network/provider and implement its website/Android client adapters against the new provider-neutral configuration contract; validate publisher/ad-unit settings with the target clients and document consent, placement, reward, and compliance requirements. The backend deliberately does not claim network approval or invent a provider SDK.
8. Completed locally: data-backed browser verification now covers proof upload/review, assignment payment release/completion, user ban/unban, worker video watch/claim, and admin video-ad listing plus pause/reactivate after disposable migrations. Production/live validation and broader endpoint coverage remain tracked in items 1, 4, 5, and 6.
