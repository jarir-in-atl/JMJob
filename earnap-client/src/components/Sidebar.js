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

const ADMIN_NAV_ITEMS = [
    { path: '/admin', label: 'Overview', icon: 'bi-speedometer2' },
    { path: '/admin/payments', label: 'Payments & TRX', icon: 'bi-cash-stack' },
    { path: '/admin/jobs', label: 'Job Moderation', icon: 'bi-shield-check' },
    { path: '/admin/transactions', label: 'Ledger Audit', icon: 'bi-receipt' },
    { path: '/admin/reports', label: 'Analytics & Reports', icon: 'bi-bar-chart-line' },
    { path: '/admin/categories', label: 'Categories', icon: 'bi-tags' },
    { path: '/admin/settings', label: 'Platform Settings', icon: 'bi-sliders' },
];

const POSTER_NAV_ITEMS = [
    { path: '/poster', label: 'Poster Dashboard', icon: 'bi-kanban' },
    { path: '/poster/post-job', label: 'Post a Job', icon: 'bi-plus-square' },
    { path: '/poster/jobs', label: 'My Jobs', icon: 'bi-briefcase' },
    { path: '/poster/wallet', label: 'Poster Wallet', icon: 'bi-wallet2' },
];

function getNavItems() {
    const u = currentUser.get();
    if (u && u.is_admin) {
        return [
            { header: 'ADMIN CONSOLE' },
            ...ADMIN_NAV_ITEMS,
        ];
    }

    const items = [...USER_NAV_ITEMS];
    if (u && u.role === 'poster') {
        items.push({ separator: true }, ...POSTER_NAV_ITEMS);
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
    const isAdminRoute = () => route.get().startsWith('/admin');
    return {
        tag: 'aside',
        props: {
            class: () => `sidebar ${isCollapsed.get() ? 'sidebar--collapsed' : ''} ${isAdminRoute() ? 'sidebar--admin' : ''}`,
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
    const isAdminRoute = () => route.get().startsWith('/admin');
    return {
        tag: 'div',
        props: { class: 'sidebar__brand' },
        children: [
            {
                tag: 'div',
                props: { class: 'sidebar__brand-text' },
                children: [
                    { tag: 'span', props: { class: 'sidebar__brand-prefix' }, children: ['JM'] },
                    { tag: 'span', props: { class: 'sidebar__brand-suffix' }, children: ['JOB'] },
                ],
            },
            {
                tag: 'span',
                props: { class: () => `sidebar__admin-badge ${isAdminRoute() ? 'sidebar__admin-badge--active' : ''}` },
                children: ['ADMIN'],
            },
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
        children: getNavItems().map(item => {
            if (item.header) return NavHeader(item.header);
            if (item.separator) return NavSeparator();
            return NavItem(item);
        }),
    };
}

function NavHeader(text) {
    return {
        tag: 'div',
        props: { class: 'sidebar__header' },
        children: [text],
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

