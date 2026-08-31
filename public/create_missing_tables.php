<?php
declare(strict_types=1);

/**
 * Temporary production schema bootstrap endpoint.
 *
 * The canonical migration implementation lives in ../migration_runner.php.
 * This public entrypoint exists because the application is deployed with
 * public/ flattened into public_html while the project runtime stays one
 * directory above the document root.
 *
 * Run once with:
 *   curl -X POST https://your-domain.example/create_missing_tables.php
 *
 * If MIGRATION_TOKEN is set in .env, pass it as ?token=... or in the POST
 * body. Delete this file from the server after the migration completes.
 */

$isCli = PHP_SAPI === 'cli';
if (!$isCli && ($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    http_response_code(405);
    header('Allow: POST');
    header('Content-Type: text/plain; charset=utf-8');
    echo "Use POST to run the database migrations.\n";
    exit;
}

$runner = dirname(__DIR__) . '/migration_runner.php';
if (!is_file($runner)) {
    http_response_code(500);
    header('Content-Type: text/plain; charset=utf-8');
    echo "Migration runner not found.\n";
    exit(1);
}

require $runner;
