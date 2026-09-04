// JobDetailPage — job detail + bid form (or show work-submit if assigned).
import { api } from '../api.js';
import { currentUser, navigate, showFlash, refreshUser } from '../state.js';

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
            const { job, bids, bid_count, my_bid } = res.data;
            render(job, bids, bid_count, my_bid, user);
        } catch (err) {
            document.getElementById('job-detail-content').innerHTML =
                `<p class="muted">Failed to load: ${escapeHtml(err.message || 'unknown')}</p>`;
        }
    };
}

function render(job, bids, bidCount, myBid, user) {
    const content = document.getElementById('job-detail-content');
    if (!content) return;

    const closesAt = job.bidding_closes_at ? new Date(job.bidding_closes_at.replace(' ', 'T') + 'Z') : null;
    const closesIn = closesAt ? Math.max(0, Math.floor((closesAt - Date.now()) / 1000)) : null;
    const closesLabel = closesIn != null ? formatDuration(closesIn) : '—';

    const isOpen = ['open', 'in_review'].includes(job.status);
    const alreadyBid = !!myBid;

    content.innerHTML = `
        <div class="card job-detail__card">
            <div class="job-detail__head">
                <div>
                    ${job.category ? `<span class="job-detail__cat"><i class="bi ${job.category.icon_class || ''}"></i> ${escapeHtml(job.category.name)}</span>` : ''}
                    <h1 class="job-detail__title">${escapeHtml(job.title)}</h1>
                    <div class="job-detail__meta">
                        <span><i class="bi bi-cash"></i> Budget <strong>৳${parseFloat(job.budget).toFixed(2)}</strong></span>
                        <span><i class="bi bi-people"></i> ${bidCount} bid${bidCount === 1 ? '' : 's'}</span>
                        <span><i class="bi bi-eye"></i> ${job.view_count} view${job.view_count === 1 ? '' : 's'}</span>
                        <span><i class="bi bi-clock"></i> Bidding closes in <strong>${closesLabel}</strong></span>
                    </div>
                </div>
                <span class="badge badge--status badge--${job.status}">${job.status.replace('_', ' ').toUpperCase()}</span>
            </div>
            <div class="job-detail__body">
                <h3>Description</h3>
                <p>${escapeHtml(job.description).replace(/\n/g, '<br>')}</p>
                ${job.requirements ? `<h3>Requirements</h3><p>${escapeHtml(job.requirements).replace(/\n/g, '<br>')}</p>` : ''}
                <h3>Posted by</h3>
                <p>${job.poster ? escapeHtml(job.poster.name) : 'Unknown'} <span class="muted">@${job.poster?.username || '?'}</span></p>
            </div>
        </div>

        ${renderBidSection(job, bids, myBid, user, isOpen)}
    `;

    wireBidForm(job, myBid, user);
}

function renderBidSection(job, bids, myBid, user, isOpen) {
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
