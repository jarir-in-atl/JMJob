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

import { HomePage }          from './views/HomePage.js';
import { LoginPage }         from './views/LoginPage.js';
import { RegisterPage }      from './views/RegisterPage.js';
import { ReferPage }         from './views/ReferPage.js';
import { WebTaskPage }       from './views/WebTaskPage.js';
import { EarnPage }          from './views/EarnPage.js';
import { TgTasksPage }       from './views/TgTasksPage.js';
import { WithdrawPage }      from './views/WithdrawPage.js';
import { ProfilePage }       from './views/ProfilePage.js';
import { AdminPage }         from './views/AdminPage.js';
import { AdminPaymentsPage } from './views/AdminPaymentsPage.js';
import { DepositPage }       from './views/DepositPage.js';
import LeaderboardPage       from './views/LeaderboardPage.js';
import AchievementsPage      from './views/AchievementsPage.js';
import SupportPage           from './views/SupportPage.js';
import SettingsPage          from './views/SettingsPage.js';
import { JobsAvailablePage } from './views/JobsAvailablePage.js';
import { WorkerBidsPage }    from './views/WorkerBidsPage.js';
import { WorkerActiveJobsPage } from './views/WorkerActiveJobsPage.js';
import { AdminCategoriesPage }  from './views/AdminCategoriesPage.js';
import { AdminSettingsPage }    from './views/AdminSettingsPage.js';
import { AdminJobsPage }        from './views/AdminJobsPage.js';
import { AdminTransactionsPage } from './views/AdminTransactionsPage.js';
import { AdminReportsPage }     from './views/AdminReportsPage.js';
import { PosterDashboardPage }  from './views/PosterDashboardPage.js';
import { PostJobPage }          from './views/PostJobPage.js';
import { PosterJobsPage }        from './views/PosterJobsPage.js';
import { PosterWalletPage }      from './views/PosterWalletPage.js';
import { NotificationsPage }     from './views/NotificationsPage.js';

const VIEW_MAP = {
    '/':                HomePage,
    '/refer':           ReferPage,
    '/webtask':         WebTaskPage,
    '/tasks':           WebTaskPage,    // alias used by sidebar
    '/earn':            EarnPage,
    '/tg-tasks':        TgTasksPage,
    '/withdraw':        WithdrawPage,
    '/profile':         ProfilePage,
    '/wallet':          ProfilePage,    // wallet = profile for now
    '/admin':           AdminPage,
    '/admin/payments':  AdminPaymentsPage,
    '/admin/categories': AdminCategoriesPage,
    '/admin/settings':   AdminSettingsPage,
    '/admin/jobs':       AdminJobsPage,
    '/admin/transactions': AdminTransactionsPage,
    '/admin/reports':      AdminReportsPage,
    '/deposit':         DepositPage,
    '/leaderboard':     LeaderboardPage,
    '/achievements':    AchievementsPage,
    '/support':         SupportPage,
    '/settings':        SettingsPage,
    '/jobs/available':  JobsAvailablePage,
    '/worker/bids':     WorkerBidsPage,
    '/worker/active-jobs': WorkerActiveJobsPage,
    '/poster':          PosterDashboardPage,
    '/poster/post-job': PostJobPage,
    '/poster/jobs':     PosterJobsPage,
    '/poster/wallet':   PosterWalletPage,
    '/notifications':   NotificationsPage,
    '/login':           LoginPage,
    '/register':        RegisterPage,
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
    if (!VIEW_MAP[path]) {
        // Dynamic routes: /jobs/{id}
        const jobMatch = path.match(/^\/jobs\/(\d+)$/);
        if (jobMatch) {
            const mod = await import('./views/JobDetailPage.js');
            await invokeView(() => mod.JobDetailPage(jobMatch[1]), path);
            return;
        }
        const posterJobMatch = path.match(/^\/poster\/jobs\/(\d+)$/);
        if (posterJobMatch) {
            if (!isAuthenticated.get()) {
                navigate('/login');
                return;
            }
            const mod = await import('./views/PosterJobDetailPage.js');
            await invokeView(() => mod.PosterJobDetailPage(posterJobMatch[1]), path);
            return;
        }
        path = '/';
    }

    // Auth gate
    const authed = isAuthenticated.get();
    const u = currentUser.get();
    const PUBLIC = ['/login', '/register'];
    if (PUBLIC.includes(path) && authed) {
        navigate('/');
        return;
    }
    if (!PUBLIC.includes(path) && !authed) {
        navigate('/login');
        return;
    }
    // Admin gate
    if (path.startsWith('/admin') && (!u || !u.is_admin)) {
        mainForbidden();
        return;
    }

    const View = VIEW_MAP[path];
    await invokeView(View, path);
}

/**
 * Create a page's render closure after the view container exists, then write
 * the result into the .app-main container. Shared by both the static
 * route map and the dynamic /jobs/{id} matcher above.
 */
async function invokeView(viewFactory, path) {
    const app = document.getElementById('app');
    let main = app.querySelector('.app-main');
    if (!main) {
        main = document.createElement('div');
        main.className = 'app-main';
        const bn = app.querySelector('.bottomnav');
        if (bn) app.insertBefore(main, bn);
        else app.appendChild(main);
    }
    main.innerHTML = `<div data-view="${path}" class="view-skeleton"><div class="spinner"></div></div>`;

    try {
        const rendered = typeof viewFactory === 'function' ? viewFactory() : viewFactory;
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

function mainForbidden() {
    const app = document.getElementById('app');
    let main = app.querySelector('.app-main');
    if (!main) {
        main = document.createElement('div');
        main.className = 'app-main';
        app.appendChild(main);
    }
    main.innerHTML = `
        <div class="card" style="max-width: 480px; margin: 40px auto; text-align: center;">
            <h2>403</h2>
            <p>Admin access required.</p>
            <a class="btn btn--primary" href="#/">Go home</a>
        </div>
    `;
}
