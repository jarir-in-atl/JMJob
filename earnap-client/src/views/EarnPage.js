import { api, getAuthToken } from '../api.js';
import { currentUser, showFlash, refreshUser, navigate } from '../state.js';

export function EarnPage() {
    return async () => {
        const root = document.querySelector('[data-view]');
        if (!root) return;
        root.innerHTML = '<div class="card"><p class="muted">Loading available ads…</p></div>';
        root.className = 'view view--earn';

        const u = currentUser.get();
        const adsRemaining = u ? u.ads_remaining : 0;
        try {
            const response = await api.videoAds();
            const items = response.data || [];
            const enabled = response.meta?.enabled !== false;
            root.innerHTML = `
                <div class="card card--earn">
                    <h2 class="card__title">Ads Reward Center</h2>
                    <p class="card__sub">Server-timed sponsor videos and daily rewards</p>
                    <div class="ad-progress">
                        <div class="ad-progress__bar" style="width: ${u ? Math.min(100, ((u.today_ads || 0) / (u.ads_limit || 50)) * 100) : 0}%"></div>
                    </div>
                    <p class="ad-progress__label">${u ? u.today_ads : 0} / ${u ? u.ads_limit : 50} ads today</p>
                    ${!enabled ? '<p class="muted">Watch-and-earn is currently paused.</p>' : ''}
                    <div class="video-ad-list"></div>
                    ${enabled && items.length === 0 ? '<p class="muted">No sponsor videos are available right now.</p>' : ''}
                    <button id="watch-btn" class="btn btn--ghost btn--sm" ${adsRemaining <= 0 || !enabled ? 'disabled' : ''}>Use standard ad reward</button>
                </div>
            `;
            const list = root.querySelector('.video-ad-list');
            items.forEach(ad => {
                const card = document.createElement('div');
                card.className = 'admin-row';
                card.innerHTML = `<div><strong>${escapeHtml(ad.title)}</strong><span class="muted">${ad.duration_seconds}s · +${Number(ad.reward_amount || 0).toFixed(4)} · ${ad.watched_today}/${ad.daily_limit || '∞'} today</span></div>`;
                const button = document.createElement('button');
                button.className = 'btn btn--primary btn--sm';
                button.textContent = ad.can_start && adsRemaining > 0 ? 'Watch & earn' : 'Unavailable';
                button.disabled = !ad.can_start || adsRemaining <= 0;
                button.addEventListener('click', () => openVideoAdModal(ad));
                card.appendChild(button);
                list.appendChild(card);
            });
            const btn = root.querySelector('#watch-btn');
            if (btn && !btn.disabled) btn.addEventListener('click', () => openAdModal());
        } catch (e) {
            root.innerHTML = `<div class="card card--earn"><h2 class="card__title">Ads Reward Center</h2><p class="muted">${escapeHtml(e.message || 'Could not load ads.')}</p></div>`;
        }
    };
}

async function openVideoAdModal(ad) {
    let response;
    try {
        response = await api.videoAdStart({ video_ad_id: ad.id });
    } catch (e) {
        showFlash(e.message || 'Could not start this ad.', 'error');
        return;
    }
    const session = response.data;
    const modal = document.createElement('div');
    modal.className = 'modal modal--ad';
    modal.innerHTML = `
        <div class="modal__backdrop"></div>
        <div class="modal__content modal__content--ad">
            <button class="modal__close" aria-label="Close">×</button>
            <h3>${escapeHtml(ad.title)}</h3>
            <video id="video-ad-player" controls playsinline style="width:100%;max-height:320px;background:#000"></video>
            <p class="ad-slot__countdown" id="video-ad-countdown">Watch ${session.duration_seconds}s to unlock the reward.</p>
        </div>
    `;
    document.body.appendChild(modal);
    const close = () => modal.remove();
    modal.querySelector('.modal__close').addEventListener('click', close);
    modal.querySelector('.modal__backdrop').addEventListener('click', close);
    const player = modal.querySelector('#video-ad-player');
    const countdown = modal.querySelector('#video-ad-countdown');
    let claimed = false;
    try {
        const res = await fetch(session.stream_url, { headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (!res.ok) throw new Error('Video could not be loaded.');
        player.src = URL.createObjectURL(await res.blob());
        await player.play().catch(() => {});
    } catch (e) {
        countdown.textContent = e.message || 'Video could not be loaded.';
        return;
    }
    const started = Number(session.started_at_unix || Math.floor(Date.now() / 1000)) * 1000;
    const interval = setInterval(async () => {
        const remaining = Math.max(0, session.duration_seconds - Math.floor((Date.now() - started) / 1000));
        countdown.textContent = remaining > 0 ? `Reward unlocks in ${remaining}s…` : 'Claiming reward…';
        if (remaining <= 0 && !claimed) {
            claimed = true;
            clearInterval(interval);
            try {
                const result = await api.videoAdClaim({ view_id: session.view_id });
                showFlash(`+$${Number(result.data?.reward || 0).toFixed(4)} credited!`, 'success');
                await refreshUser();
                URL.revokeObjectURL(player.src);
                close();
                EarnPage()();
            } catch (e) {
                claimed = false;
                countdown.textContent = e.message || 'Reward claim failed.';
            }
        }
    }, 1000);
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

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[ch]));
}
