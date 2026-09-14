// AdminSettingsPage — edit platform_settings and social media links
import { api } from '../api.js';
import { showFlash, currentUser } from '../state.js';

let _state = { grouped: {}, social: {}, noticesData: { interval: 4, notices: [] }, loading: false };

export function AdminSettingsPage() {
    return async () => {
        const root = document.querySelector('[data-view]');
        if (!root) return;
        root.innerHTML = '';
        root.className = 'view view--admin-settings';
        const u = currentUser.get();
        if (!u || !u.is_admin) {
            root.innerHTML = `<div class="card"><h2>403</h2><p>Admin only.</p><a class="btn btn--primary" href="#/">Go home</a></div>`;
            return;
        }
        root.innerHTML = `
            <h1 class="page-title">Platform Settings</h1>
            <p class="muted">Configure platform-wide defaults, homepage popup notices, and social media links.</p>
            <div id="settings-container"><div class="spinner"></div></div>
        `;
        await load();
    };
}

async function load() {
    const c = document.getElementById('settings-container');
    if (!c) return;
    c.innerHTML = '<div class="spinner"></div>';
    try {
        const [resSettings, resSocial, resNotices] = await Promise.all([
            api.adminSettings(),
            api.socialLinks(),
            api.notices()
        ]);
        _state.grouped = resSettings.data || {};
        _state.social = resSocial || {};
        _state.noticesData = resNotices || { interval: 4, notices: [] };
        render();
    } catch (e) {
        c.innerHTML = `<p class="muted">Failed to load: ${escapeHtml(e.message || 'unknown')}</p>`;
    }
}

