import { currentUser, isAuthenticated, logout, showFlash } from '../state.js';
import { when } from '@ghost-js/core';
import { openMobileNav } from './MobileNav.js';
import { theme, toggleTheme } from '../theme.js';
import { api } from '../api.js';

export function TopBar() {
    return when(
        () => isAuthenticated.get(),
        () => authenticatedTopBar(),
        () => publicTopBar(),
    );
}

function themeToggle() {
    const isDark = () => theme.get() === 'dark';
    return {
        tag: 'button',
        props: {
            class: 'topbar__icon-btn theme-toggle',
            title: isDark() ? 'Switch to light mode' : 'Switch to dark mode',
            onclick: () => toggleTheme(),
            'data-theme': () => theme.get(),
        },
        children: [{
            tag: 'i',
            props: { class: () => `bi ${isDark() ? 'bi-sun' : 'bi-moon'}` },
            children: [],
        }],
    };
}

function toggleNotifications() {
    const panel = document.getElementById('topbar-notifications-panel');
    if (!panel) return;
    const isOpen = panel.classList.contains('topbar-notifications--open');
    // close any open panels first
    document.querySelectorAll('.topbar-notifications--open').forEach(el => el.classList.remove('topbar-notifications--open'));
    if (!isOpen) panel.classList.add('topbar-notifications--open');
}

function notificationBell() {
    setTimeout(loadNotificationPreview, 0);
    return {
        tag: 'div',
        props: { class: 'topbar__notifications-wrap' },
        children: [
            {
                tag: 'button',
                props: {
                    class: 'topbar__icon-btn topbar__notifications',
                    'aria-label': 'Notifications',
                    onclick: (e) => { e.stopPropagation(); toggleNotifications(); },
                },
                children: [
                    { tag: 'i', props: { class: 'bi bi-bell' }, children: [] },
                    {
                        tag: 'span',
                        props: { class: 'topbar__notification-badge', id: 'topbar-notification-badge', 'aria-live': 'polite' },
                        children: ['0'],
                    },
                ],
            },
            {
                tag: 'div',
                props: {
                    class: 'topbar-notifications',
                    id: 'topbar-notifications-panel',
                },
                children: [
                    {
                        tag: 'div',
                        props: { class: 'topbar-notifications__header' },
                        children: [
                            { tag: 'strong', props: {}, children: ['Notifications'] },
                            {
                                tag: 'button',
                                props: {
                                    class: 'topbar-notifications__close',
                                    'aria-label': 'Close',
                                    onclick: () => {
                                        const panel = document.getElementById('topbar-notifications-panel');
                                        if (panel) panel.classList.remove('topbar-notifications--open');
                                    },
                                },
                                children: [{ tag: 'i', props: { class: 'bi bi-x-lg' }, children: [] }],
                            },
                        ],
                    },
                    {
                        tag: 'ul',
                        props: { class: 'topbar-notifications__list', id: 'topbar-notifications-list' },
                        children: [
                            notificationItem('Loading notifications…', 'Your latest updates will appear here.', 'bi-hourglass-split', 'info'),
                        ],
                    },
                    {
                        tag: 'div',
                        props: { class: 'topbar-notifications__footer' },
                        children: [
                            { tag: 'a', props: { href: '#/notifications', class: 'topbar-notifications__link' }, children: ['View all notifications'] },
                        ],
                    },
                ],
            },
        ],
    };
}

async function loadNotificationPreview() {
    const list = document.getElementById('topbar-notifications-list');
    const badge = document.getElementById('topbar-notification-badge');
    if (!list || !badge) return;

    try {
        const response = await api.notifications({ limit: 5 });
        const items = Array.isArray(response.data) ? response.data : [];
        const unread = Number(response.meta?.unread_count || items.filter(item => !item.read).length || 0);
        badge.textContent = unread > 99 ? '99+' : String(unread);
        list.innerHTML = items.length
            ? items.map(previewNotificationHtml).join('')
            : '<li class="topbar-notifications__empty">No notifications yet.</li>';
        list.querySelectorAll('[data-notification-id]').forEach(item => {
            item.addEventListener('click', async () => {
                const id = item.getAttribute('data-notification-id');
                if (!id || item.getAttribute('data-read') === '1') return;
                try {
                    await api.notificationRead(id);
                    item.setAttribute('data-read', '1');
                    item.classList.remove('topbar-notification--unread');
                    const count = Math.max(0, Number(badge.textContent.replace('+', '')) - 1);
                    badge.textContent = String(count);
                } catch { /* the full page can retry */ }
            });
        });
    } catch {
        list.innerHTML = '<li class="topbar-notifications__empty">Notifications are unavailable right now.</li>';
        badge.textContent = '0';
    }
}

