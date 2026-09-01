// Route loader — listens to the `route` signal and renders the
// corresponding view into the main container.
//
// IMPORTANT: We use STATIC imports for the views, not dynamic
// `import('./views/X.js')` calls. The esbuild bundler tree-shakes
// dynamic imports that target files which are already part of the
// same bundle, which causes silent failures (the import resolves
// to undefined). Static imports guarantee the views are in the
// bundle.

import { effect } from '@ghost-js/core';
import { route, isAuthenticated, currentUser, navigate } from './state.js';

import { HomePage }     from './views/HomePage.js';
import { LoginPage }    from './views/LoginPage.js';
import { RegisterPage } from './views/RegisterPage.js';
import { ReferPage }    from './views/ReferPage.js';
import { WebTaskPage }  from './views/WebTaskPage.js';
import { EarnPage }     from './views/EarnPage.js';
import { TgTasksPage }  from './views/TgTasksPage.js';
import { WithdrawPage } from './views/WithdrawPage.js';
import { ProfilePage }  from './views/ProfilePage.js';
import { AdminPage }    from './views/AdminPage.js';

const VIEW_MAP = {
    '/':         HomePage,
    '/refer':    ReferPage,
    '/webtask':  WebTaskPage,
    '/earn':     EarnPage,
    '/tg-tasks': TgTasksPage,
    '/withdraw': WithdrawPage,
    '/profile':  ProfilePage,
    '/admin':    AdminPage,
    '/login':    LoginPage,
    '/register': RegisterPage,
};

export function startRouter() {
    // Initial render — call twice (once for the empty hash, once
    // after refreshUser() resolves) to handle the case where the
    // user lands on / while auth is being checked.
    renderCurrent();
    setTimeout(renderCurrent, 50);

    // Re-render on route change
    window.addEventListener('hashchange', renderCurrent);

    // Re-render when auth state changes (e.g. after login/logout).
    // Ghost.js signals don't have a .subscribe() method — the way
    // to react to changes is to wrap the read in an effect(), which
    // auto-tracks dependencies and re-runs the callback.
    effect(() => {
        // Reading the signal here registers a dependency.
        isAuthenticated.get();
        // Defer to break out of the current reactive batch.
        setTimeout(renderCurrent, 0);
    });
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

    // Create or reuse a fresh view container
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
    // Reset the view container
    main.innerHTML = `<div data-view="${path}" class="view-skeleton"><div class="spinner"></div></div>`;

    // Render the view
    const View = VIEW_MAP[path];
    try {
        // Existing pages expose an async render closure, while LoginPage is
        // synchronous because it only attaches the submit handler. Support
        // both forms while the route loader owns the lifecycle.
        const rendered = View();
        if (typeof rendered === 'function') {
            await rendered();
        } else if (rendered && typeof rendered.then === 'function') {
            await rendered;
        }
    } catch (e) {
        console.error('View render threw synchronously for', path, e);
        main.innerHTML = `<div class="card"><h2>Error</h2><p>${e.message}</p></div>`;
    }
}
