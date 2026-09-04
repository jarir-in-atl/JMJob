// PosterJobsPage — list and manage jobs posted by the current poster.

import { api } from '../api.js';
import { currentUser, navigate, showFlash } from '../state.js';

const FILTERS = ['', 'open', 'assigned', 'submitted', 'revision', 'completed', 'cancelled', 'disputed'];
let selectedFilter = '';

export function PosterJobsPage() {
    return async () => {
        const root = document.querySelector('[data-view]');
        if (!root) return;
        root.innerHTML = '';
        root.className = 'view view--poster-jobs';
        if (!hasPosterAccess()) {
            root.innerHTML = `<div class="card"><h2>Poster access required</h2><a class="btn btn--primary" href="#/">Go home</a></div>`;
            return;
        }
        root.innerHTML = `
            <div class="page-heading-row">
                <div><h1 class="page-title">My Jobs</h1><p class="muted">Manage your listings, compare bids, and review delivered work.</p></div>
                <a class="btn btn--primary" href="#/poster/post-job" id="poster-jobs-new"><i class="bi bi-plus-lg"></i> Post a job</a>
            </div>
            <div class="poster-filter-bar">
                <label>Status
                    <select class="admin-select" id="poster-job-filter">
                        ${FILTERS.map(filter => `<option value="${filter}" ${filter === selectedFilter ? 'selected' : ''}>${filter ? label(filter) : 'All jobs'}</option>`).join('')}
                    </select>
                </label>
                <button class="btn btn--ghost btn--sm" id="poster-jobs-refresh">Refresh</button>
            </div>
            <div class="admin-list" id="poster-jobs-list"><div class="spinner"></div></div>
        `;
        root.querySelector('#poster-jobs-new').addEventListener('click', event => { event.preventDefault(); navigate('/poster/post-job'); });
        root.querySelector('#poster-job-filter').addEventListener('change', async event => { selectedFilter = event.target.value; await load(); });
        root.querySelector('#poster-jobs-refresh').addEventListener('click', load);
        await load();
    };
}

async function load() {
    const list = document.getElementById('poster-jobs-list');
    if (!list) return;
    list.innerHTML = '<div class="spinner"></div>';
    try {
        const response = await api.posterMyJobs();
        const jobs = (response.data || []).filter(job => !selectedFilter || job.status === selectedFilter);
        list.innerHTML = jobs.length ? '' : '<p class="muted">No jobs found for this filter.</p>';
        jobs.forEach(job => list.appendChild(renderJob(job)));
    } catch (error) {
        list.innerHTML = `<p class="muted">Failed to load jobs: ${escapeHtml(error.message || 'unknown error')}</p>`;
    }
}

function renderJob(job) {
    const row = document.createElement('article');
    row.className = `admin-row poster-job-row poster-job-row--${escapeHtml(job.status)}`;
    row.innerHTML = `
        <div class="poster-job-row__header">
            <div><strong>${escapeHtml(job.title)}</strong><span class="badge">${escapeHtml(label(job.status).toUpperCase())}</span></div>
            <strong class="admin-row__amount">${escapeHtml(job.currency || 'BDT')} ${Number(job.budget || 0).toFixed(2)}</strong>
        </div>
        <p class="muted poster-job-row__description">${escapeHtml(job.description || '').slice(0, 220)}${String(job.description || '').length > 220 ? '…' : ''}</p>
        <div class="admin-job-row__meta"><span><strong>Bids:</strong> ${Number(job.bid_count || 0)}</span><span><strong>Views:</strong> ${Number(job.view_count || 0)}</span><span><strong>Created:</strong> ${formatDate(job.created_at)}</span></div>
        <div class="poster-job-row__actions">
            <button class="btn btn--primary btn--sm" data-view-job>Manage job</button>
            ${!['completed', 'cancelled'].includes(job.status) ? '<button class="btn btn--danger btn--sm" data-cancel-job>Cancel</button>' : ''}
        </div>
    `;
    row.querySelector('[data-view-job]').addEventListener('click', () => navigate(`/poster/jobs/${job.id}`));
    row.querySelector('[data-cancel-job]')?.addEventListener('click', () => cancelJob(job.id));
    return row;
}

async function cancelJob(id) {
    if (!confirm('Cancel this job? Any escrow for this job will be refunded.')) return;
    const reason = prompt('Reason (optional):', 'Cancelled by poster') || 'Cancelled by poster';
    try {
        await api.posterCancelJob(id, { reason });
        showFlash('Job cancelled.', 'success');
        await load();
    } catch (error) { showFlash(error.message || 'Could not cancel job.', 'error'); }
}

function hasPosterAccess() { const user = currentUser.get(); return !!user && (user.is_admin || user.role === 'poster'); }
function label(value) { return String(value || '').replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()); }
function formatDate(value) { if (!value) return 'unknown'; const date = new Date(String(value).replace(' ', 'T') + 'Z'); return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString(); }
function escapeHtml(value) { return String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character])); }
