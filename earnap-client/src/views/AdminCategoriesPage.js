// AdminCategoriesPage — CRUD interface for job categories and subcategories with min_cost, created_at, updated_at.
import { api } from '../api.js';
import { showFlash, currentUser } from '../state.js';

let _state = {
    activeTab: 'categories', // 'categories' | 'subcategories'
    categories: [],
    subcategories: [],
    loading: false
};

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
            <h1 class="page-title">Categories & Subcategories</h1>
            <p class="muted">Manage main categories, subcategories, and minimum cost limits.</p>
            
            <div class="tabs" style="display: flex; gap: 1rem; margin-bottom: 1rem;">
                <button class="btn ${state.activeTab === 'categories' ? 'btn--primary' : 'btn--ghost'}" id="tab-cats-btn">Main Categories</button>
                <button class="btn ${state.activeTab === 'subcategories' ? 'btn--primary' : 'btn--ghost'}" id="tab-subcats-btn">Subcategories</button>
            </div>

            <div id="tab-content">
                <div class="card" id="cat-list"><div class="spinner"></div></div>
            </div>
        `;

        root.querySelector('#tab-cats-btn').addEventListener('click', () => {
            _state.activeTab = 'categories';
            renderView(root);
        });

        root.querySelector('#tab-subcats-btn').addEventListener('click', () => {
            _state.activeTab = 'subcategories';
            renderView(root);
        });

        await loadData(root);
    };
}

async function loadData(root) {
    try {
        const [catRes, subcatRes] = await Promise.all([
            api.adminCategories(),
            api.adminSubcategories()
        ]);
        _state.categories = catRes.data || [];
        _state.subcategories = subcatRes.data || [];
        renderView(root);
    } catch (e) {
        showFlash(e.message || 'Failed to load category data.', 'error');
    }
}

function renderView(root) {
    const tabCatsBtn = root.querySelector('#tab-cats-btn');
    const tabSubcatsBtn = root.querySelector('#tab-subcats-btn');
    const container = root.querySelector('#tab-content');

    if (!container) return;

    if (_state.activeTab === 'categories') {
        if (tabCatsBtn) { tabCatsBtn.className = 'btn btn--primary'; }
        if (tabSubcatsBtn) { tabSubcatsBtn.className = 'btn btn--ghost'; }
        renderCategoriesTab(container, root);
    } else {
        if (tabCatsBtn) { tabCatsBtn.className = 'btn btn--ghost'; }
        if (tabSubcatsBtn) { tabSubcatsBtn.className = 'btn btn--primary'; }
        renderSubcategoriesTab(container, root);
    }
}

// -----------------------------------------------------------------------------
// Categories Tab
// -----------------------------------------------------------------------------
function renderCategoriesTab(container, root) {
    container.innerHTML = `
        <div class="card" style="margin-bottom: 1rem;">
            <h3>Main Categories List</h3>
            ${_state.categories.length === 0 ? '<p class="muted">No categories yet.</p>' : `
                <div class="table-responsive">
                    <table class="table" style="width:100%; text-align:left; border-collapse:collapse;">
                        <thead>
                            <tr style="border-bottom: 1px solid #e5e7eb; padding: 0.5rem;">
                                <th>Name</th>
                                <th>Slug</th>
                                <th>Min Cost (৳)</th>
                                <th>Status</th>
                                <th>Created At</th>
                                <th>Updated At</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${_state.categories.map(c => `
                                <tr style="border-bottom: 1px solid #f3f4f6;">
                                    <td style="padding:0.75rem 0.5rem;"><strong>${escapeHtml(c.name)}</strong></td>
                                    <td style="padding:0.75rem 0.5rem;" class="muted">/${escapeHtml(c.slug)}</td>
                                    <td style="padding:0.75rem 0.5rem;">৳${Number(c.min_cost || 1).toFixed(2)}</td>
                                    <td style="padding:0.75rem 0.5rem;">
                                        <span class="badge ${c.is_active ? 'badge--success' : 'badge--warning'}">
                                            ${c.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td style="padding:0.75rem 0.5rem; font-size:0.85rem;" class="muted">${escapeHtml(c.created_at || '-')}</td>
                                    <td style="padding:0.75rem 0.5rem; font-size:0.85rem;" class="muted">${escapeHtml(c.updated_at || '-')}</td>
                                    <td style="padding:0.75rem 0.5rem;">
                                        <button class="btn btn--ghost btn--sm edit-cat-btn" data-id="${c.id}"><i class="bi bi-pencil"></i> Edit</button>
                                        <button class="btn btn--ghost btn--sm toggle-cat-btn" data-id="${c.id}">${c.is_active ? 'Disable' : 'Enable'}</button>
                                        <button class="btn btn--danger btn--sm del-cat-btn" data-id="${c.id}">Delete</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `}
        </div>

        <div class="card">
            <h3>Add New Main Category</h3>
            <form id="add-cat-form" class="poster-form">
                <div class="poster-form__grid">
                    <label>Category Name
                        <input name="name" type="text" required maxlength="80" placeholder="e.g. Website">
                    </label>
                    <label>Slug
                        <input name="slug" type="text" required maxlength="80" placeholder="e.g. website">
                    </label>
                </div>
                <div class="poster-form__grid">
                    <label>Min Cost Per Task (৳)
                        <input name="min_cost" type="number" step="0.01" min="0" value="1.00" required>
                    </label>
                    <label>Display Order
                        <input name="display_order" type="number" value="0">
                    </label>
                </div>
                <label>Description
                    <input name="description" type="text" placeholder="Short description">
                </label>
                <label class="cat-form__label--checkbox">
                    <input name="is_active" type="checkbox" checked> Active
                </label>
                <button type="submit" class="btn btn--primary" id="save-cat-btn">Create Main Category</button>
            </form>
        </div>
    `;

    container.querySelectorAll('.edit-cat-btn').forEach(b => {
        b.addEventListener('click', async () => {
            const id = b.getAttribute('data-id');
            const cat = _state.categories.find(c => String(c.id) === String(id));
            if (!cat) return;
            const newMinCost = prompt(`Update Min Cost (৳) for Main Category "${cat.name}":`, String(cat.min_cost || 1.00));
            if (newMinCost === null) return;
            const costVal = parseFloat(newMinCost);
            if (isNaN(costVal) || costVal < 0) {
                showFlash('Please enter a valid positive cost amount.', 'error');
                return;
            }
            try {
                await api.adminUpdateCategory(id, { min_cost: costVal });
                showFlash(`Min cost updated for ${cat.name}.`, 'success');
                await loadData(root);
            } catch (e) { showFlash(e.message, 'error'); }
        });
    });

    container.querySelectorAll('.toggle-cat-btn').forEach(b => {
        b.addEventListener('click', async () => {
            const id = b.getAttribute('data-id');
            const cat = _state.categories.find(c => String(c.id) === String(id));
            if (!cat) return;
            try {
                await api.adminUpdateCategory(id, { is_active: !cat.is_active });
                showFlash('Category updated.', 'success');
                await loadData(root);
            } catch (e) { showFlash(e.message, 'error'); }
        });
    });

    container.querySelectorAll('.del-cat-btn').forEach(b => {
        b.addEventListener('click', async () => {
            const id = b.getAttribute('data-id');
            if (!confirm('Delete category?')) return;
            try {
                const res = await api.adminDeleteCategory(id);
                showFlash(res.message || 'Deleted.', 'success');
                await loadData(root);
            } catch (e) { showFlash(e.message, 'error'); }
        });
    });

    const form = container.querySelector('#add-cat-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const body = {
            name: String(fd.get('name') || '').trim(),
            slug: String(fd.get('slug') || '').trim().toLowerCase(),
            min_cost: parseFloat(fd.get('min_cost') || '1.00'),
            display_order: parseInt(fd.get('display_order') || '0', 10),
            description: String(fd.get('description') || '').trim() || null,
            is_active: fd.get('is_active') === 'on'
        };
        try {
            await api.adminCreateCategory(body);
            showFlash('Main Category created.', 'success');
            await loadData(root);
        } catch (err) {
            showFlash(err.message, 'error');
        }
    });
}

