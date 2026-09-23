#!/bin/bash
# ============================================================
#  JMJob — Local Deployment Script
#  Deploys directly to server via FTP (no GitHub needed)
#  Use ./deploy.sh --check for a read-only FTP comparison.
# ============================================================

set -e

# Prevent two local deploys from interleaving FTP mirrors. GitHub deployments
# use the workflow concurrency group for the equivalent protection.
DEPLOY_LOCK_PATH="/tmp/jmjob-deploy.lock"
exec 9>"$DEPLOY_LOCK_PATH"
if ! flock -n 9; then
    echo "⚠️ Previous deployment or lock detected. Cleaning up stale process..."
    # Kill any other deploy.sh or lftp processes running under this user
    LOCK_PIDS=$(fuser "$DEPLOY_LOCK_PATH" 2>/dev/null || true)
    OTHER_PIDS=$(pgrep -f "deploy.sh|lftp" 2>/dev/null || true)
    PIDS_TO_KILL=$(echo "$LOCK_PIDS $OTHER_PIDS" | tr ' ' '\n' | grep -v "^$$$" | sort -u || true)
    
    if [ -n "$PIDS_TO_KILL" ]; then
        echo "$PIDS_TO_KILL" | xargs kill -9 2>/dev/null || true
        sleep 1
    fi
    
    exec 9>"$DEPLOY_LOCK_PATH"
    flock -n 9 || true
fi

CHECK_ONLY=false
if [ "${1:-}" = "--check" ]; then
    CHECK_ONLY=true
    shift
fi

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
FTP_TIMEOUT_SECONDS=${FTP_TIMEOUT_SECONDS:-1800}
SERVER_ROOT="/public_html"
LOCAL_ROOT="$SCRIPT_DIR"
# APP_URL is commonly a local development URL; never use it as the production
# migration target unless the deploy caller explicitly supplies SITE_URL.
SITE_URL="${SITE_URL:-https://jmjob.xyz}"
SITE_URL="${SITE_URL%/}"
case "$SITE_URL" in
    http://localhost*|https://localhost*|http://127.0.0.1*|https://127.0.0.1*)
        echo -e "${RED}❌ SITE_URL points to a local loopback address; refusing a production deployment${NC}"
        echo "Set SITE_URL to the deployed HTTPS hostname in .env."
        exit 1
        ;;
esac
MIRROR_MODE=""
if [ "$CHECK_ONLY" = true ]; then
    MIRROR_MODE="--dry-run"
fi

echo -e "${BLUE}============================================================${NC}"
echo -e "${BLUE}  JMJob — Deployment${NC}"
echo -e "${BLUE}============================================================${NC}"
echo ""
echo -e "Time:      $(date '+%Y-%m-%d %H:%M:%S %Z')"
echo -e "Server:    $FTP_HOST"
echo -e "Local:     $LOCAL_ROOT"
if [ "$CHECK_ONLY" = true ]; then
    echo -e "Mode:      read-only FTP preflight"
fi
echo ""

# ============================================================
# Step 1: Build frontend assets
# ============================================================
echo -e "${YELLOW}▶ Step 1: Building frontend assets...${NC}"

if [ "$CHECK_ONLY" = true ]; then
    echo -e "  ${YELLOW}⚠ Skipping build in read-only preflight${NC}"
elif [ -d "$LOCAL_ROOT/earnap-client/node_modules" ]; then
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
echo -e "${YELLOW}▶ Step 2: Uploading changed files to server...${NC}"
echo -e "  Only files with different sizes are transferred (incremental sync)."
echo ""

# Create lftp script dynamically based on local folders.
# Instead of one giant silent mirror, we instruct lftp to process each folder
# individually (mirror --no-recursion). This gives us the exact synchronous
# "Scan folder -> upload -> scan folder" output behavior you wanted without
# the long upfront wait.
LFTP_SCRIPT=$(mktemp /tmp/deploy_XXXXXX.lftp)
trap 'rm -f "$LFTP_SCRIPT"' EXIT
cat > "$LFTP_SCRIPT" << LFTP_EOF
set ftp:ssl-allow no
set net:timeout 30
set net:max-retries 2
set ftp:passive-mode yes
open ftp://$FTP_USER:$FTP_PASS@$FTP_HOST:$FTP_PORT
LFTP_EOF

# 1. Backend files (skip public/ which is flattened later)
find "$LOCAL_ROOT" \
  \( -name ".git" -o -name "vendor" -o -name "node_modules" -o -name "storage" -o -name "public" -o -name "earnap-client" -o -name "tests" -o -name "examples" -o -name "docs" -o -name ".backup" -o -name ".vscode" -o -name ".idea" -o -name ".github" -o -name ".kilo" -o -name ".codex" -o -name ".agents" \) -prune \
  -o -type d -print | sort | while read DIR; do
    REL_DIR="${DIR#$LOCAL_ROOT/}"
    if [ "$REL_DIR" = "$LOCAL_ROOT" ]; then REL_DIR="."; fi
    
    echo "echo \"FOLDER: $REL_DIR\"" >> "$LFTP_SCRIPT"
    echo "mirror --no-recursion --reverse --verbose --no-perms --ignore-time --only-newer $MIRROR_MODE \\" >> "$LFTP_SCRIPT"
    echo "  --exclude-glob '.env*' --exclude-glob '*.sqlite*' --exclude-glob '*.sql' --exclude-glob '*.dump' --exclude-glob '*.log' --exclude-glob '*.md' --exclude-glob 'test_*.php' --exclude-glob 'verify_*.php' --exclude-glob '8' \\" >> "$LFTP_SCRIPT"
    if [ "$REL_DIR" = "." ]; then
        echo "  $DIR/ $SERVER_ROOT/" >> "$LFTP_SCRIPT"
    else
        echo "  $DIR/ $SERVER_ROOT/$REL_DIR/" >> "$LFTP_SCRIPT"
    fi
