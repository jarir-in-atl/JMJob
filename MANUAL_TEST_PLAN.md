# JMJob Manual Testing Plan

**Application:** JMJob job marketplace  
**Production URL:** https://jmjob.xyz  
**Scope:** Completed Phases 1–6  
**Use:** Run after every deployment and before approving a release.

> Use dedicated test accounts. Do not use real payment credentials or real withdrawal addresses. Run financial tests on staging where available; on production, use only approved reversible test data.

## 1. Test record

| Field | Value |
|---|---|
| Tester | |
| Test date/time | |
| Release/deploy reference | |
| Desktop browser/version | |
| Mobile device or viewport | |
| Result | Pass / Fail / Blocked |
| Defect references | |

## 2. Test accounts and data

For local or staging, run the idempotent demo seeder after migrations:

```bash
php nemesis db:seed DemoAccountsSeeder
```

The seeder creates or role-reconciles these accounts. The shared password is intentionally for demos only; never reuse it for a real account:

| Account | Login email | Password | Role | Purpose |
|---|---|---|---|---|
| Worker A | `worker@example.com` | `JMJobDemo!2026` | Worker | Browse, bid, submit work, receive payment |
| Worker B | `worker2@example.com` | `JMJobDemo!2026` | Worker | Competing bid and ownership checks |
| Poster A | `poster@example.com` | `JMJobDemo!2026` | Poster | Post and manage jobs |
| Poster B | `poster2@example.com` | `JMJobDemo!2026` | Poster | Cross-account ownership checks |
| Administrator | `admin-demo@example.com` | `JMJobDemo!2026` | Admin | Settings, payments, disputes, reports |

The existing `admin@example.com`, `alice@example.com`, `bob@example.com`, and `carol@example.com` accounts from `EarnAppSeeder` remain available for legacy earning/referral checks. `DemoAccountsSeeder` does not reset existing passwords or balances.

Prepare these test values:

- A unique job title, such as `Manual QA Job <date-time>`.
- An active category and a disabled category.
- A valid test budget within the configured minimum and maximum.
- A unique test TRXID only if the test environment allows payment submissions.
- A short work description and a safe external test link.

For each test, record the URL, account used, input, expected result, actual result, and screenshot or network response when the result is not obvious.

## 3. Pre-flight checks

Run these checks first after a hard refresh (`Ctrl+Shift+R`):

| ID | Action | Expected result | Result |
|---|---|---|---|
| PF-01 | Open `https://jmjob.xyz/` | JMJob loads without a blank page or PHP error | ☐ |
| PF-02 | Inspect browser console | No new red JavaScript errors | ☐ |
| PF-03 | Inspect Network | `app.js` and `app-v2.css` load successfully | ☐ |
| PF-04 | Open `/api/health` | JSON health response is returned | ☐ |
| PF-05 | Open a protected route while logged out | User is sent to `#/login` | ☐ |
| PF-06 | Log in as Worker A | Dashboard and authenticated navigation appear | ☐ |
| PF-07 | Log out and log in as Administrator | Admin navigation and `#/admin` are available | ☐ |
| PF-08 | Refresh while logged in | Session remains valid or redirects cleanly to login | ☐ |

## 4. Phase 1 — Layout, theme, and navigation

| ID | Action | Expected result | Result |
|---|---|---|---|
| P1-01 | Open `#/settings` and choose Default, Emerald, Amber, and Rose | Primary buttons, links, badges, and gradients update immediately | ☐ |
| P1-02 | Select Dark, Light, and System modes | Colors and text remain readable in each mode | ☐ |
| P1-03 | Reload after choosing a theme and mode | Choices persist after reload | ☐ |
| P1-04 | At desktop width, inspect navigation | Sidebar or desktop navigation is visible and links work | ☐ |
| P1-05 | At width below 768px, open the hamburger menu | Slide-out navigation and overlay appear | ☐ |
| P1-06 | Tap a mobile navigation link | Correct hash route opens, menu closes, and body scrolling returns | ☐ |
| P1-07 | Open and close the top-bar notification panel | Panel opens, closes with X, and closes on outside click | ☐ |
| P1-08 | Resize between desktop and mobile | No horizontal page overflow or clipped controls | ☐ |

## 5. Phase 2 — Deposits and withdrawals

### User deposit flow

| ID | Action | Expected result | Result |
|---|---|---|---|
| P2-01 | Open `#/deposit` as Worker A | Balance, gateways, and submission history load | ☐ |
| P2-02 | Select each gateway | Only the selected gateway is active and its instructions appear | ☐ |
| P2-03 | Use Copy on a gateway number | Copy succeeds and a confirmation toast appears | ☐ |
| P2-04 | Submit empty or invalid fields | Required fields and clear validation messages appear | ☐ |
| P2-05 | Submit one approved test deposit | Submission is pending and appears in history | ☐ |
| P2-06 | Reload the page | Submission history persists | ☐ |
| P2-07 | Reuse the same TRXID | Duplicate submission is rejected | ☐ |

