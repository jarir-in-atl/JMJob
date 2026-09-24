// WorkerActiveJobsPage — jobs I'm currently working on, with job detail navigation and assignment status.
import { api } from '../api.js';
import { showFlash } from '../state.js';

let _state = { jobs: [], submissions: [], loading: false };

export function WorkerActiveJobsPage() {
    return async () => {
        const root = document.querySelector('[data-view]');
        if (!root) return;
        root.innerHTML = '';
        root.className = 'view view--worker-active';

        root.innerHTML = `
            <h1 class="page-title">Active Jobs</h1>
            <p class="muted active-jobs__intro"><strong>AVAILABLE TO APPLY</strong> Open job details to place your bid. Assigned workers can submit work from the job details page.</p>
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
        list.innerHTML = '<p class="muted">No activated or assigned jobs are available right now. New jobs appear here after admin activation.</p>';
        return;
    }

    list.innerHTML = _state.jobs.map(j => {
       const mySub = j.assignment_id
           ? _state.submissions.find(s => Number(s.assignment_id) === Number(j.assignment_id))
           : _state.submissions.find(s => s.job_id === j.id);
       const status = j.worker_state === 'available' ? 'available' : (j.assignment_status || j.status);
        const summary = String(j.description || '').trim();
        const remainingSlots = Number(j.remaining_workers ?? j.remaining_tasks_count ?? 0);
       return `
            <div class="active-job-card" data-id="${j.id}">
                <div class="active-job-card__head">
                    <div>
                        <h3>${escapeHtml(j.title)}</h3>
                       ${j.subtitle ? `<div class="muted">${escapeHtml(j.subtitle)}</div>` : ''}
                        ${summary ? `<p class="muted">${escapeHtml(summary.slice(0, 180))}${summary.length > 180 ? '…' : ''}</p>` : ''}
                        <div class="muted">Pay: ৳${parseFloat(j.cost_per_worker || j.budget || 0).toFixed(2)} · Available slots: ${remainingSlots} · Deadline: ${escapeHtml(j.deadline_at || 'None')}</div>
                    </div>
                    <span class="badge badge--status badge--${status}">${status.toUpperCase()}</span>
                </div>
                <div class="active-job-card__actions">
                    <a class="btn btn--primary btn--details" href="#/jobs/${encodeURIComponent(j.id)}">View job details</a>
                </div>
                ${mySub ? renderExistingSubmission(mySub) : ''}
                ${!mySub && j.assignment_id ? `<div class="active-job-card__actions"><button type="button" class="btn btn--ghost btn--sm" data-cancel-assignment="${j.assignment_id}">Request cancellation</button><small class="muted">Available before submitting work.</small></div>` : ''}
            </div>
        `;
    }).join('');

    wireForms();
}

function renderExistingSubmission(sub) {
    return `
        <div class="active-job-card__sub">
            <strong>Submitted:</strong> ${formatDate(sub.created_at)}
            <div class="muted">${escapeHtml((sub.description || '').slice(0, 200))}${(sub.description || '').length > 200 ? '…' : ''}</div>
            ${sub.status === 'pending_review' ? '<p class="muted">⏳ Awaiting poster review.</p>' : ''}
            ${sub.status === 'revision' ? '<p class="muted">🔄 Poster requested changes. Open job details to resubmit your work.</p>' : ''}
            ${sub.status === 'approved' ? '<p class="muted">✅ Approved! Payment has been released.</p>' : ''}
        </div>
    `;
}


function wireForms() {

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
