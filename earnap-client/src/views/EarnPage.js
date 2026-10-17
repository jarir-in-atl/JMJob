import { api, getAuthToken } from '../api.js';
import { currentUser, showFlash, refreshUser } from '../state.js';

export function EarnPage() {
    return async () => {
        const root = document.querySelector('[data-view]');
        if (!root) return;
        root.innerHTML = '<div class="card"><p class="muted">Loading video rewards…</p></div>';
        root.className = 'view view--earn';

        const user = currentUser.get();
        try {
            const response = await api.videoAds();
            const items = Array.isArray(response.data) ? response.data : [];
            const meta = response.meta || {};
            const enabled = meta.enabled !== false;
            const dailyLimit = Number(user?.ads_limit || 0);
            const todayAds = Number(user?.today_ads || 0);
            const remaining = Number(meta.ads_remaining_today ?? user?.ads_remaining ?? 0);
            const dailyProgress = dailyLimit > 0 ? Math.min(100, (todayAds / dailyLimit) * 100) : 0;

            root.innerHTML = `
                <section class="earn-hero">
                    <div class="earn-hero__glow earn-hero__glow--one"></div>
                    <div class="earn-hero__glow earn-hero__glow--two"></div>
                    <div class="earn-hero__content">
                        <span class="earn-hero__eyebrow"><i class="bi bi-play-circle-fill"></i> VIDEO INCOME</span>
                        <h1>Earn Money Watching Videos</h1>
                        <p>Watch a sponsor video, wait for the timer, and collect its reward in your JMJob balance.</p>
                        <div class="earn-hero__stats">
                            <div class="earn-hero__stat">
                                <i class="bi bi-coin"></i>
                                <div><span>Today’s video earnings</span><strong>৳${money(meta.today_earnings)}</strong></div>
                            </div>
                            <div class="earn-hero__stat">
                                <i class="bi bi-wallet2"></i>
                                <div><span>Total video earnings</span><strong>৳${money(meta.total_earnings)}</strong></div>
                            </div>
                        </div>
                    </div>
                </section>

                <section class="card earn-progress-card">
                    <div class="earn-progress-card__top">
                        <div>
                            <span class="earn-section-kicker">TODAY</span>
                            <h2>Daily ad allowance</h2>
                        </div>
                        <span class="earn-progress-card__count">${dailyLimit > 0 ? `${todayAds} / ${dailyLimit}` : `${todayAds} ads`}</span>
                    </div>
                    ${dailyLimit > 0 ? `<div class="earn-progress"><span style="width:${dailyProgress}%"></span></div>` : ''}
                    <div class="earn-progress-card__bottom">
                        <span>${dailyLimit > 0 ? `${remaining} ad rewards remaining today` : 'No daily ad limit'}</span>
                        <span>${Number(meta.video_views_today || 0)} video rewards claimed today</span>
                    </div>
                    <div class="earn-stat-strip">
                        <div><i class="bi bi-camera-video"></i><span>${items.length} videos available</span></div>
                        <div><i class="bi bi-shield-check"></i><span>Rewards are checked by JMJob</span></div>
                    </div>
                </section>

                <section class="earn-video-section">
                    <div class="earn-section-heading">
                        <div>
                            <span class="earn-section-kicker">WATCH & EARN</span>
                            <h2>Videos for you</h2>
                            <p>Choose a video below and complete its watch timer to claim the reward.</p>
                        </div>
                        <span class="earn-video-count">${items.length}</span>
                    </div>
                    ${!enabled ? '<div class="earn-empty"><i class="bi bi-pause-circle"></i><strong>Video rewards are paused</strong><span>Please check back later.</span></div>' : ''}
                    ${enabled && items.length === 0 ? '<div class="earn-empty"><i class="bi bi-film"></i><strong>No videos available right now</strong><span>New sponsor videos will appear here when they are ready.</span></div>' : ''}
                    <div class="earn-video-grid"></div>
                </section>

                <section class="card earn-howto">
                    <div class="earn-howto__heading"><span class="earn-howto__icon"><i class="bi bi-lightbulb-fill"></i></span><div><span class="earn-section-kicker">QUICK GUIDE</span><h2>How video rewards work</h2></div></div>
                    <div class="earn-howto__steps">
                        <div><span>1</span><p><strong>Choose a video</strong><small>Check its reward and required watch time.</small></p></div>
                        <div><span>2</span><p><strong>Watch and wait</strong><small>Keep the video open until the timer finishes.</small></p></div>
                        <div><span>3</span><p><strong>Claim your reward</strong><small>Your reward is credited after JMJob verifies the timer.</small></p></div>
                    </div>
                </section>
            `;

            const list = root.querySelector('.earn-video-grid');
            items.forEach(ad => list.appendChild(renderVideoCard(ad, remaining)));
        } catch (error) {
            root.innerHTML = `<section class="card card--earn"><h1 class="card__title">Video income</h1><p class="muted">${escapeHtml(error.message || 'Could not load video rewards.')}</p><button class="btn btn--ghost btn--sm" type="button">Retry</button></section>`;
            root.querySelector('button')?.addEventListener('click', () => EarnPage()());
        }
    };
}

