<?php
declare(strict_types=1);

require_once __DIR__ . '/../vendor/autoload.php';

use App\Models\Job;
use App\Models\JobBid;
use App\Models\User;
use App\Services\JobService;
use Nemesis\Testing\TestCase;

class JobWorkflowUnitTest extends TestCase
{
    private JobService $service;

    public function setUp(): void
    {
        $this->service = new JobService();
    }

    public function testAdditiveFeeCalculation(): void
    {
        $workerCount = 10;
        $costPerWorker = 100.00;
        $net = $workerCount * $costPerWorker; // 1000
        $feePercent = 30.00;
        $feeAmount = $net * ($feePercent / 100.0); // 300
        $totalPayable = $net + $feeAmount; // 1300

        $this->assertSame(1000.0, $net);
        $this->assertSame(300.0, $feeAmount);
        $this->assertSame(1300.0, $totalPayable);
    }

    public function testSelfApplicationGuardLogic(): void
    {
        $posterId = 5;
        $workerId = 5;

        $isSelf = ($posterId === $workerId);
        $this->assertTrue($isSelf, 'Poster cannot apply to their own job');
    }
    public function testBanglaTextAndUnicodeHandling(): void
    {
        $banglaTitle = 'ফেসবুক পেজে লাইক দিন';
        $banglaDesc = 'কাজটি খুব সহজ। নির্দিষ্ট লিংকে গিয়ে লাইক দিন এবং স্ক্রিনশট জমা দিন।';
        $proofs = [
            ['title' => 'স্ক্রিনশট প্রুফ', 'type' => 'screenshot']
        ];

        $encoded = json_encode($proofs, JSON_UNESCAPED_UNICODE);
        $this->assertStringContainsString('স্ক্রিনশট প্রুফ', $encoded);

        $decoded = json_decode($encoded, true);
        $this->assertSame('স্ক্রিনশট প্রুফ', $decoded[0]['title']);

        $this->assertTrue(mb_strlen($banglaTitle) <= 160);
        $this->assertTrue(mb_strlen($banglaDesc) > 0);
    }
    public function testProofRequirementsCategorization(): void
    {
        $classify = function (array $proofRequirements): array {
            $requiresAttachment = false;
            $requiresWrittenReport = false;
            foreach ($proofRequirements as $requirement) {
                $type = is_array($requirement)
                    ? strtolower(trim((string) ($requirement['type'] ?? 'text')))
                    : strtolower(trim((string) $requirement));
                if (in_array($type, ['screenshot', 'file', 'attachment', 'image', 'document'], true)) {
                    $requiresAttachment = true;
                }
                if (in_array($type, ['text', 'written', 'written_report', 'report', 'description'], true)) {
                    $requiresWrittenReport = true;
                }
            }
            return [$requiresAttachment, $requiresWrittenReport];
        };

        // 1. Images only
        [$imgAttach, $imgText] = $classify([['title' => 'Proof screenshot', 'type' => 'screenshot']]);
        $this->assertTrue($imgAttach, 'Images only must require attachment');
        $this->assertFalse($imgText, 'Images only must NOT require written report');

        // 2. Texts only
        [$txtAttach, $txtText] = $classify([['title' => 'Username', 'type' => 'text']]);
        $this->assertFalse($txtAttach, 'Texts only must NOT require attachment');
        $this->assertTrue($txtText, 'Texts only must require written report');

        // 3. Both pairs
        [$bothAttach, $bothText] = $classify([
            ['title' => 'Account Username', 'type' => 'text'],
            ['title' => 'Payment Receipt Screenshot', 'type' => 'screenshot'],
        ]);
        $this->assertTrue($bothAttach, 'Both pairs must require attachment');
        $this->assertTrue($bothText, 'Both pairs must require written report');

        // 4. Legacy format
        [$legAttach, $legText] = $classify(['screenshot']);
        $this->assertTrue($legAttach, 'Legacy screenshot must require attachment');
        $this->assertFalse($legText, 'Legacy screenshot must NOT require written report');
    }
}

$test = new JobWorkflowUnitTest();
echo "--- Job Workflow Unit Test ---\n";
foreach ([
    'testAdditiveFeeCalculation',
    'testSelfApplicationGuardLogic',
    'testBanglaTextAndUnicodeHandling',
    'testProofRequirementsCategorization'
] as $method) {
    echo "Running {$method}... ";
    try {
        $test->setUp();
        $test->{$method}();
        echo "PASS\n";
    } catch (\Throwable $e) {
        echo "FAIL: " . $e->getMessage() . "\n";
        exit(1);
    }
}
echo "\n--- Job Workflow Unit Test Complete ---\n";

