# Manual Test Plan — Phase 1 & 2

> **Use this checklist after each deploy.** All tests should be run in a real browser on the production URL (e.g. `https://jmjob.xyz`). Test in both **desktop** and **mobile** viewports.
>
> Mobile simulation: Chrome DevTools → toggle device toolbar (Ctrl+Shift+M) → iPhone 14 / Pixel 7.
>
> Always start with a **hard refresh** (Ctrl+Shift+R) to bypass cache.

---

## 0. Pre-flight

| # | Check | Expected | ✓/✗ |
|---|-------|----------|-----|
| 0.1 | Site loads | `https://jmjob.xyz/` returns the JMJob SPA without errors | ☐ |
| 0.2 | Logged in as a regular user | Can see dashboard, sidebar populated | ☐ |
| 0.3 | Logged in as admin | `#/admin` accessible, no 403 | ☐ |
| 0.4 | Browser console clean | No red errors in DevTools console on any page | ☐ |

---

## 1. Phase 1.1 + 1.2 + 1.3 — Color Theme System

| # | Test | Steps | Expected | ✓/✗ |
|---|------|-------|----------|-----|
| 1.1 | Default theme loads | Open `/` logged in, then `#/settings` → **Appearance** section | Purple primary on buttons, links, badges, hero gradients | ☐ |
| 1.2 | Switch to Emerald | Settings → click **Emerald** swatch | Primary color (buttons, links, header gradient) turns **green** instantly | ☐ |
| 1.3 | Switch to Amber | Settings → click **Amber** swatch | Primary color turns **orange** | ☐ |
| 1.4 | Switch to Rose | Settings → click **Rose** swatch | Primary color turns **pink/red** | ☐ |
| 1.5 | Back to Default | Settings → click **Default** swatch | Primary color returns to **purple** | ☐ |
| 1.6 | Color persists across reload | Pick Emerald → **hard refresh** (Ctrl+Shift+R) | Still green after reload | ☐ |
| 1.7 | Color per-user | Open in a 2nd private window, pick Amber. Original window still green. Reload both. | Both keep their own choice (client-side, no cross-talk) | ☐ |
| 1.8 | Mode Light → Dark | Settings → **Theme Mode** = Dark | Whole UI flips to dark (cards, text, sidebar) | ☐ |
| 1.9 | Mode = System | Settings → Theme Mode = System. Change your OS theme. | App follows OS without reload | ☐ |
| 1.10 | Mode persists | Set Dark → hard refresh | Still dark | ☐ |
| 1.11 | Color works in both modes | Pick Emerald, then toggle Dark | Green primary visible in both light & dark backgrounds | ☐ |
| 1.12 | Settings page layout | On a narrow viewport, settings rows stack properly | No overflow or broken layout | ☐ |

---

## 2. Phase 1.4 — Mobile Vertical Navbar

> Test on mobile OR narrow desktop window (<768px).

| # | Test | Steps | Expected | ✓/✗ |
|---|------|-------|----------|-----|
| 2.1 | Hamburger visible on mobile | Open on mobile width | ☰ icon in top-left of topbar | ☐ |
| 2.2 | Hamburger hidden on desktop | Resize to >768px | ☰ icon gone, sidebar visible on left | ☐ |
| 2.3 | Open slide-out | Tap ☰ | Dark overlay covers page; vertical navbar slides in from left | ☐ |
| 2.4 | Brand + close button | Slide-out shows **JM JOB** at top with **✕** button | Both visible | ☐ |
| 2.5 | All links present | Compare slide-out links to sidebar | Same links: Dashboard, Tasks, Watch Ads, Refer, **Deposit**, Withdraw, Wallet, Leaderboard, Achievements, Support, Settings | ☐ |
| 2.6 | Active item highlighted | Currently on `#/settings` → open menu | "Settings" highlighted in primary color | ☐ |
| 2.7 | Tap a link | Tap "Deposit" in slide-out | Slide-out closes, navigates to `#/deposit`, overlay gone, body scroll restored | ☐ |
| 2.8 | Close via X | Tap **✕** in slide-out header | Slide-out closes | ☐ |
| 2.9 | Close via overlay | Open menu → tap outside (overlay) | Slide-out closes | ☐ |
| 2.10 | Body scroll lock | Open menu | Can't scroll the main page behind overlay | ☐ |
| 2.11 | Slide-out animates | Open/close | Smooth slide (not instant) | ☐ |
| 2.12 | Deposit link present | New "Deposit" item is in the slide-out list | Visible with cash-coin icon | ☐ |

---

## 3. Phase 1.5 — TopBar Notification Bell

