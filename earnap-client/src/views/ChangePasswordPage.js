import { d, navigate, showFlash, currentUser } from '../state.js';

export default async function ChangePasswordPage() {
    const container = document.querySelector('[data-view]');
    if (!container) return;

    const user = currentUser.get();

    container.innerHTML = '';
    container.removeAttribute('data-view');
    container.className = 'view view--settings';

    container.innerHTML = `
        <h1 class="page-title">Change Password</h1>

        <div class="card">
            <div class="card__header">
                <h3 class="card__title">Update Your Password</h3>
            </div>

            <p class="card__sub">Enter your current password and choose a new one.</p>

            <form class="auth-form" id="change-password-form">
                <label class="auth-form__label">
                    Current Password
                    <input type="password" name="current_password" placeholder="••••••" required autocomplete="current-password">
                </label>

                <label class="auth-form__label">
                    New Password
                    <input type="password" name="new_password" placeholder="••••••" minlength="6" required autocomplete="new-password">
                </label>

                <label class="auth-form__label">
                    Confirm New Password
                    <input type="password" name="new_password_confirmation" placeholder="••••••" minlength="6" required autocomplete="new-password">
                </label>

                <div style="display: flex; gap: 12px;">
                    <button type="submit" class="btn btn--primary" id="submit-btn">
                        Change Password
                    </button>
                    <a href="#/settings" class="btn btn--secondary">Cancel</a>
                </div>
            </form>
        </div>
    `;

    const form = document.getElementById('change-password-form');
    const submitBtn = document.getElementById('submit-btn');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const currentPassword = form.current_password.value;
        const newPassword = form.new_password.value;
        const newPasswordConfirmation = form.new_password_confirmation.value;

        // Validation
        if (!currentPassword || !newPassword) {
            showFlash('Please fill in all fields.', 'error');
            return;
        }

        if (newPassword !== newPasswordConfirmation) {
            showFlash('New passwords do not match.', 'error');
            return;
        }

        if (newPassword.length < 6) {
            showFlash('New password must be at least 6 characters.', 'error');
            return;
        }

        if (currentPassword === newPassword) {
            showFlash('New password must be different from current password.', 'error');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Changing...';

        try {
            await d.changePassword({ current_password: currentPassword, new_password: newPassword });
            showFlash('Password changed successfully!', 'success');
            navigate('/settings');
        } catch (err) {
            showFlash(err.message || 'Failed to change password.', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Change Password';
        }
    });
}
