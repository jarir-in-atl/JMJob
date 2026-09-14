// PostJobPage — create a new job listing as a poster.

import { api } from '../api.js';
import { currentUser, navigate, showFlash } from '../state.js';

export function PostJobPage() {
    return async () => {
        const root = document.querySelector('[data-view]');
        if (!root) return;
        root.innerHTML = '';
        root.className = 'view view--post-job';
        if (!hasPosterAccess()) {
            root.innerHTML = `<div class="card"><h2>Poster access required</h2><a class="btn btn--primary" href="#/">Go home</a></div>`;
            return;
        }
        root.innerHTML = `
            <a href="#/poster" class="back-link"><i class="bi bi-arrow-left"></i> Poster dashboard</a>
            <h1 class="page-title">Post a Job</h1>
            <p class="muted">Write a clear brief so workers can send useful proposals.</p>
            <div class="card">
                <form id="post-job-form" class="poster-form">
                    <label>Job title
                        <input name="title" type="text" maxlength="160" required placeholder="e.g. Design a modern business logo">
                    </label>
                    <label>Category
                        <select name="category_id" id="post-job-category" required><option value="">Loading categories…</option></select>
                    </label>
                    <label>Description
                        <textarea name="description" rows="6" required placeholder="Explain the outcome, scope, and what success looks like."></textarea>
                    </label>
                    <label>Requirements (optional)
                        <textarea name="requirements" rows="4" placeholder="Mention preferred tools, formats, experience, or constraints."></textarea>
                    </label>
                    <div class="poster-form__grid">
                        <label>Budget (৳)
                            <input name="budget" type="number" min="1" step="0.01" required placeholder="100.00">
                        </label>
                        <label>
                            <span class="poster-form__label-head">
                                Bidding window
                                <i class="bi bi-info-circle" title="Set 0 for unlimited" style="color: var(--muted, #6b7280); cursor: help; font-weight: normal; font-size: 14px;"></i>
                            </span>
                            <div class="poster-form__input-group">
                                <input id="bidding-window-val" type="number" min="0" step="any" value="3" placeholder="3" required>
                                <select id="bidding-window-unit">
                                    <option value="minutes">Minutes</option>
                                    <option value="hours">Hours</option>
                                    <option value="days" selected>Days</option>
                                    <option value="months">Months</option>
                                </select>
                            </div>
                        </label>
                    </div>
                    <label>Deadline (optional)
                        <input name="deadline_at" type="datetime-local">
                    </label>
                    <div class="poster-form__actions">
                        <button type="button" class="btn btn--ghost" id="post-job-cancel">Cancel</button>
                        <button type="submit" class="btn btn--primary btn--xl" id="post-job-submit">Publish job</button>
                    </div>
                </form>
            </div>
        `;
        root.querySelector('#post-job-cancel').addEventListener('click', () => navigate('/poster'));
        await loadCategories(root);
        wireForm(root);
    };
}

async function loadCategories(root) {
    const select = root.querySelector('#post-job-category');
    try {
        const response = await api.categories();
        const categories = response.data || [];
        select.innerHTML = categories.length
            ? '<option value="">Choose a category…</option>' + categories.map(category => `<option value="${Number(category.id)}">${escapeHtml(category.name)}</option>`).join('')
            : '<option value="">No active categories</option>';
    } catch (error) {
        select.innerHTML = '<option value="">Unable to load categories</option>';
        showFlash(error.message || 'Could not load categories.', 'error');
    }
}

function wireForm(root) {
    const form = root.querySelector('#post-job-form');
    form.addEventListener('submit', async event => {
        event.preventDefault();
        const fields = new FormData(form);
        const button = root.querySelector('#post-job-submit');
        button.disabled = true;
        button.textContent = 'Publishing…';

        const val = Number(root.querySelector('#bidding-window-val')?.value || 0);
        const unit = root.querySelector('#bidding-window-unit')?.value || 'days';
        let windowHours = 0;
        if (val > 0) {
            if (unit === 'minutes') windowHours = val / 60;
            else if (unit === 'hours') windowHours = val;
            else if (unit === 'days') windowHours = val * 24;
            else if (unit === 'months') windowHours = val * 24 * 30;
        }

        try {
            await api.posterCreateJob({
                category_id: Number(fields.get('category_id')),
                title: String(fields.get('title') || '').trim(),
                description: String(fields.get('description') || '').trim(),
                requirements: String(fields.get('requirements') || '').trim() || null,
                budget: Number(fields.get('budget')),
                deadline_at: toSqlDate(fields.get('deadline_at')),
                bidding_window_hours: windowHours,
            });
            showFlash('Job published successfully.', 'success');
            navigate('/poster/jobs');
        } catch (error) {
            showFlash(error.message || 'Could not publish job.', 'error');
        } finally {
            button.disabled = false;
            button.textContent = 'Publish job';
        }
    });
}

function toSqlDate(value) {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 19).replace('T', ' ');
}

function hasPosterAccess() {
    const user = currentUser.get();
    return !!user;
}

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
}
