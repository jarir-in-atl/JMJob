# EarnApp Clone — Nemesis + Ghost.js

A full functional clone of [earnapp339.imrantechnology.xyz](https://earnapp339.imrantechnology.xyz/) (a.k.a. "TakaIncome" / "EasyEarningBot" — a Telegram Mini App for watching ads, completing tasks, and earning rewards).

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│ Browser                                                          │
│  ┌──────────────────────────────────────────────────────┐       │
│  │  Ghost.js SPA (vanilla DOM rendering)                 │       │
│  │  - Hash-based router (6 pages + login/register)       │       │
│  │  - asyncSignal / persistSignal for reactive state     │       │
│  │  - 48.7 KB bundled                                    │       │
│  └──────────────────┬────────────────────────────────────┘       │
└─────────────────────┼─────────────────────────────────────────────┘
                      │ JSON over HTTP
                      ▼
┌──────────────────────────────────────────────────────────────────┐
│  Nemesis v7.1.1 (PHP 8.2) — Backend                              │
│  ┌──────────────────────────────────────────────────────┐       │
│  │ 17 MySQL tables (10 in v7.1.1)                         │       │
│  │ 10 models (AR / Fluent)                              │       │
│  │ 6 API controllers                                    │       │
│  │ 3 services (Reward, Withdrawal, AdProvider)         │       │
│  │ 2 API middleware (AuthenticateApi, AdminOnly)        │       │
│  │ 16+ JSON endpoints                                   │       │
│  └──────────────────────────────────────────────────────┘       │
└──────────────────────────────────────────────────────────────────┘
```

## Features

### User-facing
- **Email + password auth** (no Telegram — the original is a TMA, this is a plain website)
- **Referral system** with 50% lifetime commission
- **Ad watching** with 12s server-enforced cooldown
- **Web tasks** (visit URL, wait N seconds, claim reward)
- **Telegram tasks** (mock — trust-based, since we don't have a real bot)
- **Withdrawals** to bKash / Nagad with admin approval queue
- **Daily ad limit** (50 ads/user/day)
- **Persistent session** (localStorage token + server-side sessions table)
- **Reactive balance** — every reward instantly updates the UI

### Admin
- **Stats dashboard** (users, withdrawals, ad views, lifetime paid)
- **Withdrawal approval** (approve / reject with refund / mark paid)
- **User list** (all registered users)
- **Ad provider config** (toggle GigaPub / TgAds / Simulated, set block IDs, weights, rewards)

## Quick start

### Backend (Nemesis)

```bash
# Install
composer install

# Configure .env
cp .env.example .env
# Edit DB_HOST, DB_NAME, DB_USER, DB_PASS

# Migrate + seed
php nemesis migrate:run
php nemesis db:seed EarnAppSeeder

# Serve
php -S 127.0.0.1:8080 -t public/
```

Open http://127.0.0.1:8080/

### Frontend (Ghost.js)

The frontend is pre-built and committed at `jarir-nemesis/public/js/app.js` (48.7 KB). To rebuild from source:

```bash
cd earnap-client
npm install
npx esbuild src/index.js --bundle --minify --format=esm \
    --target=es2020 --outfile=../jarir-nemesis/public/js/app.js
```

## Demo accounts

After running the seeder:

| Email | Password | Role | Balance |
|---|---|---|---|
| `admin@example.com` | `password` | Admin | $0.00 |
| `alice@example.com` | `password` | User (referrer) | $1.234 |
| `bob@example.com` | `password` | User (referred by Alice) | $0.42 |
| `carol@example.com` | `password` | User (referred by Alice) | $0.10 |

## API Reference

All endpoints return JSON. All authenticated routes require `Authorization: Bearer <token>`.

### Public
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/health` | Health check |
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Log in |

### Authenticated
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/logout` | Log out (invalidate session) |
| GET | `/api/user` | Get user record |
| POST | `/api/user/reward` | Credit ad reward (server checks 12s minimum) |
| POST | `/api/user/withdraw` | Request a withdrawal |
| GET | `/api/user/withdrawals` | List user's withdrawals |
| GET | `/api/user/referrals` | List user's referral network |
| GET | `/api/user/ads` | List ad view history |
| GET | `/api/ads/config` | List active ad providers |
| GET | `/api/ads/next` | Pick next provider by weight |
| GET | `/api/tasks/web` | List active web tasks |
| POST | `/api/tasks/web/start` | Start a web task (returns completion_id) |
| POST | `/api/tasks/web/claim` | Claim a web task reward (server checks duration) |
| GET | `/api/tasks/telegram` | List active Telegram channel tasks |
| POST | `/api/tasks/telegram/verify` | Verify + reward a TG task |

### Admin only
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/admin/stats` | Top-line counts |
| GET | `/api/admin/withdrawals?status=pending` | List withdrawals (any status) |
| POST | `/api/admin/withdrawals/{id}/approve` | Approve a withdrawal |
| POST | `/api/admin/withdrawals/{id}/reject` | Reject + refund |
| POST | `/api/admin/withdrawals/{id}/pay` | Mark approved → paid |
| GET | `/api/admin/users` | List all users |
| GET | `/api/admin/ad-providers` | List ad provider configs |
| POST | `/api/admin/ad-providers/{id}` | Update a provider config |

## Configuration

`.env` keys (set to your own values):

```env
# Database
DB_DRIVER=mysql
DB_HOST=localhost
DB_PORT=3306
DB_NAME=earn_db
DB_USER=root
DB_PASS=root

# Ad providers (block IDs are placeholders; leave empty to use simulated only)
AD_PROVIDER_GIGAPUB_ID=
AD_PROVIDER_TGADS_ID=
AD_REWARD_PER_VIEW=0.0050
AD_DAILY_LIMIT=50
AD_MIN_DURATION_SECONDS=12

# Withdrawals
WITHDRAW_MIN_REFERRALS=1

# Referral commission
REFERRAL_COMMISSION_RATE=0.50
```

You can also configure ad providers at runtime via the admin UI (no DB seed needed).

## How the ad flow works

1. User clicks "Watch Ad & Earn" on the home page.
2. The frontend calls `GET /api/ads/next` which picks a random provider by weight.
3. The provider has three modes:
   - **simulated** (default, always works): a 12-second countdown
   - **gigapub**: real GigaPub widget (needs `AD_PROVIDER_GIGAPUB_ID` set)
   - **tgads**: real AdExium widget (needs `AD_PROVIDER_TGADS_ID` set)
4. When the ad finishes, the frontend calls `POST /api/user/reward` with `{provider, started_at}`.
5. The server checks: (a) daily limit not exceeded, (b) `now - started_at >= min_duration_seconds`, (c) reward > 0.
6. The server credits the user and, if the user has a referrer, sends 50% of the reward to the referrer.
7. The frontend `refreshUser()` fetches the new balance and re-renders the UI reactively.

## Differences from the original Telegram Mini App

| Feature | Original | Our clone |
|---|---|---|
| Auth | Telegram WebApp `initData` | Email + password |
| Bot | `t.me/takaincomeio_bot` | None |
| Support | `t.me/EasyEarningBot_admin` | Same link (just opens Telegram) |
| Referral | `?startapp={id}` | `?ref={code}` |
| Ad serving | GigaPub + AdExium (Telegram-native) | All 3: GigaPub + AdExium + Simulated |
| Backend | Likely PHP / Laravel | Nemesis v7.1.1 |
| Frontend | jQuery + Bootstrap 5 | Ghost.js (vanilla) |
| PWA / WebApp | Telegram WebApp SDK | Plain web |

## Files of interest

- `jarir-nemesis/` — the Nemesis framework source (v7.1.1)
- `jarir-nemesis/database/migrations/2026_08_30_*.php` — the 10 new migrations
- `jarir-nemesis/app/Models/*.php` — 11 models (User, Session, AdProvider, AdView, WebTask, WebTaskCompletion, TgTask, TgTaskCompletion, Withdrawal, ReferralCommission)
- `jarir-nemesis/app/Http/Controllers/Api/*.php` — 6 API controllers
- `jarir-nemesis/app/Services/*.php` — RewardService, WithdrawalService
- `jarir-nemesis/src/Http/Middleware/AuthenticateApi.php` + `AdminOnly.php` — new middleware
- `jarir-nemesis/routes/api.php` — all 16+ endpoints
- `jarir-nemesis/routes/web.php` — serves the SPA shell
- `earnap-client/` — the Ghost.js frontend source
- `earnap-client/src/components/` — 4 components (AppShell, TopBar, BottomNav, Toast)
- `earnap-client/src/views/` — 9 views (Home, Login, Register, Refer, WebTask, Earn, TgTasks, Withdraw, Profile, Admin)

## License

MIT
