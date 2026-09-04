import { api } from '../api.js';
import { showFlash, refreshUser } from '../state.js';
import { currentUser } from '../state.js';

export function AdminPage() {
    return async () => {
        const root = document.querySelector('[data-view]');
        if (!root) return;
        root.innerHTML = '';
        root.className = 'view view--admin';
        const u = currentUser.get();
        if (!u || !u.is_admin) {
            root.innerHTML = `<div class="card"><h2>403</h2><p>Admin only.</p><a class="btn btn--primary" href="#/">Go home</a></div>`;
            return;
        }
        root.innerHTML = `
            <h2 class="page-title">Admin Panel</h2>
            <div class="admin-tabs">
                <button class="admin-tab admin-tab--active" data-tab="stats">Stats</button>
                <button class="admin-tab" data-tab="withdrawals">Withdrawals</button>
                <button class="admin-tab" data-tab="payments">Payments</button>
                <button class="admin-tab" data-tab="users">Users</button>
                <button class="admin-tab" data-tab="providers">Ad Providers</button>
            </div>
            <div class="admin-tab-content" id="admin-content">Loading…</div>
        `;
        const tabs = root.querySelectorAll('.admin-tab');
        const content = root.querySelector('#admin-content');
        tabs.forEach(t => {
            t.addEventListener('click', () => {
                tabs.forEach(x => x.classList.remove('admin-tab--active'));
                t.classList.add('admin-tab--active');
                renderTab(t.dataset.tab, content);
            });
        });
        renderTab('stats', content);
    };
}

