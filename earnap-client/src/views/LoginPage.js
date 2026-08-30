import { login, navigate, showFlash } from '../state.js';
import { route } from '../state.js';

export function LoginPage() {
    return async () => {
        const root = document.querySelector('[data-view]');
        if (!root) return;
        root.innerHTML = '';
        root.className = 'view view--auth';
        const u = route.get().startsWith('/login') ? new URLSearchParams(window.location.hash.split('?')[1] || '') : new URLSearchParams();
        const ref = (window.EARNAPP_CONFIG && window.EARNAPP_CONFIG.referralCode) || u.get('ref') || '';

        root.innerHTML = `
            <div class="auth-card">
                <h1 class="auth-card__title">💰 EarnApp</h1>
                <p class="auth-card__sub">Log in to your account</p>
                ${ref ? `<p class="auth-card__referral">Referred by <strong>${ref}</strong></p>` : ''}
                <form id="login-form" class="auth-form">
                    <label class="auth-form__label">Email
                        <input name="email" type="email" required placeholder="you@example.com">
                    </label>
                    <label class="auth-form__label">Password
                        <input name="password" type="password" required minlength="6" placeholder="••••••••">
                    </label>
                    <button type="submit" class="btn btn--primary btn--xl">Log in</button>
                </form>
                <p class="auth-card__alt">No account? <a href="#/register">Sign up</a></p>
                <p class="auth-card__demo">
                    Demo accounts:<br>
                    <code>alice@example.com</code> / <code>password</code><br>
                    <code>admin@example.com</code> / <code>password</code>
                </p>
            </div>
        `;
        const form = root.querySelector('#login-form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const fd = new FormData(form);
            const btn = form.querySelector('button');
            btn.disabled = true; btn.textContent = 'Logging in…';
            try {
                await login(fd.get('email'), fd.get('password'));
                showFlash('Welcome back!', 'success');
                navigate('/');
            } catch (err) {
                showFlash(err.message || 'Login failed', 'error');
                btn.disabled = false; btn.textContent = 'Log in';
            }
        });
    };
}
