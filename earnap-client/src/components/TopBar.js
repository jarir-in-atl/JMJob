import { currentUser, isAuthenticated, logout, showFlash } from '../state.js';
import { when } from '@ghost-js/core';
import { openSidebar } from './Sidebar.js';
import { theme, toggleTheme } from '../theme.js';

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
                            onclick: () => openSidebar(),
                            'aria-label': 'Open menu',
                        },
                        children: [{ tag: 'i', props: { class: 'bi bi-list' }, children: [] }],
                    },
                ],
            },
            {
                tag: 'div',
                props: { class: 'topbar__right' },
                children: [
                    // Theme toggle
                    themeToggle(),
                    // Notifications bell
                    {
                        tag: 'button',
                        props: {
                            class: 'topbar__notifications',
                            'aria-label': 'Notifications',
                        },
                        children: [
                            { tag: 'i', props: { class: 'bi bi-bell' }, children: [] },
                            {
                                tag: 'span',
                                props: { class: 'topbar__notification-badge' },
                                children: ['3'],
                            },
                        ],
                    },
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
                                    { tag: 'div', props: { class: 'topbar__user-name' }, children: [u ? u.name : 'Loading…'] },
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
