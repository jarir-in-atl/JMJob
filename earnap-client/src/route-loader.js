// Route loader — listens to the `route` signal and renders the
// corresponding view into the main container.

import { route, isAuthenticated, currentUser, navigate } from './state.js';
import { effect } from '@ghost-js/core';

const VIEW_MAP = {
    '/':         () => import('./views/HomePage.js'),
    '/refer':    () => import('./views/ReferPage.js'),
    '/webtask':  () => import('./views/WebTaskPage.js'),
    '/earn':     () => import('./views/EarnPage.js'),
    '/tg-tasks': () => import('./views/TgTasksPage.js'),
    '/withdraw': () => import('./views/WithdrawPage.js'),
    '/profile':  () => import('./views/ProfilePage.js'),
    '/admin':    () => import('./views/AdminPage.js'),
    '/login':    () => import('./views/LoginPage.js'),
    '/register': () => import('./views/RegisterPage.js'),
};

export function startRouter() {
    // Initial render
    renderCurrent();

    // Re-render on route change
    window.addEventListener('hashchange', renderCurrent);
}

async function renderCurrent() {
    let path = window.location.hash.replace(/^#/, '') || '/';
    if (!VIEW_MAP[path]) path = '/';

    // Auth gate
    const authed = isAuthenticated.get();
    const PUBLIC = ['/login', '/register'];
    if (PUBLIC.includes(path) && authed) {
        navigate('/');
        return;
    }
    if (!PUBLIC.includes(path) && !authed) {
        navigate('/login');
        return;
    }

    // Create a fresh view container
    const app = document.getElementById('app');
    let main = app.querySelector('.app-main');
    if (!main) {
        main = document.createElement('div');
        main.className = 'app-main';
        // Insert before any bottom nav
        const bn = app.querySelector('.bottomnav');
        if (bn) app.insertBefore(main, bn);
        else app.appendChild(main);
    }
    main.innerHTML = `<div data-view="${path}" class="view-skeleton"><div class="spinner"></div></div>`;

    try {
        const mod = await VIEW_MAP[path]();
        // Each view exports a default function that returns a Promise (renders into the [data-view] container)
        const viewFn = mod.default || (mod[Object.keys(mod)[0]]);
        if (typeof viewFn === 'function') {
            const result = viewFn();
            if (result && typeof result.then === 'function') {
                await result;
            }
        }
    } catch (e) {
        console.error('Route render failed', e);
        main.innerHTML = `<div class="card"><h2>Error</h2><p>${e.message}</p></div>`;
    }
}
