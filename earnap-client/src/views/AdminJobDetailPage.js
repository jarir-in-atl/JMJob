import { api } from '../api.js';
import { currentUser, navigate, showFlash } from '../state.js';

export function AdminJobDetailPage(id) {
    return async () => {
        const root = document.querySelector('[data-view]');
        if (!root) return;
        root.className = 'view view--admin-job-detail';
        if (!currentUser.get()?.is_admin) {
            root.innerHTML = '<div class="card"><h2>403</h2><p>Admin access required.</p></div>';
            return;
        }
        root.innerHTML = '<div class="card"><p class="muted">Loading job detail…</p></div>';
        await load(root, id);
    };
}

async function load(root, id) {
    try {
        const response = await api.adminJobDetail(id);
        render(root, response.data || {}, id);
    } catch (error) {
        root.innerHTML = `<div class="card"><p class="muted">Could not load job: ${escapeHtml(error.message || 'unknown error')}</p></div>`;
    }
}

function render(root, data, id) {
    const job = data.job || {};
    const progress = data.progress || {};
   const assignments = data.assignments || [];
   const bids = data.bids || [];
   const submissions = data.submissions || [];
    const currency = job.currency || 'BDT';
    const proofRequirements = Array.isArray(job.proof_requirements) ? job.proof_requirements : [];
    const proofMarkup = proofRequirements.length
        ? `<ul>${proofRequirements.map(item => `<li>${escapeHtml(item.title || 'Proof')} <span class="muted">(${escapeHtml(item.type || 'text')})</span></li>`).join('')}</ul>`
        : '<p class="muted">No structured proof requirements configured.</p>';
   root.innerHTML = `
        <a href="#/admin/jobs" class="back-link"><i class="bi bi-arrow-left"></i> Job management</a>
        <div class="page-heading-row"><div><h1 class="page-title">${escapeHtml(job.title)}</h1><p class="muted">${escapeHtml(job.subtitle || '')}</p></div><div class="admin-row__actions"><button class="btn btn--ghost btn--sm" id="edit-job">Edit job</button>${canDelete(job, assignments) ? '<button class="btn btn--danger btn--sm" id="delete-job">Delete job</button>' : ''}</div></div>
        <div class="card"><div class="admin-job-row__meta"><span><strong>Customer:</strong> ${escapeHtml(job.customer_name || '—')}</span><span><strong>Phone:</strong> ${escapeHtml(job.customer_phone || '—')}</span><span><strong>Email:</strong> ${escapeHtml(job.customer_email || '—')}</span><span><strong>Status:</strong> ${escapeHtml(String(job.status || '').replace('_', ' ').toUpperCase())}</span><span><strong>Start date:</strong> ${escapeHtml(formatDate(job.created_at))}</span><span><strong>Deadline:</strong> ${escapeHtml(formatDate(job.deadline_at))}</span></div><p>${escapeHtml(job.description || '').replace(/\n/g, '<br>')}</p>${job.requirements ? `<p><strong>Requirements:</strong><br>${escapeHtml(job.requirements).replace(/\n/g, '<br>')}</p>` : ''}<div><strong>Proof requirements:</strong>${proofMarkup}</div></div>
        <div class="stat-grid"><div class="stat-tile"><span class="muted">Total workers</span><strong>${Number(progress.total_workers || 0)}</strong></div><div class="stat-tile"><span class="muted">Completed</span><strong>${Number(progress.completed_workers || 0)}</strong></div><div class="stat-tile"><span class="muted">Pending</span><strong>${Number(progress.pending_workers || 0)}</strong></div><div class="stat-tile"><span class="muted">Rejected</span><strong>${Number(progress.rejected_workers || 0)}</strong></div><div class="stat-tile"><span class="muted">Remaining</span><strong>${Number(progress.remaining_workers || 0)}</strong></div><div class="stat-tile"><span class="muted">Total job amount</span><strong>${formatAmount(progress.total_amount, currency)}</strong></div><div class="stat-tile"><span class="muted">Total payable</span><strong>${formatAmount(progress.total_payable_amount, currency)}</strong></div><div class="stat-tile"><span class="muted">Completed amount</span><strong>${formatAmount(progress.completed_amount, currency)}</strong></div><div class="stat-tile"><span class="muted">Pending amount</span><strong>${formatAmount(progress.pending_amount, currency)}</strong></div><div class="stat-tile"><span class="muted">Remaining amount</span><strong>${formatAmount(progress.remaining_amount, currency)}</strong></div></div>
        <div class="card"><h2 class="card__title">Worker assignments</h2><div class="admin-list">${assignments.length ? assignments.map(item => renderAssignment(item, bids)).join('') : '<p class="muted">No assignments yet.</p>'}</div></div>
        <div class="card"><h2 class="card__title">Pending worker bids</h2><div class="admin-list">${bids.filter(bid => bid.status === 'pending').length ? bids.filter(bid => bid.status === 'pending').map(renderBid).join('') : '<p class="muted">No pending bids.</p>'}</div></div>
        <div class="card"><h2 class="card__title">Submissions</h2><div class="admin-list" id="admin-detail-submissions">${submissions.length ? submissions.map(renderSubmission).join('') : '<p class="muted">No submissions yet.</p>'}</div></div>
   `;
    root.querySelector('#edit-job')?.addEventListener('click', () => navigate(`/admin/admin-job-post?edit=${id}`));
    root.querySelector('#delete-job')?.addEventListener('click', async () => {
        if (!confirm('Delete this job and its unassigned bids?')) return;
        try { await api.adminDeleteJob(id); showFlash('Job deleted.', 'success'); navigate('/admin/jobs'); }
        catch (error) { showFlash(error.message || 'Could not delete job.', 'error'); }
    });
    root.querySelectorAll('[data-review-id]').forEach(button => button.addEventListener('click', async () => {
        const decision = button.dataset.reviewDecision;
        const note = decision === 'reject' ? prompt('Rejection reason:') : (prompt('Optional admin note:') || '');
        if (note === null || (decision === 'reject' && !note.trim())) return;
        try { await api.adminReviewSubmission(button.dataset.reviewId, { decision, note }); showFlash('Submission reviewed.', 'success'); await load(root, id); }
        catch (error) { showFlash(error.message || 'Could not review submission.', 'error'); }
    }));
    root.querySelectorAll('[data-cancel-assignment]').forEach(button => button.addEventListener('click', async () => {
        const reason = prompt('Reason for cancelling this assignment:');
        if (!reason || !reason.trim()) return;
        try { await api.adminCancelAssignment(button.dataset.cancelAssignment, { reason: reason.trim() }); showFlash('Assignment cancelled and refunded.', 'success'); await load(root, id); }
        catch (error) { showFlash(error.message || 'Could not cancel assignment.', 'error'); }
    }));
    root.querySelectorAll('[data-reassign-assignment]').forEach(button => button.addEventListener('click', async () => {
        const select = root.querySelector(`[data-reassign-select="${button.dataset.reassignAssignment}"]`);
        const bidId = Number(select?.value || 0);
        if (!bidId) { showFlash('Select a pending replacement bid first.', 'error'); return; }
        const reason = prompt('Reason for reassignment:') || 'Reassigned by administrator';
        try { await api.adminReassignAssignment(button.dataset.reassignAssignment, { bid_id: bidId, reason: reason.trim() }); showFlash('Worker reassigned.', 'success'); await load(root, id); }
        catch (error) { showFlash(error.message || 'Could not reassign worker.', 'error'); }
    }));
}

