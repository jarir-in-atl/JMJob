// HomePage — dashboard with user header + 3-col icon grid + Quick Actions,
// Daily Mission card, Ads Reward Center, Web Task Center, Referral & Withdraw
// summary cards. Layout matches the earnapp339 reference.
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

        // Notice banner (Bengali-style per reference, but English for our app)
        const banner = el('div', 'welcome-popup', '');
        banner.innerHTML = `
            <strong>JM Job:</strong>
            <span>Complete tasks, watch ads, refer friends, and withdraw anytime.</span>
            <button class="welcome-popup__close" aria-label="Close">Got it</button>
        `;
        banner.querySelector('button').addEventListener('click', () => banner.remove());
        root.appendChild(banner);

        // Section 1: user header (avatar + name + balance)
        root.appendChild(renderUserHeader(u));

        // Section 2: 3-column icon grid (Earn Ad, Web Task, Tasks, Withdraw,
        // Referral, Profile, Support, Deposit) — matches reference
        root.appendChild(renderIconGrid());

        // Section 3: Quick action cards (Daily Mission + Invite & Earn + Tasks + Ads)
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

// ----- 1. User header -----
function renderUserHeader(u) {
    const card = el('div', 'card card--user-header');

    // 3 stat cards fill the whole row (name+avatar live in the topbar)
    const stats = el('div', 'user-header__stats');
    stats.innerHTML = `
        <div class="user-header__stat">
            <span class="metric__label">Balance</span>
            <strong class="metric__value--primary">$${u ? parseFloat(u.balance).toFixed(2) : '0.00'}</strong>
        </div>
        <div class="user-header__stat">
            <span class="metric__label">Total Earned</span>
            <strong>$${u ? parseFloat(u.lifetime_earned).toFixed(2) : '0.00'}</strong>
        </div>
        <div class="user-header__stat">
            <span class="metric__label">My Network</span>
            <strong>${u ? (u.referral_count || 0) : 0}</strong>
        </div>
    `;

    card.appendChild(stats);
    return card;
}

// ----- 2. 3-column icon grid (matches reference) -----
function renderIconGrid() {
    const grid = el('div', 'icon-grid');

    const items = [
        { path: '/earn',      label: 'Earn Ad',     icon: 'bi-play-circle-fill',  tone: 'green' },
        { path: '/tasks',     label: 'Web Task',    icon: 'bi-link-45deg',         tone: 'blue' },
        { path: '/webtask',   label: 'Tasks',       icon: 'bi-telegram',           tone: 'blue' },
        { path: '/withdraw',  label: 'Withdraw',    icon: 'bi-wallet2',            tone: 'amber' },
        { path: '/refer',     label: 'Referral',    icon: 'bi-gift-fill',          tone: 'pink' },
        { path: '/profile',   label: 'Profile',     icon: 'bi-person-bounding-box', tone: 'gray' },
        { path: '/support',   label: 'Support',     icon: 'bi-headset',            tone: 'red' },
        { path: '/deposit',   label: 'Deposit',     icon: 'bi-cash-coin',          tone: 'green' },
    ];

    items.forEach(item => {
        const a = el('a', `icon-grid__item icon-grid__item--${item.tone}`);
        a.href = `#${item.path}`;
        a.innerHTML = `
            <span class="icon-grid__chip">
                <i class="bi ${item.icon}"></i>
            </span>
            <span class="icon-grid__label">${item.label}</span>
        `;
        a.addEventListener('click', e => { e.preventDefault(); navigate(item.path); });
        grid.appendChild(a);
    });

    return grid;
}

// ----- 3. Daily Mission -----
function renderDailyMission(u) {
    const card = el('div', 'card card--daily-mission');
    const done = u ? (u.today_ads || 0) : 0;
    const target = u ? (u.ads_limit || 50) : 50;
    const pct = Math.min(100, (done / Math.max(1, target)) * 100);

    card.innerHTML = `
        <div class="card__row">
            <h3 class="card__title">Daily Mission</h3>
            <span class="card__sub">Target: ${target} | Completed: ${done}</span>
        </div>
        <div class="ad-progress">
            <div class="ad-progress__bar" style="width: ${pct}%"></div>
        </div>
    `;
    const btn = el('button', 'btn btn--primary btn--xl', '🎁 Claim Daily Bonus');
    btn.addEventListener('click', async () => {
        try {
            const res = await fetch('/api/user/claim-daily-bonus', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json',
                           'Authorization': 'Bearer ' + (window.EARNAPP_TOKEN || '') },
            }).then(r => r.json());
            if (res.success) {
                showFlash(res.message || 'Daily bonus claimed!', 'success');
                await refreshUser();
                HomePage()();
            } else {
                showFlash(res.message || 'Bonus not available.', 'info');
            }
        } catch (e) {
            showFlash('Could not claim. Try again later.', 'error');
        }
    });
    card.appendChild(btn);
    return card;
}

// ----- 4. Ads Reward Center -----
async function renderAdReward(u) {
    const card = el('div', 'card card--ad-reward');
    const adsRemaining = u ? u.ads_remaining : 0;
    const done = u ? (u.today_ads || 0) : 0;
    const target = u ? (u.ads_limit || 50) : 50;
    const pct = Math.min(100, (done / Math.max(1, target)) * 100);

    card.innerHTML = `
        <div class="card__row">
            <h3 class="card__title">Ads Reward Center</h3>
            <span class="ad-reward__meta">Wait: <strong>12s</strong> · Daily Limit: <strong>${target} Ads</strong></span>
        </div>
        <div class="ad-progress">
            <div class="ad-progress__bar" style="width: ${pct}%"></div>
        </div>
        <p class="ad-progress__label">Mission Progress: ${done} / ${target} (${adsRemaining} remaining)</p>
    `;
    const btn = el('button', 'btn btn--success btn--xl', '▶ Watch Ad & Earn');
    if (adsRemaining <= 0) {
        btn.disabled = true;
        btn.textContent = '✓ All Tasks Completed';
    }
    btn.addEventListener('click', () => openAdModal());
    card.appendChild(btn);
    return card;
}

// ----- 5. Web Task Center summary -----
async function renderWebTaskSummary() {
    const card = el('div', 'card card--webtask');
    card.innerHTML = `
        <div class="card__row">
            <h3 class="card__title">Web Task Center</h3>
            <span class="card__sub">Loading…</span>
        </div>
    `;
    try {
        const res = await api.webTasks();
        const tasks = res.data || [];
        const avail = tasks.filter(t => t.can_claim).length;
        const done  = tasks.filter(t => !t.can_claim).length;
        card.querySelector('.card__sub').textContent =
            `Available: ${avail} · Completed: ${done} · Total: ${tasks.length}`;
        const more = el('a', 'btn btn--ghost', 'View all tasks →');
        more.href = '#/webtask';
        more.addEventListener('click', e => { e.preventDefault(); navigate('/webtask'); });
        card.appendChild(more);
    } catch (e) {
        card.querySelector('.card__sub').textContent = 'Failed to load tasks.';
    }
    return card;
}

// ----- Ad modal (unchanged) -----
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
    const startedAt = new Date().toISOString();

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
