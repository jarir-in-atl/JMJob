import {
    requestRegistrationOtp,
    verifyRegistrationOtp,
    navigate,
    showFlash,
} from '../state.js';

export function RegisterPage() {
    return async () => {
        const root = document.querySelector('[data-view]');
        if (!root) return;

        let step = 'details';
        let registration = null;
        const ref = (window.JMJOB_CONFIG && window.JMJOB_CONFIG.referralCode) || '';

        const render = () => {
            root.innerHTML = '';
            root.className = 'view view--auth';

            if (step === 'otp') {
                root.innerHTML = [
                    '<div class="auth-card">',
                    '<h1 class="auth-card__title">Check your email</h1>',
                    '<p class="auth-card__sub">Enter the 6-digit code sent to <strong>',
                    escapeHtml(registration.email),
                    '</strong>.</p>',
                    '<form id="register-otp-form" class="auth-form">',
                    '<label class="auth-form__label">Verification code',
                    '<input name="otp" type="text" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6}" minlength="6" maxlength="6" required placeholder="123456">',
                    '</label>',
                    '<button type="submit" class="btn btn--primary btn--xl">Verify and create account</button>',
                    '</form>',
                    '<p class="auth-card__alt"><button type="button" class="link-button" id="register-back">Change details</button></p>',
                    '</div>',
                ].join('');

                root.querySelector('#register-back').addEventListener('click', () => {
                    step = 'details';
                    render();
                });
                root.querySelector('#register-otp-form').addEventListener('submit', verify);
                return;
            }

            const referralMarkup = ref
                ? '<p class="auth-card__referral">🎁 You were referred by <strong>' + escapeHtml(ref) + '</strong></p>'
                : '';
            root.innerHTML = [
                '<div class="auth-card">',
                '<h1 class="auth-card__title">Create your JMJob account</h1>',
                '<p class="auth-card__sub">Start earning in minutes</p>',
                referralMarkup,
                '<form id="register-form" class="auth-form">',
                '<label class="auth-form__label">Full name',
                '<input name="name" type="text" required minlength="2" maxlength="100" placeholder="Jane Doe">',
                '</label>',
                '<label class="auth-form__label">Email',
                '<input name="email" type="email" required placeholder="you@example.com">',
                '</label>',
                '<label class="auth-form__label">Password',
                '<input name="password" type="password" required minlength="6" placeholder="At least 6 characters">',
                '</label>',
                '<label class="auth-form__label">Confirm password',
                '<input name="password_confirmation" type="password" required minlength="6" placeholder="Repeat your password">',
                '</label>',
                ref ? '<input type="hidden" name="referral_code" value="' + escapeHtml(ref) + '">' : '',
                '<button type="submit" class="btn btn--primary btn--xl">Send verification code</button>',
                '</form>',
                '<p class="auth-card__alt">Already have an account? <a href="#/login">Log in</a></p>',
                '</div>',
            ].join('');

            root.querySelector('#register-form').addEventListener('submit', requestOtp);
        };

        const requestOtp = async (event) => {
            event.preventDefault();
            const form = event.currentTarget;
            const fd = new FormData(form);
            const btn = form.querySelector('button[type="submit"]');
            btn.disabled = true;
            btn.textContent = 'Sending code…';

            registration = {
                name: String(fd.get('name') || '').trim(),
                email: String(fd.get('email') || '').trim().toLowerCase(),
                password: String(fd.get('password') || ''),
                password_confirmation: String(fd.get('password_confirmation') || ''),
                referral_code: String(fd.get('referral_code') || ''),
            };

            try {
                await requestRegistrationOtp(registration);
                step = 'otp';
                showFlash('Verification code sent. It expires in 15 minutes.', 'success');
                render();
            } catch (error) {
                showFlash(firstError(error) || 'Could not send the verification code.', 'error');
                btn.disabled = false;
                btn.textContent = 'Send verification code';
            }
        };

        const verify = async (event) => {
            event.preventDefault();
            const form = event.currentTarget;
            const btn = form.querySelector('button[type="submit"]');
            btn.disabled = true;
            btn.textContent = 'Verifying…';

            try {
                await verifyRegistrationOtp({
                    email: registration.email,
                    otp: String(new FormData(form).get('otp') || '').trim(),
                });
                showFlash('Account created — welcome!', 'success');
                navigate('/');
            } catch (error) {
                showFlash(firstError(error) || 'Invalid or expired verification code.', 'error');
                btn.disabled = false;
                btn.textContent = 'Verify and create account';
            }
        };

        render();
    };
}

function firstError(error) {
    const errors = error && error.payload && error.payload.errors;
    if (!errors) return error && error.message;
    const first = Object.values(errors)[0];
    return Array.isArray(first) ? first[0] : first;
}

function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, character => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
    }[character]));
}
