// HorizontalNav — full-width icon+label nav that sits at the bottom of the
// viewport (Android-style). Includes left/right scroll arrows on mobile so
// the link list is reachable when it overflows. Redundant with the desktop
// Sidebar and the mobile slide-out (per client requirement).
import { route, navigate, isAuthenticated, currentUser } from '../state.js';

const USER_NAV_ITEMS = [
    { path: '/',              label: 'Home',     icon: 'bi-house-door' },
    { path: '/earn',          label: 'Earn Ad',  icon: 'bi-play-circle-fill' },
    { path: '/tasks',         label: 'Web Task', icon: 'bi-link-45deg' },
    { path: '/webtask',       label: 'Tasks',    icon: 'bi-telegram' },
    { path: '/withdraw',      label: 'Withdraw', icon: 'bi-wallet2' },
    { path: '/notifications', label: 'Alerts',    icon: 'bi-bell' },
    { path: '/refer',         label: 'Referral', icon: 'bi-gift-fill' },
    { path: '/deposit',       label: 'Deposit',  icon: 'bi-cash-coin' },
    { path: '/profile',       label: 'Profile',  icon: 'bi-person-bounding-box' },
    { path: '/leaderboard',   label: 'Leaders',  icon: 'bi-bar-chart-line-fill' },
    { path: '/achievements',  label: 'Awards',   icon: 'bi-award-fill' },
    { path: '/support',       label: 'Support',  icon: 'bi-headset' },
    { path: '/settings',      label: 'Settings', icon: 'bi-gear-fill' },
];

const ADMIN_NAV_ITEMS = [
    { path: '/admin',          label: 'Admin',    icon: 'bi-shield-lock-fill' },
    { path: '/admin/payments', label: 'Payments', icon: 'bi-cash-stack' },
    { path: '/admin/jobs', label: 'Jobs', icon: 'bi-briefcase' },
    { path: '/admin/transactions', label: 'Ledger', icon: 'bi-receipt' },
    { path: '/admin/reports', label: 'Reports', icon: 'bi-bar-chart-line' },
];

const POSTER_NAV_ITEMS = [
    { path: '/poster', label: 'Poster', icon: 'bi-kanban' },
    { path: '/poster/post-job', label: 'Post Job', icon: 'bi-plus-square' },
    { path: '/poster/jobs', label: 'My Jobs', icon: 'bi-briefcase' },
    { path: '/poster/wallet', label: 'Wallet', icon: 'bi-wallet2' },
];

function getNavItems() {
    const u = currentUser.get();
    const items = [...USER_NAV_ITEMS];
    if (u && (u.role === 'poster' || u.is_admin)) {
        items.push({ separator: true }, ...POSTER_NAV_ITEMS);
    }
    if (u && u.is_admin) {
        return [...items, { separator: true }, ...ADMIN_NAV_ITEMS];
    }
    return items;
}

function NavLink({ path, label, icon }) {
    const isActive = route.get() === path;
    return {
        tag: 'a',
        props: {
            class: `hnav__item${isActive ? ' hnav__item--active' : ''}`,
            href: `#${path}`,
            title: label,
            'aria-label': label,
            onclick: (e) => {
                e.preventDefault();
                navigate(path);
            },
        },
        children: [
            { tag: 'i', props: { class: `bi ${icon} hnav__icon` }, children: [] },
            { tag: 'span', props: { class: 'hnav__label' }, children: [label] },
        ],
    };
}

function NavSeparator() {
    return {
        tag: 'div',
        props: { class: 'hnav__separator' },
        children: [],
    };
}

function NavList() {
    return {
        tag: 'nav',
        props: { class: 'hnav__list', id: 'hnav-list' },
        children: getNavItems().map(item => item.separator ? NavSeparator() : NavLink(item)),
    };
}

function ScrollButton(direction) {
    const isLeft = direction === 'left';
    return {
        tag: 'button',
        props: {
            class: `hnav__scroll hnav__scroll--${direction}`,
            id: `hnav-scroll-${direction}`,
            type: 'button',
            'aria-label': isLeft ? 'Scroll left' : 'Scroll right',
            onclick: (e) => {
                e.preventDefault();
                scrollHnav(isLeft ? -1 : 1);
            },
        },
        children: [
            {
                tag: 'i',
                props: { class: `bi ${isLeft ? 'bi-chevron-left' : 'bi-chevron-right'}` },
                children: [],
            },
        ],
    };
}

function scrollHnav(direction) {
    const list = document.getElementById('hnav-list');
    if (!list) return;
    // Scroll by ~70% of the visible width for a snappy feel
    const amount = Math.max(120, Math.round(list.clientWidth * 0.7));
    list.scrollBy({ left: direction * amount, behavior: 'smooth' });
}

// Toggle arrow disabled state based on scroll position (run after every render)
function refreshScrollButtons() {
    const list = document.getElementById('hnav-list');
    const left = document.getElementById('hnav-scroll-left');
    const right = document.getElementById('hnav-scroll-right');
    if (!list || !left || !right) return;
    const maxScroll = list.scrollWidth - list.clientWidth;
    left.disabled = list.scrollLeft <= 1;
    right.disabled = list.scrollLeft >= maxScroll - 1;
    left.classList.toggle('is-disabled', left.disabled);
    right.classList.toggle('is-disabled', right.disabled);
}

if (typeof document !== 'undefined') {
    // Bind scroll listener once. Re-query the list each time because the
    // route-driven re-render may swap the underlying DOM node.
    document.addEventListener('scroll', (e) => {
        if (e.target && e.target.id === 'hnav-list') refreshScrollButtons();
    }, true);
    // Refresh on resize (list width changes)
    window.addEventListener('resize', () => setTimeout(refreshScrollButtons, 50));
    // Refresh on a custom event the AppShell will dispatch after every render
    document.addEventListener('hnav:rendered', () => setTimeout(refreshScrollButtons, 0));
}

export function HorizontalNav() {
    return {
        tag: 'div',
        props: {
            class: 'hnav',
            id: 'horizontal-nav',
        },
        children: [
            ScrollButton('left'),
            NavList(),
            ScrollButton('right'),
        ],
    };
}
