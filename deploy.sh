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

# Upload CSS (with cache-busting filename)
put $LOCAL_ROOT/public/css/app-v2.css -o $SERVER_ROOT/css/app-v2.css
put $LOCAL_ROOT/public/css/app.css -o $SERVER_ROOT/css/app.css

# Upload JS (with cache-busting filename)
put $LOCAL_ROOT/public/js/app-v2.js -o $SERVER_ROOT/js/app-v2.js
put $LOCAL_ROOT/public/js/app.js -o $SERVER_ROOT/js/app.js

# Upload Blade template
put $LOCAL_ROOT/views/app.blade.php -o views/app.blade.php

# Upload deploy script
put $LOCAL_ROOT/deploy.php -o deploy.php
put $LOCAL_ROOT/deploy.sh -o deploy.sh

# Upload migration runner
put $LOCAL_ROOT/migration_runner.php -o migration_runner.php

# Upload new PHP files
put $LOCAL_ROOT/app/Http/Controllers/Api/DailyBonusController.php -o app/Http/Controllers/Api/DailyBonusController.php
put $LOCAL_ROOT/app/Http/Controllers/Api/AuthController.php -o app/Http/Controllers/Api/AuthController.php

# Upload routes
put $LOCAL_ROOT/routes/api.php -o routes/api.php

# Upload migrations
put $LOCAL_ROOT/database/migrations/2026_09_01_000001_add_daily_bonus_claim_to_users.php -o database/migrations/2026_09_01_000001_add_daily_bonus_claim_to_users.php
put $LOCAL_ROOT/database/migrations/2026_09_01_000002_create_password_reset_tokens_table.php -o database/migrations/2026_09_01_000002_create_password_reset_tokens_table.php

# Verify uploads
ls -l $SERVER_ROOT/css/app-v2.css
ls -l $SERVER_ROOT/js/app-v2.js
ls -l views/app.blade.php

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
echo -e "  📜 JS:     $SERVER_ROOT/js/app-v2.js"
echo -e "  📄 Blade:  views/app.blade.php"
echo ""

# ============================================================
# Summary
# ============================================================
echo -e "${BLUE}============================================================${NC}"
echo -e "${GREEN}  ✅ Deployment complete!${NC}"
echo -e "${BLUE}============================================================${NC}"
echo ""
echo -e "  Hard refresh (Ctrl+Shift+R) to see changes."
echo ""
echo -e "  Next: Run migrations at:"
echo -e "  https://jmjob.xyz/migration_runner.php"
echo ""
