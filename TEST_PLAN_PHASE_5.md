# JMJob Phase 5 — Admin Panel Test Plan

Updated: September 4, 2026

## Automated checks

- [x] PHP lint for `AdminController`, `AdminSettingsController`, and `JobService`
- [x] JavaScript syntax checks for all Phase 5 views and route files
- [x] Admin route registration check
- [x] Phase 2 and Phase 3 unit suites
- [x] Frontend production build
- [x] Live unauthenticated protection checks for admin jobs, role, ledger, and reports APIs

## Authenticated manual checks

Use an administrator account on `https://jmjob.xyz`.

- [ ] Open `#/admin` and confirm revenue, commission, job, user, payment, escrow, and legacy operation cards load.
- [ ] Open the Users tab; confirm worker, poster, and admin roles are shown.
- [ ] Change a non-admin user to poster, then back to worker; confirm the badge and role persist after refresh.
- [ ] Confirm the current administrator’s role selector is disabled and cannot self-demote.
- [ ] Open `#/admin/jobs`; filter by each status and confirm job, poster, worker, budget, bid, and view fields render.
- [ ] Flag an active job for dispute review; confirm it appears under the disputed filter.
- [ ] Resolve a disputed job with cancellation and verify only that job’s escrow is refunded.
- [ ] Resolve a submitted/disputed job with payment release and verify the worker credit and commission ledger entries.
- [ ] Open `#/admin/transactions`; filter by deposit, commission, escrow, refund, and adjustment types.
- [ ] Open `#/admin/reports`; confirm transaction totals and job-status totals match the ledger and jobs list.
- [ ] Confirm all new admin pages redirect unauthenticated visitors to `#/login`.

## Deployment evidence

- `./deploy.sh` completed successfully.
- Remote migration runner reported: `No new migrations to apply.`
- Live homepage returned HTTP 200.
- Live admin endpoints returned HTTP 401 without a bearer token.
- Live JavaScript/CSS contained the Phase 5 dashboard, role, job, ledger, and report markers.
