// WorkerBidsPage — my bids list with status badges.
import { api } from '../api.js';
import { navigate } from '../state.js';

let _state = { bids: [], loading: false };

export function WorkerBidsPage() {
    return async () => {
        const root = document.querySelector('[data-view]');
        if (!root) return;
        root.innerHTML = '';
        root.className = 'view view--worker-bids';

        root.innerHTML = `
            <h1 class="page-title">My Bids</h1>
            <p class="muted">All the bids you've placed, with their current status.</p>
            <div class="card" id="bids-list"><div class="spinner"></div></div>
        `;

        try {
            const res = await api.workerBids();
            _state.bids = res.data || [];
            render();
        } catch (e) {
            document.getElementById('bids-list').innerHTML =
                `<p class="muted">Failed to load: ${escapeHtml(e.message || 'unknown')}</p>`;
        }
    };
}

function render() {
    const list = document.getElementById('bids-list');
    if (!list) return;
    if (_state.bids.length === 0) {
        list.innerHTML = `<p class="muted">You haven't placed any bids yet. <a href="#/jobs/available">Browse jobs</a> to get started.</p>`;
        return;
    }
    list.innerHTML = _state.bids.map(b => `
        <a class="bid-row-card" href="#/jobs/${b.job_id}" data-id="${b.job_id}">
            <div class="bid-row-card__main">
                <div class="bid-row-card__title">${escapeHtml(b.job?.title || 'Job')}</div>
                <div class="bid-row-card__meta">
                    <span><i class="bi bi-cash"></i> ৳${parseFloat(b.amount).toFixed(2)}</span>
                    <span><i class="bi bi-calendar"></i> ${b.delivery_days} day${b.delivery_days === 1 ? '' : 's'}</span>
                    <span class="muted">${formatDate(b.created_at)}</span>
                </div>
            </div>
            <span class="badge badge--status badge--${b.status}">${b.status.toUpperCase()}</span>
        </a>
    `).join('');
    list.querySelectorAll('a.bid-row-card').forEach(a => {
        a.addEventListener('click', (e) => { e.preventDefault(); navigate(`/jobs/${a.getAttribute('data-id')}`); });
    });
}

function formatDate(s) {
    if (!s) return '';
    try { return new Date(s.replace(' ', 'T') + 'Z').toLocaleString(); } catch { return s; }
}

function escapeHtml(s) {
    if (s === null || s === undefined) return '';
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
