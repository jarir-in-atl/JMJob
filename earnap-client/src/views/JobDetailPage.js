// JobDetailPage — job detail + bid form (or show work-submit if assigned).
import { api } from '../api.js';
import { currentUser, navigate, showFlash, refreshUser } from '../state.js';

const FILE_PROOF_TYPES = new Set(['screenshot', 'file', 'attachment', 'image', 'document']);

function proofRequirementType(requirement) {
    return typeof requirement === 'object'
        ? String(requirement?.type || 'text').toLowerCase()
        : String(requirement || 'text').toLowerCase();
}

function isFileProofRequirement(requirement) {
    return FILE_PROOF_TYPES.has(proofRequirementType(requirement));
}

function proofRequirementLabel(requirement) {
    const title = typeof requirement === 'object' ? requirement?.title : '';
    return title || (isFileProofRequirement(requirement) ? 'Screenshot / image / PDF / DOC / DOCX' : 'Written report');
}

export function JobDetailPage(id) {
    return async () => {
        const root = document.querySelector('[data-view]');
        if (!root) return;
        root.innerHTML = '';
        root.className = 'view view--job-detail';
        const user = currentUser.get();

        root.innerHTML = `
            <a href="#/jobs/available" class="back-link"><i class="bi bi-arrow-left"></i> Back to jobs</a>
            <div id="job-detail-content"><div class="spinner"></div></div>
        `;

        try {
            const res = await api.job(id);
            const { job, bids, bid_count, my_bid, my_submission } = res.data;
            render(job, bids, bid_count, my_bid, my_submission, user);
        } catch (err) {
            document.getElementById('job-detail-content').innerHTML =
                `<p class="muted">Failed to load: ${escapeHtml(err.message || 'unknown')}</p>`;
        }
    };
}

