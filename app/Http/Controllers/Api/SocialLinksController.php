<?php

namespace App\Http\Controllers\Api;

use Nemesis\Core\Controller;
use Nemesis\Http\Request;
use Nemesis\Http\Response;

class SocialLinksController extends Controller
{
    private function getFilePath(): string
    {
        if (function_exists('base_path')) {
            return base_path('storage/social_links.json');
        }
        return dirname(__DIR__, 3) . '/storage/social_links.json';
    }

    public function index(): Response
    {
        $filePath = $this->getFilePath();

        if (!file_exists($filePath)) {
            $default = [
                'facebook' => 'https://facebook.com',
                'instagram' => 'https://instagram.com',
                'whatsapp' => 'https://wa.me/',
                'telegram' => 'https://t.me/'
            ];
            file_put_contents($filePath, json_encode($default, JSON_PRETTY_PRINT));
            return Response::json($default);
        }

        $content = file_get_contents($filePath);
        $data = json_decode($content, true) ?? [];

        return Response::json($data);
    }

    public function update(Request $request): Response
    {
        $data = $request->all();
        $validated = [
            'facebook'  => isset($data['facebook']) ? (string)$data['facebook'] : '',
            'instagram' => isset($data['instagram']) ? (string)$data['instagram'] : '',
            'whatsapp'  => isset($data['whatsapp']) ? (string)$data['whatsapp'] : '',
            'telegram'  => isset($data['telegram']) ? (string)$data['telegram'] : '',
        ];

        $filePath = $this->getFilePath();
        file_put_contents($filePath, json_encode($validated, JSON_PRETTY_PRINT));

        return Response::json([
            'message' => 'Social media links updated successfully',
            'data' => $validated
        ]);
    }

    private function getNoticesFilePath(): string
    {
        if (function_exists('base_path')) {
            return base_path('storage/notices.json');
        }
        return dirname(__DIR__, 3) . '/storage/notices.json';
    }

    public function getNotices(): Response
    {
        $filePath = $this->getNoticesFilePath();

        if (!file_exists($filePath)) {
            $default = [
                'interval' => 4,
                'notices' => [
                    [
                        'text' => 'Complete tasks, watch ads, refer friends, and withdraw anytime.',
                        'image' => ''
                    ]
                ]
            ];
            file_put_contents($filePath, json_encode($default, JSON_PRETTY_PRINT));
            return Response::json($default);
        }

        $content = file_get_contents($filePath);
        $data = json_decode($content, true) ?? [];

        $rawNotices = is_array($data['notices'] ?? null) ? $data['notices'] : [];
        $noticesList = [];

        foreach ($rawNotices as $item) {
            if (is_array($item)) {
                $text = isset($item['text']) ? trim((string)$item['text']) : '';
                $image = isset($item['image']) ? trim((string)$item['image']) : '';
                if ($text !== '' || $image !== '') {
                    $noticesList[] = ['text' => $text, 'image' => $image];
                }
            } elseif (is_string($item) && trim($item) !== '') {
                // If it's a URL (starts with / or http), treat as image, otherwise text
                $val = trim($item);
                if (str_starts_with($val, '/') || str_starts_with($val, 'http')) {
                    $noticesList[] = ['text' => '', 'image' => $val];
                } else {
                    $noticesList[] = ['text' => $val, 'image' => ''];
                }
            }
        }

        return Response::json([
            'interval' => isset($data['interval']) ? (int)$data['interval'] : 4,
            'notices'  => $noticesList
        ]);
    }

    public function updateNotices(Request $request): Response
    {
        $data = $request->all();
        $rawNotices = $data['notices'] ?? [];
        $noticesList = [];

        if (is_array($rawNotices)) {
            foreach ($rawNotices as $item) {
                if (is_array($item)) {
                    $image = isset($item['image']) ? trim((string)$item['image']) : '';
                    if ($image !== '') {
                        $noticesList[] = ['image' => $image];
                    }
                } elseif (is_string($item) && trim($item) !== '') {
                    $noticesList[] = ['image' => trim($item)];
                }
            }
        }

        $interval = isset($data['interval']) && (string)$data['interval'] !== '' ? (int)$data['interval'] : 4;
        if ($interval <= 0) $interval = 4;

        $validated = [
            'interval' => $interval,
            'notices'  => $noticesList,
        ];

        $filePath = $this->getNoticesFilePath();
        file_put_contents($filePath, json_encode($validated, JSON_PRETTY_PRINT));

        return Response::json([
            'message' => 'Banner images updated successfully',
            'data' => $validated
        ]);
    }

    public function uploadBannerImage(Request $request): Response
    {
        if (empty($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
            return Response::json(['message' => 'No valid image file uploaded.'], 400);
        }

        $file = $_FILES['image'];
        $tmpPath = $file['tmp_name'];
        $origName = $file['name'];
        $ext = strtolower(pathinfo($origName, PATHINFO_EXTENSION));

        $allowedExts = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        if (!in_array($ext, $allowedExts, true)) {
            return Response::json(['message' => 'Invalid image format. Allowed: JPG, PNG, GIF, WEBP.'], 400);
        }

        // Upload directory in web root /uploads/banners
        if (isset($_SERVER['DOCUMENT_ROOT']) && is_dir($_SERVER['DOCUMENT_ROOT'])) {
            $uploadDir = rtrim($_SERVER['DOCUMENT_ROOT'], '/') . '/uploads/banners';
        } elseif (function_exists('public_path')) {
            $uploadDir = public_path('uploads/banners');
        } else {
            $uploadDir = dirname(__DIR__, 3) . '/public/uploads/banners';
        }

        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $newFilename = 'banner_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
        $destPath = $uploadDir . '/' . $newFilename;

        if (!move_uploaded_file($tmpPath, $destPath)) {
            return Response::json(['message' => 'Failed to save uploaded banner image.'], 500);
        }

        $url = '/uploads/banners/' . $newFilename;

        return Response::json([
            'message' => 'Image uploaded successfully',
            'url' => $url
        ]);
    }
}
