// AdminJobsPage — Job Post (Pending Approval), Active Job management, Moderation, and Worker Proof Viewer.

import { api } from '../api.js';
import { showFlash, currentUser, navigate } from '../state.js';

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
const pendingJobApprovals = new Set();

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
                    <p class="muted">Review pending user job postings, activate approved jobs, track live active jobs, and inspect worker proofs & screenshots.</p>
                </div>
                <button class="btn btn--primary" id="admin-create-job"><i class="bi bi-plus-circle"></i> Admin Job Post</button>
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
            <div id="admin-proof-modal-container"></div>
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
        root.querySelector('#admin-create-job').addEventListener('click', () => navigate('/admin/admin-job-post'));
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
                <div><i class="bi bi-people"></i> <strong>Workers:</strong> ${Number(job.in_progress_workers || 0)} working / ${Number(job.pending_review_workers || 0)} review / ${Number(job.revision_workers || 0)} revision / ${Number(job.rejected_workers || 0)} rejected / ${Number(job.completed_workers || 0)} completed</div>
                <div><i class="bi bi-hourglass-split"></i> <strong>Unassigned:</strong> ${Number(job.remaining_workers ?? job.remaining_tasks_count ?? 0)} slots</div>
                <div><i class="bi bi-cash-stack"></i> <strong>Paid:</strong> ${escapeHtml(job.currency || 'BDT')} ${Number(job.completed_amount || 0).toFixed(2)} / <strong>Remaining:</strong> ${Number(job.remaining_amount || 0).toFixed(2)}</div>
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
        ${job.subtitle ? `<p class="muted"><strong>Subtitle:</strong> ${escapeHtml(job.subtitle)}</p>` : ''}

        ${metricsHtml}

        <div class="admin-job-row__meta">
            <span><strong>Customer:</strong> ${escapeHtml(job.customer_name || job.poster?.name || '(deleted)')} (${escapeHtml(job.customer_email || job.poster?.email || '')})</span>
            ${job.customer_phone ? `<span><strong>Phone:</strong> ${escapeHtml(job.customer_phone)}</span>` : ''}
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

    if (!isPending && !isDeclined) {
        actions.appendChild(actionButton('View Job Details', 'btn--ghost', () => navigate(`/admin/jobs/${job.id}`)));
        actions.appendChild(actionButton('View Proofs & Screenshots', 'btn--ghost', () => viewProofSubmissions(job.id, job.title)));
    }

    if (isPending) {
        const activateButton = actionButton('Activate Job', 'btn--success', () => approveJob(job.id, activateButton));
        if (pendingJobApprovals.has(job.id)) setActivationPending(activateButton);
        actions.appendChild(activateButton);
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

async function viewProofSubmissions(jobId, jobTitle) {
    const container = document.getElementById('admin-proof-modal-container');
    if (!container) return;
    container.innerHTML = `
        <div class="modal-backdrop" style="position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center; z-index:99999;">
            <div class="modal-card" style="background:#fff; width:90%; max-width:800px; max-height:85vh; border-radius:12px; padding:24px; overflow-y:auto; box-shadow:0 10px 30px rgba(0,0,0,0.2);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                    <h2 style="margin:0; font-size:18px;"><i class="bi bi-file-earmark-check"></i> Proof Submissions for "${escapeHtml(jobTitle)}"</h2>
                    <button class="btn btn--ghost btn--sm" id="close-proof-modal"><i class="bi bi-x-lg"></i> Close</button>
                </div>
                <div id="proof-modal-content"><div class="spinner"></div></div>
            </div>
        </div>
    `;

    const closeBtn = container.querySelector('#close-proof-modal');
    closeBtn.addEventListener('click', () => { container.innerHTML = ''; });

    const content = container.querySelector('#proof-modal-content');
    try {
        const res = await api.adminJobSubmissions(jobId);
        const data = res.data || {};
        const submissions = data.submissions || [];

        if (!submissions.length) {
            content.innerHTML = '<p class="muted" style="text-align:center; padding:30px;">No worker submissions or proof screenshots submitted yet for this job.</p>';
            return;
        }

        content.innerHTML = submissions.map(sub => {
            const proofData = sub.work_proof_data || {};
            const attachment = sub.attachment_url || (sub.attachment_path ? (sub.attachment_path.startsWith('http') ? sub.attachment_path : `/storage/${sub.attachment_path}`) : null);
            const attachmentPath = String(sub.attachment_path || '');
            const isImage = Boolean(attachment && (/\.(jpg|jpeg|png|gif|webp)$/i.test(attachment) || /\.(jpg|jpeg|png|gif|webp)$/i.test(attachmentPath)));
            const attachmentLabel = isImage ? 'View screenshot' : 'Open proof attachment';

            return `
                <div class="card" style="margin-bottom:16px; padding:16px; border:1px solid #e2e8f0; border-radius:8px; background:#f9fafb;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                        <div>
                            <strong><i class="bi bi-person"></i> ${escapeHtml(sub.worker_name)}</strong>
                            <span class="muted">User ID #${escapeHtml(sub.worker_id)} · ${escapeHtml(sub.worker_phone || 'Phone unavailable')} · ${escapeHtml(sub.worker_email || sub.worker_username || '')}</span>
                        </div>
                        <span class="badge badge--${sub.status === 'approved' ? 'success' : 'warning'}">${escapeHtml(sub.status.toUpperCase())}</span>
                    </div>

                    ${sub.description ? `<p style="margin:8px 0; font-size:14px; background:#fff; padding:10px; border-radius:6px; border:1px solid #edf2f7;"><strong>Proof Description:</strong><br>${escapeHtml(sub.description)}</p>` : ''}

                    ${sub.external_link ? `<div style="margin:8px 0;"><a href="${escapeHtml(sub.external_link)}" target="_blank" class="btn btn--ghost btn--sm"><i class="bi bi-box-arrow-up-right"></i> Open External Proof Link</a></div>` : ''}

                    ${attachment ? `
                        <div style="margin:10px 0;">
                            <strong>Proof Screenshot / Attachment:</strong><br>
                            <button type="button" class="btn btn--ghost btn--sm" data-proof-attachment="${Number(sub.id)}"><i class="bi ${isImage ? 'bi-image' : 'bi-file-earmark-text'}"></i> ${attachmentLabel}</button>
                        </div>
                    ` : ''}

                    ${sub.trx_id ? `<div style="font-size:12px; color:#475569; margin-top:6px;"><strong>TrxID:</strong> ${escapeHtml(sub.trx_id)} | <strong>bKash:</strong> ${escapeHtml(sub.bkash_number || 'N/A')}</div>` : ''}

                    <div style="font-size:12px; color:#64748b; margin-top:8px;">Submitted on: ${formatDate(sub.submitted_at || sub.created_at)} · Attempt ${Number(sub.attempt_number || 1)}</div>
                </div>
            `;
        }).join('');

        content.querySelectorAll('[data-proof-attachment]').forEach(button => button.addEventListener('click', () => openProofAttachment(button.dataset.proofAttachment)));

        content.querySelectorAll('.card').forEach((card, index) => {
            const submission = submissions[index];
            if (!submission || submission.status !== 'pending_review') return;

            const actions = document.createElement('div');
            actions.style.cssText = 'display:flex; gap:8px; margin-top:12px;';

            const approve = document.createElement('button');
            approve.className = 'btn btn--success btn--sm';
            approve.textContent = 'Approve for payment review';
            approve.addEventListener('click', () => reviewSubmission(submission, jobId, jobTitle, approve, reject));

            const reject = document.createElement('button');
            reject.className = 'btn btn--danger btn--sm';
            reject.textContent = 'Reject';
            reject.addEventListener('click', () => reviewSubmission(submission, jobId, jobTitle, reject, approve));

            actions.append(approve, reject);
            card.appendChild(actions);
        });
    } catch (error) {
        content.innerHTML = `<p class="muted">Failed to load submissions: ${escapeHtml(error.message || 'unknown error')}</p>`;
    }
}

async function openProofAttachment(id) {
    const popup = window.open('about:blank', '_blank', 'noopener,noreferrer');
    try {
        const blob = await api.proofAttachment(id);
        const url = URL.createObjectURL(blob);
        if (popup) popup.location.href = url;
        else window.location.href = url;
        setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (error) {
        if (popup) popup.close();
        showFlash(error.message || 'Could not open the proof attachment.', 'error');
    }
}

async function reviewSubmission(submission, jobId, jobTitle, button, sibling) {
    const decision = button.textContent.startsWith('Approve') ? 'approve' : 'reject';
    const note = decision === 'reject'
        ? prompt('Rejection reason:')
        : (prompt('Optional admin note:') || '');
    if (note === null) return;
    if (decision === 'reject' && !note.trim()) {
        showFlash('A rejection reason is required.', 'error');
        return;
    }

    button.disabled = true;
    sibling.disabled = true;
    try {
        await api.adminReviewSubmission(submission.id, { decision, note });
        showFlash(decision === 'approve' ? 'Submission approved for payment review.' : 'Submission rejected.', 'success');
        await viewProofSubmissions(jobId, jobTitle);
    } catch (error) {
        button.disabled = false;
        sibling.disabled = false;
        showFlash(error.message || 'Could not review submission.', 'error');
    }
}

function setActivationPending(button) {
    if (!button) return;
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    button.innerHTML = '<i class="bi bi-hourglass-split"></i> Activating...';
}

function restoreActivationButton(button) {
    if (!button || !button.isConnected) return;
    button.disabled = false;
    button.removeAttribute('aria-busy');
    button.innerHTML = 'Activate Job';
}

async function approveJob(id, button) {
    if (pendingJobApprovals.has(id)) {
        setActivationPending(button);
        return;
    }
    if (!confirm('Approve and activate this job post?')) return;

    pendingJobApprovals.add(id);
    setActivationPending(button);
    try {
        await api.adminApproveJob(id);
        showFlash('Job approved and activated!', 'success');
        pendingJobApprovals.delete(id);
        await load();
    } catch (error) {
        pendingJobApprovals.delete(id);
        restoreActivationButton(button);
        showFlash(error.message || 'Could not approve job.', 'error');
    } finally {
        pendingJobApprovals.delete(id);
        restoreActivationButton(button);
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