function render() {
    const c = document.getElementById('settings-container');
    if (!c) return;

    const cats = Object.keys(_state.grouped);
    let html = cats.map(cat => `
        <div class="card settings-group">
            <h3 class="card__title">${escapeHtml(cat.charAt(0).toUpperCase() + cat.slice(1))}</h3>
            <div class="settings-group__rows">
                ${_state.grouped[cat].map(s => settingRow(cat, s)).join('')}
            </div>
        </div>
    `).join('');

    // Dynamic Image Banner Setting section
    const nd = _state.noticesData;
    let noticesList = [];
    if (Array.isArray(nd.notices) && nd.notices.length) {
        noticesList = nd.notices.map(item => {
            if (typeof item === 'string') {
                if (item.startsWith('/') || item.startsWith('http')) return { image: item, text: '' };
                return { image: '', text: item };
            }
            return { image: item.image || '', text: item.text || '' };
        });
    }
    if (!noticesList.length) {
        noticesList = [{ image: '', text: '' }];
    }
    
    html += `
        <div class="card settings-group" style="margin-top:20px;">
            <h3 class="card__title"><i class="bi bi-image me-2"></i>Banner Setting (Image Only)</h3>
            <p class="muted mb-3" style="font-size:13px;">Upload banner images to display on the homepage dashboard. Click <strong>+ Add Banner Image</strong> to upload images directly. Banners rotate randomly after every specified interval.</p>
            <div class="settings-group__rows">
                <div class="settings-row">
                    <label for="notice-interval" class="settings-row__label">
                        <strong>Rotation Interval (seconds)</strong>
                        <span class="muted">Time period before switching to a random banner image (default: 4 seconds).</span>
                    </label>
                    <div class="settings-row__control">
                        <input type="number" min="1" step="1" id="notice-interval" value="${nd.interval || 4}" placeholder="4" class="settings-row__input">
                    </div>
                </div>
                <div class="settings-row">
                    <label for="notice-direction" class="settings-row__label">
                        <strong>Animation Direction</strong>
                        <span class="muted">Select transition animation style when switching banner images.</span>
                    </label>
                    <div class="settings-row__control">
                        <select id="notice-direction" class="settings-row__input">
                            <option value="right_to_left" ${(nd.direction || 'right_to_left') === 'right_to_left' ? 'selected' : ''}>Right to Left (Gradual Vanish)</option>
                            <option value="left_to_right" ${nd.direction === 'left_to_right' ? 'selected' : ''}>Left to Right (Gradual Vanish)</option>
                            <option value="top_to_bottom" ${nd.direction === 'top_to_bottom' ? 'selected' : ''}>Top to Bottom (Gradual Vanish)</option>
                            <option value="bottom_to_top" ${nd.direction === 'bottom_to_top' ? 'selected' : ''}>Bottom to Top (Gradual Vanish)</option>
                            <option value="fade" ${nd.direction === 'fade' ? 'selected' : ''}>Fade In / Out</option>
                        </select>
                    </div>
                </div>
                <div class="settings-row settings-row--stack">
                    <div class="settings-row__label" style="margin-bottom:8px;">
                        <strong>Banner Images</strong>
                        <span class="muted">Upload image files directly (JPG, PNG, WEBP, GIF).</span>
                    </div>
                    <div id="notice-messages-container" class="banner-messages-list">
                        ${noticesList.map((item, index) => messageInputRow(index + 1, item)).join('')}
                    </div>
                    <div style="margin-top: 12px;">
                        <button type="button" class="btn btn--secondary btn--sm" id="add-notice-btn">
                            <i class="bi bi-plus-circle-fill"></i> Add Banner Image
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Social Media Links section
    const s = _state.social;
    html += `
        <div class="card settings-group" style="margin-top:20px;">
            <h3 class="card__title"><i class="bi bi-share me-2"></i>Social Media Links (Footer)</h3>
            <p class="muted mb-3" style="font-size:13px;">Specify full URLs for the social icons displayed in the site footer. Leave empty to hide.</p>
            <div class="settings-group__rows">
                <div class="settings-row">
                    <label for="social-facebook" class="settings-row__label">
                        <strong>Facebook URL</strong>
                    </label>
                    <div class="settings-row__control">
                        <input type="url" id="social-facebook" value="${escapeHtml(s.facebook || '')}" placeholder="https://facebook.com/yourpage" class="settings-row__input">
                    </div>
                </div>
                <div class="settings-row">
                    <label for="social-instagram" class="settings-row__label">
                        <strong>Instagram URL</strong>
                    </label>
                    <div class="settings-row__control">
                        <input type="url" id="social-instagram" value="${escapeHtml(s.instagram || '')}" placeholder="https://instagram.com/yourprofile" class="settings-row__input">
                    </div>
                </div>
                <div class="settings-row">
                    <label for="social-whatsapp" class="settings-row__label">
                        <strong>WhatsApp Link / Number</strong>
                    </label>
                    <div class="settings-row__control">
                        <input type="text" id="social-whatsapp" value="${escapeHtml(s.whatsapp || '')}" placeholder="https://wa.me/1234567890" class="settings-row__input">
                    </div>
                </div>
                <div class="settings-row">
                    <label for="social-telegram" class="settings-row__label">
                        <strong>Telegram Link / Channel</strong>
                    </label>
                    <div class="settings-row__control">
                        <input type="text" id="social-telegram" value="${escapeHtml(s.telegram || '')}" placeholder="https://t.me/yourchannel" class="settings-row__input">
                    </div>
                </div>
            </div>
        </div>
        <div style="margin-top:20px;">
            <button class="btn btn--primary btn--xl" id="settings-save-btn">Save All Changes</button>
        </div>
    `;

    c.innerHTML = html;
    document.getElementById('settings-save-btn').addEventListener('click', saveAll);
    document.getElementById('add-notice-btn').addEventListener('click', addNoticeRow);
    wireNoticeUploadAndButtons();
}

function messageInputRow(num, item = { image: '', text: '' }) {
    const imgVal = typeof item === 'string' ? (item.startsWith('/') || item.startsWith('http') ? item : '') : (item?.image || '');
    const textVal = typeof item === 'string' ? (!item.startsWith('/') && !item.startsWith('http') ? item : '') : (item?.text || '');
    
    let previewHtml = '';
    if (imgVal) {
        previewHtml = `<div class="banner-preview"><img src="${escapeHtml(imgVal)}" alt="Banner preview"></div>`;
    } else if (textVal) {
        previewHtml = `<div class="banner-preview banner-preview--text"><strong>Text Notice:</strong> <span>${escapeHtml(textVal)}</span></div>`;
    } else {
        previewHtml = `<div class="banner-preview banner-preview--empty"><i class="bi bi-image muted"></i> No image uploaded</div>`;
    }

    return `
        <div class="banner-message-row card">
            <div class="banner-message-row__header">
                <span class="banner-message-num">Banner ${num}</span>
                <button type="button" class="btn btn--danger btn--sm remove-notice-btn" title="Remove banner">
                    <i class="bi bi-trash"></i> Remove
                </button>
            </div>
            <div class="banner-message-row__fields">
                <div class="banner-field banner-field--full">
                    ${previewHtml}
                    <input type="hidden" class="notice-msg-image" value="${escapeHtml(imgVal)}">
                    <div class="banner-upload-ctrl" style="margin-top:8px;">
                        <label class="btn btn--secondary btn--sm banner-upload-btn">
                            <i class="bi bi-cloud-upload"></i> ${imgVal ? 'Change Image' : 'Upload Image'}
                            <input type="file" class="banner-file-input" accept="image/*" style="display:none;">
                        </label>
                        <span class="banner-upload-status muted" style="font-size:12px; margin-left:8px;"></span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function addNoticeRow() {
    const container = document.getElementById('notice-messages-container');
    if (!container) return;
    const count = container.querySelectorAll('.banner-message-row').length + 1;
    const div = document.createElement('div');
    div.innerHTML = messageInputRow(count, { image: '' });
    const newRow = div.firstElementChild;
    container.appendChild(newRow);
    wireNoticeUploadAndButtons();
}

function wireNoticeUploadAndButtons() {
    const container = document.getElementById('notice-messages-container');
    if (!container) return;
    const rows = container.querySelectorAll('.banner-message-row');
    rows.forEach((row, i) => {
        const numLabel = row.querySelector('.banner-message-num');
        if (numLabel) numLabel.textContent = `Banner ${i + 1}`;

        const fileInput = row.querySelector('.banner-file-input');
        const hiddenInput = row.querySelector('.notice-msg-image');
        const previewBox = row.querySelector('.banner-preview');
        const statusSpan = row.querySelector('.banner-upload-status');
        const uploadBtn = row.querySelector('.banner-upload-btn');

        if (fileInput && !fileInput.dataset.wired) {
            fileInput.dataset.wired = 'true';
            fileInput.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                if (statusSpan) statusSpan.textContent = 'Uploading…';
                try {
                    const formData = new FormData();
                    formData.append('image', file);
                    const res = await api.adminUploadBannerImage(formData);
                    if (res && res.url) {
                        hiddenInput.value = res.url;
                        previewBox.className = 'banner-preview';
                        previewBox.innerHTML = `<img src="${escapeHtml(res.url)}" alt="Banner preview">`;
                        if (statusSpan) statusSpan.textContent = 'Uploaded!';
                    }
                } catch (err) {
                    if (statusSpan) statusSpan.textContent = err.message || 'Upload failed.';
                    showFlash(err.message || 'Failed to upload image.', 'error');
                }
            });
        }

        const delBtn = row.querySelector('.remove-notice-btn');
        if (delBtn) {
            delBtn.onclick = () => {
                row.remove();
                wireNoticeUploadAndButtons();
            };
        }
    });
}

