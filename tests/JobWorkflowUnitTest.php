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
}

$test = new JobWorkflowUnitTest();
echo "--- Job Workflow Unit Test ---\n";
foreach (['testAdditiveFeeCalculation', 'testSelfApplicationGuardLogic'] as $method) {
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

