# Manual Test Plan — Phase 3 (Jobs Marketplace)

> **Use this checklist after each deploy.** Tests assume the Phase 1+2 deploy is already done.
> Always start with a **hard refresh** (Ctrl+Shift+R).

---

## 0. Pre-flight

| # | Check | Expected | ✓/✗ |
|---|-------|----------|-----|
| 0.1 | After deploy, log table in DB has rows for: 2026_09_03_000001 (payment), 000002 (users alter), 000003 (settings), 000004 (categories), 000005-000009 (jobs/bids/submissions/transactions/reviews) | Migrations log shows all applied | ☐ |
| 0.2 | `curl https://jmjob.xyz/api/categories` (with a valid token) | Returns 8 seeded categories in `data` | ☐ |
| 0.3 | Admin user can sign in, regular user can sign in | Both work | ☐ |
| 0.4 | Sidebar shows new entries: **Browse Jobs**, **My Bids**, **Active Jobs** (plus admin **Categories**, **Settings**) | All present | ☐ |
| 0.5 | Mobile horizontal nav has all the same links | All present | ☐ |

---

## 1. Admin — Categories CRUD

> Sign in as admin first. The Categories page is at `#/admin/categories`.

| # | Test | Steps | Expected | ✓/✗ |
|---|------|-------|----------|-----|
| 1.1 | Page loads | Navigate to `#/admin/categories` | Page title "Categories" + the list of 8 seeded categories | ☐ |
| 1.2 | Each row shows icon + name + slug + description + Enable/Disable + Delete buttons | Inspect a row | All visible | ☐ |
| 1.3 | Create new category | Fill form: name=`SEO Writing`, slug=`seo-writing`, icon=`bi-search`, display_order=99, active ✓ → Create | Toast "Category created", new row appears at the top of the list | ☐ |
| 1.4 | Duplicate slug error | Try to create another with the same `seo-writing` slug | Toast "A category with that slug already exists." | ☐ |
| 1.5 | Disable a category | Click Disable on the new SEO Writing row | Row gets "INACTIVE" badge; the disable button label changes to "Enable" | ☐ |
| 1.6 | Re-enable | Click Enable | Badge gone | ☐ |
| 1.7 | Delete (no jobs) | Delete a brand-new category (no jobs attached) | Toast "Category deleted." Row disappears | ☐ |
| 1.8 | Delete (has jobs) | Try to delete "Logo Design" after a job is posted there (in section 3) | Toast "Category has N job(s) attached; deactivated instead of deleted." Row stays but is now INACTIVE | ☐ |
| 1.9 | Non-admin blocked | Log out, log in as regular user, go to `#/admin/categories` | "403 Admin only" | ☐ |

---

## 2. Admin — Platform Settings

| # | Test | Steps | Expected | ✓/✗ |
|---|------|-------|----------|-----|
| 2.1 | Page loads | `#/admin/settings` | Page title + grouped cards: Commission / Currency / Escrow / Withdrawal / Jobs | ☐ |
| 2.2 | Commission rate | Find `commission_rate` row (decimal, 0.10) | Input shows `0.1` | ☐ |
| 2.3 | Change commission | Set to `0.15`, click **Save All Changes** | Toast "Settings saved." Page re-renders showing 0.15 | ☐ |
| 2.4 | Change currency code | Set `default_currency` to `USD`, `currency_symbol` to `$`, save | Toast "Settings saved." | ☐ |
| 2.5 | Escrow mode | Set `escrow_mode` to `flat_percent`, `escrow_percent` to `50`, save | Toast "Settings saved." | ☐ |
| 2.6 | Min/max job budget | Set `min_job_budget` to `200`, save | Toast "Settings saved." | ☐ |
| 2.7 | Boolean setting | Set `escrow_mode` is a string so it has no boolean — try a key with a boolean type (none in seeds) — skip if no boolean key exists | n/a | ☐ |
| 2.8 | Restore defaults | Reset to 0.10 / BDT / full_bid for the next sections | Toast "Settings saved." | ☐ |
| 2.9 | Non-admin blocked | Log out, log in as regular user, go to `#/admin/settings` | "403 Admin only" | ☐ |

---

## 3. Worker — Browse Jobs (`#/jobs/available`)

> Sign in as a **regular worker user**. You'll need wallet balance later (section 5) so deposit first if not already.

