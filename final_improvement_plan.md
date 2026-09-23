# JMJob Final Improvement Plan

Date: 2026-09-24  
Source: `Transcribed.md`, `upgrade_plan.txt`, and the current JMJob checkout.

## Executive conclusion

The client’s main JMJob complaint is valid, but it is caused by two different issues:

1. The current role predicates block normal worker accounts. `User::isPoster()` returns true for every non-admin user, and `User::isWorker()` immediately rejects every account that is a poster. As a result, worker actions such as applying, opening active assignments, and submitting work can return `Worker access required`.
2. The product flow in the client feedback and `upgrade_plan.txt` is “Admin activates → the job appears in the user Active Job area → the worker opens the requirements and submits work.” The current implementation is a marketplace flow: Admin activates a job as `open`, workers see it in `Browse Jobs`, a bid/application is required, and only an assigned worker can see `Submit Work`.

The progress counters are substantially present in the current source, and the advertisement controls plus a first-party rewarded-video system are also present. Those areas still need semantic cleanup, production configuration, migration/deployment verification, and end-to-end testing before they should be reported as complete.

## QA feedback mapped to the current implementation

| Client feedback | Current implementation evidence | Status | Final decision/work |
|---|---|---|---|
| After a job is activated, the poster and admin should see how many workers are working, completed, pending, rejected, and remaining. | Poster API returns worker summaries in `app/Http/Controllers/Api/PosterController.php:217-312`; poster list renders active workers and remaining slots in `earnap-client/src/views/PosterJobsPage.js:62-70`; admin API calculates progress in `app/Http/Controllers/Api/AdminController.php:568-729`; admin list renders worker/progress counts in `earnap-client/src/views/AdminJobsPage.js:121-129`; admin detail renders the full summary in `earnap-client/src/views/AdminJobDetailPage.js:27-46`. | Implemented in source, but only partial as a client-visible delivery. | Repair count semantics, verify the deployed API/frontend versions, and add a real two-account acceptance test. Define “working”, “pending review”, “revision”, “completed”, “rejected”, and “unassigned” separately. |
| Admin activation should make the job visible to another user. | Admin approval changes the job to `open` in `app/Services/JobService.php:143-188`; open jobs are queried by `app/Models/Job.php:116-134` and shown by `earnap-client/src/views/JobsAvailablePage.js:142-199`. However, the Active Jobs endpoint only returns assigned jobs in `app/Models/Job.php:147-190` and `app/Http/Controllers/Api/JobController.php:181-187`. | Partial and currently blocked by role/workflow behavior. | Align the UI and API with the agreed flow. Recommended: expose activated/claimable jobs in the user’s Active Job area, then atomically create an assignment when the worker accepts. If bidding is retained, label the destination `Browse Jobs`, keep the existing bid/approval flow, and do not promise that activation alone creates an active assignment. |
| The user should see the job title, requirements, proof instructions, and a way to submit work. | `JobDetailPage` renders title, description, requirements, proof requirements, screenshot input, written report, and `Submit Work` in `earnap-client/src/views/JobDetailPage.js:46-136`. The submission form is shown only when the current user already has an assignment. | Implemented only after assignment; missing for the client’s reported activation-to-submit expectation. | Make the accepted workflow explicit. Do not allow submission without a valid assignment. Add the missing claim/assignment step, or change the client acceptance criteria to include worker application and admin/poster assignment before submission appears. |
| The client reports that an activated job still does not appear in the other account. | `Job::availablePage()` correctly filters `open` and `in_review`; the API route is registered at `routes/api.php:82-96`. But `User::isWorker()` is unreachable for non-admin users because `isPoster()` returns true for all non-admin accounts in `app/Models/User.php:55-78`. Worker endpoints also enforce that predicate in `app/Http/Controllers/Api/JobController.php:562-585`. | Critical defect. | Fix the role capability contract first, then verify with separate poster, worker, and admin accounts. Existing database users must be normalized to the selected policy. |
| Advertisement should have on/off controls and publisher/ad IDs. | Settings labels and controls exist in `earnap-client/src/views/AdminSettingsPage.js:7-22,288-334`; the settings API persists values in `app/Http/Controllers/Api/AdminSettingsController.php:27-111`; migrations seed the controls and IDs in `database/migrations/2026_09_19_000004_create_video_ads_and_settings.php:87-114`; public config is exposed by `app/Services/AdConfigurationService.php:73-97`. | Implemented in source; operationally unverified. | Run the production migration/status check, save real approved values through the admin UI, verify `/api/ads/config`, and confirm website/app consumers use the returned configuration. Keep account credentials out of Git, chat, and this plan. |
| The Advertisement area is empty and should provide the BII-style watch-video/earn flow. | Admin video-ad CRUD, pause/activate controls, and upload form exist in `earnap-client/src/views/AdminPage.js:392-455`; server-side start/stream/claim/reward flow exists in `app/Http/Controllers/Api/VideoAdController.php:22-371`; the user screen exists in `earnap-client/src/views/EarnPage.js:4-178`. | First-party uploaded-video flow implemented; the client’s requested link-based flow is missing. | Decide whether ads are uploaded videos or external links. Recommended: retain server-hosted uploads for rewarded ads; optionally add a separate allowlisted HTTPS `video_url` source for non-rewarded/external content. If external content is reward-bearing, document that a browser timer cannot prove genuine viewing and keep server-side limits/idempotent claims. |
| Someone should apply for the external ad account and complete account setup. | The code stores provider-neutral publisher/unit values, but no code can complete Google/provider approval on the client’s behalf. | External dependency, not a code task. | The account owner must complete the provider application and supply the approved publisher/unit IDs. Then configure and live-verify them. Never put credentials in the repository or the improvement plan. |
| Boloban Shop needs a GM Job banner, a cleaner header, grocery/fashion categories, icon tiles, and admin-controlled banners. | This is a separate product request; no Boloban Shop source was audited in this JMJob checkout. | Out of scope for JMJob. | Track as a separate Boloban Shop work package with the client’s screenshots, exact banner asset, category/subcategory list, and acceptance screenshots. Do not mix it into the JMJob release. |

