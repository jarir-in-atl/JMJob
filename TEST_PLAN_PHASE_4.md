# JMJob Phase 4 — Poster Panel Test Plan

## Automated checks

- `tests/unit/Phase4PosterTest.php` verifies poster routes, page/API surfaces, role guards, and role-specific wallet accounting.
- PHP and JavaScript syntax checks pass for the Phase 4 files.
- The frontend production build completes with `npm run build`.

## Authenticated manual flow

Use a test account whose role is `poster`, and a separate `worker` account.

1. Open `#/poster` and confirm job counts and wallet balances load.
2. Open `#/poster/post-job`, select an active category, submit a valid job, and confirm it appears in `#/poster/jobs`.
3. As the worker, open the job, place a bid, accept the bid from the poster view, and confirm escrow moves from available poster wallet to frozen escrow.
4. As the worker, submit work. As the poster, open the job detail, inspect the submission, request a revision, and confirm the job returns to revision status.
5. Submit revised work, release payment from the poster page, and confirm the job completes, escrow is released, commission is logged, and the worker balance increases.
6. Create a second assigned job and cancel it. Confirm only that job's escrow returns to the poster wallet.
7. Submit a poster deposit through `#/deposit`, approve it as admin, and confirm the approved amount increases `wallet_balance` and appears in the transaction ledger.
8. Test the same deposit flow with a worker account and confirm it increases the worker `balance` instead.

## Security checks

- Unauthenticated requests to every `/api/poster/*` endpoint return HTTP 401.
- A worker token cannot use poster endpoints and receives HTTP 403.
- A poster cannot read or modify another poster's jobs.
- Payment release, cancellation, revision requests, and bid acceptance validate ownership server-side.
