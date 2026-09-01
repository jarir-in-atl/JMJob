import { route, isAuthenticated } from '../state.js';
import { when } from '@ghost-js/core';

const TABS = [
    { path: '/',         label: 'Home',     icon: 'bi-house-door' },
    { path: '/webtask',   label: 'Tasks',    icon: 'bi-list-check' },
    { path: '/earn',      label: 'Earn',     icon: 'bi-play-circle' },
    { path: '/refer',     label: 'Refer',    icon: 'bi-people' },
    { path: '/withdraw',  label: 'Wallet',   icon: 'bi-wallet2' },
    { path: '/profile',   label: 'Profile',  icon: 'bi-person' },
];

function NavItem(tab) {
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
}

export function BottomNav() {
    return when(
        () => isAuthenticated.get(),
        () => ({
            tag: 'nav',
            props: { class: 'bottomnav' },
            children: TABS.map(NavItem),
        }),
        () => ({ tag: 'div', props: { class: 'bottomnav-spacer' }, children: [] }),
    );
}
