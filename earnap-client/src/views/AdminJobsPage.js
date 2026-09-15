// AdminJobsPage — Job Post (Pending Approval), Active Job management, and Moderation.

import { api } from '../api.js';
import { showFlash, currentUser } from '../state.js';

const STATUSES = [
    { value: 'pending_approval', label: 'Job Post (Pending Approval)' },
    { value: 'open', label: 'Active Job' },
    { value: 'all', label: 'All Jobs' },
    { value: 'in_review', label: 'In Review' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'revision', label: 'Revision' },
    { value: 'disputed', label: 'Disputed' },
    { value: 'completed', label: 'Completed' },
    { value: 'declined', label: 'Declined' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'expired', label: 'Expired' },
];

let selectedStatus = 'pending_approval';

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

        const path = window.location.hash.replace(/^#/, '').split('?')[0];
        if (path === '/admin/pending-jobs') {
            selectedStatus = 'pending_approval';
        } else if (path === '/admin/active-jobs') {
            selectedStatus = 'open';
        }

        root.innerHTML = `
            <div class="page-heading-row">
                <div>
                    <h1 class="page-title">Job Management Center</h1>
                    <p class="muted">Review pending user job postings, activate approved jobs, and monitor live active jobs.</p>
                </div>
            </div>

            <div class="admin-tabs" style="margin-bottom: 20px;">
                <button class="admin-tab ${selectedStatus === 'pending_approval' ? 'admin-tab--active' : ''}" data-status="pending_approval">
                    <i class="bi bi-file-earmark-plus"></i> Job Post (Pending Approval)
                </button>
                <button class="admin-tab ${selectedStatus === 'open' ? 'admin-tab--active' : ''}" data-status="open">
                    <i class="bi bi-lightning-charge"></i> Active Job
                </button>
                <button class="admin-tab ${selectedStatus === 'all' ? 'admin-tab--active' : ''}" data-status="all">
                    <i class="bi bi-list-task"></i> All Jobs Moderation
                </button>
            </div>

            <div class="admin-toolbar" style="margin-bottom: 16px;">
                <label>Filter Status
                    <select class="admin-select" id="admin-job-status">
                        ${STATUSES.map(s => `<option value="${s.value}" ${s.value === selectedStatus ? 'selected' : ''}>${s.label}</option>`).join('')}
                    </select>
                </label>
                <button class="btn btn--ghost btn--sm" id="admin-job-refresh"><i class="bi bi-arrow-clockwise"></i> Refresh</button>
            </div>

            <div class="admin-list" id="admin-jobs-list"><div class="spinner"></div></div>
        `;

        const tabs = root.querySelectorAll('.admin-tab');
        tabs.forEach(t => {
            t.addEventListener('click', async () => {
                tabs.forEach(x => x.classList.remove('admin-tab--active'));
                t.classList.add('admin-tab--active');
                selectedStatus = t.dataset.status;
                const select = root.querySelector('#admin-job-status');
                if (select) select.value = selectedStatus;
                await load();
            });
        });

        root.querySelector('#admin-job-status').addEventListener('change', async (event) => {
            selectedStatus = event.target.value;
            tabs.forEach(t => t.classList.toggle('admin-tab--active', t.dataset.status === selectedStatus));
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
        const queryStatus = selectedStatus === 'all' ? '' : selectedStatus;
        const res = await api.adminJobs(queryStatus);
        const items = res.data || [];
        list.innerHTML = items.length ? '' : '<p class="muted card" style="padding:20px; text-align:center;">No jobs found for this section.</p>';
        items.forEach(job => list.appendChild(renderJob(job)));
    } catch (error) {
        list.innerHTML = `<p class="muted card" style="padding:20px;">Failed to load jobs: ${escapeHtml(error.message || 'unknown error')}</p>`;
    }
}

function renderJob(job) {
    const row = document.createElement('article');
    row.className = `admin-row admin-job-row admin-job-row--${escapeHtml(job.status)}`;

    const isPending = job.status === 'pending_approval';
    const isDeclined = job.status === 'declined';

    let metricsHtml = '';
    if (!isPending && !isDeclined) {
        metricsHtml = `
            <div class="admin-job-row__metrics" style="display: flex; gap: 16px; margin: 10px 0; background: rgba(0,0,0,0.03); padding: 10px 14px; border-radius: 6px; font-size: 13px;">
                <div><i class="bi bi-clock-history"></i> <strong>Days Remaining:</strong> <span style="color:#d97706;">${escapeHtml(job.days_remaining || 'N/A')}</span></div>
                <div><i class="bi bi-people"></i> <strong>Active Workers:</strong> ${Number(job.active_workers_count || 0)} / ${Number(job.worker_count || 1)} working</div>
                <div><i class="bi bi-check2-square"></i> <strong>Tasks Remaining:</strong> ${Number(job.remaining_tasks_count || 0)} slots left</div>
            </div>
        `;
    }

    row.innerHTML = `
        <div class="admin-job-row__header">
            <div>
                <strong>${escapeHtml(job.title)}</strong>
                <span class="badge badge--${isPending ? 'warning' : (isDeclined ? 'danger' : 'success')}">${escapeHtml(String(job.status || '').replace('_', ' ').toUpperCase())}</span>
            </div>
            <strong class="admin-row__amount">${escapeHtml(job.currency || 'BDT')} ${Number(job.total_payable_amount || job.budget || 0).toFixed(2)}</strong>
        </div>

        <p class="admin-job-row__description muted">${escapeHtml(job.description || '')}</p>

        ${metricsHtml}

        <div class="admin-job-row__meta">
            <span><strong>Poster:</strong> ${escapeHtml(job.poster?.name || '(deleted)')} (${escapeHtml(job.poster?.email || '')})</span>
            <span><strong>Category:</strong> ${escapeHtml(job.category_name || 'Uncategorized')}</span>
            <span><strong>Workers Needed:</strong> ${Number(job.worker_count || 1)}</span>
            <span><strong>Cost/Worker:</strong> ${escapeHtml(job.currency || 'BDT')} ${Number(job.cost_per_worker || 0).toFixed(2)}</span>
            ${job.decline_reason ? `<span style="color:#dc2626;"><strong>Decline Reason:</strong> ${escapeHtml(job.decline_reason)}</span>` : ''}
        </div>

        <div class="admin-job-row__footer">
            <span class="muted">Submitted: ${formatDate(job.created_at)}</span>
            <div class="admin-row__actions"></div>
        </div>
    `;

    const actions = row.querySelector('.admin-row__actions');

    if (isPending) {
        actions.appendChild(actionButton('Activate Job', 'btn--success', () => approveJob(job.id)));
        actions.appendChild(actionButton('Decline', 'btn--danger', () => declineJob(job.id)));
    } else if (job.status === 'disputed') {
        actions.appendChild(actionButton('Release Payment', 'btn--success', () => resolveJob(job.id, 'release')));
        actions.appendChild(actionButton('Cancel & Refund', 'btn--danger', () => resolveJob(job.id, 'cancel')));
    } else if (!['completed', 'cancelled', 'declined'].includes(job.status)) {
        actions.appendChild(actionButton('Mark Disputed', 'btn--danger', () => flagDispute(job.id)));
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

async function approveJob(id) {
    if (!confirm('Approve and activate this job post?')) return;
    try {
        await api.adminApproveJob(id);
        showFlash('Job approved and activated!', 'success');
        await load();
    } catch (error) {
        showFlash(error.message || 'Could not approve job.', 'error');
    }
}

async function declineJob(id) {
    const reason = prompt('Reason for declining this job post:');
    if (reason === null) return;
    try {
        await api.adminDeclineJob(id, { reason });
        showFlash('Job declined.', 'info');
        await load();
    } catch (error) {
        showFlash(error.message || 'Could not decline job.', 'error');
    }
}

async function flagDispute(id) {
    if (!confirm('Flag this job for admin dispute review?')) return;
    try {
        await api.adminFlagJobDispute(id);
        showFlash('Job flagged for dispute review.', 'success');
        await load();
    } catch (error) {
        showFlash(error.message || 'Could not flag job.', 'error');
    }
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
    } catch (error) {
        showFlash(error.message || 'Could not resolve dispute.', 'error');
    }
}

function formatDate(value) {
    if (!value) return 'unknown';
    const date = new Date(String(value).replace(' ', 'T') + 'Z');
    return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
}

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
}
