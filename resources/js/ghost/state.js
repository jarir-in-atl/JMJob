// Reactive state — signals + persistSignal.
// Persisted signals auto-sync to localStorage so auth survives reloads.

import { signal, computed, effect } from '@ghost-js/core';
import { persistSignal } from '@ghost-js/core';
import { api, setAuthToken, onUnauthorized } from './api.js';

const STORAGE_KEY_TOKEN = 'earnap_token';
const STORAGE_KEY_USER  = 'earnap_user';

// Persisted signals
export const authToken  = persistSignal(STORAGE_KEY_TOKEN, null);
export const currentUser = persistSignal(STORAGE_KEY_USER, null);

// Toast / flash messages
export const flash = signal(null);
let _flashTimer = null;
export function showFlash(message, type = 'info', duration = 3500) {
    flash.set({ message, type, id: Date.now() });
    if (_flashTimer) clearTimeout(_flashTimer);
    _flashTimer = setTimeout(() => flash.set(null), duration);
}

// Route signal — hash-based
export const route = signal(window.location.hash.replace(/^#/, '') || '/');

// Computed: is the user logged in?
export const isAuthenticated = computed(() => !!authToken.get() && !!currentUser.get());

// Wire token to the API layer on changes
effect(() => {
    const token = authToken.get();
    setAuthToken(token);
});

// 401 handler
onUnauthorized(() => {
    authToken.set(null);
    currentUser.set(null);
    route.set('/login');
    showFlash('Session expired. Please log in.', 'error');
});

export async function refreshUser() {
    if (!authToken.get()) return null;
    try {
        const res = await api.me();
        currentUser.set(res.data);
        return res.data;
    } catch (e) {
        return null;
    }
}

export async function login(email, password) {
    const res = await api.login({ email, password });
    authToken.set(res.data.token);
    currentUser.set(res.data.user);
    return res.data.user;
}

export async function register(payload) {
    const res = await api.register(payload);
    authToken.set(res.data.token);
    currentUser.set(res.data.user);
    return res.data.user;
}

export async function logout() {
    try { await api.logout(); } catch {}
    authToken.set(null);
    currentUser.set(null);
    route.set('/login');
}

export function navigate(to) {
    window.location.hash = to;
}
