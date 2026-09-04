# JMJob Phase 6 — Polish, Notifications, Search & Testing Plan

## Automated checks

- `tests/unit/Phase6NotificationsTest.php` verifies the migration, protected API routes, in-memory read/mark-read behavior, email/search/pagination markers, and frontend notification surface.
- The jobs API uses a maximum page size of 50, an allowlisted sort field, bounded search input, budget validation, and `meta` pagination fields.
- The production bundle contains the jobs filter controls, pagination UI, notifications inbox, unread badge, and responsive navigation.
- PHP/JavaScript syntax checks and the frontend production build must pass before deployment.

## Authenticated manual flow

1. Log in and open the notification bell. Confirm the unread badge matches the API count.
2. Open `#/notifications` and confirm the inbox lists notification title, message, timestamp, and action link.
3. Mark one notification read and confirm its unread styling/action disappears.
4. Use **Mark all read** and confirm the inbox and top-bar badge show zero unread notifications.
5. Register a new account and confirm a welcome notification is created.
6. Submit a deposit, approve it as admin, and confirm the user receives a deposit-approved notification. Repeat with rejection and confirm the rejection message is shown.
7. Browse jobs with category, title/description/requirements search, minimum/maximum budget, and each sort option. Confirm the result count and Previous/Next controls follow the API metadata.
8. Confirm configured platform notifications are delivered through both the database channel and the mail channel; SMTP failures must not fail the originating account or payment action.

## Security checks

- Unauthenticated `GET /api/notifications` returns HTTP 401.
- A user can only mark their own notification IDs as read; another user's ID returns HTTP 404.
- Notification title/message/action data is escaped before insertion into the frontend DOM.
- Job browse query values are parameterized, sort values are allowlisted, search length is capped, and `per_page` is capped at 50.

## Live verification completed 2026-09-04

- Homepage, JavaScript bundle, and stylesheet returned HTTP 200 after deployment.
- `GET /api/jobs`, `GET /api/notifications`, and `POST /api/notifications/read-all` returned HTTP 401 without credentials.
- Live bundle markers for job filters/pagination and notification UI were present.
