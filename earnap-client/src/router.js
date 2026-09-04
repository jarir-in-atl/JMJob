// Hash-based router. Watches `window.location.hash` and the `route`
// signal in state.js. Routes are matched left-to-right, most specific
// first. Unknown routes fall through to the catch-all.

import { effect } from '@ghost-js/core';
import { route, isAuthenticated, navigate } from './state.js';

const ROUTES = [
    { path: '/',               requireAuth: true,  render: () => import('./views/HomePage.js') },
    { path: '/tasks',          requireAuth: true,  render: () => import('./views/WebTaskPage.js') },
    { path: '/webtask',        requireAuth: true,  render: () => import('./views/WebTaskPage.js') }, // Legacy alias
    { path: '/earn',           requireAuth: true,  render: () => import('./views/EarnPage.js') },
    { path: '/refer',          requireAuth: true,  render: () => import('./views/ReferPage.js') },
    { path: '/withdraw',       requireAuth: true,  render: () => import('./views/WithdrawPage.js') },
    { path: '/deposit',        requireAuth: true,  render: () => import('./views/DepositPage.js') },
    { path: '/wallet',         requireAuth: true,  render: () => import('./views/ProfilePage.js') }, // Wallet = Profile for now
    { path: '/leaderboard',    requireAuth: true,  render: () => import('./views/LeaderboardPage.js') },
    { path: '/achievements',   requireAuth: true,  render: () => import('./views/AchievementsPage.js') },
    { path: '/support',        requireAuth: true,  render: () => import('./views/SupportPage.js') },
    { path: '/settings',       requireAuth: true,  render: () => import('./views/SettingsPage.js') },
    { path: '/notifications',  requireAuth: true,  render: () => import('./views/NotificationsPage.js') },
    { path: '/profile',        requireAuth: true,  render: () => import('./views/ProfilePage.js') },
    { path: '/tg-tasks',       requireAuth: true,  render: () => import('./views/TgTasksPage.js') }, // Unused but kept
    { path: '/poster',         requireAuth: true,  render: () => import('./views/PosterDashboardPage.js') },
    { path: '/poster/post-job', requireAuth: true, render: () => import('./views/PostJobPage.js') },
    { path: '/poster/jobs', requireAuth: true, render: () => import('./views/PosterJobsPage.js') },
    { path: '/poster/wallet', requireAuth: true, render: () => import('./views/PosterWalletPage.js') },
    { path: '/admin',          requireAuth: true,  requireAdmin: true, render: () => import('./views/AdminPage.js') },
    { path: '/admin/payments', requireAuth: true,  requireAdmin: true, render: () => import('./views/AdminPaymentsPage.js') },
    { path: '/admin/jobs',      requireAuth: true,  requireAdmin: true, render: () => import('./views/AdminJobsPage.js') },
    { path: '/admin/transactions', requireAuth: true, requireAdmin: true, render: () => import('./views/AdminTransactionsPage.js') },
    { path: '/admin/reports', requireAuth: true, requireAdmin: true, render: () => import('./views/AdminReportsPage.js') },
    { path: '/login',          requireAuth: false, render: () => import('./views/LoginPage.js') },
    { path: '/register',       requireAuth: false, render: () => import('./views/RegisterPage.js') },
];

// Reactive route resolver
export const currentRoute = effect(() => {
    const path = route.get();
    return ROUTES.find(r => r.path === path) || ROUTES[0];
});

// Lazy-load helper that returns a Promise<module>
export async function loadRouteModule(routeEntry) {
    const mod = await routeEntry.render();
    return mod;
}

// Watch window hashchange and update the signal
window.addEventListener('hashchange', () => {
    const h = window.location.hash.replace(/^#/, '') || '/';
    route.set(h);
});

export { ROUTES, navigate };
