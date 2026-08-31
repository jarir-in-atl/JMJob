# JMJob — Local Development Guide

This document explains how to run the project on your dev machine.

## Prerequisites

- PHP 8.2+ (PHP 8.4+ recommended for the framework)
- Composer
- MySQL 5.7+ / MariaDB 10.3+ (or SQLite as a fallback)
- Node.js 18+ (only needed to rebuild the frontend bundle)
- lftp (only needed for FTP deployment)

## One-time setup

```bash
# 1. Install PHP dependencies
composer install --no-interaction --no-scripts --prefer-dist

# 2. Strip the heavy AWS SDK (we don't use S3 in the EarnApp clone)
composer remove --no-interaction --no-scripts \
    aws/aws-sdk-php \
    league/flysystem-aws-s3-v3

# 3. Generate an APP_KEY
APP_KEY=$(php -r "echo bin2hex(random_bytes(32));")
echo "APP_KEY=$APP_KEY"

# 4. Set up your local .env
cp .env.local.example .env
sed -i "s|^APP_KEY=.*|APP_KEY=$APP_KEY|" .env

# 5. Make sure your DB exists and you have credentials
mysql -h localhost -u root -p -e "CREATE DATABASE IF NOT EXISTS earn_db"

# 6. Run migrations and seed demo data
php nemesis migrate:run
php nemesis db:seed EarnAppSeeder

# 7. Start the dev server
php -S 127.0.0.1:8080 -t public/
```

## Daily workflow

```bash
# Start the server
php -S 127.0.0.1:8080 -t public/

# Open in browser
open http://127.0.0.1:8080

# Log in as one of the seeded accounts:
#   admin@example.com / password    (admin)
#   alice@example.com / password    (regular user, referrer)
#   bob@example.com   / password    (referred by Alice)

# Re-build the frontend (only if you change earnap-client/src/)
cd earnap-client
npm install
npx esbuild src/index.js --bundle --minify --format=esm \
    --target=es2020 --outfile=../public/js/app.js
cd ..
```

## Database

- **Driver:** MySQL (production) / SQLite (alternative for throwaway dev)
- **Tables:** 17 (10 framework + 7 EarnApp)
- **Seeded users:** 1 admin + 3 regulars (alice, bob, carol)
- **All seeded users have password `password`.**

## Backend layout

```
app/
├── Http/
│   ├── Controllers/Api/   # Auth, User, Ad, WebTask, TgTask, Admin
│   └── Kernel.php         # middleware aliases (auth.api, admin, ...)
├── Models/                 # User, Session, AdProvider, WebTask, ...
└── Services/               # RewardService, WithdrawalService

src/                        # Nemesis framework source
├── Http/Middleware/        # AuthenticateApi, AdminOnly, Throttle, ...
├── Core/                    # Config, Database, View, Router, Model
└── ...

routes/
├── api.php                 # 16+ JSON endpoints
├── web.php                 # SPA shell
└── route.php               # legacy routes

config/                     # database, app, app env, etc.
database/
├── migrations/             # 10 EarnApp + 5 framework migrations
└── seeders/                # EarnAppSeeder
```

## Frontend layout

```
earnap-client/
├── package.json
├── src/
│   ├── index.js            # entry point
│   ├── api.js              # ghostFetch wrapper
│   ├── state.js            # signals (authToken, currentUser, route)
│   ├── router.js           # hash-based router
│   ├── components/         # 4: AppShell, TopBar, BottomNav, Toast
│   ├── views/              # 9: Home, Login, Register, Refer, WebTask, Earn, TgTasks, Withdraw, Profile, Admin
│   └── css/app.css         # bundled styles
└── dist/                   # built output (gitignored)

public/
├── js/app.js               # built bundle (49 KB)
├── css/app.css             # built CSS (16 KB)
├── index.php               # PHP front controller
└── index.html              # SPA shell
```

## Common commands

```bash
# Run a specific migration
php nemesis migrate:rollback

# View the database
mysql -h localhost -u root -p earn_db
mysql> SHOW TABLES;
mysql> SELECT id, name, email, balance, lifetime_earned FROM users;

# View the error log
tail -f storage/logs/*.log

# Re-seed
php nemesis db:seed EarnAppSeeder
```

## End-to-end test flow

1. Open http://127.0.0.1:8080
2. Log in as `alice@example.com / password`
3. Home page shows $1.234 balance, 10/50 ads today, 2 referrals
4. Click "Watch Ad & Earn" → 12s simulated ad → $0.005 credited
5. Click "Refer" → copy referral link → log out
6. Register new user with `?ref=ALICE001` → see "Referred by ALICE001"
7. The new user watches an ad → Alice gets 50% commission ($0.0025)
8. Click "Withdraw" → enter amount + bKash number → submit
9. Log in as `admin@example.com` → see withdrawal in admin panel → approve
10. Log back in as the user → withdrawal status is now "approved"
```

## Production deployment

Pushes to `main` trigger GitHub Actions which:

1. Lint, syntax-check, build, and test the code
2. Build the Ghost.js bundle (`earnap-client/dist/`)
3. Run `composer install` + `composer remove aws/aws-sdk-php` to produce a 12 MB vendor/
4. `lftp --mirror` to `ftp.jmjob.xyz/public_html/` (skips unchanged files via `--ignore-time`)

After the first deploy, visit `https://jmjob.xyz/migration_runner.php` once to apply migrations. Delete the file from the server after it runs.
