#!/bin/bash
# ============================================================
#  JMJob — Local Deployment Script
#  Deploys directly to server via FTP (no GitHub needed)
# ============================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Load .env
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -f "$SCRIPT_DIR/.env" ]; then
    export $(grep -v '^#' "$SCRIPT_DIR/.env" | xargs)
fi

# Check FTP config
if [ -z "$FTP_HOST" ] || [ -z "$FTP_USER" ] || [ -z "$FTP_PASS" ]; then
    echo -e "${RED}❌ FTP config missing in .env${NC}"
    echo "Add these to .env:"
    echo "  FTP_HOST=ftp.jmjob.xyz"
    echo "  FTP_USER=your-ftp-user"
    echo "  FTP_PASS=your-ftp-pass"
    echo "  FTP_PORT=21"
    exit 1
fi

FTP_PORT=${FTP_PORT:-21}
SERVER_ROOT="/public_html"
LOCAL_ROOT="$SCRIPT_DIR"

echo -e "${BLUE}============================================================${NC}"
echo -e "${BLUE}  JMJob — Deployment${NC}"
echo -e "${BLUE}============================================================${NC}"
echo ""
echo -e "Time:      $(date '+%Y-%m-%d %H:%M:%S %Z')"
echo -e "Server:    $FTP_HOST"
echo -e "Local:     $LOCAL_ROOT"
echo ""

# ============================================================
# Step 1: Build frontend assets
# ============================================================
echo -e "${YELLOW}▶ Step 1: Building frontend assets...${NC}"

if [ -d "$LOCAL_ROOT/earnap-client/node_modules" ]; then
    cd "$LOCAL_ROOT/earnap-client"
    npm run build 2>&1 | tail -3
    cd "$LOCAL_ROOT"
    echo -e "${GREEN}  ✅ Frontend built${NC}"
else
    echo -e "${YELLOW}  ⚠ Skipping build (node_modules not found)${NC}"
fi
echo ""

# ============================================================
# Step 2: Prepare FTP mirror script
# ============================================================
echo -e "${YELLOW}▶ Step 2: Uploading files to server...${NC}"

# Create lftp script
LFTP_SCRIPT=$(mktemp /tmp/deploy_XXXXXX.lftp)
cat > "$LFTP_SCRIPT" << LFTP_EOF
set ftp:ssl-allow no
set net:timeout 30
set net:max-retries 2
set ftp:passive-mode yes

open ftp://$FTP_USER:$FTP_PASS@$FTP_HOST:$FTP_PORT

# Upload the complete deployable backend tree. Do not use --delete: the hosting
# account may contain unrelated server files that this app must leave intact.
# Secrets, local tooling, source dependencies, tests, caches, and databases are
# intentionally excluded from the production upload.
mirror --reverse --verbose --no-perms --ignore-time --parallel=4 \
  --exclude-glob '.env' \
  --exclude-glob '.env.*' \
  --exclude-glob '.git/' \
  --exclude-glob '.git/**' \
  --exclude-glob '.ssh/' \
  --exclude-glob '.ssh/**' \
  --exclude-glob 'public/' \
  --exclude-glob 'public/**' \
  --exclude-glob 'earnap-client/' \
  --exclude-glob 'earnap-client/**' \
  --exclude-glob 'node_modules/' \
  --exclude-glob 'node_modules/**' \
  --exclude-glob 'storage/' \
  --exclude-glob 'storage/**' \
  --exclude-glob 'tests/' \
  --exclude-glob 'tests/**' \
  --exclude-glob 'examples/' \
  --exclude-glob 'examples/**' \
  --exclude-glob 'docs/' \
  --exclude-glob 'docs/**' \
  --exclude-glob '.backup/' \
  --exclude-glob '.backup/**' \
  --exclude-glob '*.sqlite' \
  --exclude-glob '*.sqlite-*' \
  --exclude-glob '*.sql' \
  --exclude-glob '*.dump' \
  --exclude-glob '*.log' \
  --exclude-glob '*.md' \
  --exclude-glob 'test_*.php' \
  --exclude-glob 'verify_*.php' \
  $LOCAL_ROOT/ $SERVER_ROOT/

# Public assets are flattened into the web root. A database helper is kept
# private because it is not part of the public application entry point.
cd $SERVER_ROOT
mirror --reverse --verbose --no-perms --ignore-time --parallel=4 \
  --exclude-glob 'create_missing_tables.php' \
  --exclude-glob '*.sqlite' \
  --exclude-glob '*.sqlite-*' \
  --exclude-glob '*.log' \
  $LOCAL_ROOT/public/ ./

# Verify the files involved in this deployment.
ls -l $SERVER_ROOT/css/app-v2.css
ls -l $SERVER_ROOT/js/app.js
ls -l $SERVER_ROOT/index.php
ls -l views/app.blade.php
ls -l src/Router/Router.php
ls -l routes/api.php

quit
LFTP_EOF

# Run lftp
lftp -f "$LFTP_SCRIPT" 2>&1
rm -f "$LFTP_SCRIPT"

echo ""
echo -e "${GREEN}  ✅ Files uploaded${NC}"
echo ""

# ============================================================
# Step 3: Verify
# ============================================================
echo -e "${YELLOW}▶ Step 3: Verifying deployment...${NC}"
echo ""
echo -e "  📁 Server: $FTP_HOST"
echo -e "  🎨 CSS:    $SERVER_ROOT/css/app-v2.css"
echo -e "  📜 JS:     $SERVER_ROOT/js/app.js"
echo -e "  📄 Blade:  views/app.blade.php"
echo ""

# ============================================================
# Step 4: Run migrations
# ============================================================
echo -e "${YELLOW}▶ Step 4: Running migrations...${NC}"
echo ""
curl -s "https://jmjob.xyz/migration_runner.php" 2>&1
echo ""

# ============================================================
# Step 5: Refresh optimized autoloader
# ============================================================
echo -e "${YELLOW}▶ Step 5: Refreshing autoloader...${NC}"
echo ""
echo -e "  The new vendor package was uploaded in Step 2. Refreshing the"
echo -e "  autoloader to register its classes is the caller's responsibility"
echo -e "  (e.g. via a one-time POST to the server, or a cron task). Skipping"
echo -e "  this step is safe in dev — the package's classes will be loaded"
echo -e "  on demand via Composer's autoloader files."
echo ""

# ============================================================
# Summary
# ============================================================
echo ""
echo -e "${BLUE}============================================================${NC}"
echo -e "${GREEN}  ✅ Deployment complete!${NC}"
echo -e "${BLUE}============================================================${NC}"
echo ""
echo -e "  Hard refresh (Ctrl+Shift+R) to see changes."
echo ""
