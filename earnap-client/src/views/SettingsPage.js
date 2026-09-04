import { currentUser, logout, showFlash } from '../state.js';
import { theme, setTheme, colorTheme, setColorTheme, getAvailableColorThemes } from '../theme.js';

const COLOR_THEME_LABELS = {
    default: 'Default (Purple)',
    emerald: 'Emerald (Green)',
    amber: 'Amber (Orange)',
    rose: 'Rose (Pink)',
};

const COLOR_THEME_SWATCHES = {
    default: 'linear-gradient(135deg, #7c3aed, #a855f7)',
    emerald: 'linear-gradient(135deg, #059669, #10b981)',
    amber: 'linear-gradient(135deg, #d97706, #f59e0b)',
    rose: 'linear-gradient(135deg, #e11d48, #f43f5e)',
};

export default async function SettingsPage() {
    const container = document.querySelector('[data-view]');
    if (!container) return;

    const user = currentUser.get();

    container.innerHTML = '';
    container.removeAttribute('data-view');
    container.className = 'view view--settings';

    const currentMode = theme.get();
    const currentColor = colorTheme.get();
    const colorOptions = getAvailableColorThemes();

    container.innerHTML = `
        <h1 class="page-title">Settings</h1>

        <div class="card">
            <div class="card__header">
                <h3 class="card__title">Account</h3>
            </div>

            <div class="settings-section">
                <div class="settings-item">
                    <div class="settings-info">
                        <div class="settings-label">Name</div>
                        <div class="settings-value">${user ? user.name : 'Loading…'}</div>
                    </div>
                    <button class="btn btn--secondary btn--sm">Edit</button>
                </div>
                <div class="settings-item">
                    <div class="settings-info">
                        <div class="settings-label">Email</div>
                        <div class="settings-value">${user ? user.email : 'Loading…'}</div>
                    </div>
                    <button class="btn btn--secondary btn--sm">Edit</button>
                </div>
                <div class="settings-item">
                    <div class="settings-info">
                        <div class="settings-label">Username</div>
                        <div class="settings-value">@${user ? user.username : 'user'}</div>
                    </div>
                    <button class="btn btn--secondary btn--sm">Edit</button>
                </div>
            </div>
        </div>

        <div class="card">
            <div class="card__header">
                <h3 class="card__title">Appearance</h3>
                <p class="card__sub">Customize how JMJob looks for you. Only your device is affected.</p>
            </div>

            <div class="settings-section">
                <div class="settings-item settings-item--stack">
                    <div class="settings-info">
                        <div class="settings-label">Theme Mode</div>
                        <div class="settings-value">Light, dark, or follow system</div>
                    </div>
                    <div class="theme-segmented" id="theme-mode-group" role="radiogroup" aria-label="Theme mode">
                        <button class="theme-segmented__btn ${currentMode === 'light' ? 'is-active' : ''}" data-mode="light" role="radio" aria-checked="${currentMode === 'light'}">
                            <i class="bi bi-sun"></i> Light
                        </button>
                        <button class="theme-segmented__btn ${currentMode === 'dark' ? 'is-active' : ''}" data-mode="dark" role="radio" aria-checked="${currentMode === 'dark'}">
                            <i class="bi bi-moon-stars"></i> Dark
                        </button>
                        <button class="theme-segmented__btn ${currentMode === 'system' ? 'is-active' : ''}" data-mode="system" role="radio" aria-checked="${currentMode === 'system'}">
                            <i class="bi bi-circle-half"></i> System
                        </button>
                    </div>
                </div>

                <div class="settings-item settings-item--stack">
                    <div class="settings-info">
                        <div class="settings-label">Accent Color</div>
                        <div class="settings-value">${COLOR_THEME_LABELS[currentColor] || 'Default (Purple)'}</div>
                    </div>
                    <div class="theme-swatches" id="color-theme-group" role="radiogroup" aria-label="Accent color">
                        ${colorOptions.map(c => `
                            <button class="theme-swatch ${c === currentColor ? 'is-active' : ''}" data-color="${c}" role="radio" aria-checked="${c === currentColor}" title="${COLOR_THEME_LABELS[c] || c}">
                                <span class="theme-swatch__chip" style="background: ${COLOR_THEME_SWATCHES[c]};"></span>
                                <span class="theme-swatch__label">${(COLOR_THEME_LABELS[c] || c).split(' ')[0]}</span>
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>

        <div class="card">
            <div class="card__header">
                <h3 class="card__title">Security</h3>
            </div>

            <div class="settings-section">
                <div class="settings-item">
                    <div class="settings-info">
                        <div class="settings-label">Password</div>
                        <div class="settings-value">Last changed: Never</div>
                    </div>
                    <button class="btn btn--secondary btn--sm">Change</button>
                </div>
                <div class="settings-item">
                    <div class="settings-info">
                        <div class="settings-label">Two-Factor Authentication</div>
                        <div class="settings-value">Not enabled</div>
                    </div>
                    <button class="btn btn--secondary btn--sm">Enable</button>
                </div>
            </div>
        </div>

        <div class="card">
            <div class="card__header">
                <h3 class="card__title">Notifications</h3>
            </div>

            <div class="settings-section">
                <div class="settings-item">
                    <div class="settings-info">
                        <div class="settings-label">Email Notifications</div>
                        <div class="settings-value">Receive updates about your account</div>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" checked>
                        <span class="toggle-slider"></span>
                    </label>
                </div>
                <div class="settings-item">
                    <div class="settings-info">
                        <div class="settings-label">Withdrawal Alerts</div>
                        <div class="settings-value">Get notified about withdrawal status</div>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" checked>
                        <span class="toggle-slider"></span>
                    </label>
                </div>
            </div>
        </div>

        <div class="card">
            <div class="card__header">
                <h3 class="card__title">Danger Zone</h3>
            </div>

            <div class="settings-section">
                <div class="settings-item settings-item--danger">
                    <div class="settings-info">
                        <div class="settings-label">Delete Account</div>
                        <div class="settings-value">Permanently delete your account and data</div>
                    </div>
                    <button class="btn btn--danger btn--sm">Delete</button>
                </div>
                <div class="settings-item">
                    <div class="settings-info">
                        <div class="settings-label">Log Out</div>
                        <div class="settings-value">Sign out of your account</div>
                    </div>
                    <button class="btn btn--secondary btn--sm" id="logout-btn">Log Out</button>
                </div>
            </div>
        </div>
    `;

    // Theme mode buttons
    const modeGroup = document.getElementById('theme-mode-group');
    if (modeGroup) {
        modeGroup.querySelectorAll('button[data-mode]').forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.getAttribute('data-mode');
                setTheme(mode);
                showFlash(`Theme mode set to ${mode}.`, 'info');
            });
        });
    }

    // Color theme swatches
    const colorGroup = document.getElementById('color-theme-group');
    if (colorGroup) {
        colorGroup.querySelectorAll('button[data-color]').forEach(btn => {
            btn.addEventListener('click', () => {
                const color = btn.getAttribute('data-color');
                setColorTheme(color);
                showFlash(`Accent color set to ${COLOR_THEME_LABELS[color] || color}.`, 'info');
            });
        });
    }

    // Add logout functionality
    document.getElementById('logout-btn')?.addEventListener('click', async () => {
        await logout();
        showFlash('Logged out.', 'info');
    });
}
