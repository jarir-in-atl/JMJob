<?php
declare(strict_types=1);

/**
 * deploy.php — One-click deployment script (no shell_exec needed)
 *
 * Visit https://jmjob.xyz/deploy.php?token=YOUR_SECRET
 *
 * SECURITY: DELETE this file after deployment!
 */

error_reporting(E_ALL);
ini_set('display_errors', '1');

$ROOT = __DIR__;

// Load .env for token check
if (is_file($ROOT . '/.env')) {
    foreach (file($ROOT . '/.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        if (str_starts_with(trim($line), '#') || !str_contains($line, '=')) continue;
        [$key, $value] = explode('=', $line, 2);
        putenv(trim($key) . '=' . trim($value, " \t\"'"));
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
echo "Project root:  $ROOT\n";
echo "Timestamp:     " . date('Y-m-d H:i:s T') . "\n\n";

// Helper: copy a file from source to destination, creating dirs as needed
function deployCopy(string $src, string $dest): bool {
    $destDir = dirname($dest);
    if (!is_dir($destDir)) {
        mkdir($destDir, 0755, true);
    }
    return copy($src, $dest);
}

// Helper: check file status
function checkFile(string $path, string $label): void {
    if (is_file($path)) {
        $size = filesize($path);
        $modified = date('Y-m-d H:i:s', filemtime($path));
        echo "  ✅ {$label} — {$size} bytes (modified: {$modified})\n";
    } else {
        echo "  ❌ {$label} — MISSING\n";
    }
}

// ============================================================
// Step 1: Update static assets from git working tree
// ============================================================
echo "▶ Step 1: Updating static assets...\n\n";

// Check if we're in a git repo
$isGitRepo = is_dir($ROOT . '/.git');

if ($isGitRepo) {
    // Try to use git to checkout the latest files
    // Since exec() is disabled, we check if files exist in the working tree
    // and the user needs to run git pull manually or via SSH

    echo "  ℹ Git repo detected. To update files, run:\n";
    echo "     cd $ROOT && git pull origin main\n\n";
    echo "  ⚠ If you don't have SSH access, upload these files manually:\n";
} else {
    echo "  ℹ No git repo found. Upload files manually to:\n";
    echo "     $ROOT/public/css/app.css\n";
    echo "     $ROOT/public/js/app.js\n\n";
}

// ============================================================
// Step 2: Verify critical files
// ============================================================
echo "▶ Step 2: Checking files...\n\n";

$checks = [
    ['public/css/app.css', 'CSS (dark theme)'],
    ['public/js/app.js', 'JS bundle'],
    ['views/app.blade.php', 'Blade template'],
    ['app/Http/Controllers/Api/DailyBonusController.php', 'DailyBonusController'],
    ['app/Http/Controllers/Api/AuthController.php', 'AuthController'],
    ['app/Http/Controllers/Api/UserController.php', 'UserController'],
    ['routes/api.php', 'API routes'],
];

$missingFiles = [];
foreach ($checks as [$file, $label]) {
    $fullPath = $ROOT . '/' . $file;
    if (is_file($fullPath)) {
        $size = filesize($fullPath);
        $modified = date('Y-m-d H:i:s', filemtime($fullPath));
        $content = file_get_contents($fullPath, false, null, 0, 100);

        // Check if CSS has dark theme
        if ($file === 'public/css/app.css') {
            if (str_contains($content, '--bg-main')) {
                echo "  ✅ {$label} — Dark theme detected\n";
            } else {
                echo "  ⚠ {$label} — OLD version (light theme). Upload new CSS!\n";
                $missingFiles[] = $file;
            }
        }
        // Check if JS has sidebar
        elseif ($file === 'public/js/app.js') {
            if (str_contains(file_get_contents($fullPath) ?: '', 'sidebar__item')) {
                echo "  ✅ {$label} — New sidebar detected\n";
            } else {
                echo "  ⚠ {$label} — OLD version. Upload new JS!\n";
                $missingFiles[] = $file;
            }
        }
        else {
            echo "  ✅ {$label} — {$size} bytes (modified: {$modified})\n";
        }
    } else {
        echo "  ❌ {$label} — MISSING\n";
        $missingFiles[] = $file;
    }
}

echo "\n";

// ============================================================
// Step 3: Run migrations (if possible)
// ============================================================
echo "▶ Step 3: Database migrations\n\n";

// Check if migration_runner.php exists
if (is_file($ROOT . '/migration_runner.php')) {
    echo "  ℹ migration_runner.php exists.\n";
    echo "  → Run it at: https://jmjob.xyz/migration_runner.php\n";
} else {
    echo "  ⚠ migration_runner.php not found\n";
}

echo "\n";

// ============================================================
// Step 4: Summary
// ============================================================
echo "============================================================\n";

if (!empty($missingFiles)) {
    echo "  ⚠ ACTION REQUIRED — Upload updated files:\n\n";
    foreach ($missingFiles as $f) {
        echo "    📁 $ROOT/$f\n";
    }
    echo "\n  Download from your local machine:\n";
    echo "    /home/jarir-ahmed/Downloads/JMJob/public/css/app.css\n";
    echo "    /home/jarir-ahmed/Downloads/JMJob/public/js/app.js\n";
} else {
    echo "  ✅ All files look good!\n";
}

echo "============================================================\n";

echo "\n⚠ DELETE this file after deployment:\n";
echo "  rm " . realpath(__FILE__) . "\n";
