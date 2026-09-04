// AdminPaymentsPage — TRXID deposit verification panel.
// Admin can filter by status (pending/approved/rejected), approve (credits balance),
// or reject (with optional note). Mounted at #/admin/payments.

import { api } from '../api.js';
import { showFlash, currentUser } from '../state.js';

const STATUS_LABELS = {
    pending:  { label: 'Pending',  class: 'payment-row--pending'  },
    approved: { label: 'Approved', class: 'payment-row--approved' },
    rejected: { label: 'Rejected', class: 'payment-row--rejected' },
};

let _state = { status: 'pending', items: [], loading: false };

export function AdminPaymentsPage() {
    return async () => {
        const root = document.querySelector('[data-view]');
        if (!root) return;
        root.innerHTML = '';
        root.className = 'view view--admin-payments';
        const u = currentUser.get();
        if (!u || !u.is_admin) {
            root.innerHTML = `<div class="card"><h2>403</h2><p>Admin only.</p><a class="btn btn--primary" href="#/">Go home</a></div>`;
            return;
        }

        root.innerHTML = `
            <h1 class="page-title">Payment Verifications</h1>
            <p class="muted">Review TRXID-based deposits submitted by users. Approving credits the user's balance.</p>

            <div class="admin-tabs">
                <button class="admin-tab ${_state.status === 'pending'  ? 'admin-tab--active' : ''}" data-status="pending">Pending</button>
                <button class="admin-tab ${_state.status === 'approved' ? 'admin-tab--active' : ''}" data-status="approved">Approved</button>
                <button class="admin-tab ${_state.status === 'rejected' ? 'admin-tab--active' : ''}" data-status="rejected">Rejected</button>
                <button class="admin-tab ${_state.status === ''         ? 'admin-tab--active' : ''}" data-status="">All</button>
            </div>

            <div class="admin-list" id="admin-payments-list">
                <div class="spinner"></div>
            </div>
        `;

        // Wire tabs
        root.querySelectorAll('.admin-tab').forEach(btn => {
            btn.addEventListener('click', () => {
                _state.status = btn.getAttribute('data-status');
                root.querySelectorAll('.admin-tab').forEach(b => b.classList.remove('admin-tab--active'));
                btn.classList.add('admin-tab--active');
                loadList();
            });
        });

        await loadList();
    };
}

async function loadList() {
    const list = document.getElementById('admin-payments-list');
    if (!list) return;
    list.innerHTML = '<div class="spinner"></div>';
    try {
        const res = await api.adminPayments(_state.status);
        _state.items = res.data || [];
        renderList(list);
    } catch (err) {
        list.innerHTML = `<p class="muted">Error: ${escapeHtml(err.message || 'Failed to load.')}</p>`;
    }
}

function renderList(list) {
    if (_state.items.length === 0) {
        list.innerHTML = '<p class="muted">No payment submissions found.</p>';
        return;
    }
    list.innerHTML = '';
    _state.items.forEach(s => list.appendChild(renderRow(s)));
}

function renderRow(s) {
    const meta = STATUS_LABELS[s.status] || { label: s.status, class: '' };
    const row = document.createElement('div');
    row.className = `admin-row admin-row--payment ${meta.class}`;
    row.innerHTML = `
        <div class="admin-row__main">
            <div class="admin-row__amount">৳ ${parseFloat(s.amount).toFixed(2)} <span class="badge badge--gateway">${escapeHtml((s.gateway || '').toUpperCase())}</span></div>
            <div class="admin-row__sub">
                <strong>TRX:</strong> <code>${escapeHtml(s.trxid)}</code>
                &nbsp;•&nbsp;
                <strong>From:</strong> ${escapeHtml(s.sender_number)}
                ${s.user ? `&nbsp;•&nbsp;<strong>User:</strong> ${escapeHtml(s.user.name)} <span class="muted">(${escapeHtml(s.user.email)})</span>` : ''}
            </div>
            <div class="admin-row__meta">
                <span class="admin-row__status payment-row__status">${meta.label}</span>
                &nbsp;•&nbsp;
                <span class="muted">Submitted: ${formatDate(s.created_at)}</span>
                ${s.verified_at ? `&nbsp;•&nbsp;<span class="muted">Verified: ${formatDate(s.verified_at)}</span>` : ''}
            </div>
            ${s.admin_note ? `<div class="admin-row__note"><em>Note:</em> ${escapeHtml(s.admin_note)}</div>` : ''}
        </div>
        ${s.status === 'pending' ? `
        <div class="admin-row__actions">
            <button class="btn btn--success btn--sm" data-action="approve">
                <i class="bi bi-check-circle"></i> Approve
            </button>
            <button class="btn btn--danger btn--sm" data-action="reject">
                <i class="bi bi-x-circle"></i> Reject
            </button>
        </div>` : ''}
    `;

    if (s.status === 'pending') {
        row.querySelector('[data-action="approve"]')?.addEventListener('click', () =>
            handleAction(s.id, 'approve', row));
        row.querySelector('[data-action="reject"]')?.addEventListener('click', () =>
            handleAction(s.id, 'reject', row));
    }
    return row;
}

async function handleAction(id, action, row) {
    const note = prompt(action === 'approve'
        ? 'Optional note for approval:'
        : 'Reason for rejection:');
    if (note === null) return;
    try {
        const fn = action === 'approve' ? api.adminApprovePayment : api.adminRejectPayment;
        const res = await fn(id, { note: note || null });
        showFlash(res.message || 'Done.', 'success');
        await loadList();
    } catch (err) {
        showFlash(err.message || 'Action failed.', 'error');
    }
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
