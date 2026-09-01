import { api } from '../api.js';
import { showFlash, refreshUser } from '../state.js';

export function TgTasksPage() {
    return async () => {
        const root = document.querySelector('[data-view]');
        if (!root) return;
        root.innerHTML = '';
        root.className = 'view view--tgtasks';
        root.innerHTML = `
            <h2 class="page-title">Telegram Tasks</h2>
            <p class="muted">Join these channels to earn rewards.</p>
            <div class="task-list" id="tg-list">Loading…</div>
        `;
        const list = root.querySelector('#tg-list');
        try {
            const res = await api.tgTasks();
            const tasks = res.data || [];
            list.innerHTML = '';
            if (tasks.length === 0) {
                list.innerHTML = '<p class="muted">No tasks available right now.</p>';
                return;
            }
            tasks.forEach(t => list.appendChild(renderTask(t)));
        } catch (e) {
            list.innerHTML = '<p class="muted">Failed to load tasks.</p>';
        }
    };
}

function renderTask(t) {
    const card = document.createElement('div');
    card.className = 'card card--task';
    card.innerHTML = `
        <div class="task-header">
            <div class="task-channel">
                <i class="bi bi-telegram"></i>
                <strong>${escapeHtml(t.channel_name)}</strong>
                <span class="muted">${escapeHtml(t.channel_username)}</span>
            </div>
        </div>
        <p class="card__sub">${escapeHtml(t.description || '')}</p>
        <div class="task-meta">
            <span><i class="bi bi-cash"></i> $${parseFloat(t.reward).toFixed(3)}</span>
        </div>
        <div class="task-actions">
            ${t.completed
                ? `<button class="btn btn--ghost" disabled>✓ Completed</button>`
                : `<a class="btn btn--primary" href="https://t.me/${escapeHtml(t.channel_username.replace('@',''))}" target="_blank" rel="noopener" data-task-id="${t.id}">Join channel</a>`}
        </div>
    `;
    if (!t.completed) {
        const link = card.querySelector('a.btn');
        link.addEventListener('click', async (e) => {
            // Open in new tab; when user comes back, click button to verify
            e.preventDefault();
            const tgUrl = link.href;
            window.open(tgUrl, '_blank', 'noopener,noreferrer');
            // After 3 seconds, prompt to verify
            setTimeout(() => {
                if (confirm(`Did you join ${t.channel_name}? Click OK to claim the reward.`)) {
                    claim(t, card);
                }
            }, 3000);
        });
    }
    return card;
}

async function claim(t, card) {
    const btn = card.querySelector('.task-actions');
    btn.innerHTML = '<button class="btn btn--ghost" disabled>Claiming…</button>';
    try {
        await api.tgTaskVerify({ task_id: t.id });
        showFlash('+ $' + parseFloat(t.reward).toFixed(3) + ' credited!', 'success');
        await refreshUser();
        TgTasksPage()();
    } catch (e) {
        showFlash(e.message || 'Verification failed', 'error');
        btn.innerHTML = `<button class="btn btn--primary" data-task-id="${t.id}">Retry</button>`;
    }
}

function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}
