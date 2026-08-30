import { currentUser, route, navigate, logout, isAuthenticated, showFlash } from '../state.js';
import { ROUTES } from '../router.js';

export function TopBar() {
    return () => {
        const u = currentUser.get();
        const authed = isAuthenticated.get();
        if (!authed) {
            // Show a slim top bar for unauthenticated views
            return {
                tag: 'header',
                props: { class: 'topbar topbar--public' },
                children: [
                    {
                        tag: 'a',
                        props: { class: 'topbar__brand', href: '#/' },
                        children: ['💰 EarnApp'],
                    },
                    {
                        tag: 'div',
                        props: { class: 'topbar__actions' },
                        children: [
                            {
                                tag: 'a',
                                props: { class: 'topbar__link', href: '#/login' },
                                children: ['Log in'],
                            },
                            {
                                tag: 'a',
                                props: { class: 'topbar__link topbar__link--cta', href: '#/register' },
                                children: ['Sign up'],
                            },
                        ],
                    },
                ],
            };
        }
        const balance = u ? parseFloat(u.balance || 0).toFixed(2) : '0.00';
        const lifetime = u ? parseFloat(u.lifetime_earned || 0).toFixed(2) : '0.00';
        return {
            tag: 'header',
            props: { class: 'topbar topbar--user' },
            children: [
                {
                    tag: 'a',
                    props: { class: 'topbar__brand', href: '#/' },
                    children: ['💰 EarnApp'],
                },
                {
                    tag: 'div',
                    props: { class: 'topbar__user' },
                    children: [
                        {
                            tag: 'div',
                            props: { class: 'topbar__user-info' },
                            children: [
                                { tag: 'strong', props: {}, children: [() => u ? u.name : 'Loading…'] },
                                {
                                    tag: 'span',
                                    props: { class: 'topbar__user-balance' },
                                    children: [() => '$' + balance],
                                },
                            ],
                        },
                        {
                            tag: 'img',
                            props: {
                                class: 'topbar__avatar',
                                src: () => u ? u.avatar_url : 'https://placehold.co/40x40/e8e8e8/a9a9a9?text=U',
                                alt: 'avatar',
                            },
                            children: [],
                        },
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
    };
}
