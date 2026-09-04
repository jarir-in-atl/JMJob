import { route, navigate, isAuthenticated, currentUser } from '../state.js';
import { signal } from '@ghost-js/core';

const USER_NAV_ITEMS = [
    { path: '/', label: 'Dashboard', icon: 'bi-house-door' },
    { path: '/tasks', label: 'Tasks', icon: 'bi-list-check' },
    { path: '/earn', label: 'Watch Ads', icon: 'bi-play-circle' },
    { path: '/refer', label: 'Refer & Earn', icon: 'bi-people' },
    { path: '/deposit', label: 'Deposit', icon: 'bi-cash-coin' },
    { path: '/withdraw', label: 'Withdraw', icon: 'bi-wallet2' },
    { path: '/wallet', label: 'Wallet', icon: 'bi-wallet' },
    { path: '/notifications', label: 'Notifications', icon: 'bi-bell' },
    { path: '/jobs/available', label: 'Browse Jobs', icon: 'bi-briefcase' },
    { path: '/worker/bids', label: 'My Bids', icon: 'bi-clipboard-check' },
    { path: '/worker/active-jobs', label: 'Active Jobs', icon: 'bi-hammer' },
    { path: '/leaderboard', label: 'Leaderboard', icon: 'bi-bar-chart' },
    { path: '/achievements', label: 'Achievements', icon: 'bi-trophy' },
    { path: '/support', label: 'Support', icon: 'bi-question-circle' },
    { path: '/settings', label: 'Settings', icon: 'bi-gear' },
];

// Admin-only sidebar additions (appended after the user links).
const ADMIN_NAV_ITEMS = [
    { path: '/admin', label: 'Admin Panel', icon: 'bi-shield-lock' },
    { path: '/admin/payments', label: 'Payments', icon: 'bi-cash-stack' },
    { path: '/admin/jobs', label: 'Job Oversight', icon: 'bi-briefcase' },
    { path: '/admin/transactions', label: 'Transactions', icon: 'bi-receipt' },
    { path: '/admin/reports', label: 'Reports', icon: 'bi-bar-chart-line' },
    { path: '/admin/categories', label: 'Categories', icon: 'bi-tags' },
    { path: '/admin/settings', label: 'Settings', icon: 'bi-sliders' },
];

const POSTER_NAV_ITEMS = [
    { path: '/poster', label: 'Poster Dashboard', icon: 'bi-kanban' },
    { path: '/poster/post-job', label: 'Post a Job', icon: 'bi-plus-square' },
    { path: '/poster/jobs', label: 'My Jobs', icon: 'bi-briefcase' },
    { path: '/poster/wallet', label: 'Poster Wallet', icon: 'bi-wallet2' },
];

function getNavItems() {
    const u = currentUser.get();
    const items = [...USER_NAV_ITEMS];
    if (u && (u.role === 'poster' || u.is_admin)) {
        items.push({ separator: true }, ...POSTER_NAV_ITEMS);
    }
    if (u && u.is_admin) {
        // Admin: show user links + a separator + admin links at the bottom.
        return [...items, { separator: true }, ...ADMIN_NAV_ITEMS];
    }
    return items;
}

// Collapsed state signal (persisted to localStorage)
const STORAGE_KEY = 'sidebar_collapsed';
const isCollapsed = signal(localStorage.getItem(STORAGE_KEY) === 'true');

function toggleCollapse() {
    const next = !isCollapsed.get();
    isCollapsed.set(next);
    localStorage.setItem(STORAGE_KEY, String(next));
}

export function Sidebar() {
    return {
        tag: 'aside',
        props: {
            class: () => `sidebar ${isCollapsed.get() ? 'sidebar--collapsed' : ''}`,
            id: 'sidebar',
        },
        children: [
            Brand(),
            CollapseButton(),
            NavList(),
        ],
    };
}

function Brand() {
    return {
        tag: 'div',
        props: { class: 'sidebar__brand' },
        children: [
            { tag: 'span', props: {}, children: ['JM'] },
            { tag: 'span', props: { class: () => isCollapsed.get() ? '' : '' }, children: ['JOB'] },
        ],
    };
}

function CollapseButton() {
    return {
        tag: 'button',
        props: {
            class: 'sidebar__collapse-btn',
            onclick: () => toggleCollapse(),
            title: () => isCollapsed.get() ? 'Expand sidebar' : 'Collapse sidebar',
        },
        children: [{
            tag: 'i',
            props: { class: () => `bi ${isCollapsed.get() ? 'bi-chevron-right' : 'bi-chevron-left'}` },
            children: [],
        }],
    };
}

function NavList() {
    return {
        tag: 'nav',
        props: { class: 'sidebar__nav' },
        children: getNavItems().map(item => item.separator ? NavSeparator() : NavItem(item)),
    };
}

function NavSeparator() {
    return {
        tag: 'div',
        props: { class: 'sidebar__separator' },
        children: [],
    };
}

function NavItem({ path, label, icon }) {
    const isActive = route.get() === path;

    return {
        tag: 'a',
        props: {
            class: `sidebar__item${isActive ? ' sidebar__item--active' : ''}`,
            href: `#${path}`,
            title: () => isCollapsed.get() ? label : '',
            onclick: (e) => {
                e.preventDefault();
                navigate(path);
                closeSidebar();
            },
        },
        children: [
            { tag: 'i', props: { class: `bi ${icon} sidebar__icon` }, children: [] },
            { tag: 'span', props: { class: 'sidebar__label' }, children: [label] },
        ],
    };
}

export function SidebarOverlay() {
    return {
        tag: 'div',
        props: {
            class: 'sidebar-overlay',
            id: 'sidebar-overlay',
            onclick: () => closeSidebar(),
        },
        children: [],
    };
}

export function openSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar) sidebar.classList.add('sidebar--open');
    if (overlay) overlay.classList.add('sidebar-overlay--active');
}

export function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar) sidebar.classList.remove('sidebar--open');
    if (overlay) overlay.classList.remove('sidebar-overlay--active');
}