| # | Test | Steps | Expected | ✓/✗ |
|---|------|-------|----------|-----|
| 3.1 | Bell visible | Top-right of topbar | 🔔 bell icon with red **3** badge | ☐ |
| 3.2 | Click opens panel | Click bell | Dropdown panel opens with 3 notifications + "View all" footer | ☐ |
| 3.3 | Panel close (X) | Click ✕ in panel header | Panel closes | ☐ |
| 3.4 | Panel close (outside click) | Open panel, click somewhere else on the page | Panel closes | ☐ |
| 3.5 | Panel close (re-click bell) | Open panel, click bell again | Panel closes | ☐ |
| 3.6 | Logout still works | Click 🚪 icon | Logged out, redirected, flash message "Logged out" | ☐ |
| 3.7 | Brand link on user topbar | When authenticated, "JMJOB" link appears next to hamburger | Clicking goes to `#/` | ☐ |

---

## 4. Phase 2.4 — Deposit Page (`#/deposit`)

> Requires logged-in user. If you don't have one, register first.

| # | Test | Steps | Expected | ✓/✗ |
|---|------|-------|----------|-----|
| 4.1 | Page loads | Navigate to `#/deposit` | Header: "Deposit Funds", your balance in gradient hero card | ☐ |
| 4.2 | Gateways load | Wait ~1s | 4 gateway cards: bKash, Nagad, Rocket, Upay — each with wallet number | ☐ |
| 4.3 | Select gateway | Click "bKash" | Card gets primary-color border + checkmark. Steps 2 & 3 cards appear. | ☐ |
| 4.4 | Switch gateway | Click "Nagad" | bKash deselects, Nagad selects, wallet number updates | ☐ |
| 4.5 | Copy wallet | Click **Copy** button | Toast "Wallet number copied." — paste somewhere to verify | ☐ |
| 4.6 | Empty form | Click **Submit Payment** with empty fields | Browser-native required-field errors | ☐ |
| 4.7 | Invalid amount | Enter amount = 0 or 0.5 | "Amount must be between 1 and 50000." (toast) | ☐ |
| 4.8 | Invalid sender | Enter sender "abc" | "Invalid sender number format." | ☐ |
| 4.9 | Invalid TRXID | Enter TRXID "xy!" | "TRXID must be 4-40 uppercase letters or digits." | ☐ |
| 4.10 | Valid submission | Amount: `100`, Sender: `01712345678`, TRXID: `TEST1234ABC` → Submit | Toast "Payment submitted. Awaiting admin verification." Form clears. New row appears in **Submission History** with status **Pending** (orange left border). | ☐ |
| 4.11 | Duplicate TRXID | Re-submit same TRXID | "This TRXID has already been submitted." | ☐ |
| 4.12 | History persists | Submit a payment → hard refresh | Submission still in history | ☐ |
| 4.13 | Lowercase TRXID auto-upper | Enter trxid `test1234` | Sent to server as `TEST1234` (server uppercases) | ☐ |

---

## 5. Phase 2.5 — Admin Payment Verification (`#/admin/payments`)

> Requires an admin user. Default admin is set in your DB.

| # | Test | Steps | Expected | ✓/✗ |
|---|------|-------|----------|-----|
| 5.1 | Page accessible | Log in as admin, go to `#/admin/payments` | Page loads with "Payment Verifications" header and 4 tabs (Pending/Approved/Rejected/All) | ☐ |
| 5.2 | Non-admin blocked | Log out, log in as non-admin, go to `#/admin/payments` | "403 Admin only" message with "Go home" button | ☐ |
| 5.3 | Pending tab default | Land on page | "Pending" tab active, list of pending submissions shown | ☐ |
| 5.4 | Tab switching | Click "Approved" | List filters to approved-only | ☐ |
| 5.5 | All tab | Click "All" | All submissions regardless of status | ☐ |
| 5.6 | Row details | Each row shows: amount, gateway badge, TRXID (in monospace), sender number, user name + email, submission date | All visible | ☐ |
| 5.7 | Approve with note | Click **Approve** on a pending row → enter "Looks good" → OK | Toast "Payment approved. Balance credited." Row disappears from Pending tab. | ☐ |
| 5.8 | User balance updated | Log in as that user → `#/deposit` | Balance now shows the new total (was + approved amount) | ☐ |
| 5.9 | Approved tab | Switch to Approved tab | New row appears with green left border, status "Approved", "Verified" date, "Looks good" note | ☐ |
| 5.10 | Reject with note | Find another pending row → **Reject** → "TRXID not found in bKash" | Toast "Payment rejected." Row disappears from Pending. | ☐ |
| 5.11 | Rejected tab | Switch to Rejected tab | Row with red left border, red "Rejected" status, the rejection note | ☐ |
| 5.12 | Approve empty note | Approve another → leave prompt empty | Same as with note, just no note saved | ☐ |
| 5.13 | Admin panel has Payments tab | Go to `#/admin` → click Payments tab | Redirects to `/admin/payments` | ☐ |

---

## 6. Cross-cutting (Mobile + Theme + Color)

