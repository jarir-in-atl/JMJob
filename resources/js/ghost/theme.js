// Theme manager — handles dark/light mode switching
import { ce } from '@ghost-js/core';

// Theme signal: 'dark' | 'light' | 'system'
const STORAGE_KEY = 'jmjob_theme';

function getInitialTheme() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') return stored;
    return 'system'; // follow OS preference
}

function getEffectiveTheme(theme) {
    if (theme === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return theme;
}

// Create reactive signal for theme
export const theme = ce(getInitialTheme());
export const effectiveTheme = ce(getEffectiveTheme(theme.get()));

// Apply theme to document
function applyTheme(t) {
    const effective = getEffectiveTheme(t);
    document.documentElement.setAttribute('data-theme', effective);
    effectiveTheme.set(effective);
}

// Initialize
applyTheme(theme.get());

// React to changes
theme.on((t) => {
    applyTheme(t);
    localStorage.setItem(STORAGE_KEY, t);
});

// Listen for OS theme changes when in system mode
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (theme.get() === 'system') {
        applyTheme('system');
    }
});

// Toggle between dark and light (or cycle through modes)
export function toggleTheme() {
    const current = theme.get();
    if (current === 'dark') {
        theme.set('light');
    } else {
        theme.set('dark');
    }
}

export function setTheme(t) {
    theme.set(t);
}