async function renderTab(name, content) {
    content.innerHTML = 'Loading…';
    try {
        if (name === 'stats') {
            const [statsResponse, revenueResponse] = await Promise.all([
                api.adminStats(),
                api.adminRevenue(),
            ]);
            const s = statsResponse.data || {};
            const r = revenueResponse.data || {};
            const symbol = r.currency_symbol || '৳';
            content.innerHTML = `
                <div class="stat-grid admin-revenue-grid">
                    ${adminStatTile('bi-graph-up-arrow', 'Platform revenue', money(r.platform_revenue, symbol))}
                    ${adminStatTile('bi-percent', 'Commission rate', `${(Number(r.commission_rate || 0) * 100).toFixed(2)}%`)}
                    ${adminStatTile('bi-briefcase', 'Total jobs', number(r.total_jobs))}
                    ${adminStatTile('bi-check2-circle', 'Completed jobs', number(r.completed_jobs))}
                    ${adminStatTile('bi-lightning-charge', 'Active jobs', number(r.active_jobs))}
                    ${adminStatTile('bi-people', 'Total users', number(r.total_users))}
                    ${adminStatTile('bi-hourglass-split', 'Pending deposits', number(r.pending_payments))}
                    ${adminStatTile('bi-lock', 'Held in escrow', money(r.escrow_total, symbol))}
                </div>
                <div class="card admin-operations-card">
                    <div class="card__header">
                        <div>
                            <h3 class="card__title">Operations overview</h3>
                            <p class="muted">Legacy earning activity alongside marketplace finance.</p>
                        </div>
                        <a class="btn btn--ghost btn--sm" href="#/admin/transactions">View ledger</a>
                    </div>
                    <div class="admin-operations-grid">
                        <div><span class="muted">Withdrawals</span><strong>${number(s.total_withdrawals)}</strong></div>
                        <div><span class="muted">Pending withdrawals</span><strong>${number(s.pending_withdrawals)}</strong></div>
                        <div><span class="muted">Total ad views</span><strong>${number(s.total_ad_views)}</strong></div>
                        <div><span class="muted">Lifetime paid</span><strong>${money(s.total_lifetime_paid, symbol)}</strong></div>
                    </div>
                </div>
                <div class="card admin-config-card">
                    <span class="muted">Current configuration</span>
                    <div><strong>${escapeHtml(r.currency || 'BDT')}</strong> currency · <strong>${escapeHtml(r.escrow_mode || 'full_bid')}</strong> escrow</div>
                </div>
            `;
        } else if (name === 'withdrawals') {
            const res = await api.adminWithdrawals('pending');
            const items = res.data || [];
            content.innerHTML = `
                <select id="wd-filter" class="admin-select">
                    <option value="pending" selected>Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="paid">Paid</option>
                </select>
                <div class="admin-list" id="wd-list">${items.length === 0 ? '<p class="muted">No pending withdrawals.</p>' : ''}</div>
            `;
            const list = content.querySelector('#wd-list');
            items.forEach(w => list.appendChild(renderWithdrawal(w, list)));
            content.querySelector('#wd-filter').addEventListener('change', async (e) => {
                const r = await api.adminWithdrawals(e.target.value);
                list.innerHTML = '';
                (r.data || []).forEach(w => list.appendChild(renderWithdrawal(w, list)));
            });
        } else if (name === 'payments') {
            // Redirect to the dedicated /admin/payments page for richer UX.
            window.location.hash = '#/admin/payments';
            return;
        } else if (name === 'users') {
            const res = await api.adminUsers();
            const items = res.data || [];
            content.innerHTML = `<div class="admin-list"></div>`;
            const list = content.querySelector('.admin-list');
            const currentId = Number(currentUser.get()?.id || 0);
            items.forEach(u => {
                const row = document.createElement('div');
                row.className = 'admin-row';
                row.innerHTML = `
                    <div>
                        <strong>${escapeHtml(u.name)}</strong>
                        <span class="muted">${escapeHtml(u.email)}</span>
                        <span class="badge user-role-badge">${escapeHtml(u.role || (u.is_admin ? 'admin' : 'worker')).toUpperCase()}</span>
                    </div>
                    <div class="admin-user-controls">
                        <span class="muted">Balance: ৳${Number(u.balance || 0).toFixed(2)} · Earned: ৳${Number(u.lifetime_earned || 0).toFixed(2)}</span>
                        <label class="admin-user-role-label">Role
                            <select class="admin-select admin-user-role" ${Number(u.id) === currentId ? 'disabled' : ''}>
                                ${['worker', 'poster', 'admin'].map(role => `<option value="${role}" ${(u.role || (u.is_admin ? 'admin' : 'worker')) === role ? 'selected' : ''}>${role[0].toUpperCase() + role.slice(1)}</option>`).join('')}
                            </select>
                        </label>
                    </div>
                `;
                const select = row.querySelector('.admin-user-role');
                select?.addEventListener('change', async () => {
                    const previous = u.role || (u.is_admin ? 'admin' : 'worker');
                    try {
                        const updated = await api.adminUpdateUserRole(u.id, select.value);
                        u.role = updated.data?.role || select.value;
                        u.is_admin = !!updated.data?.is_admin;
                        row.querySelector('.user-role-badge').textContent = u.role.toUpperCase();
                        showFlash('User role updated', 'success');
                    } catch (e) {
                        select.value = previous;
                        showFlash(e.message || 'Role update failed', 'error');
                    }
                });
                list.appendChild(row);
            });
        } else if (name === 'providers') {
            const res = await api.adminProviders();
            const items = res.data || [];
            content.innerHTML = `<div class="admin-list"></div>`;
            const list = content.querySelector('.admin-list');
            items.forEach(p => list.appendChild(renderProvider(p, list)));
        }
    } catch (e) {
        content.innerHTML = '<p class="muted">Failed to load.</p>';
    }
}

function adminStatTile(icon, label, value) {
    return `
        <div class="stat-tile admin-stat-tile">
            <i class="bi ${icon} admin-stat-tile__icon"></i>
            <span class="muted">${escapeHtml(label)}</span>
            <strong>${escapeHtml(String(value))}</strong>
        </div>
    `;
}

function number(value) {
    const amount = Number(value || 0);
    return Number.isFinite(amount) ? amount.toLocaleString() : '0';
}

function money(value, symbol) {
    const amount = Number(value || 0);
    return `${symbol}${Number.isFinite(amount) ? amount.toFixed(2) : '0.00'}`;
}

