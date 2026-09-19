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
            root.innerHTML = `<div class="card"><h2>403</h2><p>Admin access required.</p><a class="btn btn--primary" href="#/">Go home</a></div>`;
            return;
        }
        root.innerHTML = `
            <div class="admin-page-header">
                <div>
                    <div class="admin-page-header__tag"><i class="bi bi-shield-lock-fill"></i> ADMIN CONTROL CENTER</div>
                    <h1 class="page-title">Executive Dashboard</h1>
                    <p class="muted">System-wide operational metrics, finance auditing, and platform management.</p>
                </div>
            </div>

            <div class="admin-tabs">
                <button class="admin-tab admin-tab--active" data-tab="stats"><i class="bi bi-speedometer2"></i> Overview</button>
                <button class="admin-tab" data-tab="withdrawals"><i class="bi bi-wallet2"></i> Withdrawals</button>
                <button class="admin-tab" data-tab="payments"><i class="bi bi-cash-stack"></i> Deposits</button>
                <button class="admin-tab" data-tab="users"><i class="bi bi-people"></i> Users & Roles</button>
                <button class="admin-tab" data-tab="providers"><i class="bi bi-play-circle"></i> Ad Providers</button>
                <button class="admin-tab" data-tab="video-ads"><i class="bi bi-film"></i> Video Ads</button>
                <button class="admin-tab" data-tab="fraud"><i class="bi bi-shield-exclamation"></i> Fraud Review</button>
            </div>
            <div class="admin-tab-content" id="admin-content"><div class="spinner"></div></div>
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
            const m = s.marketplace || {};
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
                    ${adminStatTile('bi-hourglass-split', 'Pending submissions', number(m.pending_submissions))}
                    ${adminStatTile('bi-shield-exclamation', 'Flagged submissions', number(m.flagged_submissions))}
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
                        <div><span class="muted">Video ad views</span><strong>${number(s.video_ad_views)}</strong></div>
                        <div><span class="muted">Video rewards paid</span><strong>${money(s.video_rewards_paid, symbol)}</strong></div>
                        <div><span class="muted">Banned users</span><strong>${number(s.banned_users)}</strong></div>
                        <div><span class="muted">Lifetime paid</span><strong>${money(s.total_lifetime_paid, symbol)}</strong></div>
                        <div><span class="muted">Pending jobs</span><strong>${number(m.pending_jobs)}</strong></div>
                        <div><span class="muted">Rejected jobs</span><strong>${number(m.rejected_jobs)}</strong></div>
                        <div><span class="muted">Total workers</span><strong>${number(m.total_workers)}</strong></div>
                        <div><span class="muted">Approved submissions</span><strong>${number(m.approved_submissions)}</strong></div>
                        <div><span class="muted">Rejected submissions</span><strong>${number(m.rejected_submissions)}</strong></div>
                        <div><span class="muted">Job budget</span><strong>${money(m.total_job_budget, symbol)}</strong></div>
                        <div><span class="muted">Completed payments</span><strong>${money(m.completed_payment, symbol)}</strong></div>
                        <div><span class="muted">Pending payments</span><strong>${money(m.pending_payment, symbol)}</strong></div>
                        <div><span class="muted">Commissions</span><strong>${money(m.commissions, symbol)}</strong></div>
                        <div><span class="muted">Worker earnings</span><strong>${money(m.worker_earnings, symbol)}</strong></div>
                        <div><span class="muted">Ad rewards</span><strong>${money(m.ad_earnings, symbol)}</strong></div>
                    </div>
                </div>
                <div class="card admin-config-card">
                    <span class="muted">Current configuration</span>
                    <div><strong>${escapeHtml(r.currency || 'BDT')}</strong> currency · <strong>${escapeHtml(r.escrow_mode || 'full_bid')}</strong> escrow</div>
                </div>
                <div class="card admin-config-card">
                    <div>
                        <strong>System Maintenance</strong>
                        <p class="muted" style="margin:0; font-size:12px;">Reset daily user ad view limits and daily bonus claim timers for all users.</p>
                    </div>
                    <button class="btn btn--danger btn--sm" id="btn-reset-counters"><i class="bi bi-arrow-counterclockwise"></i> Reset Daily Counters</button>
                </div>
            `;
            const resetBtn = content.querySelector('#btn-reset-counters');
            if (resetBtn) {
                resetBtn.addEventListener('click', async () => {
                    if (!confirm('Reset daily ad view counters for all users?')) return;
                    try {
                        const res = await api.adminResetDailyCounters();
                        showFlash(res.message || 'Daily counters reset.', 'success');
                    } catch (e) { showFlash(e.message || 'Reset failed.', 'error'); }
                });
            }
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
                        <span class="badge user-status-badge ${u.is_banned ? 'badge--danger' : 'badge--success'}">${u.is_banned ? 'BANNED' : 'ACTIVE'}</span>
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

                if (Number(u.id) !== currentId) {
                    const banButton = document.createElement('button');
                    banButton.className = `btn ${u.is_banned ? 'btn--success' : 'btn--danger'} btn--sm`;
                    banButton.textContent = u.is_banned ? 'Unban user' : 'Ban user';
                    banButton.addEventListener('click', async () => {
                        const reason = prompt(u.is_banned ? 'Reason for unbanning:' : 'Reason for banning this user:', u.ban_reason || '');
                        if (reason === null || (!u.is_banned && !reason.trim())) return;
                        try {
                            const updated = u.is_banned
                                ? await api.adminUnbanUser(u.id, { reason })
                                : await api.adminBanUser(u.id, { reason });
                            u.is_banned = !!updated.data?.is_banned;
                            u.ban_reason = u.is_banned ? reason : null;
                            banButton.className = `btn ${u.is_banned ? 'btn--success' : 'btn--danger'} btn--sm`;
                            banButton.textContent = u.is_banned ? 'Unban user' : 'Ban user';
                            const status = row.querySelector('.user-status-badge');
                            if (status) {
                                status.className = `badge user-status-badge ${u.is_banned ? 'badge--danger' : 'badge--success'}`;
                                status.textContent = u.is_banned ? 'BANNED' : 'ACTIVE';
                            }
                            showFlash(updated.message || 'User status updated.', 'success');
                        } catch (e) {
                            showFlash(e.message || 'Could not update user status.', 'error');
                        }
                    });
                    row.querySelector('.admin-user-controls').appendChild(banButton);
                }
                list.appendChild(row);
            });
        } else if (name === 'providers') {
            const res = await api.adminProviders();
            const items = res.data || [];
            content.innerHTML = `<div class="admin-list"></div>`;
            const list = content.querySelector('.admin-list');
            items.forEach(p => list.appendChild(renderProvider(p, list)));
        } else if (name === 'video-ads') {
            await renderVideoAds(content);
        } else if (name === 'fraud') {
            const res = await api.adminFraudSubmissions();
            const items = res.data || [];
            content.innerHTML = `<div class="card"><p class="muted">Risk signals are advisory. Confirm fraud only after reviewing the proof. A confirmed decision can optionally ban the worker and revoke active sessions.</p></div><div class="admin-list" id="fraud-list"></div>`;
            const list = content.querySelector('#fraud-list');
            if (!items.length) list.innerHTML = '<p class="muted">No flagged submissions.</p>';
            items.forEach(item => {
                const row = document.createElement('div');
                row.className = 'admin-row';
                row.innerHTML = `
                    <div>
                        <strong>${escapeHtml(item.worker_name || 'Unknown worker')}</strong>
                        <span class="muted">${escapeHtml(item.worker_email || '')} · Job: ${escapeHtml(item.job_title || '')}</span>
                        <p>${escapeHtml(item.description || '')}</p>
                        <span class="badge badge--danger">Risk ${Number(item.risk_score || 0).toFixed(0)}</span>
                        <span class="muted">${escapeHtml((item.risk_flags || []).join(', ') || 'Manual review')}</span>
                        ${item.attachment_url ? `<a href="${escapeHtml(item.attachment_url)}" target="_blank" rel="noopener">Open proof</a>` : ''}
                    </div>
                    <div class="admin-row__actions"><button class="btn btn--success btn--sm" data-fraud-decision="cleared">Clear</button><button class="btn btn--danger btn--sm" data-fraud-decision="confirmed_fraud">Confirm fraud</button></div>
                `;
                row.querySelectorAll('[data-fraud-decision]').forEach(button => button.addEventListener('click', async () => {
                    const decision = button.dataset.fraudDecision;
                    const note = decision === 'confirmed_fraud' ? prompt('Reason for confirming fraud:') : (prompt('Optional review note:') || '');
                    if (note === null || (decision === 'confirmed_fraud' && !note.trim())) return;
                    const banUser = decision === 'confirmed_fraud' && confirm('Also ban this worker and revoke active sessions?');
                    try {
                        const result = await api.adminReviewFraud(item.id, { decision, note, ban_user: banUser });
                        showFlash(result.data?.user_banned ? 'Fraud review saved and worker banned.' : 'Fraud review saved.', 'success');
                        row.remove();
                        if (!list.children.length) list.innerHTML = '<p class="muted">No flagged submissions.</p>';
                    } catch (e) { showFlash(e.message || 'Fraud review failed.', 'error'); }
                }));
                list.appendChild(row);
            });
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

async function renderVideoAds(content) {
    const response = await api.adminVideoAds();
    const items = response.data || [];
    content.innerHTML = `
        <form class="card admin-video-ad-form" id="video-ad-form">
            <h3 class="card__title">Add sponsored video</h3>
            <div class="admin-row__form">
                <label>Title <input name="title" required maxlength="160"></label>
                <label>Video <input name="video" type="file" accept="video/*" required></label>
                <label>Duration (seconds) <input name="duration_seconds" type="number" min="1" value="10" required></label>
                <label>Reward <input name="reward_amount" type="number" min="0" step="0.0001" value="0.005" required></label>
                <label>Daily limit (0 = unlimited) <input name="daily_limit" type="number" min="0" value="0"></label>
                <label>Total limit (0 = unlimited) <input name="total_limit" type="number" min="0" value="0"></label>
                <button class="btn btn--primary btn--sm" type="submit">Upload video ad</button>
            </div>
        </form>
        <div class="admin-list" id="video-ad-list"></div>
    `;
    const list = content.querySelector('#video-ad-list');
    if (!items.length) list.innerHTML = '<p class="muted">No video ads configured.</p>';
    items.forEach(ad => list.appendChild(renderVideoAdRow(ad, list)));
    content.querySelector('#video-ad-form').addEventListener('submit', async event => {
        event.preventDefault();
        const form = event.currentTarget;
        try {
            await api.adminCreateVideoAd(new FormData(form));
            showFlash('Video ad uploaded.', 'success');
            await renderVideoAds(content);
        } catch (e) { showFlash(e.message || 'Video upload failed.', 'error'); }
    });
}

function renderVideoAdRow(ad, list) {
    const row = document.createElement('div');
    row.className = 'admin-row admin-row--provider';
    row.innerHTML = `
        <div class="admin-row__main">
            <strong>${escapeHtml(ad.title)}</strong>
            <span class="muted">${ad.duration_seconds}s · reward ${Number(ad.reward_amount || 0).toFixed(4)} · ${Number(ad.completed_views || 0)}/${Number(ad.total_views || 0)} completed</span>
            <span class="badge ${ad.status === 'active' ? 'badge--green' : ''}">${escapeHtml(String(ad.status || '').toUpperCase())}</span>
        </div>
        <div class="admin-row__actions">
            <button class="btn btn--ghost btn--sm video-ad-toggle">${ad.status === 'active' ? 'Pause' : 'Activate'}</button>
            <button class="btn btn--danger btn--sm video-ad-delete">Delete</button>
        </div>
    `;
    row.querySelector('.video-ad-toggle').addEventListener('click', async () => {
        const form = new FormData();
        form.append('status', ad.status === 'active' ? 'paused' : 'active');
        try {
            await api.adminUpdateVideoAd(ad.id, form);
            showFlash('Video ad status updated.', 'success');
            await renderVideoAds(list.parentElement);
        } catch (e) { showFlash(e.message || 'Could not update video ad.', 'error'); }
    });
    row.querySelector('.video-ad-delete').addEventListener('click', async () => {
        if (!confirm(`Delete “${ad.title}”?`)) return;
        try {
            await api.adminDeleteVideoAd(ad.id);
            showFlash('Video ad deleted.', 'success');
            row.remove();
        } catch (e) { showFlash(e.message || 'Could not delete video ad.', 'error'); }
    });
    return row;
}

function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}
