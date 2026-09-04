// Theme manager — handles dark/light/system mode AND color theme switching
import { signal, effect } from '@ghost-js/core';

// ----- Mode theme (dark/light/system) -----
const MODE_STORAGE_KEY = 'jmjob_theme';

function getInitialMode() {
    const stored = localStorage.getItem(MODE_STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') return stored;
    return 'system';
}

function getEffectiveMode(t) {
    if (t === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return t;
}

// Reactive signal for mode
export const theme = signal(getInitialMode());

// Apply mode to document
function applyMode(t) {
    const effective = getEffectiveMode(t);
    document.documentElement.setAttribute('data-theme', effective);
}

// Initialize
applyMode(theme.get());

// React to changes
effect(() => {
    const t = theme.get();
    applyMode(t);
    localStorage.setItem(MODE_STORAGE_KEY, t);
});

// Listen for OS theme changes when in system mode
if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (theme.get() === 'system') {
            applyMode('system');
        }
    });
}

// Toggle between dark and light (skipping system)
export function toggleTheme() {
    const current = theme.get();
    theme.set(current === 'dark' ? 'light' : 'dark');
}

export function setTheme(t) {
    theme.set(t);
}

// ----- Color theme (default/emerald/amber/rose) -----
const COLOR_STORAGE_KEY = 'jmjob_color_theme';

const VALID_COLOR_THEMES = ['default', 'emerald', 'amber', 'rose'];

function getInitialColor() {
    const stored = localStorage.getItem(COLOR_STORAGE_KEY);
    if (stored && VALID_COLOR_THEMES.includes(stored)) return stored;
    return 'default';
}

// Reactive signal for color theme
export const colorTheme = signal(getInitialColor());

// Apply color theme to document
function applyColorTheme(c) {
    if (c === 'default') {
        // Remove attribute to fall back to :root defaults
        document.documentElement.removeAttribute('data-color-theme');
    } else {
        document.documentElement.setAttribute('data-color-theme', c);
    }
}

// Initialize
applyColorTheme(colorTheme.get());

// React to changes
effect(() => {
    const c = colorTheme.get();
    applyColorTheme(c);
    localStorage.setItem(COLOR_STORAGE_KEY, c);
});

export function setColorTheme(c) {
    if (VALID_COLOR_THEMES.includes(c)) {
        colorTheme.set(c);
    }
}

export function getAvailableColorThemes() {
    return VALID_COLOR_THEMES;
}
