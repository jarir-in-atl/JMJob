// NotificationsPage — persistent in-app account and marketplace updates.

import { api } from '../api.js';
import { showFlash } from '../state.js';

export function NotificationsPage() {
    return async () => {
        const root = document.querySelector('[data-view]');
        if (!root) return;
        root.innerHTML = '';
        root.className = 'view view--notifications';
        root.innerHTML = `
            <div class="page-heading-row">
                <div><h1 class="page-title">Notifications</h1><p class="muted">Account, payment, and marketplace updates.</p></div>
                <button class="btn btn--secondary" id="notifications-read-all"><i class="bi bi-check2-all"></i> Mark all read</button>
            </div>
            <div class="card notifications-page__card" id="notifications-page-list"><div class="spinner"></div></div>
        `;
        document.getElementById('notifications-read-all')?.addEventListener('click', async () => {
            try {
                await api.notificationsReadAll();
                showFlash('All notifications marked as read.', 'success');
                await loadNotifications();
            } catch (error) {
                showFlash(error.message || 'Could not update notifications.', 'error');
            }
        });
        await loadNotifications();
    };
}

async function loadNotifications() {
    const list = document.getElementById('notifications-page-list');
    if (!list) return;
    try {
        const response = await api.notifications({ limit: 100 });
        const items = Array.isArray(response.data) ? response.data : [];
        list.innerHTML = items.length ? items.map(notificationHtml).join('') : '<p class="muted notifications-page__empty">No notifications yet.</p>';
        list.querySelectorAll('[data-notification-id]').forEach(item => {
            item.querySelector('[data-mark-read]')?.addEventListener('click', async () => {
                try {
                    await api.notificationRead(item.getAttribute('data-notification-id'));
                    item.classList.remove('notifications-page__item--unread');
                    item.querySelector('[data-mark-read]').remove();
                } catch (error) {
                    showFlash(error.message || 'Could not mark notification as read.', 'error');
                }
            });
        });
    } catch (error) {
        list.innerHTML = `<p class="muted">Failed to load notifications: ${escapeHtml(error.message || 'unknown error')}</p>`;
    }
}

function notificationHtml(item) {
    const data = item.data || {};
    const tone = ['success', 'warning', 'primary', 'info', 'danger'].includes(data.tone) ? data.tone : 'info';
    const icon = /^bi-[a-z0-9-]+$/.test(String(data.icon || '')) ? data.icon : 'bi-bell';
    const action = typeof data.action_url === 'string' && data.action_url.startsWith('/') ? `<a class="btn btn--ghost btn--sm" href="#${escapeHtml(data.action_url)}">Open</a>` : '';
    const mark = item.read ? '' : '<button class="btn btn--ghost btn--sm" data-mark-read>Mark read</button>';
    return `<article class="notifications-page__item ${item.read ? '' : 'notifications-page__item--unread'}" data-notification-id="${escapeHtml(item.id)}"><i class="bi ${icon} notifications-page__icon notifications-page__icon--${tone}"></i><div class="notifications-page__body"><h3>${escapeHtml(data.title || 'Notification')}</h3><p>${escapeHtml(data.message || '')}</p><small>${formatDate(item.created_at)}</small></div><div class="notifications-page__actions">${action}${mark}</div></article>`;
}

function formatDate(value) {
    if (!value) return '';
    const date = new Date(String(value).replace(' ', 'T') + 'Z');
    return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
}

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
}
