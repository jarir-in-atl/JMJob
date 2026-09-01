import { route, navigate, isAuthenticated } from '../state.js';

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

export function Sidebar() {
    return {
        tag: 'aside',
        props: { class: 'sidebar', id: 'sidebar' },
        children: [
            Brand(),
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
            { tag: 'span', props: {}, children: ['JOB'] },
        ],
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
