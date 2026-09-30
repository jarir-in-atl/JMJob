import { api } from '../api.js';
import { currentUser, navigate, showFlash } from '../state.js';

export function AdminJobPostPage() {
    return async () => {
        const root = document.querySelector('[data-view]');
        if (!root) return;
        root.className = 'view view--admin-job-post';
        if (!currentUser.get()?.is_admin) {
            root.innerHTML = '<div class="card"><h2>403</h2><p>Admin access required.</p></div>';
            return;
        }

        const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
        const editId = Number(params.get('edit') || 0);
        root.innerHTML = '<div class="card"><p class="muted">Loading job form…</p></div>';
        try {
            const categoriesResponse = await api.categories();
            const detail = editId ? (await api.adminJobDetail(editId)).data : null;
            render(root, categoriesResponse.data || [], detail?.job || null, editId);
        } catch (error) {
            root.innerHTML = `<div class="card"><p class="muted">Could not load job form: ${escapeHtml(error.message || 'unknown error')}</p></div>`;
        }
    };
}

function render(root, categories, job, editId) {
    const proof = job?.proof_requirements || [];
    const screenshotRequired = proof.some(item => item.type === 'screenshot');
    const writtenRequired = proof.some(item => item.type === 'text');

    const selectedCategoryId = job?.category_id ? Number(job.category_id) : '';
    const selectedCategory = categories.find(category => Number(category.id) === selectedCategoryId);
    const subcategories = selectedCategory?.subcategories || [];
    const selectedSubcategoryId = job?.subcategory_id ? Number(job.subcategory_id) : '';

    const currentThumbnail = job?.attachment_url || (job?.attachment_path ? (job.attachment_path.startsWith('http') ? job.attachment_path : `/storage/${job.attachment_path}`) : null);
    let newThumbnailBase64 = null;
    let removeCurrentThumbnail = false;

    root.innerHTML = `
        <a href="#/admin/jobs" class="back-link"><i class="bi bi-arrow-left"></i> Job management</a>
        <div class="page-heading-row"><div><h1 class="page-title">${editId ? 'Edit Job' : 'Admin Job Post'}</h1><p class="muted">Create or maintain a job using the same worker assignment and payment workflow as customer posts.</p></div></div>
        <form class="card admin-job-form" id="admin-job-form">
            <div class="poster-form__grid">
                <label>Category
                    <select name="category_id" id="admin-category-select" required>
                        <option value="">Choose category…</option>
                        ${categories.map(category => `<option value="${category.id}" ${Number(category.id) === selectedCategoryId ? 'selected' : ''}>${escapeHtml(category.name)}</option>`).join('')}
                    </select>
                </label>
                <label>Subcategory
                    <select name="subcategory_id" id="admin-subcategory-select" ${!selectedCategory ? 'disabled' : ''}>
                        <option value="">${selectedCategory && subcategories.length === 0 ? 'No subcategories available' : 'Choose subcategory (optional)…'}</option>
                        ${subcategories.map(sub => `<option value="${sub.id}" ${Number(sub.id) === selectedSubcategoryId ? 'selected' : ''}>${escapeHtml(sub.name)}</option>`).join('')}
                    </select>
                </label>
            </div>
            <div class="poster-form__grid">
                <label>Job title <input name="title" maxlength="160" required value="${escapeHtml(job?.title || '')}"></label>
                <label>Job subtitle (Optional) <input name="subtitle" maxlength="255" value="${escapeHtml(job?.subtitle || '')}" placeholder="Short job-card summary"></label>
            </div>
            <label>Customer name <input name="customer_name" maxlength="160" value="${escapeHtml(job?.customer_name || '')}"></label>
            <div class="poster-form__grid">
                <label>Customer phone <input name="customer_phone" maxlength="32" value="${escapeHtml(job?.customer_phone || '')}"></label>
                <label>Customer email <input name="customer_email" type="email" maxlength="190" value="${escapeHtml(job?.customer_email || '')}"></label>
            </div>
            <label>Job details / instructions <textarea name="description" rows="7" required>${escapeHtml(job?.description || '')}</textarea></label>
            <label>Customer requirements <textarea name="requirements" rows="4">${escapeHtml(job?.requirements || '')}</textarea></label>
            <div class="poster-form__grid">
                <label>Workers required <input name="worker_count" type="number" min="1" value="${Number(job?.worker_count || 1)}" required></label>
                <label>Payment per worker <input name="cost_per_worker" type="number" min="0.01" step="0.0001" value="${Number(job?.cost_per_worker || 0)}" required></label>
            </div>
            <label>Deadline <input name="deadline_at" type="datetime-local" value="${toLocalInput(job?.deadline_at)}"></label>
            <label>Job Screenshot / Thumbnail (Optional)
                <input id="admin-thumbnail-input" type="file" accept="image/*">
                <div id="admin-thumbnail-preview" style="margin-top: 8px;">
                    ${currentThumbnail ? `
                        <div id="admin-current-thumbnail-box" style="display:flex; align-items:center; gap:12px; padding:10px; background:var(--bg-secondary, #f8fafc); border:1px solid var(--border-color, #e2e8f0); border-radius:6px;">
                            <img src="${escapeHtml(currentThumbnail)}" style="max-height:80px; max-width:140px; border-radius:4px; border:1px solid #cbd5e1; object-fit:contain;" alt="Current thumbnail">
                            <div style="flex:1;">
                                <div style="font-size:13px; font-weight:600;">Current Screenshot</div>
                                <span class="muted" style="font-size:12px;">Choose a new file to replace it, or remove it.</span>
                            </div>
                            <button type="button" class="btn btn--ghost btn--sm" id="admin-remove-thumbnail" style="color:#ef4444;"><i class="bi bi-trash"></i> Remove</button>
                        </div>
                    ` : ''}
                </div>
            </label>
            <div class="admin-job-proof-options">
                <label><input name="requires_screenshot" type="checkbox" ${screenshotRequired ? 'checked' : ''}> Screenshot proof required</label>
                <label><input name="requires_written" type="checkbox" ${writtenRequired ? 'checked' : ''}> Written report required</label>
            </div>
            <label>Admin notes <textarea name="admin_notes" rows="3">${escapeHtml(job?.admin_notes || '')}</textarea></label>
            <label><input name="publish" type="checkbox" ${!job || job.status === 'open' ? 'checked' : ''}> Publish / activate immediately</label>
            <div class="poster-form__actions"><button class="btn btn--ghost" type="button" id="admin-job-cancel">Cancel</button><button class="btn btn--primary" type="submit">${editId ? 'Save changes' : 'Create job'}</button></div>
        </form>
    `;

    const categorySelect = root.querySelector('#admin-category-select');
    const subcategorySelect = root.querySelector('#admin-subcategory-select');
    const thumbnailInput = root.querySelector('#admin-thumbnail-input');
    const thumbnailPreview = root.querySelector('#admin-thumbnail-preview');

    function attachRemoveThumbnailHandler() {
        root.querySelector('#admin-remove-thumbnail')?.addEventListener('click', () => {
            removeCurrentThumbnail = true;
            newThumbnailBase64 = null;
            if (thumbnailInput) thumbnailInput.value = '';
            if (thumbnailPreview) thumbnailPreview.innerHTML = '<span class="muted" style="font-size:12px; font-style:italic;">Screenshot removed. Click "Save changes" to apply.</span>';
        });
    }
    attachRemoveThumbnailHandler();

    thumbnailInput?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            newThumbnailBase64 = event.target.result;
            removeCurrentThumbnail = false;
            thumbnailPreview.innerHTML = `
                <div style="display:flex; align-items:center; gap:12px; padding:10px; background:var(--bg-secondary, #f8fafc); border:1px solid var(--border-color, #e2e8f0); border-radius:6px;">
                    <img src="${newThumbnailBase64}" style="max-height:80px; max-width:140px; border-radius:4px; border:1px solid #cbd5e1; object-fit:contain;" alt="New thumbnail preview">
                    <div style="flex:1;">
                        <div style="font-size:13px; font-weight:600; color:#10b981;"><i class="bi bi-check-circle"></i> New screenshot selected</div>
                        <span class="muted" style="font-size:12px;">${escapeHtml(file.name)} (${(file.size / 1024).toFixed(1)} KB)</span>
                    </div>
                    <button type="button" class="btn btn--ghost btn--sm" id="admin-clear-new-thumbnail" style="color:#ef4444;"><i class="bi bi-x-circle"></i> Clear</button>
                </div>
            `;
            root.querySelector('#admin-clear-new-thumbnail')?.addEventListener('click', () => {
                newThumbnailBase64 = null;
                thumbnailInput.value = '';
                if (currentThumbnail && !removeCurrentThumbnail) {
                    thumbnailPreview.innerHTML = `
                        <div id="admin-current-thumbnail-box" style="display:flex; align-items:center; gap:12px; padding:10px; background:var(--bg-secondary, #f8fafc); border:1px solid var(--border-color, #e2e8f0); border-radius:6px;">
                            <img src="${escapeHtml(currentThumbnail)}" style="max-height:80px; max-width:140px; border-radius:4px; border:1px solid #cbd5e1; object-fit:contain;" alt="Current thumbnail">
                            <div style="flex:1;">
                                <div style="font-size:13px; font-weight:600;">Current Screenshot</div>
                                <span class="muted" style="font-size:12px;">Choose a new file to replace it, or remove it.</span>
                            </div>
                            <button type="button" class="btn btn--ghost btn--sm" id="admin-remove-thumbnail" style="color:#ef4444;"><i class="bi bi-trash"></i> Remove</button>
                        </div>
                    `;
                    attachRemoveThumbnailHandler();
                } else {
                    thumbnailPreview.innerHTML = '';
                }
            });
        };
        reader.readAsDataURL(file);
    });

    categorySelect.addEventListener('change', () => {
        const catId = Number(categorySelect.value);
        const cat = categories.find(c => Number(c.id) === catId);
        const subs = cat?.subcategories || [];

        if (!cat) {
            subcategorySelect.innerHTML = '<option value="">Choose subcategory (optional)…</option>';
            subcategorySelect.disabled = true;
        } else if (subs.length === 0) {
            subcategorySelect.innerHTML = '<option value="">No subcategories available</option>';
            subcategorySelect.disabled = true;
        } else {
            subcategorySelect.innerHTML = '<option value="">Choose subcategory (optional)…</option>' +
                subs.map(s => `<option value="${s.id}">${escapeHtml(s.name)}</option>`).join('');
            subcategorySelect.disabled = false;
        }
    });

    root.querySelector('#admin-job-cancel').addEventListener('click', () => navigate('/admin/jobs'));
    root.querySelector('#admin-job-form').addEventListener('submit', async event => {
        event.preventDefault();
        const form = event.currentTarget;
        const data = new FormData(form);
        const proofRequirements = [];
        if (data.get('requires_screenshot')) proofRequirements.push({ title: 'Screenshot proof', type: 'screenshot' });
        if (data.get('requires_written')) proofRequirements.push({ title: 'Written report', type: 'text' });
        const subcategoryVal = data.get('subcategory_id');
        const subcategoryId = subcategoryVal && Number(subcategoryVal) > 0 ? Number(subcategoryVal) : null;
        const body = {
            category_id: Number(data.get('category_id')),
            subcategory_id: subcategoryId,
            title: String(data.get('title') || '').trim(),
            subtitle: String(data.get('subtitle') || '').trim(),
            customer_name: String(data.get('customer_name') || '').trim(),
            customer_phone: String(data.get('customer_phone') || '').trim(),
            customer_email: String(data.get('customer_email') || '').trim(),
            description: String(data.get('description') || '').trim(),
            requirements: String(data.get('requirements') || '').trim(),
            worker_count: Number(data.get('worker_count')),
            cost_per_worker: Number(data.get('cost_per_worker')),
            deadline_at: toSqlDate(String(data.get('deadline_at') || '')),
            proof_requirements: proofRequirements,
            admin_notes: String(data.get('admin_notes') || '').trim(),
            publish: !!data.get('publish'),
        };
        if (newThumbnailBase64) {
            body.thumbnail = newThumbnailBase64;
        } else if (removeCurrentThumbnail) {
            body.attachment_path = null;
        } else if (job?.attachment_path) {
            body.attachment_path = job.attachment_path;
        }
        const button = form.querySelector('[type="submit"]');
        button.disabled = true;
        try {
            const response = editId ? await api.adminUpdateJob(editId, body) : await api.adminCreateJob(body);
            showFlash(response.message || 'Job saved.', 'success');
            navigate(editId ? `/admin/jobs/${editId}` : '/admin/jobs');
        } catch (error) {
            showFlash(error.message || 'Could not save job.', 'error');
            button.disabled = false;
        }
    });
}

function toLocalInput(value) {
    if (!value) return '';
    const date = new Date(String(value).replace(' ', 'T') + 'Z');
    if (Number.isNaN(date.getTime())) return '';
    const pad = value => String(value).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toSqlDate(value) {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 19).replace('T', ' ');
}

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
}
