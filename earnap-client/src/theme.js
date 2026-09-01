// Theme manager — handles dark/light mode switching
import { signal, effect } from '@ghost-js/core';

// Theme signal: 'dark' | 'light' | 'system'
const STORAGE_KEY = 'jmjob_theme';

function getInitialTheme() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') return stored;
    return 'system'; // follow OS preference
}

function getEffectiveTheme(t) {
    if (t === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return t;
}

// Create reactive signal for theme
export const theme = signal(getInitialTheme());

// Apply theme to document
function applyTheme(t) {
    const effective = getEffectiveTheme(t);
    document.documentElement.setAttribute('data-theme', effective);
}

// Initialize
applyTheme(theme.get());

// React to changes
effect(() => {
    const t = theme.get();
    applyTheme(t);
    localStorage.setItem(STORAGE_KEY, t);
});

// Listen for OS theme changes when in system mode
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (theme.get() === 'system') {
        applyTheme('system');
    }
});

// Toggle between dark and light
export function toggleTheme() {
    const current = theme.get();
    theme.set(current === 'dark' ? 'light' : 'dark');
}

export function setTheme(t) {
    theme.set(t);
}
