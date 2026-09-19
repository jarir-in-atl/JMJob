// AdminReportsPage — aggregated marketplace and financial reporting.

import { api } from '../api.js';
import { currentUser } from '../state.js';

export function AdminReportsPage() {
    return async () => {
        const root = document.querySelector('[data-view]');
        if (!root) return;
        root.innerHTML = '';
        root.className = 'view view--admin-reports';
        if (!currentUser.get()?.is_admin) {
            root.innerHTML = `<div class="card"><h2>403</h2><p>Admin only.</p><a class="btn btn--primary" href="#/">Go home</a></div>`;
            return;
        }
        root.innerHTML = `
            <div class="page-heading-row"><div><h1 class="page-title">Reports</h1><p class="muted">Aggregated transaction volume, assignment payments, submission risk, and marketplace job value.</p></div><button class="btn btn--ghost btn--sm" id="export-admin-report"><i class="bi bi-download"></i> Export CSV</button></div>
            <div id="admin-reports-content"><div class="spinner"></div></div>
        `;
        root.querySelector('#export-admin-report')?.addEventListener('click', exportReport);
        await load();
    };
}

async function exportReport() {
    try {
        const blob = await api.adminReportsExport();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'jmjob-report.csv';
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    } catch (error) {
        alert(error.message || 'Could not export the report.');
    }
}

async function load() {
    const content = document.getElementById('admin-reports-content');
    if (!content) return;
    try {
        const res = await api.adminReports();
        const data = res.data || {};
        const totals = data.totals || {};
        content.innerHTML = `
            <div class="stat-grid admin-report-summary">
                ${summaryTile('Transactions', number(totals.transaction_count))}
                ${summaryTile('Transaction volume', money(totals.transaction_volume))}
                ${summaryTile('Jobs', number(totals.job_count))}
                ${summaryTile('Job value', money(totals.job_value))}
            </div>
            <div class="admin-report-grid">
                <div class="card">
                    <h3 class="card__title">Transactions by type</h3>
                    <div class="admin-report-list">${renderTransactions(data.transactions || [])}</div>
                </div>
                <div class="card">
                    <h3 class="card__title">Jobs by status</h3>
                    <div class="admin-report-list">${renderJobs(data.jobs || [])}</div>
                </div>
                <div class="card">
                    <h3 class="card__title">Assignments by payment state</h3>
                    <div class="admin-report-list">${renderAssignments(data.assignments || [])}</div>
                </div>
                <div class="card">
                    <h3 class="card__title">Submissions by risk</h3>
                    <div class="admin-report-list">${renderSubmissions(data.submissions || [])}</div>
                </div>
            </div>
        `;
    } catch (error) {
        content.innerHTML = `<p class="muted">Failed to load reports: ${escapeHtml(error.message || 'unknown error')}</p>`;
    }
}

function summaryTile(label, value) {
    return `<div class="stat-tile admin-stat-tile"><span class="muted">${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`;
}

function renderTransactions(items) {
    if (!items.length) return '<p class="muted">No transactions yet.</p>';
    return items.map(item => `
        <div class="admin-report-row">
            <span><strong>${escapeHtml(String(item.type || '').replace('_', ' '))}</strong><small>${number(item.transaction_count)} entries</small></span>
            <strong>${money(item.amount)}</strong>
        </div>
    `).join('');
}

function renderJobs(items) {
    if (!items.length) return '<p class="muted">No jobs yet.</p>';
    return items.map(item => `
        <div class="admin-report-row">
            <span><strong>${escapeHtml(String(item.status || '').replace('_', ' '))}</strong><small>${number(item.job_count)} jobs</small></span>
            <strong>${money(item.budget)}</strong>
        </div>
    `).join('');
}

function renderAssignments(items) {
    if (!items.length) return '<p class="muted">No assignments yet.</p>';
    return items.map(item => `
        <div class="admin-report-row">
            <span><strong>${escapeHtml(String(item.status || '').replace('_', ' '))}</strong><small>${escapeHtml(String(item.payment_status || '').replace('_', ' '))} · ${number(item.assignment_count)} assignments</small></span>
            <strong>${money(item.amount)}</strong>
        </div>
    `).join('');
}

function renderSubmissions(items) {
    if (!items.length) return '<p class="muted">No submissions yet.</p>';
    return items.map(item => `
        <div class="admin-report-row">
            <span><strong>${escapeHtml(String(item.status || '').replace('_', ' '))}</strong><small>${escapeHtml(String(item.risk_status || '').replace('_', ' '))}</small></span>
            <strong>${number(item.submission_count)}</strong>
        </div>
    `).join('');
}

function number(value) {
    const amount = Number(value || 0);
    return Number.isFinite(amount) ? amount.toLocaleString() : '0';
}

function money(value) {
    const amount = Number(value || 0);
    return `৳${Number.isFinite(amount) ? amount.toFixed(2) : '0.00'}`;
}

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
}
