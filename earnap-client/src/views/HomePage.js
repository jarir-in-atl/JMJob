import { currentUser, route, navigate, showFlash, refreshUser } from '../state.js';
import { api } from '../api.js';

export function HomePage() {
    return async () => {
        const root = document.querySelector('[data-view]');
        if (!root) return;
        root.innerHTML = '';
        root.removeAttribute('data-view');
        root.className = 'view view--home';

        const u = currentUser.get();

        const banner = el('div', 'welcome-popup', '');
        banner.innerHTML = `
            <strong>Welcome to EarnApp.</strong>
            <span>If you don't receive payment within 5 minutes, please contact support.</span>
            <button class="welcome-popup__close" aria-label="Close">Got it</button>
        `;
        banner.querySelector('button').addEventListener('click', () => banner.remove());
        root.appendChild(banner);

        // Render the page
        root.appendChild(renderUserHeader(u));
        root.appendChild(renderDailyMission(u));
        root.appendChild(await renderAdReward(u));
        root.appendChild(await renderWebTaskSummary());
    };
}

function el(tag, className, text) {
    const e = document.createElement(tag);
    if (className) e.className = className;
    if (text !== undefined) e.textContent = text;
    return e;
}

function renderUserHeader(u) {
    const card = el('div', 'card card--user-header');
    const left = el('div', 'user-header__left');
    const avatar = el('img', 'avatar avatar--lg');
    avatar.src = u ? u.avatar_url : 'https://placehold.co/60x60/e8e8e8/a9a9a9?text=U';
    avatar.alt = 'avatar';
    left.appendChild(avatar);
    const info = el('div', 'user-header__info');
    info.innerHTML = `
        <div class="user-header__name">${u ? escapeHtml(u.name) : 'Loading…'}</div>
        <div class="user-header__username">@${u ? escapeHtml(u.username) : 'user'}</div>
    `;
    left.appendChild(info);
    card.appendChild(left);

    const right = el('div', 'user-header__right');
    right.innerHTML = `
        <div class="user-header__metric">
            <span class="metric__label">Balance</span>
            <span class="metric__value metric__value--primary">$${u ? parseFloat(u.balance).toFixed(2) : '0.00'}</span>
        </div>
        <div class="user-header__metric">
            <span class="metric__label">Total Earned</span>
            <span class="metric__value">$${u ? parseFloat(u.lifetime_earned).toFixed(2) : '0.00'}</span>
        </div>
        <div class="user-header__metric">
            <span class="metric__label">Network</span>
            <span class="metric__value">${u ? u.referral_count : 0}</span>
        </div>
    `;
    card.appendChild(right);
    return card;
}

function renderDailyMission(u) {
    const card = el('div', 'card card--daily-mission');
    card.innerHTML = `
        <h3 class="card__title">Daily Mission</h3>
        <p class="card__sub">Target: 50 | Completed: ${u ? u.today_ads : 0} | High Reward</p>
    `;
    const btn = el('button', 'btn btn--secondary', 'Claim Daily Bonus');
    btn.disabled = true; // first-day bonus is automatic; we'd need a real cron
    btn.addEventListener('click', () => showFlash('Daily bonus already claimed today.', 'info'));
    card.appendChild(btn);
    return card;
}

async function renderAdReward(u) {
    const card = el('div', 'card card--ad-reward');
    const adsRemaining = u ? u.ads_remaining : 0;
    card.innerHTML = `
        <h3 class="card__title">Ads Reward Center</h3>
        <p class="card__sub">Wait Time: 12 Sec | Daily Limit: 50 Ads</p>
        <div class="ad-progress">
            <div class="ad-progress__bar" style="width: ${u ? (u.today_ads / u.ads_limit * 100) : 0}%"></div>
        </div>
        <p class="ad-progress__label">Mission Progress: ${u ? u.today_ads : 0} / ${u ? u.ads_limit : 50}</p>
    `;
    const btn = el('button', 'btn btn--primary btn--xl', 'Watch Ad & Earn');
    if (adsRemaining <= 0) {
        btn.disabled = true;
        btn.textContent = 'All Tasks Completed';
    }
    btn.addEventListener('click', () => openAdModal());
    card.appendChild(btn);
    return card;
}

async function renderWebTaskSummary() {
    const card = el('div', 'card card--webtask');
    card.innerHTML = `
        <h3 class="card__title">Web Task Center</h3>
        <p class="card__sub">Loading…</p>
    `;
    try {
        const res = await api.webTasks();
        const tasks = res.data || [];
        const avail = tasks.filter(t => t.can_claim).length;
        const done = tasks.filter(t => !t.can_claim).length;
        card.querySelector('.card__sub').textContent = `Available: ${avail} | Completed: ${done} | Total: ${tasks.length}`;
        const more = el('a', 'btn btn--ghost', 'View all tasks →');
        more.href = '#/webtask';
        more.addEventListener('click', e => { e.preventDefault(); navigate('/webtask'); });
        card.appendChild(more);
    } catch (e) {
        card.querySelector('.card__sub').textContent = 'Failed to load.';
    }
    return card;
}

function openAdModal() {
    const modal = el('div', 'modal modal--ad');
    modal.innerHTML = `
        <div class="modal__backdrop"></div>
        <div class="modal__content modal__content--ad">
            <button class="modal__close" aria-label="Close">×</button>
            <h3>Watch the ad</h3>
            <div class="ad-slot" id="ad-slot">
                <div class="ad-slot__placeholder">
                    <i class="bi bi-play-circle-fill"></i>
                    <p>Ad will play here…</p>
                </div>
            </div>
            <p class="ad-slot__countdown" id="ad-countdown">Starting…</p>
        </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector('.modal__close').addEventListener('click', () => modal.remove());
    modal.querySelector('.modal__backdrop').addEventListener('click', () => modal.remove());

    const slot = modal.querySelector('#ad-slot');
    const countdown = modal.querySelector('#ad-countdown');
    const startedAt = new Date().toISOString();

    // Render a simulated ad
    setTimeout(() => {
        slot.innerHTML = `
            <div class="ad-slot__simulated">
                <i class="bi bi-megaphone-fill"></i>
                <h4>Simulated Sponsor Ad</h4>
                <p>Thank you for watching — your reward will be credited in <span id="cd">12</span>s.</p>
            </div>
        `;
        let sec = 12;
        const cdEl = slot.querySelector('#cd');
        const iv = setInterval(() => {
            sec--;
            cdEl.textContent = sec;
            if (sec <= 0) {
                clearInterval(iv);
                claimReward(modal, 'simulated', startedAt);
            }
        }, 1000);
    }, 200);
}

async function claimReward(modal, provider, startedAt) {
    try {
        const res = await api.reward({ provider, started_at: startedAt });
        showFlash('+' + parseFloat(res.data.reward).toFixed(4) + ' credited!', 'success');
        modal.remove();
        await refreshUser();
        // Re-render the home view
        HomePage()();
    } catch (e) {
        showFlash(e.message || 'Reward failed', 'error');
        modal.remove();
    }
}

function escapeHtml(s) {
    if (s === null || s === undefined) return '';
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
