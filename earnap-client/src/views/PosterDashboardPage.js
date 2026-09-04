// PosterDashboardPage — summary of a poster's jobs and wallet.
import { api } from '../api.js';
import { currentUser, navigate, showFlash } from '../state.js';

const STATUS_LABELS = {
    open: 'Open',
    in_review: 'In review',
    assigned: 'Assigned',
    submitted: 'Awaiting review',
    revision: 'Revision requested',
    completed: 'Completed',
    cancelled: 'Cancelled',
    expired: 'Expired',
    disputed: 'Disputed',
};

export function PosterDashboardPage() {
    return async () => {
        const root = document.querySelector('[data-view]');
        if (!root) return;
        root.innerHTML = '';
        root.className = 'view view--poster-dashboard';

        const user = currentUser.get();
        if (!user || (!user.is_admin && user.role !== 'poster')) {
            root.innerHTML = `
                <div class="card" style="max-width: 560px; margin: 40px auto; text-align: center;">
                    <h2>Poster access required</h2>
                    <p class="muted">This workspace is available to job posters and administrators.</p>
                    <a class="btn btn--primary" href="#/">Go home</a>
                </div>
            `;
            return;
        }

        root.innerHTML = `
            <div class="page-heading-row">
                <div>
                    <h1 class="page-title">Poster Dashboard</h1>
                    <p class="muted">Post jobs, compare bids, and manage work in progress.</p>
                </div>
                <a class="btn btn--primary" href="#/poster/post-job" id="poster-new-job">
                    <i class="bi bi-plus-lg"></i> Post a job
                </a>
            </div>
            <div id="poster-dashboard-content"><div class="spinner"></div></div>
        `;

        const newJob = root.querySelector('#poster-new-job');
        if (newJob) {
            newJob.addEventListener('click', (event) => {
                event.preventDefault();
                navigate('/poster/post-job');
            });
        }

        await loadDashboard();
    };
}

async function loadDashboard() {
    const content = document.getElementById('poster-dashboard-content');
    if (!content) return;
    try {
        const response = await api.posterStats();
        renderDashboard(content, response.data || {});
    } catch (error) {
        content.innerHTML = `
            <div class="card">
                <p class="muted">Failed to load poster statistics: ${escapeHtml(error.message || 'Unknown error')}</p>
                <button class="btn btn--secondary" id="poster-retry">Try again</button>
            </div>
        `;
        content.querySelector('#poster-retry')?.addEventListener('click', loadDashboard);
        showFlash(error.message || 'Failed to load poster statistics.', 'error');
    }
}

function renderDashboard(content, data) {
    const counts = data.counts || {};
    const active = (counts.assigned || 0) + (counts.submitted || 0) + (counts.revision || 0);
    const wallet = money(data.wallet_balance);
    const frozen = money(data.frozen_balance);
    const spent = money(data.total_spent);

    content.innerHTML = `
        <div class="stat-grid poster-stat-grid">
            ${statTile('bi-briefcase', 'Total jobs', counts.total || 0)}
            ${statTile('bi-lightning-charge', 'Active jobs', active)}
            ${statTile('bi-wallet2', 'Available wallet', wallet, '৳')}
            ${statTile('bi-lock', 'In escrow', frozen, '৳')}
        </div>

        <div class="poster-dashboard-grid">
            <div class="card">
                <div class="card__header">
                    <div>
                        <h2 class="card__title">Job pipeline</h2>
                        <p class="muted">See where your posted jobs are in the workflow.</p>
                    </div>
                    <a class="btn btn--ghost btn--sm" href="#/poster/jobs" data-poster-link="jobs">Manage jobs</a>
                </div>
                <div class="poster-status-list">
                    ${statusRow('open', counts.open)}
                    ${statusRow('in_review', counts.in_review)}
                    ${statusRow('assigned', counts.assigned)}
                    ${statusRow('submitted', counts.submitted)}
                    ${statusRow('revision', counts.revision)}
                    ${statusRow('completed', counts.completed)}
                </div>
            </div>

            <div class="card poster-wallet-card">
                <div class="card__header">
                    <div>
                        <h2 class="card__title">Poster wallet</h2>
                        <p class="muted">Funds available for new jobs and active escrow.</p>
                    </div>
                    <i class="bi bi-cash-stack poster-card-icon"></i>
                </div>
                <div class="poster-wallet-total">৳${wallet}</div>
                <div class="poster-wallet-lines">
                    <div><span class="muted">Frozen in escrow</span><strong>৳${frozen}</strong></div>
                    <div><span class="muted">Total spent</span><strong>৳${spent}</strong></div>
                </div>
                <a class="btn btn--secondary btn--xl" href="#/poster/wallet" data-poster-link="wallet">View wallet</a>
            </div>
        </div>

        <div class="card poster-dashboard-actions">
            <div>
                <h2 class="card__title">Ready to get started?</h2>
                <p class="muted">Create a clear brief and let workers send you proposals.</p>
            </div>
            <a class="btn btn--primary" href="#/poster/post-job" data-poster-link="post">Post your first job</a>
        </div>
    `;

    content.querySelectorAll('[data-poster-link]').forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            navigate(link.getAttribute('href').replace(/^#/, ''));
        });
    });
}

function statTile(icon, label, value, prefix = '') {
    return `
        <div class="stat-tile poster-stat-tile">
            <i class="bi ${icon} poster-stat-icon"></i>
            <span class="muted">${label}</span>
            <strong>${prefix}${escapeHtml(String(value))}</strong>
        </div>
    `;
}

function statusRow(status, value) {
    const count = Number(value || 0);
    return `
        <div class="poster-status-row">
            <span><i class="bi ${statusIcon(status)}"></i> ${STATUS_LABELS[status] || status}</span>
            <strong>${count}</strong>
        </div>
    `;
}

function statusIcon(status) {
    return {
        open: 'bi-megaphone',
        in_review: 'bi-search',
        assigned: 'bi-person-check',
        submitted: 'bi-inbox',
        revision: 'bi-arrow-repeat',
        completed: 'bi-check-circle',
    }[status] || 'bi-circle';
}

function money(value) {
    const amount = Number(value || 0);
    return Number.isFinite(amount) ? amount.toFixed(2) : '0.00';
}

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, character => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[character]));
}
