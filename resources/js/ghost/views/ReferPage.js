import { api } from '../api.js';
import { currentUser, showFlash, navigate } from '../state.js';

export function ReferPage() {
    return async () => {
        const root = document.querySelector('[data-view]');
        if (!root) return;
        root.innerHTML = '';
        root.className = 'view view--refer';

        const u = currentUser.get();
        let refData = null;
        try {
            const res = await api.referrals();
            refData = res.data;
        } catch (e) {
            showFlash('Failed to load referrals', 'error');
        }

        const link = refData ? refData.referral_link : (u ? `${window.location.origin}/?ref=${u.referral_code}` : '');

        root.innerHTML = `
            <div class="card card--refer">
                <h2 class="card__title">Invite & Earn</h2>
                <p class="card__sub">Total Network: <strong>${u ? u.referral_count : 0}</strong> | Bonus Rate: <strong>50%</strong> | Earned so far: <strong>$${refData ? parseFloat(refData.total_commission).toFixed(4) : '0.0000'}</strong></p>
                <div class="refer-link">
                    <input id="refer-link-input" class="refer-link__input" value="${link}" readonly>
                    <button id="copy-btn" class="btn btn--primary">Copy</button>
                </div>
                <a id="share-tg" class="btn btn--ghost" target="_blank" rel="noopener">Share on Telegram</a>
                <ol class="refer-steps">
                    <li>Copy and share your unique referral link</li>
                    <li>When they register and start watching ads or completing tasks</li>
                    <li>You will receive 50% commission instantly</li>
                </ol>
            </div>

            <h3 class="section-title">Your Referrals</h3>
            <div class="refer-list" id="refer-list">
                ${refData && refData.referrals.length === 0 ? '<p class="muted">No referrals yet. Share your link to start earning 50% of their rewards!</p>' : ''}
            </div>
        `;

        const copyBtn = root.querySelector('#copy-btn');
        const linkInput = root.querySelector('#refer-link-input');
        copyBtn.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(linkInput.value);
                showFlash('Link copied to clipboard!', 'success');
            } catch {
                linkInput.select();
                document.execCommand('copy');
                showFlash('Link copied!', 'success');
            }
        });
        const tgBtn = root.querySelector('#share-tg');
        tgBtn.href = 'https://t.me/share/url?url=' + encodeURIComponent(link);

        const list = root.querySelector('#refer-list');
        if (refData && refData.referrals) {
            refData.referrals.forEach(r => {
                const item = document.createElement('div');
                item.className = 'refer-item';
                item.innerHTML = `
                    <img class="avatar" src="${r.avatar_url}" alt="">
                    <div class="refer-item__info">
                        <div class="refer-item__name">${escapeHtml(r.name)}</div>
                        <div class="refer-item__username">@${escapeHtml(r.username)}</div>
                    </div>
                    <div class="refer-item__earned">$${parseFloat(r.lifetime_earned).toFixed(2)}</div>
                `;
                list.appendChild(item);
            });
        }
    };
}

function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}