function renderAssignment(assignment, bids) {
    const canChange = assignment.payment_status === 'held' && !['cancelled', 'completed'].includes(assignment.status);
    const candidates = bids.filter(bid => bid.status === 'pending' && bid.worker_id !== assignment.worker_id);
    const controls = canChange ? `<div class="admin-row__actions"><button class="btn btn--danger btn--sm" data-cancel-assignment="${assignment.id}">Cancel/refund</button>${candidates.length ? `<select data-reassign-select="${assignment.id}" aria-label="Replacement worker"><option value="">Replace with…</option>${candidates.map(bid => `<option value="${bid.id}">${escapeHtml(bid.worker?.name || `Worker #${bid.worker_id}`)} · ৳${Number(bid.amount || 0).toFixed(2)}</option>`).join('')}</select><button class="btn btn--ghost btn--sm" data-reassign-assignment="${assignment.id}">Reassign</button>` : ''}</div>` : '';
    return `<div class="admin-row"><div><strong>${escapeHtml(assignment.worker?.name || 'Unknown worker')}</strong><span class="muted">${escapeHtml(assignment.worker?.email || '')} · ${escapeHtml(assignment.worker?.phone || '')}</span></div><div><span class="badge">${escapeHtml(String(assignment.status || '').toUpperCase())}</span><span class="muted"> ${escapeHtml(String(assignment.payment_status || '').toUpperCase())} · ${Number(assignment.payment_amount || 0).toFixed(2)}</span>${controls}</div></div>`;
}

function renderBid(bid) {
    return `<div class="admin-row"><div><strong>${escapeHtml(bid.worker?.name || `Worker #${bid.worker_id}`)}</strong><span class="muted">${escapeHtml(bid.worker?.email || '')} · ${escapeHtml(bid.worker?.phone || '')}</span><p>${escapeHtml(bid.proposal || '')}</p></div><div><span class="badge">PENDING</span><span class="muted"> ৳${Number(bid.amount || 0).toFixed(2)}</span></div></div>`;
}

function renderSubmission(submission) {
    const actions = submission.status === 'pending_review' ? `<div class="admin-row__actions"><button class="btn btn--success btn--sm" data-review-id="${submission.id}" data-review-decision="approve">Approve</button><button class="btn btn--danger btn--sm" data-review-id="${submission.id}" data-review-decision="reject">Reject</button></div>` : '';
    const worker = submission.worker || {};
    const workerContact = `User ID #${escapeHtml(submission.worker_id)} · ${escapeHtml(worker.phone || 'Phone unavailable')} · ${escapeHtml(worker.email || 'Email unavailable')}`;
    const reviewNote = submission.reviewer_note || submission.rejection_reason;
    const risk = submission.risk_status && submission.risk_status !== 'clear'
        ? ` · Risk ${escapeHtml(String(submission.risk_status).replace('_', ' '))} (${Number(submission.risk_score || 0).toFixed(0)})`
        : '';
    return `<div class="admin-row"><div><strong>${escapeHtml(worker.name || 'Unknown worker')}</strong><span class="muted">${workerContact}</span><span class="muted">Submitted ${escapeHtml(formatDate(submission.submitted_at || submission.created_at))} · Attempt ${Number(submission.attempt_number || 1)} · ${escapeHtml(String(submission.status || '').replace('_', ' '))}${risk}</span><p>${escapeHtml(submission.description || '')}</p>${submission.external_link ? `<a href="${escapeHtml(submission.external_link)}" target="_blank" rel="noopener">Open delivery link</a>` : ''}${submission.attachment_url ? `${submission.external_link ? ' · ' : ''}<a href="${escapeHtml(submission.attachment_url)}" target="_blank" rel="noopener">Open screenshot</a>` : ''}${reviewNote ? `<p class="muted"><strong>Review note:</strong> ${escapeHtml(reviewNote)}</p>` : ''}</div>${actions}</div>`;
}

function canDelete(job, assignments) {
    return !['completed', 'disputed'].includes(job.status) && !assignments.some(item => !['cancelled'].includes(item.status));
}

function formatDate(value) {
    if (!value) return 'unknown';
    const date = new Date(String(value).replace(' ', 'T') + 'Z');
    return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
}

function formatAmount(value, currency) {
    return `${escapeHtml(currency || 'BDT')} ${Number(value || 0).toFixed(2)}`;
}

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
}
