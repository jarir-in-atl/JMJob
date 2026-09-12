import { login, navigate, showFlash, route } from '../state.js';

export function LoginPage() {
    const root = document.querySelector('[data-view]');
    if (!root) return;
    root.innerHTML = '';
    root.className = 'view view--auth';
    const ref = (window.JMJOB_CONFIG && window.JMJOB_CONFIG.referralCode) || '';

    root.innerHTML = `
        <div class="auth-card">
            <h1 class="auth-card__title">💰 JMJob</h1>
            <p class="auth-card__sub">Log in to your account</p>
            ${ref ? `<p class="auth-card__referral">Referred by <strong>${escapeHtml(ref)}</strong></p>` : ''}
            <form id="login-form" class="auth-form">
                <label class="auth-form__label">Email
                    <input name="email" type="email" required placeholder="you@example.com">
                </label>
                <label class="auth-form__label">Password
                    <input name="password" type="password" required minlength="6" placeholder="••••••••">
                </label>
                <button type="submit" class="btn btn--primary btn--xl">Log in</button>
            </form>
            <p class="auth-card__alt"><a href="#/forgot-password">Forgot your password?</a></p>
            <p class="auth-card__alt">No account? <a href="#/register">Sign up</a></p>
            <p class="auth-card__demo">
                Demo accounts:<br>
                <code>alice@example.com</code> / <code>password</code><br>
                <code>admin@example.com</code> / <code>password</code>
            </p>
        </div>
    `;
    const form = root.querySelector('#login-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const fd = new FormData(form);
            const btn = form.querySelector('button');
            btn.disabled = true; btn.textContent = 'Logging in…';
            try {
                const user = await login(fd.get('email'), fd.get('password'));
                showFlash('Welcome back!', 'success');
                if (user && user.is_admin) {
                    navigate('/admin');
                } else {
                    navigate('/');
                }
            } catch (err) {
                showFlash(err.message || 'Login failed', 'error');
                btn.disabled = false; btn.textContent = 'Log in';
            }
        });
    }
}

function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}