function renderVideoCard(ad, remaining) {
    const card = document.createElement('article');
    card.className = 'earn-video-card';
    const canStart = Boolean(ad.can_start) && remaining > 0;
    const campaignLimit = Number(ad.daily_limit || 0);
    const watchedToday = Number(ad.watched_today || 0);
    const perUserLimit = Number(ad.per_user_limit || 0);
    const viewsByUser = Number(ad.views_by_user || 0);
    const dailyReached = campaignLimit > 0 && watchedToday >= campaignLimit;
    const userLimitReached = perUserLimit > 0 && viewsByUser >= perUserLimit;
    const activity = [
        campaignLimit > 0 ? `${watchedToday} / ${campaignLimit} today` : `${watchedToday} watched today`,
        ...(perUserLimit > 0 ? [`${viewsByUser} / ${perUserLimit} total for you`] : []),
    ].join(' · ');
    const disabledLabel = remaining <= 0 || dailyReached
        ? 'Daily limit reached'
        : userLimitReached ? 'View limit reached' : 'Campaign limit reached';

    card.innerHTML = `
        <div class="earn-video-card__top">
            <span class="earn-video-card__icon"><i class="bi bi-play-fill"></i></span>
            <span class="earn-video-card__badge">SPONSORED</span>
        </div>
        <h3 class="earn-video-card__title">${escapeHtml(ad.title || 'Sponsored video')}</h3>
        <div class="earn-video-card__details">
            <span><i class="bi bi-clock"></i>${Number(ad.duration_seconds || 0)} sec</span>
            <span><i class="bi bi-coin"></i>৳${money(ad.reward_amount)} <small>per completed view</small></span>
        </div>
        <p class="earn-video-card__limit">${escapeHtml(activity)}</p>
        <button class="btn ${canStart ? 'btn--primary' : 'btn--ghost'} earn-video-card__button" type="button" ${canStart ? '' : 'disabled'}>
            <i class="bi ${canStart ? 'bi-play-circle-fill' : 'bi-hourglass-split'}"></i>${canStart ? 'Watch & earn' : disabledLabel}
        </button>
    `;
    if (canStart) card.querySelector('button')?.addEventListener('click', () => openVideoAdModal(ad));
    return card;
}

