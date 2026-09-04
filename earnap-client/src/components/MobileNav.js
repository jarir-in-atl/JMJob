// MobileNav — vertical slide-out navbar for mobile (duplicates sidebar links)
// Triggered by the hamburger button in the TopBar. Lives independently from the
// desktop Sidebar so users see a discoverable, full-height nav on every viewport.
import { route, navigate, isAuthenticated, currentUser } from '../state.js';

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
        return [...items, { separator: true }, ...ADMIN_NAV_ITEMS];
    }
    return items;
}

function NavItem({ path, label, icon }) {
    const isActive = route.get() === path;
    return {
        tag: 'a',
        props: {
            class: `mobile-nav__item${isActive ? ' mobile-nav__item--active' : ''}`,
            href: `#${path}`,
            onclick: (e) => {
                e.preventDefault();
                navigate(path);
                closeMobileNav();
            },
        },
        children: [
            { tag: 'i', props: { class: `bi ${icon} mobile-nav__icon` }, children: [] },
            { tag: 'span', props: { class: 'mobile-nav__label' }, children: [label] },
        ],
    };
}

function BrandRow() {
    return {
        tag: 'div',
        props: { class: 'mobile-nav__brand' },
        children: [
            { tag: 'span', props: { class: 'mobile-nav__brand-text' }, children: ['JM JOB'] },
            {
                tag: 'button',
                props: {
                    class: 'mobile-nav__close',
                    'aria-label': 'Close menu',
                    onclick: () => closeMobileNav(),
                },
                children: [
                    { tag: 'i', props: { class: 'bi bi-x-lg' }, children: [] },
                ],
            },
        ],
    };
}

function NavList() {
    return {
        tag: 'nav',
        props: { class: 'mobile-nav__list' },
        children: getNavItems().map(item => item.separator ? NavSeparator() : NavItem(item)),
    };
}

function NavSeparator() {
    return {
        tag: 'div',
        props: { class: 'mobile-nav__separator' },
        children: [],
    };
}

export function MobileNav() {
    return {
        tag: 'aside',
        props: {
            class: 'mobile-nav',
            id: 'mobile-nav',
        },
        children: [
            BrandRow(),
            NavList(),
        ],
    };
}

export function MobileNavOverlay() {
    return {
        tag: 'div',
        props: {
            class: 'mobile-nav-overlay',
            id: 'mobile-nav-overlay',
            onclick: () => closeMobileNav(),
        },
        children: [],
    };
}

export function openMobileNav() {
    const nav = document.getElementById('mobile-nav');
    const overlay = document.getElementById('mobile-nav-overlay');
    if (nav) nav.classList.add('mobile-nav--open');
    if (overlay) overlay.classList.add('mobile-nav-overlay--active');
    document.body.style.overflow = 'hidden';
}

export function closeMobileNav() {
    const nav = document.getElementById('mobile-nav');
    const overlay = document.getElementById('mobile-nav-overlay');
    if (nav) nav.classList.remove('mobile-nav--open');
    if (overlay) overlay.classList.remove('mobile-nav-overlay--active');
    document.body.style.overflow = '';
}

// Toggle helper (some UIs prefer a single hamburger that toggles)
export function toggleMobileNav() {
    const nav = document.getElementById('mobile-nav');
    if (nav && nav.classList.contains('mobile-nav--open')) {
        closeMobileNav();
    } else {
        openMobileNav();
    }
}
