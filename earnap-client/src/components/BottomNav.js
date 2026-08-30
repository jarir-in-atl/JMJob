import { route, isAuthenticated, currentUser, navigate } from '../state.js';

const TABS = [
    { path: '/',         label: 'Home',     icon: 'bi-house-door' },
    { path: '/webtask',   label: 'Tasks',    icon: 'bi-list-check' },
    { path: '/earn',      label: 'Earn',     icon: 'bi-play-circle' },
    { path: '/refer',     label: 'Refer',    icon: 'bi-people' },
    { path: '/withdraw',  label: 'Wallet',   icon: 'bi-wallet2' },
    { path: '/profile',   label: 'Profile',  icon: 'bi-person' },
];

export function BottomNav() {
    return () => {
        if (!isAuthenticated.get()) {
            return { tag: 'div', props: { class: 'bottomnav-spacer' }, children: [] };
        }
        return {
            tag: 'nav',
            props: { class: 'bottomnav' },
            children: TABS.map(tab => NavItem(tab)),
        };
    };
}

function NavItem(tab) {
    return () => {
        const isActive = route.get() === tab.path;
        return {
            tag: 'a',
            props: {
                class: 'bottomnav__item' + (isActive ? ' bottomnav__item--active' : ''),
                href: '#' + tab.path,
            },
            children: [
                { tag: 'i', props: { class: 'bi ' + tab.icon + ' bottomnav__icon' }, children: [] },
                { tag: 'span', props: { class: 'bottomnav__label' }, children: [tab.label] },
            ],
        };
    };
}