async function openVideoAdModal(ad) {
    let session;
    try {
        const response = await api.videoAdStart({ video_ad_id: ad.id });
        session = response.data;
    } catch (error) {
        showFlash(error.message || 'Could not start this video.', 'error');
        return;
    }

    const modal = document.createElement('div');
    modal.className = 'modal modal--earn-watch';
    modal.innerHTML = `
        <div class="modal__backdrop"></div>
        <section class="modal__content modal__content--earn" role="dialog" aria-modal="true" aria-label="Watch video and earn">
            <button class="modal__close" type="button" aria-label="Close">×</button>
            <div class="earn-watch__heading"><span class="earn-watch__icon"><i class="bi bi-play-fill"></i></span><div><span class="earn-section-kicker">WATCH & EARN</span><h2 class="earn-watch__title">${escapeHtml(ad.title || 'Sponsored video')}</h2></div></div>
            <div class="earn-watch__player"><div class="earn-watch__loading"><span class="spinner"></span><span>Preparing your video…</span></div></div>
            <div class="earn-watch__timer-row"><div class="earn-watch__timer-icon"><i class="bi bi-hourglass-split"></i></div><div class="earn-watch__timer-copy"><strong id="earn-watch-status">Starting your watch timer…</strong><span id="earn-watch-countdown">${Number(session.duration_seconds || 0)} seconds required</span></div></div>
            <div class="earn-watch__progress"><span></span></div>
            <p class="earn-watch__note">The reward button becomes available when the timer finishes. Keep this page open while you watch.</p>
            <div class="earn-watch__actions"><button class="btn btn--ghost" type="button" data-watch-close>Close</button><button class="btn btn--primary" type="button" data-watch-claim disabled><i class="bi bi-gift-fill"></i><span>Claim reward</span><strong>৳${money(session.reward_amount ?? ad.reward_amount)}</strong></button></div>
        </section>
    `;
    document.body.appendChild(modal);

    const playerSlot = modal.querySelector('.earn-watch__player');
    const status = modal.querySelector('#earn-watch-status');
    const countdown = modal.querySelector('#earn-watch-countdown');
    const progress = modal.querySelector('.earn-watch__progress > span');
    const claimButton = modal.querySelector('[data-watch-claim]');
    let objectUrl = null;
    let claimInProgress = false;
    let closed = false;

    const close = () => {
        closed = true;
        modal.remove();
        if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
    modal.querySelector('[data-watch-close]')?.addEventListener('click', close);
    modal.querySelector('.modal__close')?.addEventListener('click', close);
    modal.querySelector('.modal__backdrop')?.addEventListener('click', close);

    const streamUrl = String(session.stream_url || '');
    const source = await classifyVideoSource(streamUrl);
    if (source.kind === 'local') {
        try {
            const response = await fetch(streamUrl, { headers: { Authorization: `Bearer ${getAuthToken()}` } });
            if (!response.ok) throw new Error('Video could not be loaded.');
            objectUrl = URL.createObjectURL(await response.blob());
            playerSlot.replaceChildren(createVideoElement(objectUrl));
        } catch (error) {
            showPlayerError(playerSlot, error.message || 'Video could not be loaded.');
        }
    } else if (source.kind === 'file') {
        const video = createVideoElement(source.url);
        video.addEventListener('error', () => showPlayerError(playerSlot, 'This video could not be played in your browser.', source.url), { once: true });
        playerSlot.replaceChildren(video);
    } else if (source.kind === 'embed') {
        if (source.provider === 'tiktok') playerSlot.classList.add('earn-watch__player--tiktok');
        const frame = document.createElement('iframe');
        frame.src = source.embedUrl;
        frame.title = ad.title || 'Sponsored video';
        frame.dataset.i18nIgnore = 'true';
        frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen; web-share';
        frame.allowFullscreen = true;
        frame.referrerPolicy = 'strict-origin-when-cross-origin';
        playerSlot.replaceChildren(frame);
        addExternalLink(playerSlot, source.url);
    } else {
        showExternalPlayer(playerSlot, source.url);
    }

    const requiredSeconds = Math.max(1, Number(session.duration_seconds || 1));
    const startedAt = performance.now();
    const claimReward = async () => {
        if (claimInProgress || claimButton.disabled) return;
        claimInProgress = true;
        claimButton.disabled = true;
        claimButton.innerHTML = '<span class="spinner spinner--small"></span><span>Claiming…</span>';
        try {
            const result = await api.videoAdClaim({ view_id: session.view_id });
            showFlash(`+৳${money(result.data?.reward || session.reward_amount || ad.reward_amount)} reward credited!`, 'success');
            clearInterval(timer);
            close();
            await refreshUser();
            await EarnPage()();
        } catch (error) {
            claimInProgress = false;
            claimButton.disabled = false;
            claimButton.innerHTML = '<i class="bi bi-gift-fill"></i><span>Retry claim</span>';
            status.textContent = error.message || 'Reward claim failed.';
        }
    };
    const updateTimer = () => {
        const elapsed = (performance.now() - startedAt) / 1000;
        const left = Math.max(0, Math.ceil(requiredSeconds - elapsed));
        progress.style.width = `${Math.min(100, (elapsed / requiredSeconds) * 100)}%`;
        if (left > 0) {
            status.textContent = 'Watch time in progress';
            countdown.textContent = `${left} seconds until you can claim`;
            return;
        }
        status.textContent = 'Your reward is ready';
        countdown.textContent = 'Claim your reward to add it to your balance.';
        claimButton.disabled = false;
        clearInterval(timer);
        if (closed) claimReward();
    };
    const timer = setInterval(updateTimer, 250);
    updateTimer();
    claimButton.addEventListener('click', claimReward);
}

export async function classifyVideoSource(value) {
    const raw = String(value || '');
    if (raw.startsWith('/')) return { kind: 'local', url: raw };
    let url;
    try { url = new URL(raw); } catch { return { kind: 'external', url: '#' }; }
    if (url.protocol !== 'https:') return { kind: 'external', url: '#' };

    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    const path = url.pathname;
    if (['tiktok.com', 'm.tiktok.com', 'vm.tiktok.com', 'vt.tiktok.com'].includes(host)) {
        const videoId = path.match(/^\/@[^/]+\/video\/(\d+)(?:\/|$)/)?.[1]
            || path.match(/^\/player\/v1\/(\d+)(?:\/|$)/)?.[1]
            || await resolveTikTokVideoId(raw);
        if (videoId) {
            const embedUrl = new URL(`https://www.tiktok.com/player/v1/${videoId}`);
            embedUrl.searchParams.set('autoplay', '1');
            embedUrl.searchParams.set('controls', '1');
            embedUrl.searchParams.set('rel', '0');
            return { kind: 'embed', provider: 'tiktok', url: raw, embedUrl: embedUrl.toString() };
        }
        return { kind: 'external', url: raw };
    }

    if (['youtube.com', 'm.youtube.com', 'youtu.be', 'youtube-nocookie.com'].includes(host)) {
        const match = host === 'youtu.be'
            ? path.match(/^\/([\w-]{6,20})/)
            : path.match(/^\/(?:embed|shorts|live)\/([\w-]{6,20})/);
        const id = url.searchParams.get('v') || match?.[1];
        if (id && /^[\w-]{6,20}$/.test(id)) {
            const embedUrl = new URL(`https://www.youtube.com/embed/${id}`);
            embedUrl.searchParams.set('autoplay', '1');
            embedUrl.searchParams.set('playsinline', '1');
            embedUrl.searchParams.set('rel', '0');
            embedUrl.searchParams.set('controls', '1');
            return { kind: 'embed', url: raw, embedUrl: embedUrl.toString() };
        }
    }

    if (['dailymotion.com', 'dai.ly', 'geo.dailymotion.com'].includes(host)) {
        const playerMatch = path.match(/^\/player\/[^/]+\.html$/);
        if (playerMatch && url.searchParams.has('video')) return { kind: 'embed', url: raw, embedUrl: raw };
        const match = host === 'dai.ly' ? path.match(/^\/([\w]+)/) : path.match(/\/(?:embed\/)?video\/([a-zA-Z0-9]+)/);
        if (match?.[1]) {
            const embedUrl = new URL(`https://www.dailymotion.com/embed/video/${match[1]}`);
            embedUrl.searchParams.set('autoplay', '1');
            return { kind: 'embed', url: raw, embedUrl: embedUrl.toString() };
        }
    }

    if (['vimeo.com', 'player.vimeo.com'].includes(host)) {
        const match = path.match(/\/(?:video\/)?(\d+)/);
        if (match?.[1]) {
            return { kind: 'embed', url: raw, embedUrl: `https://player.vimeo.com/video/${match[1]}?autoplay=1` };
        }
    }

    if (/\.(?:mp4|m4v|mov|webm|ogg|ogv|m3u8)$/i.test(path)) return { kind: 'file', url: raw };
    return { kind: 'external', url: raw };
}

async function resolveTikTokVideoId(videoUrl) {
    const endpoint = new URL('https://www.tiktok.com/oembed');
    endpoint.searchParams.set('url', videoUrl);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
        const response = await fetch(endpoint.toString(), {
            headers: { Accept: 'application/json' },
            signal: controller.signal,
        });
        if (!response.ok) return null;
        const data = await response.json();
        if (String(data.provider_url || '').replace(/\/$/, '') !== 'https://www.tiktok.com') return null;
        return String(data.html || '').match(/\bdata-video-id=["'](\d{5,30})["']/i)?.[1] || null;
    } catch {
        return null;
    } finally {
        clearTimeout(timeout);
    }
}

function createVideoElement(url) {
    const video = document.createElement('video');
    video.className = 'earn-watch__video';
    video.controls = true;
    video.playsInline = true;
    video.autoplay = true;
    video.src = url;
    video.addEventListener('loadedmetadata', () => video.play().catch(() => {}), { once: true });
    return video;
}

function showPlayerError(slot, message, sourceUrl = '') {
    const content = document.createElement('div');
    content.className = 'earn-watch__fallback';
    content.innerHTML = `<i class="bi bi-exclamation-circle"></i><strong>${escapeHtml(message)}</strong>`;
    if (sourceUrl && sourceUrl !== '#') content.appendChild(makeExternalLink(sourceUrl));
    slot.replaceChildren(content);
}

function showExternalPlayer(slot, sourceUrl) {
    const content = document.createElement('div');
    content.className = 'earn-watch__fallback';
    content.innerHTML = '<i class="bi bi-box-arrow-up-right"></i><strong>This video is hosted on another site</strong><span>Open the original video in a new tab, then return here when the timer finishes.</span>';
    if (sourceUrl && sourceUrl !== '#') content.appendChild(makeExternalLink(sourceUrl));
    slot.replaceChildren(content);
}

function addExternalLink(slot, sourceUrl) {
    const link = makeExternalLink(sourceUrl);
    link.classList.add('earn-watch__external-link');
    slot.appendChild(link);
}

function makeExternalLink(sourceUrl) {
    const link = document.createElement('a');
    link.href = sourceUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.className = 'btn btn--ghost btn--sm';
    link.innerHTML = '<i class="bi bi-box-arrow-up-right"></i> Open video on original site';
    return link;
}

function money(value) {
    return Number(value || 0).toFixed(4);
}

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[ch]));
}