// -----------------------------------------------------------------------------
// Subcategories Tab
// -----------------------------------------------------------------------------
function renderSubcategoriesTab(container, root) {
    container.innerHTML = `
        <div class="card" style="margin-bottom: 1rem;">
            <h3>Subcategories List</h3>
            ${_state.subcategories.length === 0 ? '<p class="muted">No subcategories yet.</p>' : `
                <div class="table-responsive">
                    <table class="table" style="width:100%; text-align:left; border-collapse:collapse;">
                        <thead>
                            <tr style="border-bottom: 1px solid #e5e7eb;">
                                <th>Subcategory Name</th>
                                <th>Main Category</th>
                                <th>Min Cost (৳)</th>
                                <th>Status</th>
                                <th>Created At</th>
                                <th>Updated At</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${_state.subcategories.map(s => `
                                <tr style="border-bottom: 1px solid #f3f4f6;">
                                    <td style="padding:0.75rem 0.5rem;"><strong>${escapeHtml(s.name)}</strong></td>
                                    <td style="padding:0.75rem 0.5rem;"><span class="badge" style="background:#e0e7ff; color:#3730a3;">${escapeHtml(s.category_name || '-')}</span></td>
                                    <td style="padding:0.75rem 0.5rem;">৳${Number(s.min_cost || 1).toFixed(2)}</td>
                                    <td style="padding:0.75rem 0.5rem;">
                                        <span class="badge ${s.is_active ? 'badge--success' : 'badge--warning'}">
                                            ${s.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td style="padding:0.75rem 0.5rem; font-size:0.85rem;" class="muted">${escapeHtml(s.created_at || '-')}</td>
                                    <td style="padding:0.75rem 0.5rem; font-size:0.85rem;" class="muted">${escapeHtml(s.updated_at || '-')}</td>
                                    <td style="padding:0.75rem 0.5rem;">
                                        <button class="btn btn--ghost btn--sm edit-subcat-btn" data-id="${s.id}"><i class="bi bi-pencil"></i> Edit</button>
                                        <button class="btn btn--ghost btn--sm toggle-subcat-btn" data-id="${s.id}">${s.is_active ? 'Disable' : 'Enable'}</button>
                                        <button class="btn btn--danger btn--sm del-subcat-btn" data-id="${s.id}">Delete</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `}
        </div>

        <div class="card">
            <h3>Add New Subcategory</h3>
            <form id="add-subcat-form" class="poster-form">
                <label>Parent Main Category
                    <select name="category_id" required>
                        <option value="">Select Main Category…</option>
                        ${_state.categories.map(c => `
                            <option value="${c.id}">${escapeHtml(c.name)}</option>
                        `).join('')}
                    </select>
                </label>

                <div class="poster-form__grid">
                    <label>Subcategory Name
                        <input name="name" type="text" required maxlength="100" placeholder="e.g. Website Search & 1-3 Article Visit">
                    </label>
                    <label>Slug
                        <input name="slug" type="text" required maxlength="120" placeholder="e.g. website-search-article-visit">
                    </label>
                </div>

                <div class="poster-form__grid">
                    <label>Min Cost Per Task (৳)
                        <input name="min_cost" type="number" step="0.01" min="0" value="1.00" required>
                    </label>
                    <label>Display Order
                        <input name="display_order" type="number" value="0">
                    </label>
                </div>

                <label class="cat-form__label--checkbox">
                    <input name="is_active" type="checkbox" checked> Active
                </label>
                <button type="submit" class="btn btn--primary" id="save-subcat-btn">Create Subcategory</button>
            </form>
        </div>
    `;

    container.querySelectorAll('.edit-subcat-btn').forEach(b => {
        b.addEventListener('click', async () => {
            const id = b.getAttribute('data-id');
            const sub = _state.subcategories.find(s => String(s.id) === String(id));
            if (!sub) return;
            const newMinCost = prompt(`Update Min Cost (৳) for Subcategory "${sub.name}":`, String(sub.min_cost || 1.00));
            if (newMinCost === null) return;
            const costVal = parseFloat(newMinCost);
            if (isNaN(costVal) || costVal < 0) {
                showFlash('Please enter a valid positive cost amount.', 'error');
                return;
            }
            try {
                await api.adminUpdateSubcategory(id, { min_cost: costVal });
                showFlash(`Min cost updated for ${sub.name}.`, 'success');
                await loadData(root);
            } catch (e) { showFlash(e.message, 'error'); }
        });
    });

    container.querySelectorAll('.toggle-subcat-btn').forEach(b => {
        b.addEventListener('click', async () => {
            const id = b.getAttribute('data-id');
            const sub = _state.subcategories.find(s => String(s.id) === String(id));
            if (!sub) return;
            try {
                await api.adminUpdateSubcategory(id, { is_active: !sub.is_active });
                showFlash('Subcategory updated.', 'success');
                await loadData(root);
            } catch (e) { showFlash(e.message, 'error'); }
        });
    });

    container.querySelectorAll('.del-subcat-btn').forEach(b => {
        b.addEventListener('click', async () => {
            const id = b.getAttribute('data-id');
            if (!confirm('Delete subcategory?')) return;
            try {
                const res = await api.adminDeleteSubcategory(id);
                showFlash(res.message || 'Deleted.', 'success');
                await loadData(root);
            } catch (e) { showFlash(e.message, 'error'); }
        });
    });

    const form = container.querySelector('#add-subcat-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const body = {
            category_id: parseInt(fd.get('category_id') || '0', 10),
            name: String(fd.get('name') || '').trim(),
            slug: String(fd.get('slug') || '').trim().toLowerCase(),
            min_cost: parseFloat(fd.get('min_cost') || '1.00'),
            display_order: parseInt(fd.get('display_order') || '0', 10),
            is_active: fd.get('is_active') === 'on'
        };
        try {
            await api.adminCreateSubcategory(body);
            showFlash('Subcategory created.', 'success');
            await loadData(root);
        } catch (err) {
            showFlash(err.message, 'error');
        }
    });
}

function escapeHtml(s) {
    if (s === null || s === undefined) return '';
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
