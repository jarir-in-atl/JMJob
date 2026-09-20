<?php
declare(strict_types=1);

namespace App\Services;

/** Small client for the SMS.net.bd send-sms endpoint. */
class SmsNetBdClient
{
    private const DEFAULT_ENDPOINT = 'https://api.sms.net.bd/sendsms';

    public static function normalizeBangladeshNumber(?string $number): ?string
    {
        $digits = preg_replace('/\D+/', '', trim((string) $number));
        if ($digits === null || $digits === '') {
            return null;
        }

        if (str_starts_with($digits, '880')) {
            $normalized = $digits;
        } elseif (str_starts_with($digits, '0')) {
            $normalized = '88' . $digits;
        } else {
            $normalized = '880' . $digits;
        }

        return preg_match('/^8801[3-9]\d{8}$/', $normalized) === 1
            ? $normalized
            : null;
    }

    public function sendOtp(string $phone, string $otp): bool
    {
        $apiKey = trim((string) getenv('SMS_API_KEY'));
        $endpoint = trim((string) (getenv('SMS_SENDING_ENDPOINT') ?: self::DEFAULT_ENDPOINT));
        $number = self::normalizeBangladeshNumber($phone);
        if ($apiKey === '' || $endpoint === '' || $number === '' || !function_exists('curl_init')) {
            return false;
        }

        $message = "Your JMJob verification code is {$otp}. It expires in 15 minutes.";
        $separator = str_contains($endpoint, '?') ? '&' : '?';
        $url = $endpoint . $separator . http_build_query([
            'api_key' => $apiKey,
            'msg' => $message,
            'to' => $number,
        ], '', '&', PHP_QUERY_RFC3986);

        $curl = curl_init($url);
        if ($curl === false) {
            return false;
        }

        curl_setopt_array($curl, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CONNECTTIMEOUT => 5,
            CURLOPT_TIMEOUT => 15,
            CURLOPT_HTTPGET => true,
        ]);
        $body = curl_exec($curl);
        $status = (int) curl_getinfo($curl, CURLINFO_HTTP_CODE);
        curl_close($curl);

        if ($body === false || $status < 200 || $status >= 300) {
            return false;
        }

        $response = json_decode((string) $body, true);
        return is_array($response) && (int) ($response['error'] ?? -1) === 0;
    }
}
