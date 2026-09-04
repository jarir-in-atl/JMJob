// AdminTransactionsPage — searchable financial audit ledger.

import { api } from '../api.js';
import { currentUser } from '../state.js';

const TYPES = ['', 'deposit', 'withdrawal', 'escrow_hold', 'escrow_release', 'commission', 'refund', 'adjustment'];
let selectedType = '';

export function AdminTransactionsPage() {
    return async () => {
        const root = document.querySelector('[data-view]');
        if (!root) return;
        root.innerHTML = '';
        root.className = 'view view--admin-transactions';
        if (!currentUser.get()?.is_admin) {
            root.innerHTML = `<div class="card"><h2>403</h2><p>Admin only.</p><a class="btn btn--primary" href="#/">Go home</a></div>`;
            return;
        }
        root.innerHTML = `
            <h1 class="page-title">Transaction Ledger</h1>
            <p class="muted">Every deposit, withdrawal, escrow movement, commission, and refund recorded by the marketplace.</p>
            <div class="admin-toolbar">
                <label>Type
                    <select class="admin-select" id="admin-transaction-type">
                        ${TYPES.map(type => `<option value="${type}" ${type === selectedType ? 'selected' : ''}>${type ? type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'All transactions'}</option>`).join('')}
                    </select>
                </label>
                <button class="btn btn--ghost btn--sm" id="admin-transaction-refresh">Refresh</button>
            </div>
            <div class="admin-list" id="admin-transactions-list"><div class="spinner"></div></div>
        `;
        root.querySelector('#admin-transaction-type').addEventListener('change', async (event) => {
            selectedType = event.target.value;
            await load();
        });
        root.querySelector('#admin-transaction-refresh').addEventListener('click', load);
        await load();
    };
}

async function load() {
    const list = document.getElementById('admin-transactions-list');
    if (!list) return;
    list.innerHTML = '<div class="spinner"></div>';
    try {
        const res = await api.adminTransactions({ type: selectedType });
        const items = res.data || [];
        list.innerHTML = items.length ? '' : '<p class="muted">No transactions found for this filter.</p>';
        items.forEach(transaction => list.appendChild(renderTransaction(transaction)));
    } catch (error) {
        list.innerHTML = `<p class="muted">Failed to load ledger: ${escapeHtml(error.message || 'unknown error')}</p>`;
    }
}

function renderTransaction(transaction) {
    const row = document.createElement('article');
    row.className = `admin-row admin-transaction-row admin-transaction-row--${escapeHtml(transaction.type)}`;
    row.innerHTML = `
        <div class="admin-transaction-row__header">
            <div>
                <strong>${escapeHtml(String(transaction.type || '').replace('_', ' ').toUpperCase())}</strong>
                <span class="badge">#${Number(transaction.id || 0)}</span>
            </div>
            <strong class="admin-row__amount">${escapeHtml(transaction.currency || 'BDT')} ${Number(transaction.amount || 0).toFixed(2)}</strong>
        </div>
        <div class="admin-transaction-row__meta">
            <span><strong>User:</strong> ${escapeHtml(transaction.user_name || 'Platform')} ${transaction.user_email ? `<span class="muted">(${escapeHtml(transaction.user_email)})</span>` : ''}</span>
            <span><strong>Job:</strong> ${escapeHtml(transaction.job_title || (transaction.job_id ? `#${transaction.job_id}` : '—'))}</span>
            <span><strong>Date:</strong> ${formatDate(transaction.created_at)}</span>
        </div>
        ${transaction.note ? `<p class="muted admin-transaction-row__note">${escapeHtml(transaction.note)}</p>` : ''}
        ${transaction.reference ? `<code class="admin-transaction-row__reference">${escapeHtml(transaction.reference)}</code>` : ''}
    `;
    return row;
}

function formatDate(value) {
    if (!value) return 'unknown';
    const date = new Date(String(value).replace(' ', 'T') + 'Z');
    return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
}

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
}
