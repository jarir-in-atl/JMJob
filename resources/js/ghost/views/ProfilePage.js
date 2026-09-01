import { api } from '../api.js';
import { currentUser, showFlash, refreshUser, navigate } from '../state.js';

export function ProfilePage() {
    return async () => {
        const root = document.querySelector('[data-view]');
        if (!root) return;
        root.innerHTML = '';
        root.className = 'view view--profile';
        const u = currentUser.get();

        root.innerHTML = `
            <div class="card card--profile">
                <img class="avatar avatar--xl" src="${u ? u.avatar_url : ''}" alt="">
                <h2 class="card__title">${u ? escapeHtml(u.name) : ''}</h2>
                <p class="card__sub">@${u ? escapeHtml(u.username) : ''}</p>
                <div class="profile-stats">
                    <div><span class="muted">Main Balance</span><strong>$${u ? parseFloat(u.balance).toFixed(2) : '0.00'}</strong></div>
                    <div><span class="muted">Lifetime Earn</span><strong>$${u ? parseFloat(u.lifetime_earned).toFixed(2) : '0.00'}</strong></div>
                    <div><span class="muted">Earn Today</span><strong>$${u ? parseFloat(u.today_earned).toFixed(2) : '0.00'}</strong></div>
                    <div><span class="muted">Ads Viewed</span><strong>${u ? u.today_ads : 0}</strong></div>
                </div>
                <div class="profile-links">
                    <a class="btn btn--ghost" href="#/refer">Referral Network (${u ? u.referral_count : 0})</a>
                    <a class="btn btn--ghost" href="#/withdraw">Withdraw Funds</a>
                    <a class="btn btn--ghost" href="#/admin">Admin</a>
                    <a class="btn btn--ghost" href="https://t.me/EasyEarningBot_admin" target="_blank" rel="noopener">Customer Support</a>
                </div>
            </div>

            <h3 class="section-title">Recent Ad History</h3>
            <div class="ad-history" id="ad-history">Loading…</div>
        `;

        const history = root.querySelector('#ad-history');
        try {
            const res = await api.adHistory();
            const items = res.data || [];
            if (items.length === 0) {
                history.innerHTML = '<p class="muted">No ad views yet.</p>';
            } else {
                history.innerHTML = '<div class="ad-history__list"></div>';
                const list = history.querySelector('.ad-history__list');
                items.forEach(a => {
                    const row = document.createElement('div');
                    row.className = 'ad-history__row';
                    row.innerHTML = `
                        <span class="ad-history__provider">${escapeHtml(a.provider)}</span>
                        <span class="ad-history__reward">+$${parseFloat(a.reward).toFixed(4)}</span>
                        <span class="ad-history__date">${a.completed_at || a.started_at}</span>
                    `;
                    list.appendChild(row);
                });
            }
        } catch (e) {
            history.innerHTML = '<p class="muted">Failed to load history.</p>';
        }
    };
}

function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}