### Administrator verification

| ID | Action | Expected result | Result |
|---|---|---|---|
| P2-08 | Open `#/admin/payments` as Administrator | Pending, Approved, Rejected, and All tabs load | ☐ |
| P2-09 | Approve the test submission with a note | Status changes to Approved and the user balance is credited once | ☐ |
| P2-10 | Check the user account | Deposit notification and transaction record are present | ☐ |
| P2-11 | Reject another test submission with a note | Status changes to Rejected and no balance is credited | ☐ |
| P2-12 | Open `#/withdraw` as a funded test user | Withdrawal form and history load | ☐ |
| P2-13 | Submit invalid withdrawal values | Server-side validation prevents the request | ☐ |
| P2-14 | Process a withdrawal as Administrator | Approved, rejected, and paid states display correctly | ☐ |
| P2-15 | Check the user after rejection | Refund and withdrawal-status notification appear exactly once | ☐ |

## 6. Phase 3 — Worker marketplace

| ID | Action | Expected result | Result |
|---|---|---|---|
| P3-01 | Open `#/jobs/available` as Worker A | Job cards, categories, budgets, and bid counts load | ☐ |
| P3-02 | Search by a title word | Only matching jobs remain | ☐ |
| P3-03 | Search by description and requirements text | Matching jobs remain; unrelated jobs disappear | ☐ |
| P3-04 | Filter by category | Only jobs in that category appear | ☐ |
| P3-05 | Set minimum and maximum budget | Results stay within the selected range | ☐ |
| P3-06 | Try minimum budget greater than maximum | Clear validation error appears and no request is accepted | ☐ |
| P3-07 | Test each sort option | Newest, lowest, highest, and closing-soon orders are correct | ☐ |
| P3-08 | Create enough jobs to exceed one page | Result count and Previous/Next controls match the displayed page | ☐ |
| P3-09 | Open a job card | `#/jobs/{id}` shows details and bidding deadline | ☐ |
| P3-10 | Place a valid bid as Worker A | Bid appears as Pending and bid count increases | ☐ |
| P3-11 | Place a second bid on the same job | Duplicate bid is rejected | ☐ |
| P3-12 | Withdraw a pending bid and re-bid | Withdrawal works; a permitted re-bid follows the documented rule | ☐ |
| P3-13 | Open `#/worker/bids` | Worker-owned bids and statuses are listed | ☐ |
| P3-14 | Open `#/worker/active-jobs` | Only assigned active jobs are listed | ☐ |

## 7. Phase 4 — Poster workflow and escrow

Use Poster A, Worker A, and Worker B for this section.

| ID | Action | Expected result | Result |
|---|---|---|---|
| P4-01 | Open `#/poster` as Poster A | Job counts, wallet, escrow, and quick actions load | ☐ |
| P4-02 | Open `#/poster/post-job` | Form loads active categories and configured budget rules | ☐ |
| P4-03 | Submit a valid job | Job is created and appears in `#/poster/jobs` | ☐ |
| P4-04 | Submit invalid title, description, category, budget, or deadline | Request is rejected with a useful validation message | ☐ |
| P4-05 | Place bids from Worker A and Worker B | Poster job detail shows both bids and their details | ☐ |
| P4-06 | Accept Worker A’s bid | Other pending bids are rejected; escrow moves to frozen funds | ☐ |
| P4-07 | Attempt the same action as Poster B | Ownership check returns Forbidden or an equivalent rejection | ☐ |
| P4-08 | Submit work as Worker A | Job moves to submitted/review state and Poster A is notified | ☐ |
| P4-09 | Request a revision as Poster A | Revision note is required; job returns to revision state | ☐ |
| P4-10 | Submit revised work | New submission is visible to Poster A | ☐ |
| P4-11 | Release payment | Job completes; worker receives the net amount; commission and release ledger rows exist | ☐ |
| P4-12 | Create and assign a second job, then cancel it | Only that job’s escrow is refunded to Poster A | ☐ |
| P4-13 | Open `#/poster/wallet` | Available wallet, frozen amount, deposits, refunds, and spending are coherent | ☐ |

## 8. Phase 5 — Administrator operations

| ID | Action | Expected result | Result |
|---|---|---|---|
| P5-01 | Open `#/admin` | Revenue, users, jobs, payments, escrow, and legacy operation summaries load | ☐ |
| P5-02 | Open the Users view | Worker, poster, and admin roles are shown | ☐ |
| P5-03 | Change a test user’s role and reload | New role persists and navigation changes appropriately | ☐ |
| P5-04 | Try to change the current administrator’s own role | Self-demotion is blocked | ☐ |
| P5-05 | Open `#/admin/jobs` and filter statuses | Job data and status filters are correct | ☐ |
| P5-06 | Flag an active job for dispute | Job becomes disputed and appears in the disputed filter | ☐ |
| P5-07 | Resolve a disputed job by cancellation | Job closes and only its escrow is refunded | ☐ |
| P5-08 | Resolve a disputed/submitted job by release | Worker credit, commission, and status are correct | ☐ |
| P5-09 | Open `#/admin/transactions` | Deposit, escrow, release, commission, refund, and adjustment records are filterable | ☐ |
| P5-10 | Open `#/admin/reports` | Aggregates agree with the jobs and transaction records | ☐ |
| P5-11 | Open `#/admin/categories` | Create, disable, enable, and safely delete/deactivate categories | ☐ |
| P5-12 | Open `#/admin/settings` | Settings load with correct keys and values; save a reversible test change | ☐ |
| P5-13 | Restore changed settings | Production defaults are restored and verified after reload | ☐ |

