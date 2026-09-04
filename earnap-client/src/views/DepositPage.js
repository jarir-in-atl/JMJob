// DepositPage — user-facing deposit page (TRXID-based, manual verification).
// Submits payments to /api/payment/submit, lists history from /api/payment/submissions.

import { api } from '../api.js';
import { currentUser, showFlash, refreshUser } from '../state.js';

const STATUS_LABELS = {
    pending:  { label: 'Pending',  class: 'payment-row--pending'  },
    approved: { label: 'Approved', class: 'payment-row--approved' },
    rejected: { label: 'Rejected', class: 'payment-row--rejected' },
};

let _state = {
    gateways: [],
    minAmount: 1,
    maxAmount: 50000,
    selectedGateway: null,
    submissions: [],
    loading: false,
};

export function DepositPage() {
    return async () => {
        const root = document.querySelector('[data-view]');
        if (!root) return;
        root.innerHTML = '';
        root.className = 'view view--deposit';
        const u = currentUser.get();

        root.innerHTML = `
            <h1 class="page-title">Deposit Funds</h1>

            <div class="card card--deposit-balance">
                <div class="deposit-balance__row">
                    <div>
                        <div class="muted">${u?.role === 'poster' ? 'Available Poster Wallet' : 'Your Balance'}</div>
                        <div class="deposit-balance__amount" id="deposit-balance">৳${u ? parseFloat(u.role === 'poster' ? (u.wallet_balance || 0) : (u.balance || 0)).toFixed(2) : '0.00'}</div>
                    </div>
                    <div class="deposit-balance__hint">
                        <i class="bi bi-info-circle"></i>
                        Funds are added after admin verification.
                    </div>
                </div>
            </div>

            <div class="card" id="deposit-gateway-section">
                <h3 class="card__title">1. Select Payment Method</h3>
                <div class="payment-gateways" id="payment-gateways">
                    <div class="spinner"></div>
                </div>
            </div>

            <div class="card" id="deposit-instructions-card" style="display:none">
                <h3 class="card__title">2. Send Money</h3>
                <div class="payment-instructions" id="payment-instructions"></div>
            </div>

            <div class="card" id="deposit-form-card" style="display:none">
                <h3 class="card__title">3. Submit TRXID</h3>
                <form id="deposit-form" class="deposit-form">
                    <label class="deposit-form__label">
                        Amount (Taka)
                        <input name="amount" type="number" step="0.01" min="1" required id="deposit-amount">
                    </label>
                    <label class="deposit-form__label">
                        Sender Number
                        <input name="sender_number" type="text" required minlength="8" maxlength="20" placeholder="01XXXXXXXXX" id="deposit-sender">
                    </label>
                    <label class="deposit-form__label">
                        Transaction ID (TRXID)
                        <input name="trxid" type="text" required minlength="4" maxlength="40" placeholder="e.g. 8A9B7C6D5E" id="deposit-trxid" style="text-transform: uppercase;">
                    </label>
                    <button type="submit" class="btn btn--primary btn--xl" id="deposit-submit-btn">
                        <i class="bi bi-send"></i> Submit Payment
                    </button>
                </form>
                <p class="deposit-form__warn">
                    ⚠ Please double-check the TRXID. Duplicate or invalid TRXIDs will be rejected.
                </p>
            </div>

            <h3 class="section-title">Submission History</h3>
            <div class="payment-history" id="payment-history">
                <div class="spinner"></div>
            </div>
        `;

        // Load gateways + history
        try {
            _state.loading = true;
            const [gatewaysRes, subsRes] = await Promise.all([
                api.paymentGateways(),
                api.paymentSubmissions(),
            ]);
            _state.gateways = gatewaysRes.data.gateways;
            _state.minAmount = gatewaysRes.data.min_amount;
            _state.maxAmount = gatewaysRes.data.max_amount;
            _state.submissions = subsRes.data;
            renderGateways();
            renderHistory();
        } catch (err) {
            showFlash('Failed to load deposit info: ' + err.message, 'error');
        } finally {
            _state.loading = false;
        }

        // Form submit handler
        const form = document.getElementById('deposit-form');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                if (!_state.selectedGateway) {
                    showFlash('Please select a payment method.', 'error');
                    return;
                }
                const fd = new FormData(form);
                const btn = document.getElementById('deposit-submit-btn');
                btn.disabled = true; btn.innerHTML = '<i class="bi bi-hourglass-split"></i> Submitting…';
                try {
                    const res = await api.paymentSubmit({
                        gateway: _state.selectedGateway,
                        sender_number: String(fd.get('sender_number') || '').trim(),
                        amount: parseFloat(fd.get('amount')),
                        trxid: String(fd.get('trxid') || '').trim().toUpperCase(),
                    });
                    showFlash(res.message || 'Payment submitted.', 'success');
                    form.reset();
                    // Refresh submissions + balance
                    const subsRes = await api.paymentSubmissions();
                    _state.submissions = subsRes.data;
                    renderHistory();
                    await refreshUser();
                    const u2 = currentUser.get();
                    const balEl = document.getElementById('deposit-balance');
                    if (balEl && u2) balEl.textContent = '৳' + parseFloat(u2.role === 'poster' ? (u2.wallet_balance || 0) : (u2.balance || 0)).toFixed(2);
                } catch (err) {
                    showFlash(err.message || 'Failed to submit payment.', 'error');
                } finally {
                    btn.disabled = false; btn.innerHTML = '<i class="bi bi-send"></i> Submit Payment';
                }
            });
        }
    };
}

