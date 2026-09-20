#!/usr/bin/env bash
set -euo pipefail

SITE_URL="${SITE_URL:?SITE_URL is required}"
SITE_URL="${SITE_URL%/}"

check_response() {
    local path="$1"
    local expected_status="$2"
    local expected_content="$3"
    local response status content_type

    response="$(curl -sS --retry 2 --retry-delay 2 --max-time 20 \
        -o /dev/null -w '%{http_code}|%{content_type}' "$SITE_URL$path")"
    status="${response%%|*}"
    content_type="${response#*|}"

    if [[ "$status" != "$expected_status" || "$content_type" != *"$expected_content"* ]]; then
        echo "❌ Live smoke failed for $path: received HTTP $status ($content_type), expected HTTP $expected_status ($expected_content)." >&2
        exit 1
    fi

    echo "✅ $path -> HTTP $status ($content_type)"
}

check_response '/' '200' 'text/html'
check_response '/api/health' '200' 'application/json'
check_response '/api/social-links' '200' 'application/json'
check_response '/api/jobs' '401' 'application/json'
check_response '/api/admin/stats' '401' 'application/json'
check_response '/js/app.js' '200' 'javascript'

migration_status="$(curl -fsS --retry 2 --retry-delay 2 --max-time 20 \
    "$SITE_URL/migration_runner.php?action=status")"
if ! grep -Fxq 'Pending: 0' <<< "$migration_status"; then
    echo "❌ Live migration status is not clean; expected Pending: 0." >&2
    echo "$migration_status" >&2
    exit 1
fi
echo '✅ /migration_runner.php?action=status -> Pending: 0'
