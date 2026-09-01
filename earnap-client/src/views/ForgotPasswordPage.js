import { d, navigate, showFlash } from '../state.js';

export default async function ForgotPasswordPage() {
    const container = document.querySelector('[data-view]');
    if (!container) return;

    container.innerHTML = '';
    container.removeAttribute('data-view');
    container.className = 'view view--auth';

    container.innerHTML = `
        <div class="auth-card">
            <h2 class="auth-card__title">Forgot Password</h2>
            <p class="auth-card__sub">Enter your email address and we'll send you a code to reset your password.</p>

            <form class="auth-form" id="forgot-form">
                <label class="auth-form__label">
                    Email Address
                    <input type="email" name="email" placeholder="you@example.com" required autocomplete="email">
                </label>

                <button type="submit" class="btn btn--primary btn--xl" id="submit-btn">
                    Send Reset Code
                </button>
            </form>

            <p class="auth-card__alt">
                Remember your password? <a href="#/login">Log in</a>
            </p>
        </div>
    `;

    const form = document.getElementById('forgot-form');
    const submitBtn = document.getElementById('submit-btn');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = form.email.value.trim();
        if (!email) {
            showFlash('Please enter your email address.', 'error');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';

        try {
            await d.forgotPassword({ email });
            showFlash('If an account exists with this email, you will receive a reset code.', 'success');
            // Navigate to reset password page with email
            navigate(`/reset-password?email=${encodeURIComponent(email)}`);
        } catch (err) {
            showFlash(err.message || 'Failed to send reset code.', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Reset Code';
        }
    });
}