function renderGateways() {
    const container = document.getElementById('payment-gateways');
    if (!container) return;
    if (_state.gateways.length === 0) {
        container.innerHTML = '<p class="muted">No payment methods available right now.</p>';
        return;
    }
    container.innerHTML = _state.gateways.map(g => `
        <button class="payment-gateway ${_state.selectedGateway === g.key ? 'is-selected' : ''}" data-gateway="${g.key}">
            <i class="bi bi-wallet2 payment-gateway__icon"></i>
            <div class="payment-gateway__body">
                <div class="payment-gateway__label">${escapeHtml(g.label)}</div>
                <div class="payment-gateway__number">${escapeHtml(g.wallet_number)}</div>
            </div>
            ${_state.selectedGateway === g.key ? '<i class="bi bi-check-circle-fill payment-gateway__check"></i>' : ''}
        </button>
    `).join('');

    container.querySelectorAll('button[data-gateway]').forEach(btn => {
        btn.addEventListener('click', () => {
            _state.selectedGateway = btn.getAttribute('data-gateway');
            renderGateways();
            renderInstructions();
        });
    });
}

function renderInstructions() {
    const g = _state.gateways.find(x => x.key === _state.selectedGateway);
    const instrCard = document.getElementById('deposit-instructions-card');
    const formCard = document.getElementById('deposit-form-card');
    if (!g) {
        if (instrCard) instrCard.style.display = 'none';
        if (formCard) formCard.style.display = 'none';
        return;
    }
    if (instrCard) instrCard.style.display = '';
    if (formCard) formCard.style.display = '';

    const instrEl = document.getElementById('payment-instructions');
    if (instrEl) {
        instrEl.innerHTML = `
            <p>${escapeHtml(g.instructions)}</p>
            <div class="payment-instructions__number">
                <span class="muted">Send money to:</span>
                <strong id="wallet-number">${escapeHtml(g.wallet_number)}</strong>
                <button type="button" class="btn btn--ghost btn--sm" id="copy-wallet-btn">
                    <i class="bi bi-clipboard"></i> Copy
                </button>
            </div>
            <p class="muted" style="font-size:12px">
                Send the exact amount you'll enter below, then submit the TRXID. Verification takes up to 24h.
            </p>
        `;
        document.getElementById('copy-wallet-btn')?.addEventListener('click', () => {
            navigator.clipboard.writeText(g.wallet_number).then(() => {
                showFlash('Wallet number copied.', 'info');
            }).catch(() => {
                showFlash('Could not copy. Please copy manually.', 'error');
            });
        });
    }

    // Update amount constraints
    const amt = document.getElementById('deposit-amount');
    if (amt) {
        amt.min = _state.minAmount;
        amt.max = _state.maxAmount;
        amt.placeholder = `${_state.minAmount} – ${_state.maxAmount}`;
    }
}

function renderHistory() {
    const root = document.getElementById('payment-history');
    if (!root) return;
    if (_state.submissions.length === 0) {
        root.innerHTML = '<p class="muted">No submissions yet.</p>';
        return;
    }
    root.innerHTML = _state.submissions.map(s => {
        const meta = STATUS_LABELS[s.status] || { label: s.status, class: '' };
        return `
            <div class="payment-row ${meta.class}">
                <div class="payment-row__main">
                    <div class="payment-row__amount">৳ ${parseFloat(s.amount).toFixed(2)}</div>
                    <div class="payment-row__gateway">${escapeHtml((s.gateway || '').toUpperCase())} • TRX: ${escapeHtml(s.trxid)}</div>
                </div>
                <div class="payment-row__status">${meta.label}</div>
                <div class="payment-row__date">${formatDate(s.created_at)}</div>
            </div>
        `;
    }).join('');
}

function formatDate(s) {
    if (!s) return '';
    try {
        const d = new Date(s.replace(' ', 'T') + 'Z');
        return d.toLocaleString();
    } catch {
        return s;
    }
}

function escapeHtml(s) {
    if (s === null || s === undefined) return '';
    return String(s).replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
}
