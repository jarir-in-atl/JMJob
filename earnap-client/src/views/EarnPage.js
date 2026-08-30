import { api } from '../api.js';
import { currentUser, showFlash, refreshUser, navigate } from '../state.js';

export function EarnPage() {
    return async () => {
        const root = document.querySelector('[data-view]');
        if (!root) return;
        root.innerHTML = '';
        root.className = 'view view--earn';

        const u = currentUser.get();
        const adsRemaining = u ? u.ads_remaining : 0;

        root.innerHTML = `
            <div class="card card--earn">
                <h2 class="card__title">Ads Reward Center</h2>
                <p class="card__sub">Daily Limit: 50 ads | Reward: ~$0.005 per ad</p>
                <div class="ad-progress">
                    <div class="ad-progress__bar" style="width: ${u ? (u.today_ads / u.ads_limit * 100) : 0}%"></div>
                </div>
                <p class="ad-progress__label">${u ? u.today_ads : 0} / ${u ? u.ads_limit : 50} ads today</p>
                <div class="ad-meta">
                    <span><i class="bi bi-clock"></i> 12 sec per ad</span>
                    <span><i class="bi bi-cash"></i> +$0.005 each</span>
                </div>
                <button id="watch-btn" class="btn btn--primary btn--xl" ${adsRemaining <= 0 ? 'disabled' : ''}>
                    ${adsRemaining <= 0 ? 'All Tasks Completed' : 'Watch Ad & Earn'}
                </button>
            </div>
        `;

        const btn = root.querySelector('#watch-btn');
        if (!btn.disabled) {
            btn.addEventListener('click', () => openAdModal());
        }
    };
}

function openAdModal() {
    const modal = document.createElement('div');
    modal.className = 'modal modal--ad';
    modal.innerHTML = `
        <div class="modal__backdrop"></div>
        <div class="modal__content modal__content--ad">
            <button class="modal__close" aria-label="Close">×</button>
            <h3>Watch the ad</h3>
            <div class="ad-slot" id="ad-slot">
                <div class="ad-slot__placeholder">
                    <i class="bi bi-play-circle-fill"></i>
                    <p>Preparing ad…</p>
                </div>
            </div>
            <p class="ad-slot__countdown" id="ad-countdown">Starting…</p>
        </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector('.modal__close').addEventListener('click', () => modal.remove());
    modal.querySelector('.modal__backdrop').addEventListener('click', () => modal.remove());

    const startedAt = new Date().toISOString();
    let countdown = 12;
    const slot = modal.querySelector('#ad-slot');
    const cdEl = modal.querySelector('#ad-countdown');

    setTimeout(() => {
        slot.innerHTML = `
            <div class="ad-slot__simulated">
                <i class="bi bi-megaphone-fill"></i>
                <h4>Sponsored Content</h4>
                <p>This is a placeholder for a real ad. <br>Your reward will be credited in <strong><span id="cd-num">12</span>s</strong>.</p>
            </div>
        `;
        const num = slot.querySelector('#cd-num');
        const iv = setInterval(async () => {
            countdown--;
            num.textContent = countdown;
            cdEl.textContent = `Reward in ${countdown}s…`;
            if (countdown <= 0) {
                clearInterval(iv);
                await claim(modal, 'simulated', startedAt);
            }
        }, 1000);
    }, 300);
}

async function claim(modal, provider, startedAt) {
    try {
        const res = await api.reward({ provider, started_at: startedAt });
        showFlash(`+$${parseFloat(res.data.reward).toFixed(4)} credited!`, 'success');
        await refreshUser();
        modal.remove();
        EarnPage()();
    } catch (e) {
        showFlash(e.message || 'Reward failed', 'error');
        modal.remove();
    }
}