## Recommended target workflow

This target follows the client’s feedback and the documented flow in `upgrade_plan.txt:3-38` and `upgrade_plan.txt:573-633`.

1. A poster/customer creates a job. It starts as `pending_approval`.
2. Admin reviews and activates it. The server changes it to `open`, records the admin action, and notifies eligible workers.
3. The worker account sees the activated job in the user-facing Active Job/Available Job area with title, subtitle, description, requirements, proof rules, pay, capacity, and deadline.
4. The worker accepts/claims the job, creating one assignment through an atomic server-side operation. If the marketplace intentionally keeps bidding, this step must instead be an explicit application/bid step and the UI must say that assignment is still pending.
5. Only the assigned worker sees the submission form. The form accepts the required written report and screenshot/proof fields.
6. The submission is `pending_review`. Admin and poster see the worker identity, proof, status, and audit information.
7. Approval releases payment exactly once, increments completed work, decrements remaining work, and updates the job status. Rejection/revision records a reason and allows a controlled resubmission.
8. All clients obtain fresh progress from the server after each mutation. If the client means live updates rather than refresh-time updates, add bounded polling or an approved push mechanism and define its interval.

## Implementation phases

### Phase 0 — Confirm product and data rules

- Confirm whether a regular user may both post and work, or whether accounts are strictly `worker` versus `poster`.
- Confirm whether activation alone assigns work, or whether the existing bid/application workflow remains mandatory.
- Confirm whether “Active Jobs” means activated/claimable jobs or already-assigned jobs. The current code uses the latter.
- Confirm whether rewarded advertisements must be uploaded to JMJob or may point to external URLs.
- Keep the current changes to `CHANGELOG.md`, `NEMESIS_KNOWN_GAPS.md`, and `Transcribed.md` untouched while implementing this scope.

### Phase 1 — Repair role and access behavior

Files to update:

- `app/Models/User.php`
- `app/Http/Controllers/Api/JobController.php`
- `app/Http/Controllers/Api/PosterController.php`
- `earnap-client/src/views/PostJobPage.js`
- `earnap-client/src/views/PosterDashboardPage.js`
- `earnap-client/src/views/PosterJobsPage.js`
- `earnap-client/src/views/PosterJobDetailPage.js`
- `earnap-client/src/views/PosterWalletPage.js`
- user/admin navigation and role-management UI as needed

