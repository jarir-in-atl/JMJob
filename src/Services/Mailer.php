<?php
declare(strict_types=1);
namespace Nemesis\Services;

use PHPMailer\PHPMailer\PHPMailer;
use Nemesis\Core\Config;

class Mailer {
    protected $mail;
    protected string $lastError = '';

    public function __construct() {
        $this->mail = new PHPMailer(true);
        $this->setup();
    }

    protected function setup() {
        $host = (string) Config::get('MAIL_HOST', 'smtp.gmail.com');
        $password = (string) (Config::get('MAIL_PASS') ?: Config::get('MAIL_PASSWORD', ''));

        // Google displays app passwords in four groups separated by spaces.
        // Those spaces are formatting and must not be sent to Gmail as part
        // of the credential. Keep other SMTP passwords unchanged.
        if (strcasecmp($host, 'smtp.gmail.com') === 0) {
            $password = (string) preg_replace('/\s+/', '', $password);
        }

        $this->mail->isSMTP();
        $this->mail->Host       = $host;
        $this->mail->SMTPAuth   = true;
        $this->mail->Username   = Config::get('MAIL_USER') ?: Config::get('MAIL_USERNAME', '');
        $this->mail->Password   = $password;
        $encryption = strtolower((string) Config::get('MAIL_ENCRYPTION', 'tls'));
        $this->mail->SMTPSecure = $encryption === 'ssl'
            ? PHPMailer::ENCRYPTION_SMTPS
            : PHPMailer::ENCRYPTION_STARTTLS;
        $this->mail->Port       = Config::get('MAIL_PORT', 587);

        $this->mail->setFrom(
            Config::get('MAIL_FROM') ?: Config::get('MAIL_FROM_ADDRESS', ''),
            Config::get('MAIL_FROM_NAME', 'JMJob')
        );
    }

    public function send($to, $subject, $body, $altBody = '') {
        try {
            $this->mail->addAddress($to);
            $this->mail->isHTML(true);
            $this->mail->Subject = $subject;
            $this->mail->Body    = $body;
            $this->mail->AltBody = $altBody ?: strip_tags($body);

            $this->mail->send();
            $this->mail->clearAddresses();
            return true;
        } catch (\Throwable $e) {
            $this->lastError = trim((string) ($this->mail->ErrorInfo ?: $e->getMessage()));
            error_log("Mailer Error: {$this->lastError}");
            return false;
        }
    }

    public function getError() {
        return $this->lastError ?: $this->mail->ErrorInfo;
    }
}
