import { route, navigate, isAuthenticated } from '../state.js';
import { signal } from '@ghost-js/core';

const NAV_ITEMS = [
    { path: '/', label: 'Dashboard', icon: 'bi-house-door' },
    { path: '/tasks', label: 'Tasks', icon: 'bi-list-check' },
    { path: '/earn', label: 'Watch Ads', icon: 'bi-play-circle' },
    { path: '/refer', label: 'Refer & Earn', icon: 'bi-people' },
    { path: '/withdraw', label: 'Withdraw', icon: 'bi-wallet2' },
    { path: '/wallet', label: 'Wallet', icon: 'bi-wallet' },
    { path: '/leaderboard', label: 'Leaderboard', icon: 'bi-bar-chart' },
    { path: '/achievements', label: 'Achievements', icon: 'bi-trophy' },
    { path: '/support', label: 'Support', icon: 'bi-question-circle' },
    { path: '/settings', label: 'Settings', icon: 'bi-gear' },
];

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
        children: NAV_ITEMS.map(item => NavItem(item)),
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