Required changes:

- Replace the contradictory `isPoster()`/`isWorker()` predicates with one documented capability policy.
- At minimum, a user whose persisted role is `worker` must pass worker guards and a user whose role is `poster` must pass poster guards. If dual capability is intended, represent it deliberately rather than inferring poster capability from “not admin.”
- Remove frontend placeholder checks such as `user.is_admin || true` and the `!user.is_admin && false` conditions. The browser should match the backend role policy, while the backend remains authoritative.
- Normalize existing users after the policy is chosen; do not silently convert the admin account.
- Add tests for worker, poster, admin, banned worker, and banned poster access to every affected endpoint.

### Phase 2 — Make activation and worker visibility consistent

Files to update or extend:

- `routes/api.php`
- `app/Models/Job.php`
- `app/Http/Controllers/Api/JobController.php`
- `app/Services/JobService.php`
- `app/Models/JobAssignment.php`
- `earnap-client/src/views/JobsAvailablePage.js`
- `earnap-client/src/views/WorkerActiveJobsPage.js`
- `earnap-client/src/views/JobDetailPage.js`
- relevant notification code and tests

Recommended implementation:

- Add a clearly named worker endpoint for activated/claimable jobs, or change the existing Active Jobs endpoint only if its meaning is explicitly changed.
- Add a claim/accept action that creates a `job_assignments` row transactionally, checks capacity/deadline/status, prevents self-claim and duplicate assignment, and reserves any required payment exactly once.
- Return the same job detail contract to the worker after claim, including `subtitle`, customer requirements, normalized `proof_requirements`, assignment status, and the current submission.
- Keep `/jobs/{id}/submit` assignment-bound. A user must never be able to submit merely because a job is publicly open.
- Make the UI show a useful empty state: “No activated jobs available” versus “No assigned jobs.” This will make future QA reports distinguish visibility from assignment.
- Add a post-activation notification and verify that it is delivered to eligible workers without exposing private customer data.

### Phase 3 — Normalize progress and status reporting

Files to update or extend:

- `app/Http/Controllers/Api/PosterController.php`
- `app/Http/Controllers/Api/AdminController.php`
- `app/Http/Controllers/Api/AdminJobController.php`
- `earnap-client/src/views/PosterJobsPage.js`
- `earnap-client/src/views/PosterJobDetailPage.js`
- `earnap-client/src/views/AdminJobsPage.js`
- `earnap-client/src/views/AdminJobDetailPage.js`

Required output contract per job:

- total worker slots
- unassigned/remaining slots
- assigned/in-progress workers
- pending-review submissions
- revision/rejected workers
- completed workers
- cancelled/refunded assignments
- total worker amount, held amount, released amount, and remaining amount
- job status and deadline

The current implementation counts many non-completed assignments as `pending`. That is not precise enough for “who is working and who is not.” Use assignment status and latest submission status separately, and make the labels identical in poster and admin screens. Add a refresh button and, if the client expects live updates, bounded polling with a visible last-updated time.

### Phase 4 — Complete and verify Advertisement behavior

Files to update or extend:

- `earnap-client/src/views/AdminAdvertisementPage.js`
- `earnap-client/src/views/AdminPage.js`
- `earnap-client/src/views/AdminSettingsPage.js`
- `earnap-client/src/views/EarnPage.js`
- `app/Http/Controllers/Api/AdminVideoAdController.php`
- `app/Http/Controllers/Api/VideoAdController.php`
- `app/Services/AdConfigurationService.php`
- `database/migrations/2026_09_19_000004_create_video_ads_and_settings.php`

Required decisions and work:

- Keep the master switches separate: advertisement system, external network, first-party video ads, watch-and-earn, reward system, website ads, and app ads.
- Keep publisher IDs and ad-unit maps provider-neutral and validate them before persistence.
- Make the Advertisement landing page visibly link to settings, provider configuration, and video campaigns in the deployed build.
- If the client requires admin-entered links, add a safe `source_type`/`video_url` contract with HTTPS and provider allowlisting. Do not weaken the existing path-traversal, MIME, size, daily-limit, total-limit, frequency, or idempotent-claim protections.
- Remove or clearly label the current simulated/placeholder standard-ad fallback before production reward claims are enabled.
- Verify that an admin-created active ad appears in the worker’s Earn page, starts, streams/opens, reaches the required duration, and credits one reward only once.
- Complete provider approval outside the codebase, then configure IDs and verify the rendered website/app integration separately.

