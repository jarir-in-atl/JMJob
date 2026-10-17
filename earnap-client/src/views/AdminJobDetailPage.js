import { api } from '../api.js';
import { currentUser, navigate, showFlash } from '../state.js';

const proofPreviewUrls = new Set();

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
    proofPreviewUrls.forEach(url => URL.revokeObjectURL(url));
    proofPreviewUrls.clear();
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

    const jobAttachment = job.attachment_url || (job.attachment_path ? (job.attachment_path.startsWith('http') ? job.attachment_path : `/storage/${job.attachment_path}`) : null);
    const jobScreenshotMarkup = jobAttachment ? `
        <div class="job-screenshot-section" style="margin: 16px 0; padding: 14px; background: var(--card-bg, #ffffff); border: 1px solid var(--border-color, #e2e8f0); border-radius: 8px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 10px;">
                <strong style="display:flex; align-items:center; gap:6px;"><i class="bi bi-image" style="color:var(--primary, #4f46e5); font-size:1.1rem;"></i> Job Screenshot / Thumbnail:</strong>
                <a href="${escapeHtml(jobAttachment)}" target="_blank" rel="noopener noreferrer" class="btn btn--ghost btn--sm"><i class="bi bi-box-arrow-up-right"></i> Open full size</a>
            </div>
            <div style="text-align:center; background:#f8fafc; border-radius:6px; padding:10px; border:1px solid #edf2f7;">
                <a href="${escapeHtml(jobAttachment)}" target="_blank" rel="noopener noreferrer" style="display:inline-block; max-width:100%;">
                    <img src="${escapeHtml(jobAttachment)}" alt="Job screenshot" style="max-width: 100%; max-height: 400px; object-fit: contain; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.06);" />
                </a>
            </div>
        </div>
    ` : `
        <div class="job-screenshot-empty" style="margin: 16px 0; padding: 12px 16px; background: var(--bg-secondary, #f8fafc); border: 1px dashed var(--border-color, #cbd5e1); border-radius: 8px; display:flex; justify-content:space-between; align-items:center;">
            <span class="muted"><i class="bi bi-image"></i> No job screenshot attached.</span>
            <button type="button" class="btn btn--ghost btn--sm" id="btn-add-screenshot"><i class="bi bi-upload"></i> Upload / Edit screenshot</button>
        </div>
    `;

    const proofMarkup = proofRequirements.length
        ? `<div class="proof-requirements-list" style="margin-top:8px;">${proofRequirements.map((item, idx) => {
            const proofImg = item.image_url || item.fileBase64 || null;
            return `
                <div style="margin-bottom:8px; padding:10px 12px; background:var(--bg-secondary, #f8fafc); border:1px solid var(--border-color, #e2e8f0); border-radius:6px;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <strong>#${idx + 1}. ${escapeHtml(item.title || 'Requirement')}</strong>
                        <span class="badge" style="font-size:11px;">${escapeHtml(String(item.type || 'text').toUpperCase())}</span>
                    </div>
                    ${proofImg ? `
                        <div style="margin-top:8px;">
                            <span class="muted" style="font-size:12px; display:block; margin-bottom:4px;">Reference screenshot:</span>
                            <a href="${escapeHtml(proofImg)}" target="_blank" rel="noopener noreferrer" style="display:inline-block;">
                                <img src="${escapeHtml(proofImg)}" alt="Proof sample" style="max-height:160px; max-width:100%; border-radius:4px; border:1px solid #cbd5e1; object-fit:contain;" />
                            </a>
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('')}</div>`
        : '<p class="muted">No structured proof requirements configured.</p>';
    root.innerHTML = `
        <a href="#/admin/jobs" class="back-link"><i class="bi bi-arrow-left"></i> Job management</a>
        <div class="page-heading-row"><div><h1 class="page-title" data-i18n-ignore>${escapeHtml(job.title)}</h1><p class="muted" data-i18n-ignore>${escapeHtml(job.subtitle || '')}</p></div><div class="admin-row__actions"><button class="btn btn--ghost btn--sm" id="edit-job">Edit job</button>${canDelete(job, assignments) ? '<button class="btn btn--danger btn--sm" id="delete-job">Delete job</button>' : ''}</div></div>
        <div class="card"><div class="admin-job-row__meta"><span><strong>Customer:</strong> <span data-i18n-ignore>${escapeHtml(job.customer_name || '—')}</span></span><span><strong>Phone:</strong> <span data-i18n-ignore>${escapeHtml(job.customer_phone || '—')}</span></span><span><strong>Email:</strong> <span data-i18n-ignore>${escapeHtml(job.customer_email || '—')}</span></span><span><strong>Status:</strong> ${escapeHtml(String(job.status || '').replace('_', ' ').toUpperCase())}</span><span><strong>Start date:</strong> ${escapeHtml(formatDate(job.created_at))}</span><span><strong>Deadline:</strong> ${escapeHtml(formatDate(job.deadline_at))}</span></div>${jobScreenshotMarkup}<p data-i18n-ignore>${escapeHtml(job.description || '').replace(/\n/g, '<br>')}</p>${job.requirements ? `<p><strong>Requirements:</strong><br><span data-i18n-ignore>${escapeHtml(job.requirements).replace(/\n/g, '<br>')}</span></p>` : ''}<div><strong>Proof requirements:</strong>${proofMarkup}</div></div>
        <div class="stat-grid"><div class="stat-tile"><span class="muted">Total workers</span><strong>${Number(progress.total_workers || 0)}</strong></div><div class="stat-tile"><span class="muted">Assigned</span><strong>${Number(progress.assigned_workers || 0)}</strong></div><div class="stat-tile"><span class="muted">Working</span><strong>${Number(progress.in_progress_workers || 0)}</strong></div><div class="stat-tile"><span class="muted">Pending review</span><strong>${Number(progress.pending_review_workers || 0)}</strong></div><div class="stat-tile"><span class="muted">Revision</span><strong>${Number(progress.revision_workers || 0)}</strong></div><div class="stat-tile"><span class="muted">Completed</span><strong>${Number(progress.completed_workers || 0)}</strong></div><div class="stat-tile"><span class="muted">Rejected</span><strong>${Number(progress.rejected_workers || 0)}</strong></div><div class="stat-tile"><span class="muted">Cancelled/refunded</span><strong>${Number(progress.cancelled_workers || 0)}</strong></div><div class="stat-tile"><span class="muted">Remaining</span><strong>${Number(progress.remaining_workers || 0)}</strong></div><div class="stat-tile"><span class="muted">Total job amount</span><strong>${formatAmount(progress.total_amount, currency)}</strong></div><div class="stat-tile"><span class="muted">Total payable</span><strong>${formatAmount(progress.total_payable_amount, currency)}</strong></div><div class="stat-tile"><span class="muted">Completed amount</span><strong>${formatAmount(progress.completed_amount, currency)}</strong></div><div class="stat-tile"><span class="muted">Pending amount</span><strong>${formatAmount(progress.pending_amount, currency)}</strong></div><div class="stat-tile"><span class="muted">Remaining amount</span><strong>${formatAmount(progress.remaining_amount, currency)}</strong></div></div>
        <div class="card"><h2 class="card__title">Worker assignments</h2><div class="admin-list">${assignments.length ? assignments.map(item => renderAssignment(item, bids)).join('') : '<p class="muted">No assignments yet.</p>'}</div></div>
        <div class="card">
            <div class="card__header" style="display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap;">
                <h2 class="card__title">Worker bids</h2>
                <label>Filter workers
                    <select class="admin-select" id="admin-detail-bid-filter">
                        <option value="all">All</option><option value="pending">Pending</option><option value="accepted">Accepted</option><option value="declined">Declined</option><option value="other">Other</option>
                    </select>
                </label>
            </div>
            <div class="admin-list" id="admin-detail-bids">${bids.length ? bids.map(renderBid).join('') : '<p class="muted">No worker bids yet.</p>'}</div>
            <p class="muted" id="admin-detail-bids-filter-empty" hidden>No workers match this filter.</p>
        </div>
        <div class="card">
            <div class="card__header" style="display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap;">
                <h2 class="card__title">Submissions</h2>
                <label>Filter workers
                    <select class="admin-select" id="admin-detail-submission-filter">
                        <option value="all">All</option><option value="pending">Pending review</option><option value="accepted">Accepted</option><option value="declined">Declined</option><option value="revision">Revision</option>
                    </select>
                </label>
            </div>
            <div class="admin-list" id="admin-detail-submissions">${submissions.length ? submissions.map(submission => renderSubmission(submission, currency)).join('') : '<p class="muted">No submissions yet.</p>'}</div>
            <p class="muted" id="admin-detail-submissions-filter-empty" hidden>No workers match this filter.</p>
        </div>
   `;
    root.querySelector('#admin-detail-bid-filter')?.addEventListener('change', event => {
        applyWorkerFilter(root, '#admin-detail-bids', '#admin-detail-bids-filter-empty', event.target.value, 'bid');
    });
    root.querySelector('#admin-detail-submission-filter')?.addEventListener('change', event => {
        applyWorkerFilter(root, '#admin-detail-submissions', '#admin-detail-submissions-filter-empty', event.target.value, 'submission');
    });
    root.querySelector('#btn-add-screenshot')?.addEventListener('click', () => navigate(`/admin/admin-job-post?edit=${id}`));
    root.querySelector('#edit-job')?.addEventListener('click', () => navigate(`/admin/admin-job-post?edit=${id}`));
    root.querySelector('#delete-job')?.addEventListener('click', async () => {
        if (!confirm('Delete this job and its unassigned bids?')) return;
        try { await api.adminDeleteJob(id); showFlash('Job deleted.', 'success'); navigate('/admin/jobs'); }
        catch (error) { showFlash(error.message || 'Could not delete job.', 'error'); }
    });
    root.querySelectorAll('[data-accept-bid]').forEach(button => button.addEventListener('click', async () => {
        if (!confirm('Accept this worker and assign them to this job? Payment is credited after submitted work is approved.')) return;
        button.disabled = true;
        try {
            const response = await api.adminApproveApplication(button.dataset.acceptBid);
            showFlash(response.message || 'Worker assigned. Payment will be released after work is approved.', 'success');
            await load(root, id);
        } catch (error) {
            button.disabled = false;
            showFlash(error.message || 'Could not accept this worker.', 'error');
        }
    }));
    root.querySelectorAll('[data-decline-bid]').forEach(button => button.addEventListener('click', async () => {
        const reason = prompt('Optional reason for declining this worker:');
        if (reason === null) return;
        button.disabled = true;
        try {
            const response = await api.adminDeclineApplication(button.dataset.declineBid, { reason: reason.trim() });
            showFlash(response.message || 'Worker application declined.', 'success');
            await load(root, id);
        } catch (error) {
            button.disabled = false;
            showFlash(error.message || 'Could not decline this worker.', 'error');
        }
    }));
    root.querySelectorAll('[data-review-id]').forEach(button => button.addEventListener('click', async () => {
        const decision = button.dataset.reviewDecision;
        const submission = submissions.find(item => Number(item.id) === Number(button.dataset.reviewId));
        if (decision === 'approve' && Number(submission?.assignment_id || 0) > 0
            && !confirm('Approve this work and release the held payment to the worker?')) return;
        const note = decision === 'reject' ? prompt('Rejection reason:') : (prompt('Optional admin note:') || '');
        if (note === null || (decision === 'reject' && !note.trim())) return;
        try {
            const response = await api.adminReviewSubmission(button.dataset.reviewId, { decision, note });
            showFlash(response.message || 'Submission reviewed.', 'success');
            await load(root, id);
        }
        catch (error) { showFlash(error.message || 'Could not review submission.', 'error'); }
    }));
    root.querySelectorAll('[data-proof-attachment]').forEach(button => button.addEventListener('click', () => openProofAttachment(button.dataset.proofAttachment)));
    root.querySelectorAll('[data-bid-proof-attachment]').forEach(button => button.addEventListener('click', () => openBidProofAttachment(button.dataset.bidProofAttachment)));
    root.querySelectorAll('[data-ban-worker]').forEach(button => button.addEventListener('click', async () => {
        const workerId = button.dataset.banWorker;
        const isBanned = button.dataset.banState === '1';
        const reason = prompt(isBanned ? 'Reason for unbanning this worker:' : 'Reason for banning this worker:', isBanned ? 'Restored by administrator' : '');
        if (reason === null || (!isBanned && !reason.trim())) return;
        button.disabled = true;
        try {
            if (isBanned) {
                await api.adminUnbanUser(workerId, { reason: reason.trim() });
            } else {
                await api.adminBanUser(workerId, { reason: reason.trim() });
            }
            showFlash(isBanned ? 'Worker unbanned.' : 'Worker banned and active sessions revoked.', 'success');
            await load(root, id);
        } catch (error) {
            button.disabled = false;
            showFlash(error.message || 'Could not update worker ban state.', 'error');
        }
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
    loadProtectedProofPreviews(root, bids, submissions);
}

function renderAssignment(assignment, bids) {
    const canChange = assignment.payment_status === 'held' && !['cancelled', 'completed'].includes(assignment.status);
    const candidates = bids.filter(bid => bid.status === 'pending' && bid.worker_id !== assignment.worker_id);
    const controls = canChange ? `<div class="admin-row__actions"><button class="btn btn--danger btn--sm" data-cancel-assignment="${assignment.id}">Cancel/refund</button>${candidates.length ? `<select data-reassign-select="${assignment.id}" aria-label="Replacement worker"><option value="">Replace with…</option>${candidates.map(bid => `<option value="${bid.id}">${escapeHtml(bid.worker?.name || `Worker #${bid.worker_id}`)} · ৳${Number(bid.amount || 0).toFixed(2)}</option>`).join('')}</select><button class="btn btn--ghost btn--sm" data-reassign-assignment="${assignment.id}">Reassign</button>` : ''}</div>` : '';
    return `<div class="admin-row"><div><strong>${escapeHtml(assignment.worker?.name || 'Unknown worker')}</strong><span class="muted">${escapeHtml(assignment.worker?.email || '')} · ${escapeHtml(assignment.worker?.phone || '')}</span></div><div><span class="badge">${escapeHtml(String(assignment.status || '').toUpperCase())}</span><span class="muted"> ${escapeHtml(String(assignment.payment_status || '').toUpperCase())} · ${Number(assignment.payment_amount || 0).toFixed(2)}</span>${controls}</div></div>`;
}

function renderBid(bid) {
    const status = String(bid.status || 'pending').toLowerCase();
    const filterStatus = bidFilterStatus(status);
    const badgeStyle = status === 'accepted' ? 'success' : (status === 'rejected' ? 'danger' : (status === 'pending' ? 'warning' : ''));
    const isImage = bid.proof_attachment_type === 'image'
        || /\.(jpg|jpeg|png|gif|webp)$/i.test(String(bid.proof_attachment_name || ''));
    const proofMarkup = bid.proof_attachment_url ? `
        <div style="margin-top:8px;">
            <div data-bid-preview-message="${Number(bid.id)}" class="muted">${isImage ? 'Loading screenshot preview…' : escapeHtml(bid.proof_attachment_name || 'Work proof attached')}</div>
            ${isImage ? `<img data-bid-proof-preview="${Number(bid.id)}" alt="Worker bid proof screenshot" hidden style="max-width:100%; max-height:220px; margin-top:8px; border:1px solid #cbd5e1; border-radius:6px; object-fit:contain;" />` : ''}
            <button type="button" class="btn btn--ghost btn--sm" data-bid-proof-attachment="${Number(bid.id)}"><i class="bi ${isImage ? 'bi-image' : 'bi-file-earmark-text'}"></i> ${isImage ? 'Open screenshot' : 'Open work proof'}</button>
        </div>
    ` : '<p class="muted">No proof attachment provided with this bid.</p>';
    const decisionActions = status === 'pending' ? `
        <div class="admin-row__actions">
            <button class="btn btn--success btn--sm" data-accept-bid="${Number(bid.id)}" ${bid.worker?.is_banned ? 'disabled title="Banned workers cannot be assigned."' : ''}>Accept worker</button>
            <button class="btn btn--danger btn--sm" data-decline-bid="${Number(bid.id)}">Decline</button>
        </div>
    ` : '';
    const bannedLabel = bid.worker?.is_banned ? '<span class="badge badge--danger">BANNED</span>' : '';
    const statusLabel = status === 'rejected' ? 'DECLINED' : status.toUpperCase();
    return `<div class="admin-row" data-bid-filter-status="${filterStatus}"><div><strong>${escapeHtml(bid.worker?.name || `Worker #${bid.worker_id}`)}</strong><span class="muted">User ID #${escapeHtml(bid.worker_id)} · ${escapeHtml(bid.worker?.email || 'Email unavailable')} · ${escapeHtml(bid.worker?.phone || 'Phone unavailable')}</span><p>${escapeHtml(bid.proposal || '')}</p>${proofMarkup}</div><div><span class="badge ${badgeStyle ? `badge--${badgeStyle}` : ''}">${escapeHtml(statusLabel)}</span>${bannedLabel}<span class="muted"> ${formatAmount(bid.amount, bid.currency || 'BDT')} · ${Number(bid.delivery_days || 0)} days</span>${decisionActions}</div></div>`;
}

function renderSubmission(submission, currency) {
    const worker = submission.worker || {};
    const approveLabel = Number(submission.assignment_id || 0) > 0 ? 'Approve & Pay' : 'Approve';
    const reviewActions = submission.status === 'pending_review' ? `<button class="btn btn--success btn--sm" data-review-id="${submission.id}" data-review-decision="approve">${approveLabel}</button><button class="btn btn--danger btn--sm" data-review-id="${submission.id}" data-review-decision="reject">Decline</button>` : '';
    const banAction = worker.id ? `<button class="btn ${worker.is_banned ? 'btn--success' : 'btn--danger'} btn--sm" data-ban-worker="${worker.id}" data-ban-state="${worker.is_banned ? '1' : '0'}">${worker.is_banned ? 'Unban worker' : 'Ban worker'}</button>` : '';
    const actions = reviewActions || banAction ? `<div class="admin-row__actions">${reviewActions}${banAction}</div>` : '';
    const workerContact = `User ID #${escapeHtml(submission.worker_id)} · ${escapeHtml(worker.phone || 'Phone unavailable')} · ${escapeHtml(worker.email || 'Email unavailable')}`;
    const reviewNote = submission.reviewer_note || submission.rejection_reason;
    const risk = submission.risk_status && submission.risk_status !== 'clear'
        ? ` · Risk ${escapeHtml(String(submission.risk_status).replace('_', ' '))} (${Number(submission.risk_score || 0).toFixed(0)})`
        : '';
    const subAttachment = submission.attachment_url || (submission.attachment_path ? (submission.attachment_path.startsWith('http') ? submission.attachment_path : `/storage/${submission.attachment_path}`) : null);
    const subAttachmentPath = String(submission.attachment_path || '');
    const isImage = Boolean(subAttachment && (/\.(jpg|jpeg|png|gif|webp)$/i.test(subAttachment) || /\.(jpg|jpeg|png|gif|webp)$/i.test(subAttachmentPath)));
    const filterStatus = submissionFilterStatus(submission.status);
    const badgeStyle = submission.status === 'approved' ? 'success' : (submission.status === 'rejected' ? 'danger' : 'warning');
    const statusLabel = submission.status === 'approved'
        ? 'ACCEPTED'
        : (submission.status === 'rejected' ? 'DECLINED' : String(submission.status || '').replace('_', ' ').toUpperCase());
    const workerAmount = submission.assignment_payment_amount ?? submission.bid_amount;
    const paymentStatus = submission.payment_status === 'released'
        ? 'Paid'
        : (submission.payment_status === 'held' ? 'Held' : (submission.payment_status === 'refunded' ? 'Refunded' : ''));
    const attachmentAction = subAttachment
        ? `<button type="button" class="btn btn--ghost btn--sm" data-proof-attachment="${Number(submission.id)}"><i class="bi ${isImage ? 'bi-image' : 'bi-file-earmark-text'}"></i> ${isImage ? 'View screenshot' : 'Open proof attachment'}</button>`
        : '';
    const inlineImageMarkup = isImage ? `
        <div style="margin-top:8px;">
            <span data-submission-preview-message="${Number(submission.id)}" class="muted">Loading screenshot preview…</span>
            <img data-submission-proof-preview="${Number(submission.id)}" alt="Submission proof screenshot" hidden style="max-width:100%; max-height:220px; margin-top:6px; border-radius:4px; border:1px solid #cbd5e1; object-fit:contain;" />
        </div>
    ` : '';
    const amountMarkup = workerAmount !== null && workerAmount !== undefined
        ? `<span class="muted">Worker amount: <span data-i18n-ignore>${formatAmount(workerAmount, currency)}</span>${paymentStatus ? `<span> · </span><span>${paymentStatus}</span>` : ''}</span>`
        : '';
    return `<div class="admin-row" data-submission-filter-status="${filterStatus}"><div><strong>${escapeHtml(worker.name || 'Unknown worker')}</strong><span class="muted">${workerContact}</span><span class="muted">Submitted ${escapeHtml(formatDate(submission.submitted_at || submission.created_at))} · Attempt ${Number(submission.attempt_number || 1)}</span>${amountMarkup}<p>${escapeHtml(submission.description || '')}</p>${submission.external_link ? `<a href="${escapeHtml(submission.external_link)}" target="_blank" rel="noopener noreferrer">Open delivery link</a>` : ''}${attachmentAction}${inlineImageMarkup}${reviewNote ? `<p class="muted"><strong>Review note:</strong> ${escapeHtml(reviewNote)}</p>` : ''}</div><div><span class="badge badge--${badgeStyle}">${escapeHtml(statusLabel)}</span>${actions}</div></div>`;
}

function applyWorkerFilter(root, listSelector, emptySelector, filterValue, type) {
    const attribute = type === 'bid' ? 'bidFilterStatus' : 'submissionFilterStatus';
    const rows = root.querySelectorAll(`${listSelector} [data-${type}-filter-status]`);
    let visibleCount = 0;
    rows.forEach(row => {
        const visible = filterValue === 'all' || row.dataset[attribute] === filterValue;
        row.hidden = !visible;
        row.style.display = visible ? '' : 'none';
        if (visible) visibleCount++;
    });
    const empty = root.querySelector(emptySelector);
    if (empty) empty.hidden = visibleCount > 0 || rows.length === 0;
}

function bidFilterStatus(status) {
    if (status === 'accepted') return 'accepted';
    if (status === 'rejected') return 'declined';
    if (status === 'pending') return 'pending';
    return 'other';
}

function submissionFilterStatus(status) {
    if (status === 'approved') return 'accepted';
    if (status === 'rejected') return 'declined';
    if (status === 'pending_review') return 'pending';
    return 'revision';
}

function loadProtectedProofPreviews(root, bids, submissions) {
    bids.forEach(bid => {
        const isImage = bid.proof_attachment_type === 'image'
            || /\.(jpg|jpeg|png|gif|webp)$/i.test(String(bid.proof_attachment_name || ''));
        if (!isImage || !bid.proof_attachment_url) return;
        const image = root.querySelector(`[data-bid-proof-preview="${Number(bid.id)}"]`);
        const message = root.querySelector(`[data-bid-preview-message="${Number(bid.id)}"]`);
        if (image && message) {
            loadProtectedImagePreview(image, message, () => api.posterBidProofAttachment(bid.id));
        }
    });

    submissions.forEach(submission => {
        const attachment = String(submission.attachment_path || '');
        const isImage = /\.(jpg|jpeg|png|gif|webp)(?:$|\?)/i.test(attachment);
        if (!isImage || !attachment.replace(/^\//, '').startsWith('job-proofs/')) return;
        const image = root.querySelector(`[data-submission-proof-preview="${Number(submission.id)}"]`);
        const message = root.querySelector(`[data-submission-preview-message="${Number(submission.id)}"]`);
        if (image && message) {
            loadProtectedImagePreview(image, message, () => api.proofAttachment(submission.id));
        }
    });
}

async function loadProtectedImagePreview(image, message, fetchProof) {
    try {
        const blob = await fetchProof();
        if (!image.isConnected) return;
        const url = URL.createObjectURL(blob);
        proofPreviewUrls.add(url);
        image.addEventListener('load', () => {
            image.hidden = false;
            image.style.display = 'block';
            message.hidden = true;
        }, { once: true });
        image.addEventListener('error', () => {
            image.hidden = true;
            message.textContent = 'Preview unavailable. Use the button to open the proof.';
            URL.revokeObjectURL(url);
            proofPreviewUrls.delete(url);
        }, { once: true });
        image.src = url;
    } catch (_) {
        if (image.isConnected) message.textContent = 'Preview unavailable. Use the button to open the proof.';
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

async function openBidProofAttachment(id) {
    const popup = window.open('about:blank', '_blank', 'noopener,noreferrer');
    try {
        const blob = await api.posterBidProofAttachment(id);
        const url = URL.createObjectURL(blob);
        if (popup) popup.location.href = url;
        else window.location.href = url;
        setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (error) {
        if (popup) popup.close();
        showFlash(error.message || 'Could not open the worker proof attachment.', 'error');
    }
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
