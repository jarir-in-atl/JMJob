import { api } from '../api.js';
import { showFlash, refreshUser } from '../state.js';

export function WebTaskPage() {
    return async () => {
        const root = document.querySelector('[data-view]');
        if (!root) return;
        root.innerHTML = '';
        root.className = 'view view--webtask';
        root.innerHTML = `<h2 class="page-title">Web Task Center</h2><div class="task-list" id="task-list">Loading…</div>`;

        const list = root.querySelector('#task-list');
        try {
            const res = await api.webTasks();
            const tasks = res.data || [];
            if (tasks.length === 0) {
                list.innerHTML = '<p class="muted">No tasks available right now.</p>';
                return;
            }
            list.innerHTML = '';
            tasks.forEach(task => list.appendChild(renderTask(task)));
        } catch (e) {
            list.innerHTML = '<p class="muted">Failed to load tasks.</p>';
        }
    };
}

function renderTask(task) {
    const card = document.createElement('div');
    card.className = 'card card--task';
    card.innerHTML = `
        <h3 class="card__title">${escapeHtml(task.title)}</h3>
        <p class="card__sub">${escapeHtml(task.description || '')}</p>
        <div class="task-meta">
            <span><i class="bi bi-cash"></i> $${parseFloat(task.reward).toFixed(2)}</span>
            <span><i class="bi bi-clock"></i> ${task.duration_seconds}s</span>
        </div>
        <div class="task-progress"><div class="task-progress__bar" style="width: ${task.completed_today > 0 ? '100%' : '0%'}"></div></div>
        <div class="task-actions">
            ${task.completed_today > 0
                ? `<button class="btn btn--ghost" disabled>✓ Completed today</button>`
                : `<button class="btn btn--primary" data-task-id="${task.id}">Start Task</button>`}
        </div>
    `;
    const startBtn = card.querySelector('button');
    if (startBtn && !startBtn.disabled) {
        startBtn.addEventListener('click', () => startTask(task, startBtn, card));
    }
    return card;
}

async function startTask(task, btn, card) {
    btn.disabled = true;
    btn.textContent = 'Opening…';
    window.open(task.target_url, '_blank', 'noopener,noreferrer');
    let progress = 0;
    const total = task.duration_seconds;
    btn.textContent = `Wait ${total}s…`;

    const startedRes = await api.webTaskStart({ task_id: task.id });
    const completionId = startedRes.data.completion_id;

    const iv = setInterval(() => {
        progress += 1;
        const remaining = total - progress;
        btn.textContent = remaining > 0 ? `Wait ${remaining}s…` : 'Claim Reward';
        if (progress >= total) {
            clearInterval(iv);
            enableClaim(btn, completionId, card);
        }
    }, 1000);
}

function enableClaim(btn, completionId, card) {
    btn.textContent = 'Claim Reward';
    btn.classList.remove('btn--primary');
    btn.classList.add('btn--success');
    btn.disabled = false;
    btn.onclick = async () => {
        btn.disabled = true;
        btn.textContent = 'Claiming…';
        try {
            const res = await api.webTaskClaim({ completion_id: completionId });
            showFlash('+' + parseFloat(res.data.reward).toFixed(2) + ' credited!', 'success');
            await refreshUser();
            // re-render
            WebTaskPage()();
        } catch (e) {
            showFlash(e.message || 'Claim failed', 'error');
            btn.disabled = false; btn.textContent = 'Claim Reward';
        }
    };
}

function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}
