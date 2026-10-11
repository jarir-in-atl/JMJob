#!/bin/bash
# ============================================================
#  JMJob — Local Deployment Script
#  Deploys directly to server via FTP (no GitHub needed)
#  Normal runs upload files changed since the last successful local deploy.
#  Use ./deploy.sh --full to force a full sync or --check for a read-only comparison.
# ============================================================

set -e

DEPLOY_STARTED_AT=$(date +%s)
DEPLOY_STARTED_DISPLAY=$(date '+%Y-%m-%d %H:%M:%S %Z')

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
FORCE_FULL_SYNC=false
while [ $# -gt 0 ]; do
    case "$1" in
        --check) CHECK_ONLY=true; shift ;;
        --full) FORCE_FULL_SYNC=true; shift ;;
        *) break ;;
    esac
done

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_deployment_timing() {
    local finished_at finished_display elapsed_seconds elapsed_minutes elapsed_remainder
    finished_at=$(date +%s)
    finished_display=$(date '+%Y-%m-%d %H:%M:%S %Z')
    elapsed_seconds=$((finished_at - DEPLOY_STARTED_AT))
    elapsed_minutes=$((elapsed_seconds / 60))
    elapsed_remainder=$((elapsed_seconds % 60))

    echo -e "  Deployment Started: ${DEPLOY_STARTED_DISPLAY}"
    echo -e "  Hard refresh (Ctrl+Shift+R) to see changes."
    echo -e "  Deployment Finished: ${finished_display}"
    printf '  Estimated Time Taken: %02d min %02d sec\n' "$elapsed_minutes" "$elapsed_remainder"
}

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
cd "$LOCAL_ROOT"
DEPLOY_STATE_FILE="$LOCAL_ROOT/.deploy-state"
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
echo -e "Deployment Started: $(date '+%Y-%m-%d %H:%M:%S %Z')"
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
echo ""

FULL_SYNC_MODE=false
FULL_SYNC_REASON=""
CHANGED_FILES=()
declare -A SEEN_CHANGED_FILES=()