function render(job, bids, bidCount, myBid, mySubmission, user) {
    const content = document.getElementById('job-detail-content');
    if (!content) return;

    const closesAt = job.bidding_closes_at ? new Date(job.bidding_closes_at.replace(' ', 'T') + 'Z') : null;
    const closesIn = closesAt ? Math.max(0, Math.floor((closesAt - Date.now()) / 1000)) : null;
    const closesLabel = closesIn != null ? formatDuration(closesIn) : '—';

    const isOpen = ['open', 'in_review'].includes(job.status);
    const isWorker = !!user && !user.is_admin;
    const isOwnJob = !!user && Number(job.poster?.id || 0) === Number(user.id);
    const assignedToCurrentUser = isWorker && (
        !!job.assignment_id || Number(job.assigned_worker_id || 0) === Number(user.id)
    );
    const displayStatus = assignedToCurrentUser && job.assignment_status
        ? job.assignment_status
        : job.status;

    content.innerHTML = `
        <div class="card job-detail__card">
            <div class="job-detail__head">
                <div>
                    ${job.category ? `<span class="job-detail__cat"><i class="bi ${job.category.icon_class || ''}"></i> ${escapeHtml(job.category.name)}</span>` : ''}
                    <h1 class="job-detail__title">${escapeHtml(job.title)}</h1>
                    ${job.subtitle ? `<p class="muted">${escapeHtml(job.subtitle)}</p>` : ''}
                    <div class="job-detail__meta">
                        <span><i class="bi bi-cash"></i> Pay <strong>৳${parseFloat(job.cost_per_worker || job.budget || 0).toFixed(2)}</strong> / worker</span>
                        <span><i class="bi bi-people"></i> ${Number(job.remaining_workers ?? job.worker_count ?? 1)} available</span>
                        <span><i class="bi bi-people"></i> ${bidCount} bid${bidCount === 1 ? '' : 's'}</span>
                        <span><i class="bi bi-eye"></i> ${job.view_count} view${job.view_count === 1 ? '' : 's'}</span>
                        <span><i class="bi bi-clock"></i> Bidding closes in <strong>${closesLabel}</strong></span>
                    </div>
                </div>
                <span class="badge badge--status badge--${displayStatus}">${displayStatus.replace('_', ' ').toUpperCase()}</span>
            </div>
            <div class="job-detail__body">
                <h3>Description</h3>
                <p>${escapeHtml(job.description).replace(/\n/g, '<br>')}</p>
                ${job.requirements ? `<h3>Requirements</h3><p>${escapeHtml(job.requirements).replace(/\n/g, '<br>')}</p>` : ''}
                ${Array.isArray(job.proof_requirements) && job.proof_requirements.length ? `
                    <h3>Proof required</h3>
                    <div class="proof-requirements-list" style="margin-top:8px;">
                        ${job.proof_requirements.map((requirement, idx) => {
                            const isFile = isFileProofRequirement(requirement);
                            const title = typeof requirement === 'object' ? requirement?.title : '';
                            const displayTitle = title || (isFile ? 'Screenshot / Image proof' : 'Written report');
                            const proofImg = (typeof requirement === 'object' && (requirement.image_url || requirement.fileBase64)) ? (requirement.image_url || requirement.fileBase64) : null;
                            return `
                                <div style="margin-bottom:8px; padding:10px 12px; background:var(--bg-secondary, #f8fafc); border:1px solid var(--border-color, #e2e8f0); border-radius:6px;">
                                    <div style="display:flex; justify-content:space-between; align-items:center;">
                                        <span><strong>#${idx + 1}.</strong> ${escapeHtml(displayTitle)}</span>
                                        <span class="badge" style="font-size:11px;">${isFile ? 'IMAGE / SCREENSHOT' : 'TEXT PROOF'}</span>
                                    </div>
                                    ${proofImg ? `
                                        <div style="margin-top:8px;">
                                            <span class="muted" style="font-size:12px; display:block; margin-bottom:4px;">Sample reference image:</span>
                                            <a href="${escapeHtml(proofImg)}" target="_blank" rel="noopener noreferrer">
                                                <img src="${escapeHtml(proofImg)}" alt="Proof sample" style="max-height:120px; max-width:100%; border-radius:4px; border:1px solid #cbd5e1; object-fit:contain;" />
                                            </a>
                                        </div>
                                    ` : ''}
                                </div>
                            `;
                        }).join('')}
                    </div>
                ` : ''}
                <h3>Posted by</h3>
                <p>${job.poster ? escapeHtml(job.poster.name) : 'Unknown'} <span class="muted">@${job.poster?.username || '?'}</span></p>
            </div>
        </div>

        ${renderSubmissionSection(job, mySubmission, assignedToCurrentUser)}
        ${assignedToCurrentUser ? '' : renderBidSection(job, bids, myBid, user, isOpen, isOwnJob)}
    `;

    wireBidForm(job, myBid, user);
    wireSubmissionForm(job);
}