## 9. Phase 6 — Notifications, search, and polish

| ID | Action | Expected result | Result |
|---|---|---|---|
| P6-01 | Log in with unread notifications | Top-bar badge equals the unread API count | ☐ |
| P6-02 | Open the bell and `#/notifications` | Title, message, timestamp, tone, icon, and action link render | ☐ |
| P6-03 | Mark one notification read | Unread styling and action disappear; count decreases | ☐ |
| P6-04 | Mark all notifications read | Inbox and top-bar badge show zero unread | ☐ |
| P6-05 | Register a new test account | Welcome notification is created | ☐ |
| P6-06 | Approve/reject a deposit | Corresponding user notification is created exactly once | ☐ |
| P6-07 | Approve/reject/pay a withdrawal | Withdrawal status notification and any refund message are correct | ☐ |
| P6-08 | Check configured mail delivery | Platform notification is recorded in-app and sent through mail when enabled; mail failure does not fail the user action | ☐ |
| P6-09 | Enter HTML/script text in job and notification-visible fields | Text is displayed as text; no script executes | ☐ |
| P6-10 | Open the job list on a phone viewport | Filters stack, cards fit, and pagination remains usable | ☐ |
| P6-11 | Test dark mode and each color theme on new pages | Text, borders, badges, forms, and status colors remain readable | ☐ |
| P6-12 | Rapidly apply filters or change pages | Stale responses do not replace newer results | ☐ |

## 10. Security and access-control checks

Run these with browser DevTools or an API client using placeholder tokens only:

| ID | Action | Expected result | Result |
|---|---|---|---|
| SEC-01 | Request protected APIs without `Authorization` | HTTP 401 | ☐ |
| SEC-02 | Use a worker token on poster/admin APIs | HTTP 403 | ☐ |
| SEC-03 | Use Poster B to read or modify Poster A’s job | HTTP 403/404; no data changes | ☐ |
| SEC-04 | Mark another user’s notification ID as read | HTTP 404; notification remains unchanged | ☐ |
| SEC-05 | Submit invalid sort, oversized page size, huge search text, and malformed budgets | Request is rejected or safely bounded | ☐ |
| SEC-06 | Try duplicate submissions, bids, approvals, and payment actions | Idempotency/business rules prevent duplicate credits or state changes | ☐ |
| SEC-07 | Inspect rendered user/job/notification text with HTML payloads | No HTML injection or script execution | ☐ |
| SEC-08 | Attempt to open admin hash routes as a regular user | Route is blocked and user is redirected or shown the access error | ☐ |

## 11. Responsive and browser matrix

At minimum, repeat the smoke flow in:

- Desktop Chrome or Chromium at 1440×900 and 1024×768.
- Mobile simulation at iPhone 14 width and Pixel 7 width.
- One additional browser such as Firefox, Safari, or Edge.

Confirm on every viewport:

- No horizontal scrolling caused by cards, forms, tables, or navigation.
- Buttons and inputs are reachable and have visible focus/active states.
- Mobile menu overlay closes correctly and restores body scrolling.
- Pagination, notification actions, and admin tabs remain tappable.
- Dark mode and all color themes maintain readable contrast.

## 12. Release sign-off

| Phase | Manual result | Evidence | Owner | Date |
|---|---|---|---|---|
| Phase 1 — Layout/theme/navigation | Pass / Fail / Blocked | | | |
| Phase 2 — Payments/withdrawals | Pass / Fail / Blocked | | | |
| Phase 3 — Worker marketplace | Pass / Fail / Blocked | | | |
| Phase 4 — Poster/escrow workflow | Pass / Fail / Blocked | | | |
| Phase 5 — Admin operations | Pass / Fail / Blocked | | | |
| Phase 6 — Notifications/polish/security | Pass / Fail / Blocked | | | |
| Release decision | Approved / Rejected | | | |

### Defect record

For every failure, record:

1. Test ID and environment.
2. Account role and exact input.
3. Expected result versus actual result.
4. Screenshot, console error, or sanitized Network response.
5. Reproduction frequency and severity.
6. Whether data or wallet balances were affected.

Do not include passwords, bearer tokens, SMTP credentials, database credentials, or private wallet information in screenshots or defect reports.
