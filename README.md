# JMJob

> A full functional clone of [earnapp339.imrantechnology.xyz](https://earnapp339.imrantechnology.xyz/) — a Telegram Mini App for watching ads, completing tasks, and earning rewards — rebuilt as a plain website on **Nemesis v7.1.1** (backend) + **Ghost.js** (frontend).

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

# 3. Frontend build
cd earnap-client
npm install
npx esbuild src/index.js --bundle --minify --format=esm \
    --target=es2020 --outfile=../public/js/app.js

# 4. Serve
cd ..
php -S 127.0.0.1:8080 -t public/
```

Open http://127.0.0.1:8080/.

## Demo accounts

| Email | Password | Role | Balance |
|---|---|---|---|
| `admin@example.com` | `password` | Admin | $0.00 |
| `alice@example.com` | `password` | User (referrer) | $1.234 |
| `bob@example.com` | `password` | User (referred by Alice) | $0.42 |
| `carol@example.com` | `password` | User (referred by Alice) | $0.10 |

## Production deploy

1. `git push` to `main`
2. GitHub Actions builds and FTPs to the server
3. Visit `https://jmjob.xyz/migration_runner.php` ONCE to apply DB migrations
4. Delete `migration_runner.php` from the server

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
├── migration_runner.php     # ONE-TIME migration script
└── .github/workflows/       # CI/CD
```

See [EARNAPP_README.md](EARNAPP_README.md) for the full feature/endpoint reference.
# JMJob