function renderSubmissionSection(job, submission, assignedToCurrentUser) {
    if (!assignedToCurrentUser) return '';

    const assignmentStatus = job.assignment_status || job.status;
    const status = submission?.status || assignmentStatus;
    if (submission && (submission.status === 'pending_review' || assignmentStatus === 'submitted')) {
        return `
            <div class="card">
                <h3 class="card__title">Your submission</h3>
                <p><span class="badge badge--status badge--${status}">${status.replace('_', ' ').toUpperCase()}</span></p>
                <p class="muted">Your work is awaiting poster review.</p>
            </div>
        `;
    }
    if (submission?.status === 'approved' || ['approved', 'completed'].includes(assignmentStatus)) {
        return `
            <div class="card">
                <h3 class="card__title">Your submission</h3>
                <p><span class="badge badge--status badge--approved">APPROVED</span></p>
                <p class="muted">Your work was approved and payment was released.</p>
            </div>
        `;
    }

    const canSubmit = ['assigned', 'in_progress', 'revision'].includes(assignmentStatus);
    if (!canSubmit) {
        return `<div class="card"><p class="muted">This assignment is ${escapeHtml(String(assignmentStatus).replace('_', ' '))}.</p></div>`;
    }
    const hasProofReqs = Array.isArray(job.proof_requirements) && job.proof_requirements.length > 0;
    const requiresProofAttachment = hasProofReqs && job.proof_requirements.some(isFileProofRequirement);
    const requiresWrittenReport = hasProofReqs && job.proof_requirements.some(r => !isFileProofRequirement(r));
    const revisionNote = submission?.reviewer_note || submission?.rejection_reason;
    return `
        <div class="card">
            <h3 class="card__title">Submit Work</h3>
            ${revisionNote ? `<p class="alert alert--warning"><strong>Revision requested:</strong> ${escapeHtml(revisionNote)}</p>` : ''}
            <form id="job-submission-form" class="submit-form">
                <label class="submit-form__label">
                    ${requiresWrittenReport ? 'Written report / delivery details (required)' : (requiresProofAttachment ? 'Submission notes / comments (optional)' : 'What did you deliver? (description)')}
                    <textarea name="description" rows="4" ${requiresWrittenReport ? 'required' : ''} placeholder="${requiresWrittenReport ? 'Describe your completed work or provide requested text proofs…' : 'Optional notes or comments about your submission…'}">${escapeHtml(submission?.description || '')}</textarea>
                </label>
                <label class="submit-form__label">
                    External link (optional)
                    <input name="external_link" type="url" value="${escapeHtml(submission?.external_link || '')}" placeholder="https://…">
                </label>
                <label class="submit-form__label">
                    Work proof attachment ${requiresProofAttachment ? '(required)' : '(optional)'}
                    <input name="screenshot" type="file" accept="image/jpeg,image/png,image/gif,image/webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx" ${requiresProofAttachment ? 'required' : ''}>
                    <small class="muted">Screenshot/image: JPG, PNG, GIF, or WEBP up to 10 MB. Documents: PDF, DOC, or DOCX up to 20 MB.</small>
                </label>
                <button type="submit" class="btn btn--success btn--xl" id="job-submit-work-btn">
                    <i class="bi bi-send"></i> Submit Work
                </button>
            </form>
        </div>
    `;
}

function wireSubmissionForm(job) {
    const form = document.getElementById('job-submission-form');
    if (!form) return;

    const hasProofReqs = Array.isArray(job.proof_requirements) && job.proof_requirements.length > 0;
    const requiresProofAttachment = hasProofReqs && job.proof_requirements.some(isFileProofRequirement);
    const requiresWrittenReport = hasProofReqs && job.proof_requirements.some(r => !isFileProofRequirement(r));

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const button = document.getElementById('job-submit-work-btn');
        const fd = new FormData(form);
        const description = String(fd.get('description') || '').trim();
        const external_link = String(fd.get('external_link') || '').trim();
        const screenshot = fd.get('screenshot');
        const hasFile = screenshot instanceof File && screenshot.size > 0;

        if (requiresProofAttachment && !hasFile) {
            showFlash('Please upload your proof screenshot/attachment.', 'error');
            return;
        }
        if (requiresWrittenReport && !description) {
            showFlash('Please provide a written report description.', 'error');
            return;
        }
        if (!requiresProofAttachment && !requiresWrittenReport && !description && !hasFile && !external_link) {
            showFlash('Please provide at least one form of proof (written description, screenshot, or external link).', 'error');
            return;
        }

        const payload = new FormData();
        payload.append('description', description);
        payload.append('external_link', external_link);
        if (hasFile) payload.append('screenshot', screenshot);
        button.disabled = true;
        button.innerHTML = '<i class="bi bi-hourglass"></i> Submitting…';
        try {
            await api.submitWork(job.id, payload);
            showFlash('Work submitted!', 'success');
            navigate('/jobs/' + job.id);
        } catch (err) {
            showFlash(err.message || 'Failed to submit.', 'error');
            button.disabled = false;
            button.innerHTML = '<i class="bi bi-send"></i> Submit Work';
        }
    });
}

