<?php
declare(strict_types=1);

namespace App\Services;

use JarirAhmed\ManualPaymentGateway\GatewayManager;
use JarirAhmed\ManualPaymentGateway\Adapters\ManualPaymentAdapter;
use JarirAhmed\ManualPaymentGateway\Adapters\SendMoneyAdapter;
use JarirAhmed\ManualPaymentGateway\DTO\GatewayContext;

/**
 * PaymentGatewayRegistry — thin wrapper around the `jarir-ahmed/manual-payment-gateway`
 * GatewayManager. This is the only place the package is referenced, so swapping
 * the underlying gateway implementation is a single-file change.
 *
 * The registry exposes two things the rest of the app needs:
 *  1. A list of *displayable* gateways (bKash, Nagad, Rocket, Upay) that the
 *     user can pick on the deposit page. These map to the package's `manual_payment`
 *     alias under the hood, but we brand them per-region.
 *  2. The underlying `GatewayManager` for callers that need the package's form
 *     builder or session store.
 */
class PaymentGatewayRegistry
{
    private GatewayManager $manager;

    /** @var array<int,array{key:string,label:string,wallet_number:string,instructions:string,aliases:array<string>}> */
    private array $gateways;

    public function __construct(?GatewayManager $manager = null)
    {
        $this->manager = $manager ?? new GatewayManager([
            new ManualPaymentAdapter(),
            new SendMoneyAdapter(),
        ]);

        // The "branded" gateways surfaced to users. `aliases` lists the package
        // adapter aliases that all share the same manual flow. Edit here to add
        // a new region or change the displayed wallet number.
        $this->gateways = [
            [
                'key' => 'bkash',
                'label' => 'bKash',
                'wallet_number' => (string) (getenv('PAYMENT_BKASH_NUMBER') ?: '01XXXXXXXXX'),
                'instructions' => 'Send money to the bKash number above, then enter the TRXID below.',
                'aliases' => ['manual_payment', 'bkash'],
            ],
            [
                'key' => 'nagad',
                'label' => 'Nagad',
                'wallet_number' => (string) (getenv('PAYMENT_NAGAD_NUMBER') ?: '01XXXXXXXXX'),
                'instructions' => 'Send money to the Nagad number above, then enter the TRXID below.',
                'aliases' => ['manual_payment', 'nagad'],
            ],
            [
                'key' => 'rocket',
                'label' => 'Rocket',
                'wallet_number' => (string) (getenv('PAYMENT_ROCKET_NUMBER') ?: '01XXXXXXXXX'),
                'instructions' => 'Send money to the Rocket number above, then enter the TRXID below.',
                'aliases' => ['manual_payment', 'rocket'],
            ],
            [
                'key' => 'upay',
                'label' => 'Upay',
                'wallet_number' => (string) (getenv('PAYMENT_UPAY_NUMBER') ?: '01XXXXXXXXX'),
                'instructions' => 'Send money to the Upay number above, then enter the TRXID below.',
                'aliases' => ['manual_payment', 'upay'],
            ],
        ];
    }

    public function manager(): GatewayManager
    {
        return $this->manager;
    }

    /**
     * @return array<int,array{key:string,label:string,wallet_number:string,instructions:string,aliases:array<string>}>
     */
    public function all(): array
    {
        return $this->gateways;
    }

    public function find(string $key): ?array
    {
        foreach ($this->gateways as $g) {
            if ($g['key'] === $key) return $g;
        }
        return null;
    }

    public function isValidKey(string $key): bool
    {
        return $this->find($key) !== null;
    }

    /**
     * Build a GatewayContext for the package, so callers that want the
     * adapter's form/intent/result DTOs can ask the package directly.
     */
    public function contextFor(string $key, int $userId, float $amount): GatewayContext
    {
        $g = $this->find($key);
        if ($g === null) {
            throw new \InvalidArgumentException("Unknown gateway key: {$key}");
        }
        return new GatewayContext([
            'method_id'  => crc32($key), // stable synthetic id
            'alias'      => $g['aliases'][0] ?? 'manual_payment',
            'name'       => $g['label'],
            'min_amount' => (float) (getenv('PAYMENT_MIN_AMOUNT') ?: 1),
            'max_amount' => (float) (getenv('PAYMENT_MAX_AMOUNT') ?: 50000),
            'currency'   => 'BDT',
            'user_id'    => $userId,
            'amount'     => $amount,
        ]);
    }
}