function renderWithdrawal(w, list) {
    const row = document.createElement('div');
    row.className = 'admin-row admin-row--withdrawal';
    row.innerHTML = `
        <div class="admin-row__main">
            <strong>${escapeHtml(w.user_name || 'User #' + w.user_id)}</strong>
            <span class="muted">${escapeHtml(w.user_email || '')}</span>
        </div>
        <div class="admin-row__amount">$${parseFloat(w.amount).toFixed(2)}</div>
        <div class="admin-row__gateway">${escapeHtml(w.gateway)} · ${escapeHtml(w.wallet_address)}</div>
        <div class="admin-row__status">${escapeHtml(w.status.toUpperCase())}</div>
    `;
    if (w.status === 'pending') {
        const actions = document.createElement('div');
        actions.className = 'admin-row__actions';
        const approve = document.createElement('button');
        approve.className = 'btn btn--success btn--sm';
        approve.textContent = 'Approve';
        approve.addEventListener('click', async () => {
            try {
                await api.adminApprove(w.id, { admin_note: 'Approved by admin' });
                showFlash('Withdrawal approved', 'success');
                row.remove();
            } catch (e) { showFlash(e.message, 'error'); }
        });
        const reject = document.createElement('button');
        reject.className = 'btn btn--danger btn--sm';
        reject.textContent = 'Reject';
        reject.addEventListener('click', async () => {
            const note = prompt('Reason for rejection (optional):', 'Invalid wallet address');
            try {
                await api.adminReject(w.id, { admin_note: note || '' });
                showFlash('Withdrawal rejected (refunded)', 'info');
                row.remove();
            } catch (e) { showFlash(e.message, 'error'); }
        });
        actions.appendChild(approve);
        actions.appendChild(reject);
        row.appendChild(actions);
    } else if (w.status === 'approved') {
        const actions = document.createElement('div');
        actions.className = 'admin-row__actions';
        const pay = document.createElement('button');
        pay.className = 'btn btn--primary btn--sm';
        pay.textContent = 'Mark as Paid';
        pay.addEventListener('click', async () => {
            try {
                await api.adminPay(w.id, { admin_note: 'Paid by admin' });
                showFlash('Marked as paid', 'success');
                row.remove();
            } catch (e) { showFlash(e.message, 'error'); }
        });
        actions.appendChild(pay);
        row.appendChild(actions);
    }
    return row;
}

function renderProvider(p, list) {
    const row = document.createElement('div');
    row.className = 'admin-row admin-row--provider';
    const enabled = !!p.enabled;
    const blockId = p.block_id || '';
    row.innerHTML = `
        <div class="admin-row__main">
            <strong>${escapeHtml(p.name)}</strong>
            <span class="muted">${escapeHtml(p.slug)}</span>
            ${enabled ? '<span class="badge badge--green">ENABLED</span>' : '<span class="badge">DISABLED</span>'}
        </div>
        <div class="admin-row__form">
            <label>Block ID: <input class="provider-block-id" type="text" value="${escapeHtml(blockId)}" placeholder="e.g. 7387"></label>
            <label>Weight: <input class="provider-weight" type="number" min="0" value="${p.weight}"></label>
            <label>Reward: <input class="provider-reward" type="number" min="0" step="0.0001" value="${p.reward_per_view}"></label>
            <label>Min duration (s): <input class="provider-duration" type="number" min="1" value="${p.min_duration_seconds}"></label>
            <label class="checkbox-label">
                <input class="provider-enabled" type="checkbox" ${enabled ? 'checked' : ''}> Enabled
            </label>
            <button class="btn btn--primary btn--sm provider-save">Save</button>
        </div>
    `;
    row.querySelector('.provider-save').addEventListener('click', async () => {
        const payload = {
            block_id: row.querySelector('.provider-block-id').value.trim() || null,
            weight: parseInt(row.querySelector('.provider-weight').value, 10) || 0,
            reward_per_view: parseFloat(row.querySelector('.provider-reward').value) || 0,
            min_duration_seconds: parseInt(row.querySelector('.provider-duration').value, 10) || 12,
            enabled: row.querySelector('.provider-enabled').checked,
        };
        try {
            await api.adminUpdateProvider(p.id, payload);
            showFlash('Provider saved', 'success');
        } catch (e) { showFlash(e.message, 'error'); }
    });
    return row;
}

function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}