function renderBidSection(job, bids, myBid, user, isOpen, isOwnJob) {
    if (isOwnJob) return '<div class="card"><p class="muted">You posted this job and cannot apply or bid on it.</p></div>';
    if (user?.is_admin) return '<div class="card"><p class="muted">Administrators manage applications from the admin console.</p></div>';
    if (myBid) {
        return `
            <div class="card">
                <h3 class="card__title">Your Bid</h3>
                <div class="bid-row bid-row--${myBid.status}">
                    <div>
                        <strong>৳${parseFloat(myBid.amount).toFixed(2)}</strong> in <strong>${myBid.delivery_days} day${myBid.delivery_days === 1 ? '' : 's'}</strong>
                        <div class="muted">${escapeHtml(myBid.proposal)}</div>
                    </div>
                    <span class="badge badge--status badge--${myBid.status}">${myBid.status.toUpperCase()}</span>
                </div>
                ${myBid.status === 'pending' ? `<button class="btn btn--ghost btn--sm" id="withdraw-bid-btn">Withdraw bid</button>` : ''}
            </div>
        `;
    }
    if (!isOpen) {
        return `<div class="card"><p class="muted">Bidding is closed for this job.</p></div>`;
    }
    if (!user) {
        return `<div class="card"><p class="muted">Please log in to place a bid.</p></div>`;
    }
    return `
        <div class="card">
            <h3 class="card__title">Place a Bid</h3>
            <form id="bid-form" class="bid-form">
                <label class="bid-form__label">
                    Your bid amount (৳)
                    <input name="amount" type="number" min="1" step="0.01" required>
                </label>
                <label class="bid-form__label">
                    Delivery time (days)
                    <input name="delivery_days" type="number" min="1" max="365" value="7" required>
                </label>
                <label class="bid-form__label">
                    Proposal (why you're a good fit)
                    <textarea name="proposal" rows="4" required placeholder="Describe your experience, approach, timeline…"></textarea>
                </label>
                <button type="submit" class="btn btn--primary btn--xl" id="bid-submit-btn">Submit Bid</button>
            </form>
        </div>
        <div class="card">
            <h3 class="card__title">Other Bids (${bids.length})</h3>
            ${bids.length === 0 ? '<p class="muted">No bids yet. Be the first!</p>' : `
                <div class="bid-list">
                    ${bids.map(b => `
                        <div class="bid-row">
                            <div>
                                <strong>৳${parseFloat(b.amount).toFixed(2)}</strong> · ${b.delivery_days} days
                                <div class="muted">${escapeHtml(b.proposal).slice(0, 100)}${b.proposal.length > 100 ? '…' : ''}</div>
                            </div>
                            <span class="muted">${b.worker?.name || 'Worker'}</span>
                        </div>
                    `).join('')}
                </div>
            `}
        </div>
    `;
}

function wireBidForm(job, myBid, user) {
    if (myBid) {
        const withdrawBtn = document.getElementById('withdraw-bid-btn');
        if (withdrawBtn) {
            withdrawBtn.addEventListener('click', async () => {
                if (!confirm('Withdraw your bid?')) return;
                try {
                    await api.withdrawBid(myBid.id);
                    showFlash('Bid withdrawn.', 'success');
                    navigate(`/jobs/${job.id}`);
                } catch (e) {
                    showFlash(e.message || 'Failed to withdraw.', 'error');
                }
            });
        }
        return;
    }
    const form = document.getElementById('bid-form');
    if (!form) return;
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const btn = document.getElementById('bid-submit-btn');
        btn.disabled = true; btn.textContent = 'Submitting…';
        try {
            await api.placeBid(job.id, {
                amount: parseFloat(fd.get('amount')),
                delivery_days: parseInt(fd.get('delivery_days'), 10),
                proposal: String(fd.get('proposal') || '').trim(),
            });
            showFlash('Bid placed!', 'success');
            navigate(`/jobs/${job.id}`);
        } catch (err) {
            showFlash(err.message || 'Failed to place bid.', 'error');
        } finally {
            btn.disabled = false; btn.textContent = 'Submit Bid';
        }
    });
}

function formatDuration(seconds) {
    if (seconds <= 0) return 'expired';
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    if (d > 0) return `${d}d ${h}h`;
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
}

function escapeHtml(s) {
    if (s === null || s === undefined) return '';
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