| # | Test | Steps | Expected | ✓/✗ |
|---|------|-------|----------|-----|
| 3.1 | Page loads | `#/jobs/available` | Page title "Browse Jobs" + search box + category dropdown + grid | ☐ |
| 3.2 | Default empty | No jobs posted yet | "No jobs match your filters. Try clearing them." | ☐ |
| 3.3 | Seed data | After step 4 (poster posts jobs), refresh | Jobs appear in grid with category icon, title, description snippet, budget, bid count | ☐ |
| 3.4 | Category filter | Select "Logo Design" from dropdown → Apply | Grid shows only Logo Design jobs | ☐ |
| 3.5 | Search filter | Type "logo" in search → Enter | Grid shows matching jobs only | ☐ |
| 3.6 | Clear filters | Clear search + set category to "All" → Apply | All jobs return | ☐ |
| 3.7 | Card click | Click any job card | Navigates to `#/jobs/{id}` | ☐ |
| 3.8 | Featured badge | Some jobs marked `is_featured=1` (admin can flip in DB) | Show "Featured" badge on the card | ☐ |

---

## 4. Worker — Job Detail + Bidding (`#/jobs/{id}`)

| # | Test | Steps | Expected | ✓/✗ |
|---|------|-------|----------|-----|
| 4.1 | Open a job | Click any card from #/jobs/available | Job title, description, requirements, budget, bid count, view count, "Bidding closes in Nh" timer | ☐ |
| 4.2 | View count | Refresh the page | `view_count` increments by 1 | ☐ |
| 4.3 | Status badge | Inspect top-right of the card | `OPEN` (or `IN_REVIEW`) badge | ☐ |
| 4.4 | Bid form (no existing bid) | Scroll to "Place a Bid" card | Form with amount, delivery_days (7), proposal (textarea) | ☐ |
| 4.5 | Place a bid | Amount=200, days=5, proposal="I'll do this in 5 days" → Submit | Toast "Bid placed!" — page reloads showing "Your Bid" card with status PENDING | ☐ |
| 4.6 | Duplicate bid | Try to bid again | "You have already bid on this job." | ☐ |
| 4.7 | Withdraw | Click "Withdraw bid" → confirm | Toast "Bid withdrawn." — bid form returns | ☐ |
| 4.8 | Re-bid after withdraw | Bid again, this time with a different amount (e.g. 180) | Bid placed successfully | ☐ |
| 4.9 | Other bids visible | Scroll to "Other Bids" card | Lists other workers' bids with their amount, days, and truncated proposal | ☐ |
| 4.10 | Closed bidding | Have admin/manually close bidding (set bidding_closes_at to past in DB), refresh | "Bidding is closed for this job." | ☐ |

---

## 5. Worker — My Bids (`#/worker/bids`)

| # | Test | Steps | Expected | ✓/✗ |
|---|------|-------|----------|-----|
| 5.1 | Page loads | `#/worker/bids` | Title "My Bids" + list of bid rows | ☐ |
| 5.2 | Each row | Shows job title, amount, days, date, status badge | All visible | ☐ |
| 5.3 | Status PENDING | The bid from step 4.5 | Badge "PENDING" | ☐ |
| 5.4 | Click a row | Click the bid row | Navigates to `#/jobs/{id}` | ☐ |
| 5.5 | Empty state | Use a fresh account with no bids | "You haven't placed any bids yet. Browse jobs" | ☐ |

---

## 6. Worker — Active Jobs + Submit Work (`#/worker/active-jobs`)

> First, the **poster** must accept your bid (section 7) so you become the assigned worker.

| # | Test | Steps | Expected | ✓/✗ |
|---|------|-------|----------|-----|
| 6.1 | Page empty | Before any job is assigned to you | "No active jobs." | ☐ |
| 6.2 | Job assigned | After poster accepts your bid, refresh | Card appears: job title, budget, status `ASSIGNED`, submit form | ☐ |
| 6.3 | Submit work (first time) | Description="Here's the design: https://example.com/file.zip" → Submit | Toast "Work submitted!" — card now shows submission with status `PENDING_REVIEW` | ☐ |
| 6.4 | Job status updated | Go back to `#/jobs/{id}` | Job status badge now says `SUBMITTED` | ☐ |
| 6.5 | Poster requests revision | As poster, release payment in section 7 → use Reject flow (or have admin change job to revision) — refresh active-jobs page | Card now shows existing submission status `REVISION` with prompt to resubmit, new form is shown | ☐ |
| 6.6 | Resubmit | Fill new description → Submit | New submission created, card shows it | ☐ |
| 6.7 | After release | After poster releases payment, refresh | Existing submission shows `APPROVED`, job done | ☐ |