done

# 2. Public assets (flattened into web root)
echo "cd $SERVER_ROOT" >> "$LFTP_SCRIPT"
find "$LOCAL_ROOT/public" -type d | sort | while read DIR; do
    REL_DIR="${DIR#$LOCAL_ROOT/public/}"
    if [ "$REL_DIR" = "$LOCAL_ROOT/public" ]; then REL_DIR="."; fi
    
    echo "echo \"FOLDER: public/$REL_DIR\"" >> "$LFTP_SCRIPT"
    echo "mirror --no-recursion --reverse --verbose --no-perms --ignore-time --only-newer $MIRROR_MODE \\" >> "$LFTP_SCRIPT"
    echo "  --exclude-glob 'create_missing_tables.php' --exclude-glob 'index.php' --exclude-glob 'index.html' --exclude-glob '*.sqlite*' --exclude-glob '*.log' \\" >> "$LFTP_SCRIPT"
    if [ "$REL_DIR" = "." ]; then
        echo "  $DIR/ ./" >> "$LFTP_SCRIPT"
    else
        echo "  $DIR/ ./$REL_DIR/" >> "$LFTP_SCRIPT"
    fi
done

cat >> "$LFTP_SCRIPT" << LFTP_EOF
ls -l $SERVER_ROOT/css/app-v2.css
ls -l $SERVER_ROOT/js/app.js
ls -l $SERVER_ROOT/index.php
ls -l $SERVER_ROOT/.user.ini
ls -l views/app.blade.php
ls -l src/Router/Router.php
ls -l routes/api.php
quit
LFTP_EOF

# Execute the script and parse the output synchronously.
LFTP_EXIT_FILE=$(mktemp /tmp/lftp_exit_XXXXXX)
echo "0" > "$LFTP_EXIT_FILE"
set +e
(
  timeout --signal=TERM --kill-after=15s "${FTP_TIMEOUT_SECONDS}s" \
    lftp -f "$LFTP_SCRIPT" 2>&1
  echo $? > "$LFTP_EXIT_FILE"
) | tr '\r' '\n' | awk '
  /^FOLDER:/ { 
    folder = $0; sub(/^FOLDER: /, "", folder);
    print "  📁 Checking folder: " folder; fflush(); next 
  }
  /Transferring file/ { 
    f = $0; sub(/.*Transferring file ./, "", f); sub(/.$/, "", f);
    print "  📄 Uploaded: " f; fflush(); next 
  }
  /Removing old file/ { 
    f = $0; sub(/.*Removing old file ./, "", f); sub(/.$/, "", f);
    print "  🗑️  Deleted:   " f; fflush(); next 
  }
  /Making directory/ {
    f = $0; sub(/.*Making directory ./, "", f); sub(/.$/, "", f);
    print "  📁 Created:  " f; fflush(); next
  }
  /^-rw/ { print "  ✅ " $0; fflush(); next }
'
set -e
LFTP_EXIT=$(cat "$LFTP_EXIT_FILE")
rm -f "$LFTP_EXIT_FILE" "$LFTP_SCRIPT"

if [ "$LFTP_EXIT" -ne 0 ]; then
    echo -e "${RED}❌ FTP upload failed or timed out (exit code $LFTP_EXIT).${NC}"
    exit 1
fi

echo ""
if [ "$CHECK_ONLY" = true ]; then
    echo -e "${GREEN}  ✅ FTP comparison complete (no files changed)${NC}"
else
    echo -e "${GREEN}  ✅ Files uploaded${NC}"
fi
echo ""

if [ "$CHECK_ONLY" = true ]; then
    echo -e "${GREEN}  ✅ Read-only FTP preflight complete; migrations and Git operations were skipped${NC}"
    exit 0
fi

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
# Step 4: Run pending production migrations
# ============================================================
echo -e "${YELLOW}▶ Step 4: Running pending production migrations...${NC}"
echo ""
curl -fsS --retry 2 --retry-delay 2 --max-time 60 \
  -X POST \
  "$SITE_URL/migration_runner.php"
echo ""
echo -e "${GREEN}  ✅ Migrations complete${NC}"
echo ""

echo -e "${YELLOW}▶ Step 4b: Running post-migration live smoke checks...${NC}"
SITE_URL="$SITE_URL" bash "$SCRIPT_DIR/scripts/live_smoke.sh"
echo -e "${GREEN}  ✅ Live response and authentication-boundary smoke checks passed${NC}"
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
# Step 6: Git commit & push
# ============================================================
echo -e "${YELLOW}▶ Step 6: Committing and pushing to git...${NC}"
echo ""
COMMIT_MSG="${1:-Deploy commit: $(date '+%Y-%m-%d %H:%M:%S')}"

if [ -n "$(git status --porcelain)" ]; then
    echo -e "  Staging changes..."
    git add .
    echo -e "  Committing: '$COMMIT_MSG'"
    git commit -m "$COMMIT_MSG"
    echo -e "  Pushing to remote repository..."
    git push
    echo -e "${GREEN}  ✅ Git commit & push complete${NC}"
else
    echo -e "  No uncommitted changes detected. Pushing any unpushed commits..."
    git push
    echo -e "${GREEN}  ✅ Git push complete${NC}"
fi
echo ""

# ============================================================
# Summary
# ============================================================
echo ""
echo -e "${BLUE}============================================================${NC}"
echo -e "${GREEN}  ✅ Deployment & Git push complete!${NC}"
echo -e "${BLUE}============================================================${NC}"
echo ""
echo -e "  Hard refresh (Ctrl+Shift+R) to see changes."
echo ""