is_deploy_excluded() {
    local path="$1"
    local base_name="${path##*/}"

    if [[ "$path" == public/* ]]; then
        case "$base_name" in
            create_missing_tables.php|index.php|index.html|*.sqlite*|*.log) return 0 ;;
        esac
        return 1
    fi

    case "/$path/" in
        */.git/*|*/vendor/*|*/node_modules/*|*/storage/*|*/public/*|*/earnap-client/*|*/tests/*|*/examples/*|*/docs/*|*/.backup/*|*/.vscode/*|*/.idea/*|*/.github/*|*/.kilo/*|*/.codex/*|*/.agents/*)
            return 0
            ;;
    esac

    case "$base_name" in
        .env*|.deploy-state*|*.sqlite*|*.sql|*.dump|*.log|*.md|test_*.php|verify_*.php|8)
            return 0
            ;;
    esac

    return 1
}

queue_changed_file() {
    local path="$1"
    if [ -z "$path" ] || [ -n "${SEEN_CHANGED_FILES["$path"]+present}" ]; then
        return
    fi
    SEEN_CHANGED_FILES["$path"]=1

    if is_deploy_excluded "$path" || [ ! -f "$LOCAL_ROOT/$path" ]; then
        return
    fi

    CHANGED_FILES+=("$path")
}

quote_for_lftp() {
    local value="$1"
    value="${value//\\/\\\\}"
    value="${value//\"/\\\"}"
    value="${value//\$/\\\$}"
    printf '"%s"' "$value"
}

if [ "$CHECK_ONLY" = true ]; then
    # Keep --check as a full, read-only remote comparison.
    FULL_SYNC_MODE=true
    FULL_SYNC_REASON="read-only full-tree comparison requested"
elif [ "$FORCE_FULL_SYNC" = true ]; then
    FULL_SYNC_MODE=true
    FULL_SYNC_REASON="full sync requested with --full"
elif [ ! -s "$DEPLOY_STATE_FILE" ]; then
    FULL_SYNC_MODE=true
    FULL_SYNC_REASON="no successful local deploy baseline exists yet"
else
    LAST_DEPLOYED_COMMIT=$(head -n 1 "$DEPLOY_STATE_FILE")
    CURRENT_HEAD=$(git rev-parse HEAD)
    if [[ ! "$LAST_DEPLOYED_COMMIT" =~ ^[0-9a-fA-F]{40,64}$ ]] || ! git cat-file -e "${LAST_DEPLOYED_COMMIT}^{commit}" 2>/dev/null; then
        FULL_SYNC_MODE=true
        FULL_SYNC_REASON="saved deploy baseline is invalid or unavailable"
    elif ! git merge-base --is-ancestor "$LAST_DEPLOYED_COMMIT" "$CURRENT_HEAD"; then
        FULL_SYNC_MODE=true
        FULL_SYNC_REASON="current Git history diverged from the saved deploy baseline"
    else
        while IFS= read -r -d '' changed_path; do
            queue_changed_file "$changed_path"
        done < <(git diff --name-only --no-renames --diff-filter=ACMRT -z "$LAST_DEPLOYED_COMMIT" --)

        while IFS= read -r -d '' changed_path; do
            queue_changed_file "$changed_path"
        done < <(git ls-files --others --exclude-standard -z)
    fi
fi

if [ "$FULL_SYNC_MODE" = true ]; then
    echo -e "  ${YELLOW}Full FTP mirror: ${FULL_SYNC_REASON}${NC}"
else
    echo -e "  Incremental FTP: ${#CHANGED_FILES[@]} changed file(s); unchanged folders will not be scanned."
fi
echo ""

# A full mirror is used for the first successful deploy, explicit --full syncs,
# and --check. Ordinary deploys put only files in the local Git delta.
LFTP_SCRIPT=$(mktemp /tmp/deploy_XXXXXX.lftp)
trap 'rm -f "$LFTP_SCRIPT"' EXIT
cat > "$LFTP_SCRIPT" << LFTP_EOF
set ftp:ssl-allow no
set net:timeout 30
set net:max-retries 2
set ftp:passive-mode yes
open ftp://$FTP_USER:$FTP_PASS@$FTP_HOST:$FTP_PORT
LFTP_EOF

if [ "$FULL_SYNC_MODE" = true ]; then
    # 1. Backend files (skip public/ which is flattened below)
    find "$LOCAL_ROOT" \
      \( -name ".git" -o -name "vendor" -o -name "node_modules" -o -name "storage" -o -name "public" -o -name "earnap-client" -o -name "tests" -o -name "examples" -o -name "docs" -o -name ".backup" -o -name ".vscode" -o -name ".idea" -o -name ".github" -o -name ".kilo" -o -name ".codex" -o -name ".agents" \) -prune \
      -o -type d -print | sort | while read DIR; do
        REL_DIR="${DIR#$LOCAL_ROOT/}"
        if [ "$REL_DIR" = "$LOCAL_ROOT" ]; then REL_DIR="."; fi

        echo "echo \"FOLDER: $REL_DIR\"" >> "$LFTP_SCRIPT"
        echo "mirror --no-recursion --reverse --verbose --no-perms --ignore-time --only-newer $MIRROR_MODE \\" >> "$LFTP_SCRIPT"
        echo "  --exclude-glob '.env*' --exclude-glob '.deploy-state*' --exclude-glob '*.sqlite*' --exclude-glob '*.sql' --exclude-glob '*.dump' --exclude-glob '*.log' --exclude-glob '*.md' --exclude-glob 'test_*.php' --exclude-glob 'verify_*.php' --exclude-glob '8' \\" >> "$LFTP_SCRIPT"
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
else
    declare -A CREATED_REMOTE_DIRS=()
    for changed_path in "${CHANGED_FILES[@]}"; do
        if [[ "$changed_path" == public/* ]]; then
            remote_relative_path="${changed_path#public/}"
        else
            remote_relative_path="$changed_path"
        fi

        remote_directory="$SERVER_ROOT"
        if [[ "$remote_relative_path" == */* ]]; then
            remote_directory="$SERVER_ROOT/${remote_relative_path%/*}"
        fi

        if [ -z "${CREATED_REMOTE_DIRS["$remote_directory"]+present}" ]; then
            printf 'mkdir -p %s\n' "$(quote_for_lftp "$remote_directory")" >> "$LFTP_SCRIPT"
            CREATED_REMOTE_DIRS["$remote_directory"]=1
        fi
        printf 'put -O %s %s\n' \
            "$(quote_for_lftp "$remote_directory")" \
            "$(quote_for_lftp "$LOCAL_ROOT/$changed_path")" >> "$LFTP_SCRIPT"
    done
fi

echo "cd $SERVER_ROOT" >> "$LFTP_SCRIPT"

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
    echo -e "${GREEN}  ✅ Read-only FTP comparison complete${NC}"
elif [ "$FULL_SYNC_MODE" = true ]; then
    echo -e "${GREEN}  ✅ Full FTP mirror complete${NC}"
elif [ "${#CHANGED_FILES[@]}" -eq 0 ]; then
    echo -e "${GREEN}  ✅ No changed files needed uploading${NC}"
else
    echo -e "${GREEN}  ✅ Changed files uploaded${NC}"
fi
echo ""

if [ "$CHECK_ONLY" = true ]; then
    echo -e "${GREEN}  ✅ Read-only FTP preflight complete; migrations and Git operations were skipped${NC}"
    print_deployment_timing
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

# Record the deployed revision only after FTP, migrations, smoke checks, and the
# existing Git handoff all complete. Failed runs therefore retry their delta.
DEPLOYED_COMMIT=$(git rev-parse HEAD)
DEPLOY_STATE_TEMP="${DEPLOY_STATE_FILE}.tmp.$$"
printf '%s\n' "$DEPLOYED_COMMIT" > "$DEPLOY_STATE_TEMP"
mv -f "$DEPLOY_STATE_TEMP" "$DEPLOY_STATE_FILE"
echo -e "  ${GREEN}✅ Incremental deploy baseline saved${NC}"
echo ""

# ============================================================
# Summary
# ============================================================
echo ""
echo -e "${BLUE}============================================================${NC}"
echo -e "${GREEN}  ✅ Deployment & Git push complete!${NC}"
echo -e "${BLUE}============================================================${NC}"
echo ""
print_deployment_timing
echo ""
