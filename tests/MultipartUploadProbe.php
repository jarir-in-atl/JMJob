<?php
declare(strict_types=1);

// Temporary local HTTP probe for real multipart upload verification.
// It is intentionally not mounted by the application routes.

require_once __DIR__ . '/../vendor/autoload.php';

use Nemesis\Http\UploadedFile;
use Nemesis\Support\FileValidator;

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    header('Content-Type: text/plain; charset=utf-8');
    echo "POST a multipart field named proof.\n";
    exit;
}

$destination = '/tmp/jmjob-upload-probe';
$file = UploadedFile::fromGlobal('proof');
$result = FileValidator::image($file, $destination, 'probe', 10, 'proof');

$moved = [];
if (is_dir($destination)) {
    foreach (glob($destination . '/*') ?: [] as $path) {
        if (is_file($path)) {
            $moved[] = basename($path);
            @unlink($path);
        }
    }
    @rmdir($destination);
}

header('Content-Type: application/json; charset=utf-8');
echo json_encode([
    'success' => $result->success,
    'error' => $result->error,
    'moved_files' => $moved,
], JSON_UNESCAPED_SLASHES);
