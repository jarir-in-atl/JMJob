import { currentUser, route, isAuthenticated, navigate, logout, showFlash } from '../state.js';
import { ROUTES } from '../router.js';
import { effect, when } from '@ghost-js/core';
import { Sidebar, SidebarOverlay } from './Sidebar.js';
import { TopBar } from './TopBar.js';
import { Toast } from './Toast.js';
import { Footer } from './Footer.js';

export function AppShell() {
    return {
        tag: 'div',
        props: { class: 'app-shell' },
        children: [
            // Only show sidebar when authenticated
            when(
                () => isAuthenticated.get(),
                () => Sidebar(),
                () => null
            ),
            when(
                () => isAuthenticated.get(),
                () => SidebarOverlay(),
                () => null
            ),
            {
                tag: 'div',
                props: { class: 'main-wrapper' },
                children: [
                    TopBar(),
                    { tag: 'main', props: { class: 'app-main' }, children: [renderRoute()] },
                    Footer(),
                ],
            },
            Toast(),
        ],
    };
}

function renderRoute() {
    const path = route.get();
    const matched = ROUTES.find(r => r.path === path);

    if (!matched) {
        return NotFoundView();
    }

    // Auth gate
    if (matched.requireAuth && !isAuthenticated.get()) {
        navigate('/login');
        return LoadingView();
    }
    if (matched.requireAdmin && (!currentUser.get() || !currentUser.get().is_admin)) {
        return ForbiddenView();
    }

    // Public pages (login/register) should not be seen when authed.
    if (!matched.requireAuth && isAuthenticated.get() && ['/login', '/register'].includes(path)) {
        navigate('/');
        return LoadingView();
    }

    return ViewPlaceholder(matched);
}

function ViewPlaceholder(matched) {
    return {
        tag: 'div',
        props: { class: 'view-placeholder', 'data-view': matched.path },
        children: [
            { tag: 'p', props: { class: 'muted' }, children: ['Loading ' + matched.path + '…'] },
        ],
    };
}

function NotFoundView() {
    return {
        tag: 'div',
        props: { class: 'view-404' },
        children: [
            { tag: 'h1', props: {}, children: ['404'] },
            { tag: 'p', props: {}, children: ['Page not found.'] },
            {
                tag: 'button',
                props: { class: 'btn-primary', onclick: () => navigate('/') },
                children: ['Go home'],
            },
        ],
    };
}

function ForbiddenView() {
    return {
        tag: 'div',
        props: { class: 'view-403' },
        children: [
            { tag: 'h1', props: {}, children: ['403'] },
            { tag: 'p', props: {}, children: ['Admin access required.'] },
            {
                tag: 'button',
                props: { class: 'btn-primary', onclick: () => navigate('/') },
                children: ['Go home'],
            },
        ],
    };
}

function LoadingView() {
    return {
        tag: 'div',
        props: { class: 'view-loading' },
        children: [
            { tag: 'div', props: { class: 'spinner' }, children: [] },
        ],
    };
}