---

## 7. Poster — Post a Job, Accept Bid, Release Payment, Cancel

> The poster flow is the biggest one. You'll need to deposit funds first (from Phase 2's `#/deposit`) so the poster has wallet_balance to put in escrow.

> **Need a poster-side UI?** Phase 3's deploy includes the **API endpoints** and the **backend service** (JobService). The frontend poster pages (`#/poster/post-job`, `#/poster/jobs`, `#/poster/jobs/{id}/bids`) are **not yet built** in this phase — they will come in Phase 4. For now, the poster side is exercised via the **API** (curl or Postman) and verified via the worker's views.

| # | Test | Steps | Expected | ✓/✗ |
|---|------|-------|----------|-----|
| 7.1 | Fund poster wallet | As poster user, go to `#/deposit`, submit a TRXID, admin approves — check `users.wallet_balance` (or topbar) shows the new balance | Balance credited | ☐ |
| 7.2 | Stats endpoint | `GET /api/poster/stats` with poster's token | Returns `{counts: {total: 0, …}, wallet_balance, frozen_balance, total_spent}` | ☐ |
| 7.3 | Post a job | `POST /api/poster/jobs` with `{category_id, title, description, requirements, budget: 1000, bidding_window_hours: 72}` | Returns success + job object with `status: "open"`, `slug`, `bidding_closes_at` | ☐ |
| 7.4 | Job visible to workers | As worker, `#/jobs/available` | New job appears in the grid | ☐ |
| 7.5 | View bids | `GET /api/poster/jobs/{id}/bids` | Returns job + bids + submissions arrays | ☐ |
| 7.6 | Accept a bid | `POST /api/poster/jobs/{id}/accept-bid` with `{bid_id: <your_worker's_bid_id>}` | Success. Poster's `wallet_balance` decreases by 1000, `frozen_balance` increases by 1000, job.status → `assigned` | ☐ |
| 7.7 | Other bids auto-rejected | As worker, view the same job | Your bid shows `ACCEPTED`, the other worker's bid shows `REJECTED` | ☐ |
| 7.8 | Worker submits work | As worker, submit work via UI (section 6.3) | Worker sees `PENDING_REVIEW`; poster endpoint shows the submission | ☐ |
| 7.9 | Release payment | `POST /api/poster/jobs/{id}/release` with optional `{submission_id}` | Success. Worker balance increases by `bid_amount - commission`, lifetime_earned up, total_posted_earned up. Poster's `frozen_balance` goes to 0. Job.status → `completed`. A `transactions` row is logged for the release + commission | ☐ |
| 7.10 | Verify in admin | As admin, `#/admin/transactions` (when added) or query `SELECT * FROM transactions WHERE job_id = X` | See `escrow_release` (worker gets 900), `commission` (platform gets 100), and possibly `refund` if escrow_mode was full_bid and bid exceeded commission | ☐ |
| 7.11 | Insufficient balance | Post another job (budget 1000), fund wallet to 500 only, try to accept a bid | Toast "Insufficient wallet balance. Available: 500.00 BDT, required: 1000.00 BDT." | ☐ |
| 7.12 | Cancel a job | `POST /api/poster/jobs/{id}/cancel` with optional reason | Success. Frozen balance refunded to wallet_balance. Job status → `cancelled`. Any pending bids → `rejected` | ☐ |

---

## 8. Cross-cutting

| # | Test | Steps | Expected | ✓/✗ |
|---|------|-------|----------|-----|
| 8.1 | Mobile browse | Resize <768px, go to `#/jobs/available` | Cards stack into 1 column, search + category filter work | ☐ |
| 8.2 | Mobile active jobs | On mobile, `#/worker/active-jobs` | Submit form is full-width, fits | ☐ |
| 8.3 | Dark mode | Toggle dark, go to `#/jobs/available` | Cards readable, badges visible | ☐ |
| 8.4 | Theme color | Switch to Emerald, navigate jobs/active | Primary color (green) used for bid buttons | ☐ |
| 8.5 | Empty worker pages | Sign up a brand-new user, go to `#/worker/bids` and `#/worker/active-jobs` | Both show empty-state copy with a "Browse jobs" link | ☐ |
| 8.6 | Back navigation | From `#/jobs/{id}` click "Back to jobs" | Returns to `#/jobs/available` with the same filter state | ☐ |
| 8.7 | Direct URL | Paste `#/jobs/123` for a non-existent job | "Failed to load: Job not found." | ☐ |
| 8.8 | Logout | Log out while on `#/worker/active-jobs` | Redirect to `#/login` | ☐ |

