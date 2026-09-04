// AdminJobsPage — job oversight and dispute resolution.

import { api } from '../api.js';
import { showFlash, currentUser } from '../state.js';

const STATUSES = ['', 'open', 'in_review', 'assigned', 'submitted', 'revision', 'disputed', 'completed', 'cancelled', 'expired'];
let selectedStatus = '';

export function AdminJobsPage() {
    return async () => {
        const root = document.querySelector('[data-view]');
        if (!root) return;
        root.innerHTML = '';
        root.className = 'view view--admin-jobs';
        if (!currentUser.get()?.is_admin) {
            root.innerHTML = `<div class="card"><h2>403</h2><p>Admin only.</p><a class="btn btn--primary" href="#/">Go home</a></div>`;
            return;
        }
        root.innerHTML = `
            <h1 class="page-title">Job Oversight</h1>
            <p class="muted">Monitor marketplace jobs and send active work to dispute review when intervention is needed.</p>
            <div class="admin-toolbar">
                <label>Status
                    <select class="admin-select" id="admin-job-status">
                        ${STATUSES.map(status => `<option value="${status}" ${status === selectedStatus ? 'selected' : ''}>${status ? status.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'All jobs'}</option>`).join('')}
                    </select>
                </label>
                <button class="btn btn--ghost btn--sm" id="admin-job-refresh">Refresh</button>
            </div>
            <div class="admin-list" id="admin-jobs-list"><div class="spinner"></div></div>
        `;
        root.querySelector('#admin-job-status').addEventListener('change', async (event) => {
            selectedStatus = event.target.value;
            await load();
        });
        root.querySelector('#admin-job-refresh').addEventListener('click', load);
        await load();
    };
}

async function load() {
    const list = document.getElementById('admin-jobs-list');
    if (!list) return;
    list.innerHTML = '<div class="spinner"></div>';
    try {
        const res = await api.adminJobs(selectedStatus);
        const items = res.data || [];
        list.innerHTML = items.length ? '' : '<p class="muted">No jobs found for this filter.</p>';
        items.forEach(job => list.appendChild(renderJob(job)));
    } catch (error) {
        list.innerHTML = `<p class="muted">Failed to load jobs: ${escapeHtml(error.message || 'unknown error')}</p>`;
    }
}

function renderJob(job) {
    const row = document.createElement('article');
    row.className = `admin-row admin-job-row admin-job-row--${escapeHtml(job.status)}`;
    const worker = job.worker ? `${escapeHtml(job.worker.name)} <span class="muted">(${escapeHtml(job.worker.email || '')})</span>` : '<span class="muted">Unassigned</span>';
    row.innerHTML = `
        <div class="admin-job-row__header">
            <div>
                <strong>${escapeHtml(job.title)}</strong>
                <span class="badge">${escapeHtml(String(job.status || '').replace('_', ' ').toUpperCase())}</span>
            </div>
            <strong class="admin-row__amount">${escapeHtml(job.currency || 'BDT')} ${Number(job.budget || 0).toFixed(2)}</strong>
        </div>
        <p class="admin-job-row__description muted">${escapeHtml(job.description || '')}</p>
        <div class="admin-job-row__meta">
            <span><strong>Poster:</strong> ${escapeHtml(job.poster?.name || '(deleted)')}</span>
            <span><strong>Worker:</strong> ${worker}</span>
            <span><strong>Category:</strong> ${escapeHtml(job.category_name || 'Uncategorized')}</span>
            <span><strong>Bids:</strong> ${Number(job.bid_count || 0).toLocaleString()} · <strong>Views:</strong> ${Number(job.view_count || 0).toLocaleString()}</span>
        </div>
        <div class="admin-job-row__footer">
            <span class="muted">Updated ${formatDate(job.updated_at || job.created_at)}</span>
            <div class="admin-row__actions"></div>
        </div>
    `;
    const actions = row.querySelector('.admin-row__actions');
    if (!['completed', 'cancelled', 'disputed'].includes(job.status)) {
        actions.appendChild(actionButton('Mark disputed', 'btn--danger', () => flagDispute(job.id)));
    }
    if (job.status === 'disputed') {
        actions.appendChild(actionButton('Release payment', 'btn--success', () => resolveJob(job.id, 'release')));
        actions.appendChild(actionButton('Cancel and refund', 'btn--danger', () => resolveJob(job.id, 'cancel')));
    }
    return row;
}

function actionButton(label, style, handler) {
    const button = document.createElement('button');
    button.className = `btn ${style} btn--sm`;
    button.textContent = label;
    button.addEventListener('click', handler);
    return button;
}

async function flagDispute(id) {
    if (!confirm('Flag this job for admin dispute review?')) return;
    try {
        await api.adminFlagJobDispute(id);
        showFlash('Job flagged for dispute review.', 'success');
        await load();
    } catch (error) { showFlash(error.message || 'Could not flag job.', 'error'); }
}

async function resolveJob(id, resolution) {
    const promptText = resolution === 'release'
        ? 'Release the held payment to the worker and close this dispute?'
        : 'Cancel this job and refund its escrow to the poster?';
    if (!confirm(promptText)) return;
    const reason = resolution === 'cancel' ? (prompt('Reason for cancellation:', 'Resolved by admin') || 'Resolved by admin') : '';
    try {
        await api.adminResolveJob(id, { resolution, reason });
        showFlash(resolution === 'release' ? 'Payment released.' : 'Job cancelled and escrow refunded.', 'success');
        await load();
    } catch (error) { showFlash(error.message || 'Could not resolve dispute.', 'error'); }
}

function formatDate(value) {
    if (!value) return 'unknown';
    const date = new Date(String(value).replace(' ', 'T') + 'Z');
    return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
}

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
}
