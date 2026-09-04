<?php
declare(strict_types=1);

namespace App\Http\Controllers\Api;

use Nemesis\Core\Controller;
use Nemesis\Http\Request;
use Nemesis\Http\Response;
use App\Models\User;
use App\Models\PaymentSubmission;
use App\Services\PaymentService;

/**
 * PaymentController — TRXID deposit flow (user-facing) and admin verification.
 *
 * User endpoints (auth.api):
 *   GET  /api/payment/gateways           — list supported gateways + wallet numbers
 *   POST /api/payment/submit             — submit a new TRXID payment
 *   GET  /api/payment/submissions        — current user's submission history
 *
 * Admin endpoints (admin middleware):
 *   GET  /api/admin/payments             — list all submissions (filter by status)
 *   POST /api/admin/payments/{id}/approve — approve + credit balance
 *   POST /api/admin/payments/{id}/reject  — reject with optional note
 */
class PaymentController extends Controller
{
    public function __construct(
        private PaymentService $payments = new PaymentService()
    ) {}

    // -------------------------------------------------------------------
    // User-facing
    // -------------------------------------------------------------------

    public function gateways(Request $request): Response
    {
        $items = array_map(
            fn($g) => [
                'key'           => $g['key'],
                'label'         => $g['label'],
                'wallet_number' => $g['wallet_number'],
                'instructions'  => $g['instructions'],
            ],
            $this->payments->registry()->all()
        );

        return Response::json([
            'success' => true,
            'data'    => [
                'gateways'      => $items,
                'min_amount'    => (float) (getenv('PAYMENT_MIN_AMOUNT') ?: 1),
                'max_amount'    => (float) (getenv('PAYMENT_MAX_AMOUNT') ?: 50000),
                'currency'      => 'BDT',
            ],
        ]);
    }

    public function submit(Request $request): Response
    {
        $user = $request->getMeta('auth.user');
        $body = (array) $this->readJson($request);

        $gateway      = (string) ($body['gateway'] ?? '');
        $senderNumber = (string) ($body['sender_number'] ?? '');
        $amount       = (float)  ($body['amount'] ?? 0);
        $trxid        = (string) ($body['trxid'] ?? '');

        if ($gateway === '' || $senderNumber === '' || $amount <= 0 || $trxid === '') {
            return Response::json([
                'success' => false,
                'message' => 'Missing required fields: gateway, sender_number, amount, trxid.',
            ], 422);
        }

        $result = $this->payments->submit($user, $gateway, $senderNumber, $amount, $trxid);
        if (!$result['success']) {
            return Response::json($result, 422);
        }

        $sub = $result['submission'];
        return Response::json([
            'success' => true,
            'message' => 'Payment submitted. Awaiting admin verification.',
            'data'    => $this->serialize($sub),
        ]);
    }

    public function submissions(Request $request): Response
    {
        $user = $request->getMeta('auth.user');
        $subs = $this->payments->listForUser((int) $user->id, 100);

        return Response::json([
            'success' => true,
            'data'    => array_map(fn($s) => $this->serialize($s), $subs),
        ]);
    }

    // -------------------------------------------------------------------
    // Admin
    // -------------------------------------------------------------------

    public function adminList(Request $request): Response
    {
        $status = $request->query('status');
        $subs = $this->payments->list($status, 200);

        return Response::json([
            'success' => true,
            'data'    => array_map(fn($s) => $this->serialize($s, true), $subs),
        ]);
    }

    public function adminApprove(Request $request, int $id): Response
    {
        $admin = $request->getMeta('auth.user');
        $body = (array) $this->readJson($request);
        $note = isset($body['note']) ? (string) $body['note'] : null;

        $result = $this->payments->approve($id, $admin, $note);
        if (!$result['success']) {
            return Response::json($result, 422);
        }

        return Response::json([
            'success' => true,
            'message' => 'Payment approved. Balance credited.',
            'data'    => $this->serialize($result['submission'], true),
        ]);
    }

    public function adminReject(Request $request, int $id): Response
    {
        $admin = $request->getMeta('auth.user');
        $body = (array) $this->readJson($request);
        $note = isset($body['note']) ? (string) $body['note'] : null;

        $result = $this->payments->reject($id, $admin, $note);
        if (!$result['success']) {
            return Response::json($result, 422);
        }

        return Response::json([
            'success' => true,
            'message' => 'Payment rejected.',
            'data'    => $this->serialize($result['submission'], true),
        ]);
    }

    // -------------------------------------------------------------------
    // Serialization
    // -------------------------------------------------------------------

    private function serialize(PaymentSubmission $s, bool $withUser = false): array
    {
        $data = [
            'id'            => (int) $s->id,
            'gateway'       => $s->gateway,
            'sender_number' => $s->sender_number,
            'amount'        => (float) $s->amount,
            'trxid'         => $s->trxid,
            'status'        => $s->status,
            'admin_note'    => $s->admin_note,
            'created_at'    => $s->created_at,
            'verified_at'   => $s->verified_at,
        ];

        if ($withUser) {
            $u = $s->user();
            if ($u !== null) {
                $data['user'] = [
                    'id'       => (int) $u->id,
                    'name'     => $u->name,
                    'email'    => $u->email,
                    'username' => $u->username ?? null,
                ];
            }
        }

        return $data;
    }
}
