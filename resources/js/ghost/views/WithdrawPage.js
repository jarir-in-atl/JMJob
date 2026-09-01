import { api } from '../api.js';
import { showFlash, refreshUser, currentUser } from '../state.js';

export function WithdrawPage() {
    return async () => {
        const root = document.querySelector('[data-view]');
        if (!root) return;
        root.innerHTML = '';
        root.className = 'view view--withdraw';
        const u = currentUser.get();

        root.innerHTML = `
            <h2 class="page-title">Withdraw</h2>
            <div class="card card--withdraw">
                <div class="withdraw-info">
                    <div class="withdraw-info__item">
                        <span class="muted">Withdrawable Balance</span>
                        <strong>$${u ? parseFloat(u.balance).toFixed(2) : '0.00'}</strong>
                    </div>
                    <div class="withdraw-info__item">
                        <span class="muted">Referrals</span>
                        <strong>${u ? u.referral_count : 0}</strong>
                    </div>
                </div>
                ${u && !u.can_withdraw
                    ? `<p class="withdraw-warn">⚠ You need at least 1 referral to unlock withdrawal.</p>`
                    : ''}
                <form id="withdraw-form" class="withdraw-form">
                    <label class="withdraw-form__label">Withdrawal Amount (Taka)
                        <input name="amount" type="number" min="1" step="0.01" required value="1.00">
                    </label>
                    <label class="withdraw-form__label">Account / Wallet Address
                        <input name="wallet_address" type="text" required minlength="8" maxlength="20" placeholder="01XXXXXXXXX">
                    </label>
                    <label class="withdraw-form__label">Payment Method
                        <select name="gateway" required>
                            <option value="bkash">bKash</option>
                            <option value="nagad">Nagad</option>
                        </select>
                    </label>
                    <button type="submit" class="btn btn--primary btn--xl" ${u && !u.can_withdraw ? 'disabled' : ''}>
                        Confirm Withdrawal
                    </button>
                </form>
            </div>

            <h3 class="section-title">Withdrawal History</h3>
            <div class="withdraw-history" id="withdraw-history">Loading…</div>
        `;

        const form = root.querySelector('#withdraw-form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const fd = new FormData(form);
            const btn = form.querySelector('button');
            btn.disabled = true; btn.textContent = 'Submitting…';
            try {
                const res = await api.withdraw({
                    amount: parseFloat(fd.get('amount')),
                    wallet_address: String(fd.get('wallet_address')),
                    gateway: String(fd.get('gateway')),
                });
                showFlash('Withdrawal requested!', 'success');
                await refreshUser();
                WithdrawPage()();
            } catch (err) {
                const errors = err.payload && err.payload.errors;
                if (errors) {
                    const first = Object.values(errors)[0];
                    showFlash(Array.isArray(first) ? first[0] : first, 'error');
                } else {
                    showFlash(err.message || 'Withdrawal failed', 'error');
                }
                btn.disabled = false; btn.textContent = 'Confirm Withdrawal';
            }
        });

        const history = root.querySelector('#withdraw-history');
        try {
            const res = await api.withdrawals();
            const items = res.data || [];
            if (items.length === 0) {
                history.innerHTML = '<p class="muted">No withdrawals yet.</p>';
            } else {
                history.innerHTML = '';
                items.forEach(w => history.appendChild(renderRow(w)));
            }
        } catch (e) {
            history.innerHTML = '<p class="muted">Failed to load history.</p>';
        }
    };
}

function renderRow(w) {
    const row = document.createElement('div');
    row.className = 'withdraw-row withdraw-row--' + w.status;
    const status = (w.status || 'pending').toUpperCase();
    const adminNote = w.admin_note ? `<div class="withdraw-row__note">"${escapeHtml(w.admin_note)}"</div>` : '';
    row.innerHTML = `
        <div class="withdraw-row__main">
            <div class="withdraw-row__amount">$${parseFloat(w.amount).toFixed(2)}</div>
            <div class="withdraw-row__gateway">${escapeHtml(w.gateway)} · ${escapeHtml(w.wallet_address)}</div>
        </div>
        <div class="withdraw-row__status">${status}</div>
        ${adminNote}
    `;
    return row;
}

function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}