---

## 9. Edge cases & error paths

| # | Test | Steps | Expected | ✓/✗ |
|---|------|-------|----------|-----|
| 9.1 | API: missing auth | `curl /api/jobs` without token | 401 | ☐ |
| 9.2 | API: bid on own job | Poster posts a job, then tries `POST /api/jobs/{id}/bid` as the poster | "Only the poster can…/not open" (or similar — the bid logic should reject this; if you see it succeed, file a bug) | ☐ |
| 9.3 | API: invalid category | `POST /api/poster/jobs` with `category_id: 99999` | "Invalid or inactive category." | ☐ |
| 9.4 | API: budget below min | Set min_job_budget=500 in admin settings, post job with budget=100 | "Budget must be between 500 and 50000." | ☐ |
| 9.5 | API: budget above max | Post job with budget=99999 | "Budget must be between 100 and 50000." | ☐ |
| 9.6 | API: empty title | Post job with title="" | "Title is required (1-160 chars)." | ☐ |
| 9.7 | API: empty description | Post job with description="" | "Description is required." | ☐ |
| 9.8 | API: bid on closed job | Admin cancels a job, then a worker tries to bid | "Job is not open for bids." | ☐ |
| 9.9 | API: bid with 0 amount | `POST /api/jobs/{id}/bid` with `amount: 0` | "Bid amount must be positive." | ☐ |
| 9.10 | API: empty proposal | `POST /api/jobs/{id}/bid` with `proposal: ""` | "Proposal is required." | ☐ |
| 9.11 | API: bid after window | Have admin/manually set `bidding_closes_at` to past, then bid | "Bidding window has closed." | ☐ |
| 9.12 | API: release on completed job | Release payment on an already-completed job | "No work to release." | ☐ |
| 9.13 | API: accept already-accepted bid | Try to accept a bid that's already accepted | "Bid is not pending." | ☐ |
| 9.14 | DB integrity | Try to insert two bids with the same (job_id, worker_id) directly via SQL | UNIQUE constraint rejects | ☐ |

---

## 10. Deploy Steps

```bash
# 1. Build
cd earnap-client && npm run build && cd ..

# 2. Deploy
./deploy.sh

# 3. Run migrations (deploy.sh does this too, but if you need to retry)
curl -X POST https://jmjob.xyz/migration_runner.php

# 4. Verify (in browser)
# - Hard refresh, go to /admin/settings, see the 9 default settings
# - Go to /admin/categories, see 8 seed categories
# - Switch to a worker account, go to /jobs/available (empty at first)
# - Test the API endpoints with the worker's auth token
```

---

## 11. Quick Triage

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| `/api/categories` returns empty | Migration 000004 didn't apply | Re-run migration runner |
| `users.role` column missing | Migration 000002 didn't apply | Re-run migration runner |
| 500 on bid placement | JobService not deployed or autoload stale | Verify `app/Services/JobService.php` is on server, re-upload vendor autoload files if needed |
| Categories page shows 0 | `/api/admin/categories` returns 403 | Ensure logged in as admin |
| "Settings saved" but no effect | Cache: SettingService has in-memory cache per request, but each new request is fresh | Should work; if not, run `composer dump-autoload` |
| Bid placed but not in worker's "My Bids" | Cache or 500 in `workerBids` endpoint | Check browser console; verify route registered |
| `transactions` table empty after release | Migration 000008 not applied | Re-run migration runner |
| Job accept fails with "Insufficient balance" but wallet shows funds | UI cache: balance not refreshed after deposit | Click refresh or sign out/in |
| Admin "Categories" link missing in sidebar | Frontend bundle stale | Hard refresh, verify `Sidebar.js` was rebuilt |

---

After completing this checklist, mark Phase 3 as done in [PLAN.md](PLAN.md) and proceed to **Phase 4** (poster-side frontend pages: post-job form, my-jobs, accept-bid UI, release-payment UI).
