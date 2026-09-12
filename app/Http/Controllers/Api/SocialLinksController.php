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
}
