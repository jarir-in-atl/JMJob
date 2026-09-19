# JMJob

> A full functional clone of [original reference platform](https://original reference platform/) — a Telegram Mini App for watching ads, completing tasks, and earning rewards — rebuilt as a plain website on **Nemesis v7.1.1** (backend) + **Ghost.js** (frontend).

## What's inside

- **Backend:** Nemesis v7.1.1 (PHP 8.2) with 17 MySQL tables, 11 models, 6 API controllers, 3 services, 2 API middleware
- **Frontend:** Ghost.js SPA (vanilla DOM) with hash routing, persistent auth tokens, 9 views + 4 components, 49 KB bundled
- **Auth:** Email + password (no Telegram)
- **Ad networks:** All 3 supported — GigaPub, TgAds (AdExium), and a Nemesis simulated fallback
- **Withdrawals:** Full bKash / Nagad flow with admin approval queue
- **CI/CD:** GitHub Actions builds, lints, syntax-checks, then FTPs to production

## Local development

```bash
# 1. Backend deps
composer install
cp .env.example .env
# Edit .env to set DB credentials

# 2. Database
mysql -u root -p -e "CREATE DATABASE jmjobxyz_db"
php nemesis migrate:run
php nemesis db:seed EarnAppSeeder
# Optional marketplace test accounts (local/staging only)
php nemesis db:seed DemoAccountsSeeder

# 3. Frontend build
cd earnap-client
npm install
npx esbuild src/index.js --bundle --minify --format=esm \
    --target=es2020 --outfile=../public/js/app.js

# 4. Serve
cd ..
php -S 127.0.0.1:8080 -t public/ public/index.php
```

Open http://127.0.0.1:8080/.

## Demo accounts

| Email | Password | Role | Balance |
|---|---|---|---|
| `admin@example.com` | `password` | Admin | $0.00 |
| `admin-demo@example.com` | `JMJobDemo!2026` | Admin | 0.00 |
| `worker@example.com` | `JMJobDemo!2026` | Worker | 100.00 |
| `worker2@example.com` | `JMJobDemo!2026` | Worker | 100.00 |
| `poster@example.com` | `JMJobDemo!2026` | Poster | 1000.00 wallet |
| `poster2@example.com` | `JMJobDemo!2026` | Poster | 1000.00 wallet |
| `alice@example.com` | `password` | User (referrer) | $1.234 |
| `bob@example.com` | `password` | User (referred by Alice) | $0.42 |
| `carol@example.com` | `password` | User (referred by Alice) | $0.10 |

The marketplace demo accounts are created by `DemoAccountsSeeder` and are for local/staging testing only. Change or disable them before exposing a seeded database publicly.

## Fraud moderation baseline

Risk signals are advisory and do not release payment or ban a worker by
themselves. The initial defaults are:

- fraud_min_description_chars: 20
- fraud_daily_submission_velocity_limit: 10 submissions per 24 hours
- fraud_shared_identity_worker_threshold: 2 workers
- fraud_review_threshold: 20
- fraud_ban_requires_confirmation: enabled

Moderators should inspect the job requirements, description, screenshot, link,
and worker history; use cleared for false positives, dismissed for
non-actionable concerns, and confirmed_fraud only for clearly invalid or
fabricated work. Rejections require a useful reason, and ban escalation
requires explicit confirmation. Decisions are recorded in the admin audit log.

## Production deploy

1. `git push` to `main`, or run `./deploy.sh` locally.
2. The deployment uploads the code and calls the idempotent `migration_runner.php`; it runs only pending migrations.
3. Back up the production database before schema-changing releases and verify migrations, queue/scheduler processing, and marketplace reads/writes.

The migration runner has no token gate. Remove it from the public server after
the deployment if automatic migration calls are no longer needed.

The application scheduler is driven by the host cron and must run from the
project root every minute:

```cron
* * * * * cd /path/to/JMJob && /usr/bin/php nemesis schedule:run >> storage/logs/scheduler-cron.log 2>&1
```

The command is safe to repeat; deadline reminders use recipient/event
deduplication. Configure the real mail environment separately and verify an
approved delivery path before enabling external notification email.

## Project structure

```
JMJob/
├── public/                  # web root (FTPs to /home/jmjobxyz/public_html/)
│   ├── index.php            # PHP front controller
│   ├── index.html           # SPA shell
│   ├── js/app.js            # Ghost.js bundle (built from earnap-client/)
│   └── css/app.css          # bundled styles
├── app/                     # controllers, models, services
├── config/                  # database, app, etc.
├── database/
│   ├── migrations/          # 15 migration files
│   └── seeders/             # EarnAppSeeder
├── src/                     # Nemesis framework source
├── routes/
│   ├── api.php              # 16+ JSON endpoints
│   └── web.php              # SPA shell
├── views/                   # Blade templates
├── earnap-client/           # Ghost.js frontend source
├── migration_runner.php     # idempotent migration script
└── .github/workflows/       # CI/CD
```

See [EARNAPP_README.md](EARNAPP_README.md) for the full feature/endpoint reference.
# JMJob