### Phase 5 — Separate Boloban Shop delivery

Do not modify JMJob for this request. Create a separate plan for:

- GM Job-sized rotating banner controlled from the admin panel
- removal of the thin blue download bar
- replacing the oversized empty registration/login/shop area with the rotating banner
- top-level `কাঁচাবাজার` and `ফ্যাশন` categories
- fashion subcategories supplied by the client
- category icon tiles under the banner
- category-specific product filtering
- grocery-only results in the grocery section
- admin-managed banner/category content

## Acceptance test matrix

### JMJob roles and job workflow

- Create one poster, one worker, one admin, and one banned worker test account.
- Confirm the poster can create a job and receives `pending_approval`.
- Confirm the admin can see it under Job Post, activate it, and receives `open` from the detail/list API.
- Confirm the worker can obtain the activated job from the agreed user-facing area without a 403 or stale empty list.
- Confirm the worker sees title, subtitle, description, requirements, proof rules, payment, available capacity, and deadline.
- Confirm the worker can claim/apply according to the chosen workflow and only the resulting assigned worker sees `Submit Work`.
- Submit written proof and required screenshot; confirm the multipart request is accepted and linked to the correct job, worker, and assignment.
- Confirm admin and poster see the submission, worker identity, timestamp, proof, and status.
- Approve once and verify one payment, one completed count increment, one remaining-count decrement, and an idempotent second approval.
- Reject/request revision with a required reason and confirm controlled resubmission behavior.
- Confirm a banned worker cannot claim, submit, or receive reward credit.
- Confirm a non-admin cannot access admin routes or another poster’s job details.

### Progress reporting

- Use a multi-worker job with at least one unassigned worker, one in-progress assignment, one pending review, one revision/rejected submission, and one completed assignment.
- Compare poster list/detail, admin list/detail, and database state.
- Refresh both panels after each state transition and verify the counters agree.
- If polling is implemented, verify that the counts update without a full page reload and stop polling when the page is left.

### Advertisement

- Verify migration status includes the video-ad/settings tables and all required settings.
- Toggle each ad switch off and on; verify the corresponding API behavior and user-facing empty/paused state.
- Save valid website/app publisher IDs and unit maps; verify `/api/ads/config` without exposing secrets.
- Reject malformed IDs, oversized placement maps, and invalid placement keys.
- Create/activate one video ad, watch it from a worker account, claim once, retry the claim, and verify only one credit.
- Verify pause, schedule, daily limit, lifetime limit, frequency limit, missing file, non-video file, and unauthorized access behavior.
- If URL ads are added, test only approved HTTPS providers and confirm reward behavior matches the documented trust model.

## Validation and release evidence

Before calling this complete:

1. Run PHP syntax checks on changed PHP files and the existing job unit/integration/concurrency coverage.
2. Build the frontend with `npm run build` from `earnap-client` and inspect the generated bundle for the changed routes and labels.
3. Run a real local two-account workflow against a fresh test database, not only static string tests. The existing `tests/unit/JobMarketplaceTest.php` explicitly notes that transactional job flows require a real database/manual flow.
4. Apply migrations in the target environment and run the migration status check.
5. Deploy only the scoped files, preserving the current unrelated worktree changes and excluding secrets.
6. Verify separately: local tests, deployment/FTP or CI result, provider/account configuration, and live browser/API behavior. A successful build or push alone does not prove that the client’s second account can see and submit the activated job.

## Definition of done

The JMJob portion is complete only when the client can perform the agreed activation-to-worker flow with two real non-admin accounts, the worker can see and submit the activated job, poster/admin progress numbers agree after every state transition, the role guards no longer block valid workers, and the advertisement settings/video flow are live-verified. External ad-network approval and Boloban Shop work remain separately tracked deliverables.
