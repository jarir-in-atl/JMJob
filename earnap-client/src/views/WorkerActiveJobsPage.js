// WorkerActiveJobsPage — jobs I'm currently working on, with submit-work action.
import { api } from '../api.js';
import { navigate, showFlash } from '../state.js';

let _state = { jobs: [], submissions: [], loading: false };

export function WorkerActiveJobsPage() {
    return async () => {
        const root = document.querySelector('[data-view]');
        if (!root) return;
        root.innerHTML = '';
        root.className = 'view view--worker-active';

        root.innerHTML = `
            <h1 class="page-title">Active Jobs</h1>
            <p class="muted">Jobs you've been assigned. Submit your work when done.</p>
            <div class="card" id="active-jobs-list"><div class="spinner"></div></div>
        `;

        try {
            const [jobsRes, subsRes] = await Promise.all([
                api.workerActiveJobs(),
                api.workerSubmissions(),
            ]);
            _state.jobs = jobsRes.data || [];
            _state.submissions = subsRes.data || [];
            render();
        } catch (e) {
            document.getElementById('active-jobs-list').innerHTML =
                `<p class="muted">Failed to load: ${escapeHtml(e.message || 'unknown')}</p>`;
        }
    };
}

function render() {
    const list = document.getElementById('active-jobs-list');
    if (!list) return;
    if (_state.jobs.length === 0) {
        list.innerHTML = `<p class="muted">No active jobs. Once a poster accepts your bid, it'll appear here.</p>`;
        return;
    }

    list.innerHTML = _state.jobs.map(j => {
        const mySub = _state.submissions.find(s => s.job_id === j.id);
        const status = j.status; // 'assigned' | 'submitted' | 'revision'
        return `
            <div class="active-job-card" data-id="${j.id}">
                <div class="active-job-card__head">
                    <div>
                        <h3>${escapeHtml(j.title)}</h3>
                        ${j.subtitle ? `<div class="muted">${escapeHtml(j.subtitle)}</div>` : ''}
                        <div class="muted">Pay: ৳${parseFloat(j.cost_per_worker || j.budget || 0).toFixed(2)} · Deadline: ${escapeHtml(j.deadline_at || 'None')}</div>
                    </div>
                    <span class="badge badge--status badge--${status}">${status.toUpperCase()}</span>
                </div>
                ${mySub ? renderExistingSubmission(j, mySub) : renderSubmitForm(j)}
                ${!mySub && j.assignment_id ? `<div class="active-job-card__actions"><button type="button" class="btn btn--ghost btn--sm" data-cancel-assignment="${j.assignment_id}">Request cancellation</button><small class="muted">Available before submitting work.</small></div>` : ''}
            </div>
        `;
    }).join('');

    wireForms();
}

function renderExistingSubmission(job, sub) {
    return `
        <div class="active-job-card__sub">
            <strong>Submitted:</strong> ${formatDate(sub.created_at)}
            <div class="muted">${escapeHtml((sub.description || '').slice(0, 200))}${(sub.description || '').length > 200 ? '…' : ''}</div>
            ${sub.status === 'pending_review' ? '<p class="muted">⏳ Awaiting poster review.</p>' : ''}
            ${sub.status === 'revision' ? '<p class="muted">🔄 Poster requested changes. Please re-submit below.</p>' : ''}
            ${sub.status === 'approved' ? '<p class="muted">✅ Approved! Payment has been released.</p>' : ''}
        </div>
    `;
}

function renderSubmitForm(job) {
    const requiresScreenshot = Array.isArray(job.proof_requirements)
        && job.proof_requirements.some(requirement => requirement && requirement.type === 'screenshot');
    return `
        <form class="submit-form" data-job-id="${job.id}">
            <label class="submit-form__label">
                What did you deliver? (description)
                <textarea name="description" rows="3" required placeholder="Summarize what you delivered…"></textarea>
            </label>
            <label class="submit-form__label">
                External link (optional — Google Drive, GitHub, Figma, etc.)
                <input name="external_link" type="url" placeholder="https://…">
            </label>
            <label class="submit-form__label">
                Screenshot proof ${requiresScreenshot ? '(required)' : '(optional)'}
                <input name="screenshot" type="file" accept="image/jpeg,image/png,image/gif,image/webp" ${requiresScreenshot ? 'required' : ''}>
                <small class="muted">JPG, PNG, GIF, or WEBP; maximum 10 MB.</small>
            </label>
            <button type="submit" class="btn btn--success btn--xl" data-submit-btn>
                <i class="bi bi-send"></i> Submit Work
            </button>
        </form>
    `;
}

function wireForms() {
    document.querySelectorAll('form.submit-form').forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const jobId = parseInt(form.getAttribute('data-job-id'), 10);
            const fd = new FormData(form);
            const btn = form.querySelector('[data-submit-btn]');
            btn.disabled = true; btn.innerHTML = '<i class="bi bi-hourglass"></i> Submitting…';
            try {
                const payload = new FormData();
                payload.append('description', String(fd.get('description') || '').trim());
                payload.append('external_link', String(fd.get('external_link') || '').trim());
                const screenshot = fd.get('screenshot');
                if (screenshot instanceof File && screenshot.size > 0) payload.append('screenshot', screenshot);
                await api.submitWork(jobId, payload);
                showFlash('Work submitted!', 'success');
                WorkerActiveJobsPage()();
            } catch (err) {
                showFlash(err.message || 'Failed to submit.', 'error');
            } finally {
                btn.disabled = false; btn.innerHTML = '<i class="bi bi-send"></i> Submit Work';
            }
        });
    });

    document.querySelectorAll('[data-cancel-assignment]').forEach(button => {
        button.addEventListener('click', async () => {
            const reason = prompt('Why do you need to cancel this assignment?');
            if (!reason || !reason.trim()) return;
            button.disabled = true;
            try {
                await api.workerCancelAssignment(button.dataset.cancelAssignment, { reason: reason.trim() });
                showFlash('Assignment cancelled and returned for reassignment.', 'success');
                WorkerActiveJobsPage()();
            } catch (error) {
                showFlash(error.message || 'Could not cancel assignment.', 'error');
                button.disabled = false;
            }
        });
    });
}

function formatDate(s) {
    if (!s) return '';
    try { return new Date(s.replace(' ', 'T') + 'Z').toLocaleString(); } catch { return s; }
}

function escapeHtml(s) {
    if (s === null || s === undefined) return '';
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
