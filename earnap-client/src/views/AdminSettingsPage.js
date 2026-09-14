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

    // Dynamic Banner Message Setting section
    const nd = _state.noticesData;
    const noticesList = Array.isArray(nd.notices) && nd.notices.length ? nd.notices : ['Complete tasks, watch ads, refer friends, and withdraw anytime.'];
    
    html += `
        <div class="card settings-group" style="margin-top:20px;">
            <h3 class="card__title"><i class="bi bi-megaphone me-2"></i>Banner Message Setting</h3>
            <p class="muted mb-3" style="font-size:13px;">Manage banner messages displayed on the homepage dashboard. Click <strong>+ Add Message</strong> to add individual textboxes. Messages will rotate randomly after every specified interval.</p>
            <div class="settings-group__rows">
                <div class="settings-row">
                    <label for="notice-interval" class="settings-row__label">
                        <strong>Rotation Interval (seconds)</strong>
                        <span class="muted">Time period before switching to a random banner message (default: 4 seconds).</span>
                    </label>
                    <div class="settings-row__control">
                        <input type="number" min="1" step="1" id="notice-interval" value="${nd.interval || 4}" placeholder="4" class="settings-row__input">
                    </div>
                </div>
                <div class="settings-row settings-row--stack">
                    <div class="settings-row__label" style="margin-bottom:8px;">
                        <strong>Banner Messages</strong>
                        <span class="muted">Add separate textboxes for each message. A message will be chosen randomly after every interval.</span>
                    </div>
                    <div id="notice-messages-container" class="banner-messages-list">
                        ${noticesList.map((msg, index) => messageInputRow(index + 1, msg)).join('')}
                    </div>
                    <div style="margin-top: 10px;">
                        <button type="button" class="btn btn--secondary btn--sm" id="add-notice-btn">
                            <i class="bi bi-plus-circle-fill"></i> Add Message
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
    wireNoticeDeleteButtons();
}

function messageInputRow(num, val = '') {
    return `
        <div class="banner-message-row">
            <span class="banner-message-num">Message ${num}:</span>
            <input type="text" class="settings-row__input notice-msg-input" value="${escapeHtml(val)}" placeholder="e.g. Complete tasks, watch ads, refer friends...">
            <button type="button" class="btn btn--danger btn--sm remove-notice-btn" title="Remove message">
                <i class="bi bi-trash"></i>
            </button>
        </div>
    `;
}

function addNoticeRow() {
    const container = document.getElementById('notice-messages-container');
    if (!container) return;
    const count = container.querySelectorAll('.banner-message-row').length + 1;
    const div = document.createElement('div');
    div.innerHTML = messageInputRow(count, '');
    const newRow = div.firstElementChild;
    container.appendChild(newRow);
    wireNoticeDeleteButtons();
    newRow.querySelector('input')?.focus();
}

function wireNoticeDeleteButtons() {
    const container = document.getElementById('notice-messages-container');
    if (!container) return;
    const rows = container.querySelectorAll('.banner-message-row');
    rows.forEach((row, i) => {
        const numLabel = row.querySelector('.banner-message-num');
        if (numLabel) numLabel.textContent = `Message ${i + 1}:`;
        const delBtn = row.querySelector('.remove-notice-btn');
        if (delBtn) {
            delBtn.onclick = () => {
                if (container.querySelectorAll('.banner-message-row').length > 1) {
                    row.remove();
                    wireNoticeDeleteButtons();
                } else {
                    showFlash('At least one message textbox is required.', 'warning');
                }
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

    const msgInputs = Array.from(document.querySelectorAll('.notice-msg-input'));
    const noticesList = msgInputs.map(input => input.value.trim()).filter(Boolean);

    const noticeUpdates = {
        interval: document.getElementById('notice-interval')?.value || 4,
        notices: noticesList.length ? noticesList : ['Complete tasks, watch ads, refer friends, and withdraw anytime.'],
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
