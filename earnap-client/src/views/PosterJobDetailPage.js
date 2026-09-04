// PosterJobDetailPage — compare bids, select a worker, and review submissions.

import { api } from '../api.js';
import { currentUser, navigate, showFlash } from '../state.js';

export function PosterJobDetailPage(id) {
    return async () => {
        const root = document.querySelector('[data-view]');
        if (!root) return;
        root.innerHTML = '';
        root.className = 'view view--poster-job-detail';
        if (!hasPosterAccess()) {
            root.innerHTML = `<div class="card"><h2>Poster access required</h2><a class="btn btn--primary" href="#/">Go home</a></div>`;
            return;
        }
        root.innerHTML = `<a href="#/poster/jobs" class="back-link"><i class="bi bi-arrow-left"></i> My jobs</a><div id="poster-job-detail-content"><div class="spinner"></div></div>`;
        await load(id);
    };
}

async function load(id) {
    const content = document.getElementById('poster-job-detail-content');
    if (!content) return;
    try {
        const response = await api.posterJobBids(id);
        const data = response.data || {};
        render(content, data.job || {}, data.bids || [], data.submissions || []);
    } catch (error) {
        content.innerHTML = `<p class="muted">Failed to load job: ${escapeHtml(error.message || 'unknown error')}</p>`;
    }
}

function render(content, job, bids, submissions) {
    content.innerHTML = `
        <div class="card poster-detail-card">
            <div class="poster-detail-card__header"><div><h1 class="page-title">${escapeHtml(job.title)}</h1><p class="muted">${escapeHtml(job.description || '')}</p></div><span class="badge badge--status badge--${escapeHtml(job.status)}">${escapeHtml(label(job.status).toUpperCase())}</span></div>
            <div class="poster-detail-meta"><span>Budget <strong>৳${Number(job.budget || 0).toFixed(2)}</strong></span><span>Bids <strong>${Number(job.bid_count || bids.length)}</strong></span><span>Views <strong>${Number(job.view_count || 0)}</strong></span><span>Created <strong>${formatDate(job.created_at)}</strong></span></div>
        </div>
        <div class="poster-detail-grid">
            <div class="card"><div class="card__header"><div><h2 class="card__title">Bid comparison</h2><p class="muted">Choose one pending proposal to assign the job.</p></div></div><div class="poster-bid-list">${renderBids(job, bids)}</div></div>
            <div class="card"><div class="card__header"><div><h2 class="card__title">Submission review</h2><p class="muted">Approve delivery to release payment or request changes.</p></div></div><div class="poster-submission-list">${renderSubmissions(job, submissions)}</div></div>
        </div>
        ${!['completed', 'cancelled'].includes(job.status) ? '<div class="card poster-detail-actions"><button class="btn btn--danger" id="poster-detail-cancel">Cancel job</button></div>' : ''}
    `;
    content.querySelectorAll('[data-accept-bid]').forEach(button => button.addEventListener('click', () => acceptBid(job.id, button.dataset.acceptBid)));
    content.querySelectorAll('[data-release-submission]').forEach(button => button.addEventListener('click', () => releasePayment(job.id, button.dataset.releaseSubmission)));
    content.querySelectorAll('[data-revision-submission]').forEach(button => button.addEventListener('click', () => requestRevision(job.id, button.dataset.revisionSubmission)));
    content.querySelector('#poster-detail-cancel')?.addEventListener('click', () => cancelJob(job.id));
}

function renderBids(job, bids) {
    if (!bids.length) return '<p class="muted">No bids yet.</p>';
    return bids.map(bid => `
        <div class="poster-bid-row poster-bid-row--${escapeHtml(bid.status)}"><div class="poster-bid-row__main"><strong>${escapeHtml(bid.worker?.name || 'Worker')}</strong><span class="muted">${escapeHtml(bid.worker?.email || '')} · Rating ${Number(bid.worker?.rating || 0).toFixed(2)}</span><p>${escapeHtml(bid.proposal || '')}</p></div><div class="poster-bid-row__offer"><strong>৳${Number(bid.amount || 0).toFixed(2)}</strong><span>${Number(bid.delivery_days || 0)} days</span><span class="badge">${escapeHtml(String(bid.status || '').toUpperCase())}</span>${bid.status === 'pending' && ['open', 'in_review'].includes(job.status) ? `<button class="btn btn--primary btn--sm" data-accept-bid="${Number(bid.id)}">Select worker</button>` : ''}</div></div>
    `).join('');
}

function renderSubmissions(job, submissions) {
    if (!submissions.length) return '<p class="muted">No work submitted yet.</p>';
    return submissions.map(submission => `
        <div class="poster-submission-row poster-submission-row--${escapeHtml(submission.status)}"><div><strong>${escapeHtml(submission.worker?.name || 'Worker')}</strong><span class="muted">Submitted ${formatDate(submission.created_at)} · ${escapeHtml(String(submission.status || '').replace('_', ' '))}</span><p>${escapeHtml(submission.description || '')}</p>${submission.external_link ? `<a href="${escapeHtml(submission.external_link)}" target="_blank" rel="noopener noreferrer">Open delivery link</a>` : ''}${submission.reviewer_note ? `<p class="muted"><strong>Revision note:</strong> ${escapeHtml(submission.reviewer_note)}</p>` : ''}</div>${submission.status === 'pending_review' && job.status === 'submitted' ? `<div class="poster-submission-row__actions"><button class="btn btn--success btn--sm" data-release-submission="${Number(submission.id)}">Release payment</button><button class="btn btn--ghost btn--sm" data-revision-submission="${Number(submission.id)}">Request revision</button></div>` : ''}</div>
    `).join('');
}

async function acceptBid(jobId, bidId) {
    if (!confirm('Select this worker? The bid amount will be moved into escrow.')) return;
    try { await api.posterAcceptBid(jobId, bidId); showFlash('Worker selected and escrow held.', 'success'); await reload(jobId); }
    catch (error) { showFlash(error.message || 'Could not select worker.', 'error'); }
}
async function releasePayment(jobId, submissionId) {
    if (!confirm('Approve this submission and release payment to the worker?')) return;
    try { await api.posterReleasePayment(jobId, { submission_id: Number(submissionId) }); showFlash('Payment released.', 'success'); await reload(jobId); }
    catch (error) { showFlash(error.message || 'Could not release payment.', 'error'); }
}
async function requestRevision(jobId, submissionId) {
    const note = prompt('What should the worker revise?');
    if (!note || !note.trim()) return;
    try { await api.posterRequestRevision(jobId, { submission_id: Number(submissionId), note: note.trim() }); showFlash('Revision requested.', 'success'); await reload(jobId); }
    catch (error) { showFlash(error.message || 'Could not request revision.', 'error'); }
}
async function cancelJob(jobId) {
    if (!confirm('Cancel this job? Any escrow for this job will be refunded.')) return;
    try { await api.posterCancelJob(jobId, { reason: 'Cancelled by poster' }); showFlash('Job cancelled.', 'success'); navigate('/poster/jobs'); }
    catch (error) { showFlash(error.message || 'Could not cancel job.', 'error'); }
}
async function reload(jobId) { const content = document.getElementById('poster-job-detail-content'); if (content) { content.innerHTML = '<div class="spinner"></div>'; await load(jobId); } }
function hasPosterAccess() { const user = currentUser.get(); return !!user && (user.is_admin || user.role === 'poster'); }
function label(value) { return String(value || '').replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()); }
function formatDate(value) { if (!value) return 'unknown'; const date = new Date(String(value).replace(' ', 'T') + 'Z'); return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString(); }
function escapeHtml(value) { return String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character])); }
