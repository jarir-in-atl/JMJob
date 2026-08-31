// Application entry — boot the shell, mount it, and start the router.

import { mount } from '@ghost-js/core';

import { AppShell } from './components/AppShell.js';
import { startRouter } from './route-loader.js';
import { authToken, refreshUser } from './state.js';

// Render the shell
const app = document.getElementById('app') || (() => {
    const d = document.createElement('div');
    d.id = 'app';
    document.body.appendChild(d);
    return d;
})();
app.innerHTML = '';
mount(AppShell(), app);

// Try to refresh the user from a persisted token
if (authToken.get()) {
    refreshUser();
}

// Start the route-driven view loader
startRouter();
