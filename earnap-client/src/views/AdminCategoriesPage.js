// AdminCategoriesPage — CRUD interface for job categories.
import { api } from '../api.js';
import { showFlash, currentUser } from '../state.js';

let _state = { categories: [], loading: false };

export function AdminCategoriesPage() {
    return async () => {
        const root = document.querySelector('[data-view]');
        if (!root) return;
        root.innerHTML = '';
        root.className = 'view view--admin-categories';
        const u = currentUser.get();
        if (!u || !u.is_admin) {
            root.innerHTML = `<div class="card"><h2>403</h2><p>Admin only.</p><a class="btn btn--primary" href="#/">Go home</a></div>`;
            return;
        }
        root.innerHTML = `
            <h1 class="page-title">Categories</h1>
            <p class="muted">Manage job categories. Inactive categories stay attached to old jobs but disappear from the post-job dropdown.</p>
            <div class="card" id="cat-list"><div class="spinner"></div></div>
            <div class="card" id="cat-form-card" style="margin-top: 16px;">
                <h3 class="card__title">Add new category</h3>
                <form id="cat-form" class="cat-form">
                    <label class="cat-form__label">
                        Name
                        <input name="name" type="text" required maxlength="80" placeholder="e.g. SEO Writing">
                    </label>
                    <label class="cat-form__label">
                        Slug (URL-safe, lowercase, hyphenated)
                        <input name="slug" type="text" required maxlength="80" placeholder="seo-writing">
                    </label>
                    <label class="cat-form__label">
                        Description
                        <input name="description" type="text" maxlength="255" placeholder="Short description">
                    </label>
                    <label class="cat-form__label">
                        Icon class (Bootstrap Icons)
                        <input name="icon_class" type="text" maxlength="80" placeholder="bi-pencil">
                    </label>
                    <label class="cat-form__label">
                        Display order
                        <input name="display_order" type="number" value="0">
                    </label>
                    <label class="cat-form__label cat-form__label--checkbox">
                        <input name="is_active" type="checkbox" checked> Active
                    </label>
                    <button type="submit" class="btn btn--primary" id="cat-save-btn">Create Category</button>
                </form>
            </div>
        `;

        wireForm();
        await load();
    };
}

async function load() {
    const list = document.getElementById('cat-list');
    if (!list) return;
    list.innerHTML = '<div class="spinner"></div>';
    try {
        const res = await api.adminCategories();
        _state.categories = res.data || [];
        render();
    } catch (e) {
        list.innerHTML = `<p class="muted">Failed to load: ${escapeHtml(e.message || 'unknown')}</p>`;
    }
}

function render() {
    const list = document.getElementById('cat-list');
    if (!list) return;
    if (_state.categories.length === 0) {
        list.innerHTML = '<p class="muted">No categories yet. Add one below.</p>';
        return;
    }
    list.innerHTML = _state.categories.map(c => `
        <div class="cat-row" data-id="${c.id}">
            <div class="cat-row__icon"><i class="bi ${escapeHtml(c.icon_class || 'bi-tag')}"></i></div>
            <div class="cat-row__main">
                <div class="cat-row__name">${escapeHtml(c.name)} ${c.is_active ? '' : '<span class="badge">INACTIVE</span>'}</div>
                <div class="cat-row__slug muted">/${escapeHtml(c.slug)}</div>
                <div class="cat-row__desc muted">${escapeHtml(c.description || '')}</div>
            </div>
            <div class="cat-row__actions">
                <button class="btn btn--ghost btn--sm" data-toggle="${c.id}">${c.is_active ? 'Disable' : 'Enable'}</button>
                <button class="btn btn--danger btn--sm" data-delete="${c.id}">Delete</button>
            </div>
        </div>
    `).join('');
    list.querySelectorAll('[data-toggle]').forEach(b => b.addEventListener('click', () => toggle(b.getAttribute('data-toggle'))));
    list.querySelectorAll('[data-delete]').forEach(b => b.addEventListener('click', () => del(b.getAttribute('data-delete'))));
}

function wireForm() {
    const form = document.getElementById('cat-form');
    if (!form) return;
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const body = {
            name: String(fd.get('name') || '').trim(),
            slug: String(fd.get('slug') || '').trim().toLowerCase(),
            description: String(fd.get('description') || '').trim() || null,
            icon_class: String(fd.get('icon_class') || '').trim() || null,
            display_order: parseInt(fd.get('display_order') || '0', 10),
            is_active: fd.get('is_active') === 'on',
        };
        const btn = document.getElementById('cat-save-btn');
        btn.disabled = true; btn.textContent = 'Creating…';
        try {
            await api.adminCreateCategory(body);
            showFlash('Category created.', 'success');
            form.reset();
            await load();
        } catch (err) {
            showFlash(err.message || 'Failed.', 'error');
        } finally {
            btn.disabled = false; btn.textContent = 'Create Category';
        }
    });
}

async function toggle(id) {
    const cat = _state.categories.find(c => String(c.id) === String(id));
    if (!cat) return;
    try {
        await api.adminUpdateCategory(id, { is_active: !cat.is_active });
        showFlash(cat.is_active ? 'Category disabled.' : 'Category enabled.', 'success');
        await load();
    } catch (e) { showFlash(e.message || 'Failed.', 'error'); }
}

async function del(id) {
    if (!confirm('Delete this category? It will be deactivated if jobs are attached.')) return;
    try {
        const res = await api.adminDeleteCategory(id);
        showFlash(res.message || 'Done.', 'success');
        await load();
    } catch (e) { showFlash(e.message || 'Failed.', 'error'); }
}

function escapeHtml(s) {
    if (s === null || s === undefined) return '';
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