function settingRow(category, s) {
    const id = `set-${s.key.replace(/[^a-z0-9]/gi, '_')}`;
    let input;
    switch (s.value_type) {
        case 'boolean':
            input = `<label class="settings-row__check"><input type="checkbox" id="${id}" ${s.value ? 'checked' : ''}></label>`;
            break;
        case 'integer':
        case 'percent':
            input = `<input type="number" step="1" id="${id}" value="${s.value}" class="settings-row__input">`;
            break;
        case 'decimal':
            input = `<input type="number" step="0.0001" id="${id}" value="${s.value}" class="settings-row__input">`;
            break;
        case 'json':
            input = `<textarea id="${id}" rows="3" class="settings-row__input">${escapeHtml(JSON.stringify(s.value, null, 2) || '')}</textarea>`;
            break;
        default:
            input = `<input type="text" id="${id}" value="${escapeHtml(String(s.value))}" class="settings-row__input">`;
    }
    return `
        <div class="settings-row">
            <label for="${id}" class="settings-row__label">
                <strong>${escapeHtml(s.key)}</strong>
                <span class="muted">${escapeHtml(s.description || '')}</span>
            </label>
            <div class="settings-row__control">${input}</div>
        </div>
    `;
}

async function saveAll() {
    const updates = {};
    for (const cat of Object.keys(_state.grouped)) {
        for (const s of _state.grouped[cat]) {
            const id = `set-${s.key.replace(/[^a-z0-9]/gi, '_')}`;
            const el = document.getElementById(id);
            if (!el) continue;
            let v;
            if (s.value_type === 'boolean') v = el.checked;
            else if (s.value_type === 'integer' || s.value_type === 'percent') v = parseInt(el.value, 10);
            else if (s.value_type === 'decimal') v = parseFloat(el.value);
            else if (s.value_type === 'json') v = el.value ? JSON.parse(el.value) : null;
            else v = el.value;
            updates[s.key] = v;
        }
    }

    const socialUpdates = {
        facebook: document.getElementById('social-facebook')?.value || '',
        instagram: document.getElementById('social-instagram')?.value || '',
        whatsapp: document.getElementById('social-whatsapp')?.value || '',
        telegram: document.getElementById('social-telegram')?.value || '',
    };

    const rows = Array.from(document.querySelectorAll('.banner-message-row'));
    const noticesList = rows.map(row => {
        const image = row.querySelector('.notice-msg-image')?.value.trim() || '';
        return { image };
    }).filter(item => item.image !== '');

    const noticeUpdates = {
        interval: document.getElementById('notice-interval')?.value || 4,
        direction: document.getElementById('notice-direction')?.value || 'right_to_left',
        notices: noticesList,
    };

    const btn = document.getElementById('settings-save-btn');
    btn.disabled = true; btn.textContent = 'Saving…';
    try {
        await Promise.all([
            api.adminUpdateSettings(updates),
            api.adminUpdateSocialLinks(socialUpdates),
            api.adminUpdateNotices(noticeUpdates),
        ]);
        showFlash('Settings, notices, and social links saved successfully.', 'success');
        await load();
    } catch (e) {
        showFlash(e.message || 'Failed to save.', 'error');
    } finally {
        btn.disabled = false; btn.textContent = 'Save All Changes';
    }
}

function escapeHtml(s) {
    if (s === null || s === undefined) return '';
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