| # | Test | Steps | Expected | ✓/✗ |
|---|------|-------|----------|-----|
| 6.1 | Deposit on mobile | Resize <768px, go to `#/deposit` | Page works; gateway grid is 1-column instead of 4; form is full-width | ☐ |
| 6.2 | Admin payments on mobile | Resize <768px, go to `#/admin/payments` | Tabs wrap; rows stack action buttons below info | ☐ |
| 6.3 | Deposit in dark mode | Toggle Dark, go to `#/deposit` | Hero card stays gradient; cards readable on dark bg; history rows visible | ☐ |
| 6.4 | Admin in dark mode | Toggle Dark, go to `#/admin/payments` | Status colors (warning/green/red) still distinguishable | ☐ |
| 6.5 | Emerald deposit | Pick Emerald, go to `#/deposit` | Hero card gradient is now green | ☐ |
| 6.6 | Slide-out in dark mode | On mobile, toggle dark, open menu | Background and text readable on dark | ☐ |

---

## 7. Edge Cases

| # | Test | Steps | Expected | ✓/✗ |
|---|------|-------|----------|-----|
| 7.1 | Submit huge amount | Amount = 99999 (just under max) | Should accept if max is 50000 (or 99999 if you raised it via `PAYMENT_MAX_AMOUNT` env) | ☐ |
| 7.2 | Logout during deposit | Open deposit page, click logout | Redirected to login, no console errors | ☐ |
| 7.3 | Direct URL to `#/deposit` when logged out | Log out, paste `#/deposit` | Redirected to login | ☐ |
| 7.4 | Refresh during submission | Submit a payment → during network, hard refresh | Page reloads cleanly, submission still appears in history | ☐ |
| 7.5 | Many submissions | Submit 5+ payments in a row | All appear in history, no duplicates | ☐ |
| 7.6 | TRXID with spaces | Enter `"ABC 123"` (with space) | Rejected (regex doesn't allow spaces) | ☐ |
| 7.7 | TRXID with special chars | Enter `"abc!@#"` | Rejected | ☐ |
| 7.8 | API without auth | Open DevTools Network, call `GET /api/payment/submissions` without token | 401 Unauthorized | ☐ |
| 7.9 | Admin endpoint as user | Non-admin calls `POST /api/admin/payments/1/approve` | 403 Forbidden | ☐ |
| 7.10 | Approve non-existent ID | Admin calls `POST /api/admin/payments/99999/approve` | "Submission not found." | ☐ |

---

## 8. Quick Triage

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| Color doesn't change | Old CSS cached | Hard refresh (Ctrl+Shift+R) |
| Mobile menu doesn't open | `MobileNav.js` not bundled | Re-run `npm run build` |
| Deposit page 404 | Route not registered in `router.js` | Verify `earnap-client/src/router.js` has `/deposit` |
| Admin 403 | Logged in as non-admin | Use the admin user from your DB |
| Submit returns 500 | `payment_submissions` table missing on server | Run `migration_runner.php` on server |
| "Unknown gateway" error | Old `routes/api.php` on server | Deploy the new `routes/api.php` |
| Bell dropdown doesn't close | Old `TopBar.js` on server | Rebuild + deploy `public/js/app.js` |
| `/api/payment/gateways` 404 | New routes not uploaded | Verify `routes/api.php` is on server |

---

## 9. Deploy Steps

Run from project root `/home/jarir-ahmed/Downloads/JMJob/`:

```bash
# 1. Build the JS bundle (required every time)
cd earnap-client && npm run build && cd ..

# 2. Deploy (uploads CSS, JS, blade, routes, controllers, models, services,
#    migration, AND the new vendor package + autoloader updates)
./deploy.sh

# 3. (deploy.sh already runs migration_runner.php — verifies the
#    payment_submissions table gets created)

# 4. Hard refresh in browser
```

The `deploy.sh` script:
- Builds the JS bundle
- Uploads the live CSS, JS, Blade template, and selected PHP files via lftp
- **Mirrors the new vendor package directory** (e.g. `vendor/jarir-ahmed/manual-payment-gateway/`) — required because the server has `shell_exec` disabled and no SSH shell, so we cannot run `composer install` remotely.
- **Updates the three composer autoloader files** (`autoload_psr4.php`, `autoload_static.php`, `installed.php`) so the new package's classes are autoloaded on the server.
- Runs the migration runner on the server via `curl https://jmjob.xyz/migration_runner.php`

**If the migration doesn't apply** (e.g. lftp silently fails for a file), verify the migration file is on the server:
```bash
curl -s "https://jmjob.xyz/migration_runner.php"
```
If it says "No new migrations to apply" but the table is missing, upload the migration file manually:
```bash
lftp -u "$FTP_USER,$FTP_PASS" "$FTP_HOST" -e "put /home/jarir-ahmed/Downloads/JMJob/database/migrations/2026_09_03_000001_create_payment_submissions_table.php -o public_html/database/migrations/2026_09_03_000001_create_payment_submissions_table.php; bye"
```
Then re-run the migration runner.

After deploy, start at section **0. Pre-flight** and work down.
