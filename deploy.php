<?php
declare(strict_types=1);

/**
 * deploy.php — One-click deployment script
 *
 * Visit https://jmjob.xyz/deploy.php to pull latest code and update assets.
 *
 * SECURITY: DELETE this file after deployment!
 * Or set DEPLOY_TOKEN in .env to require ?token=...
 *
 * Usage:
 *   - Visit https://jmjob.xyz/deploy.php in browser
 *   - curl -X POST https://jmjob.xyz/deploy.php
 *   - curl -X POST https://jmjob.xyz/deploy.php?token=YOUR_SECRET
 */

error_reporting(E_ALL);
ini_set('display_errors', '1');

$ROOT = __DIR__;

// Find project root
$candidateRoots = [
    $ROOT,
    dirname($ROOT),
];
$projectRoot = null;
foreach ($candidateRoots as $c) {
    if (is_file($c . '/vendor/autoload.php') && is_dir($c . '/.git')) {
        $projectRoot = $c;
        break;
    }
}
if ($projectRoot === null) {
    $projectRoot = $ROOT;
}

// Load .env for token check
if (is_file($projectRoot . '/.env')) {
    foreach (file($projectRoot . '/.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        if (str_starts_with($line, '#')) continue;
        if (!str_contains($line, '=')) continue;
        [$key, $value] = explode('=', $line, 2);
        $key = trim($key);
        $value = trim($value, " \t\"'");
        if (getenv($key) === false || getenv($key) === '') {
            putenv("$key=$value");
        }
    }
}

// Token gate
$requiredToken = getenv('DEPLOY_TOKEN') ?: '';
if ($requiredToken !== '') {
    $provided = $_GET['token'] ?? $_POST['token'] ?? '';
    if (!hash_equals($requiredToken, (string) $provided)) {
        http_response_code(403);
        die("❌ Forbidden. Provide ?token=YOUR_SECRET to deploy.");
    }
}

header('Content-Type: text/plain; charset=utf-8');

echo "============================================================\n";
echo "  JMJob — Deployment Script\n";
echo "============================================================\n\n";
echo "Project root:  $projectRoot\n";
echo "Timestamp:     " . date('Y-m-d H:i:s T') . "\n\n";

// Helper to run shell commands
function run(string $cmd, string $cwd): string {
    $output = [];
    $exitCode = 0;
    exec("cd " . escapeshellarg($cwd) . " && $cmd 2>&1", $output, $exitCode);
    return implode("\n", $output) . ($exitCode !== 0 ? "\n[exit code: $exitCode]" : "");
}

// 1. Pull latest code
echo "▶ Step 1: Pulling latest code from git...\n\n";
echo run("git pull origin main", $projectRoot);
echo "\n\n";

// 2. Build frontend assets
echo "▶ Step 2: Building frontend assets...\n\n";
if (is_dir($projectRoot . '/earnap-client/node_modules')) {
    echo run("npm run build", $projectRoot . '/earnap-client');
} else {
    echo "⚠ Skipping build — node_modules not found. Run 'npm install' in earnap-client/ first.\n";
}
echo "\n\n";

// 3. Run migrations
echo "▶ Step 3: Running database migrations...\n\n";
if (is_file($projectRoot . '/migration_runner.php')) {
    // Migrations are run via CLI to avoid HTTP output issues
    echo run("php migration_runner.php", $projectRoot);
} else {
    echo "⚠ migration_runner.php not found, skipping.\n";
}
echo "\n\n";

// 4. Verify deployment
echo "▶ Step 4: Verifying deployment...\n\n";

$checks = [
    ['public/css/app.css', 'CSS file'],
    ['public/js/app.js', 'JS bundle'],
    ['views/app.blade.php', 'Blade template'],
    ['app/Http/Controllers/Api/DailyBonusController.php', 'DailyBonusController'],
    ['app/Http/Controllers/Api/AuthController.php', 'AuthController'],
];

$allPassed = true;
foreach ($checks as [$file, $label]) {
    $fullPath = $projectRoot . '/' . $file;
    if (is_file($fullPath)) {
        $size = filesize($fullPath);
        $modified = date('Y-m-d H:i:s', filemtime($fullPath));
        echo "  ✅ {$label} — {$size} bytes (modified: {$modified})\n";
    } else {
        echo "  ❌ {$label} — MISSING\n";
        $allPassed = false;
    }
}

echo "\n";

if ($allPassed) {
    echo "============================================================\n";
    echo "  ✅ Deployment complete!\n";
    echo "============================================================\n";
} else {
    echo "============================================================\n";
    echo "  ⚠ Deployment completed with warnings.\n";
    echo "============================================================\n";
}

echo "\nIMPORTANT: DELETE this file from the server now:\n";
echo "  rm " . realpath(__FILE__) . "\n";
echo "\nOr set DEPLOY_TOKEN in .env to require ?token=...\n";