function previewNotificationHtml(item) {
    const data = item.data || {};
    const tone = ['success', 'warning', 'primary', 'info', 'danger'].includes(data.tone) ? data.tone : 'info';
    const icon = /^bi-[a-z0-9-]+$/.test(String(data.icon || '')) ? data.icon : 'bi-bell';
    const action = typeof data.action_url === 'string' && data.action_url.startsWith('/') ? ` href="#${escapeHtml(data.action_url)}"` : '';
    return `<li class="topbar-notification topbar-notification--${tone} ${item.read ? '' : 'topbar-notification--unread'}" data-notification-id="${escapeHtml(item.id)}" data-read="${item.read ? '1' : '0'}"><i class="bi ${icon} topbar-notification__icon"></i><div class="topbar-notification__body"><div class="topbar-notification__title">${escapeHtml(data.title || 'Notification')}</div><div class="topbar-notification__text">${escapeHtml(data.message || '')}</div>${action ? `<a class="topbar-notification__action"${action}>Open</a>` : ''}</div></li>`;
}

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
}

function notificationItem(title, body, icon, tone) {
    return {
        tag: 'li',
        props: { class: `topbar-notification topbar-notification--${tone}` },
        children: [
            { tag: 'i', props: { class: `bi ${icon} topbar-notification__icon` }, children: [] },
            {
                tag: 'div',
                props: { class: 'topbar-notification__body' },
                children: [
                    { tag: 'div', props: { class: 'topbar-notification__title' }, children: [title] },
                    { tag: 'div', props: { class: 'topbar-notification__text' }, children: [body] },
                ],
            },
        ],
    };
}

// Close notifications panel when clicking outside
if (typeof document !== 'undefined') {
    document.addEventListener('click', (e) => {
        const panel = document.getElementById('topbar-notifications-panel');
        if (!panel) return;
        if (panel.classList.contains('topbar-notifications--open') &&
            !panel.contains(e.target) &&
            !e.target.closest('.topbar__notifications')) {
            panel.classList.remove('topbar-notifications--open');
        }
    });
}

function publicTopBar() {
    return {
        tag: 'header',
        props: { class: 'topbar topbar--public' },
        children: [
            {
                tag: 'div',
                props: { class: 'topbar__left' },
                children: [
                    {
                        tag: 'a',
                        props: { class: 'topbar__brand', href: '#/' },
                        children: ['JMJOB'],
                    },
                ],
            },
            {
                tag: 'div',
                props: { class: 'topbar__right' },
                children: [
                    themeToggle(),
                    { tag: 'a', props: { class: 'topbar__link', href: '#/login' }, children: ['Log in'] },
                    { tag: 'a', props: { class: 'topbar__link topbar__link--cta', href: '#/register' }, children: ['Sign up'] },
                ],
            },
        ],
    };
}

function authenticatedTopBar() {
    const u = currentUser.get();
    const balance = u ? parseFloat(u.balance || 0).toFixed(2) : '0.00';
    const initial = u ? u.name.charAt(0).toUpperCase() : 'U';

    return {
        tag: 'header',
        props: { class: 'topbar topbar--user' },
        children: [
            {
                tag: 'div',
                props: { class: 'topbar__left' },
                children: [
                    {
                        tag: 'button',
                        props: {
                            class: 'topbar__menu-btn',
                            onclick: () => openMobileNav(),
                            'aria-label': 'Open menu',
                        },
                        children: [{ tag: 'i', props: { class: 'bi bi-list' }, children: [] }],
                    },
                    {
                        tag: 'a',
                        props: { class: 'topbar__brand', href: '#/' },
                        children: ['JMJOB'],
                    },
                ],
            },
            {
                tag: 'div',
                props: { class: 'topbar__right' },
                children: [
                    // Theme toggle
                    themeToggle(),
                    // Notifications bell + dropdown
                    notificationBell(),
                    // User profile
                    {
                        tag: 'div',
                        props: { class: 'topbar__user' },
                        children: [
                            {
                                tag: 'div',
                                props: { class: 'topbar__avatar' },
                                children: [initial],
                            },
                            {
                                tag: 'div',
                                props: { class: 'topbar__user-info' },
                                children: [
                                    {
                                        tag: 'div',
                                        props: { class: 'topbar__user-name' },
                                        children: [
                                            { tag: 'span', props: {}, children: [u ? u.name : 'Loading…'] },
                                            { tag: 'span', props: { class: 'topbar__user-active-dot', title: 'Active' }, children: [] },
                                        ],
                                    },
                                    { tag: 'div', props: { class: 'topbar__user-balance' }, children: [`$${balance}`] },
                                ],
                            },
                        ],
                    },
                    // Logout button
                    {
                        tag: 'button',
                        props: {
                            class: 'topbar__icon-btn',
                            title: 'Log out',
                            onclick: async () => {
                                await logout();
                                showFlash('Logged out.', 'info');
                            },
                        },
                        children: [{ tag: 'i', props: { class: 'bi bi-box-arrow-right' }, children: [] }],
                    },
                ],
            },
        ],
    };
}
