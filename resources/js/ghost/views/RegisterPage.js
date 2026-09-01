import { register, navigate, showFlash, currentUser } from '../state.js';
import { refreshUser } from '../state.js';

export function RegisterPage() {
    return async () => {
        const root = document.querySelector('[data-view]');
        if (!root) return;
        root.innerHTML = '';
        root.className = 'view view--auth';

        const ref = (window.EARNAPP_CONFIG && window.EARNAPP_CONFIG.referralCode) || '';

        root.innerHTML = `
            <div class="auth-card">
                <h1 class="auth-card__title">Create your EarnApp account</h1>
                <p class="auth-card__sub">Start earning in minutes</p>
                ${ref ? `<p class="auth-card__referral">🎁 You were referred by <strong>${ref}</strong></p>` : ''}
                <form id="register-form" class="auth-form">
                    <label class="auth-form__label">Full name
                        <input name="name" type="text" required minlength="2" placeholder="Jane Doe">
                    </label>
                    <label class="auth-form__label">Email
                        <input name="email" type="email" required placeholder="you@example.com">
                    </label>
                    <label class="auth-form__label">Password
                        <input name="password" type="password" required minlength="6" placeholder="At least 6 characters">
                    </label>
                    ${ref ? `<input type="hidden" name="referral_code" value="${ref}">` : ''}
                    <button type="submit" class="btn btn--primary btn--xl">Create account</button>
                </form>
                <p class="auth-card__alt">Already have an account? <a href="#/login">Log in</a></p>
            </div>
        `;
        const form = root.querySelector('#register-form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const fd = new FormData(form);
            const btn = form.querySelector('button');
            btn.disabled = true; btn.textContent = 'Creating…';
            try {
                const payload = {
                    name: fd.get('name'),
                    email: fd.get('email'),
                    password: fd.get('password'),
                };
                if (ref) payload.referral_code = ref;
                await register(payload);
                showFlash('Account created — welcome!', 'success');
                navigate('/');
            } catch (err) {
                const errors = err.payload && err.payload.errors;
                if (errors) {
                    const first = Object.values(errors)[0];
                    showFlash(Array.isArray(first) ? first[0] : first, 'error');
                } else {
                    showFlash(err.message || 'Registration failed', 'error');
                }
                btn.disabled = false; btn.textContent = 'Create account';
            }
        });
    };
}
