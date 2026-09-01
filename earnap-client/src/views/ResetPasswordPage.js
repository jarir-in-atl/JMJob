import { d, navigate, showFlash } from '../state.js';

export default async function ResetPasswordPage() {
    const container = document.querySelector('[data-view]');
    if (!container) return;

    // Get email from URL params
    const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
    const email = urlParams.get('email') || '';

    container.innerHTML = '';
    container.removeAttribute('data-view');
    container.className = 'view view--auth';

    container.innerHTML = `
        <div class="auth-card">
            <h2 class="auth-card__title">Reset Password</h2>
            <p class="auth-card__sub">Enter the 6-digit code sent to your email and your new password.</p>

            <form class="auth-form" id="reset-form">
                <label class="auth-form__label">
                    Email Address
                    <input type="email" name="email" value="${email}" placeholder="you@example.com" required autocomplete="email">
                </label>

                <label class="auth-form__label">
                    Reset Code
                    <input type="text" name="otp" placeholder="000000" maxlength="6" pattern="[0-9]{6}" required autocomplete="one-time-code">
                </label>

                <label class="auth-form__label">
                    New Password
                    <input type="password" name="password" placeholder="••••••" minlength="6" required autocomplete="new-password">
                </label>

                <label class="auth-form__label">
                    Confirm Password
                    <input type="password" name="password_confirmation" placeholder="••••••" minlength="6" required autocomplete="new-password">
                </label>

                <button type="submit" class="btn btn--primary btn--xl" id="submit-btn">
                    Reset Password
                </button>
            </form>

            <p class="auth-card__alt">
                <a href="#/forgot-password">Didn't receive a code?</a> | <a href="#/login">Back to login</a>
            </p>
        </div>
    `;

    const form = document.getElementById('reset-form');
    const submitBtn = document.getElementById('submit-btn');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = form.email.value.trim();
        const otp = form.otp.value.trim();
        const password = form.password.value;
        const passwordConfirmation = form.password_confirmation.value;

        // Validation
        if (!email || !otp || !password) {
            showFlash('Please fill in all fields.', 'error');
            return;
        }

        if (otp.length !== 6) {
            showFlash('Please enter a valid 6-digit code.', 'error');
            return;
        }

        if (password !== passwordConfirmation) {
            showFlash('Passwords do not match.', 'error');
            return;
        }

        if (password.length < 6) {
            showFlash('Password must be at least 6 characters.', 'error');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Resetting...';

        try {
            await d.resetPassword({ email, otp, password });
            showFlash('Password reset successfully! You can now log in.', 'success');
            navigate('/login');
        } catch (err) {
            showFlash(err.message || 'Failed to reset password.', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Reset Password';
        }
    });
}
