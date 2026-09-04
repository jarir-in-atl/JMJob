// AdminSettingsPage — edit platform_settings (commission, currency, escrow, etc.)
import { api } from '../api.js';
import { showFlash, currentUser } from '../state.js';

let _state = { grouped: {}, loading: false };

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
            <p class="muted">Configure platform-wide defaults. Changes apply immediately across the app.</p>
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
        const res = await api.adminSettings();
        _state.grouped = res.data || {};
        render();
    } catch (e) {
        c.innerHTML = `<p class="muted">Failed to load: ${escapeHtml(e.message || 'unknown')}</p>`;
    }
}

function render() {
    const c = document.getElementById('settings-container');
    if (!c) return;
    const cats = Object.keys(_state.grouped);
    if (cats.length === 0) {
        c.innerHTML = '<p class="muted">No settings found.</p>';
        return;
    }
    c.innerHTML = cats.map(cat => `
        <div class="card settings-group">
            <h3 class="card__title">${escapeHtml(cat.charAt(0).toUpperCase() + cat.slice(1))}</h3>
            <div class="settings-group__rows">
                ${_state.grouped[cat].map(s => settingRow(cat, s)).join('')}
            </div>
        </div>
    `).join('') + `
        <div style="margin-top:16px;">
            <button class="btn btn--primary btn--xl" id="settings-save-btn">Save All Changes</button>
        </div>
    `;
    document.getElementById('settings-save-btn').addEventListener('click', saveAll);
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
    const btn = document.getElementById('settings-save-btn');
    btn.disabled = true; btn.textContent = 'Saving…';
    try {
        await api.adminUpdateSettings(updates);
        showFlash('Settings saved.', 'success');
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
