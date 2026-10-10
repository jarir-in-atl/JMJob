// PostJobPage — 3-Step Wizard for posting a job as a poster.

import { api } from '../api.js';
import { currentUser, navigate, showFlash } from '../state.js';

export function PostJobPage() {
    return async () => {
        const root = document.querySelector('[data-view]');
        if (!root) return;
        root.innerHTML = '';
        root.className = 'view view--post-job';

        if (!hasPosterAccess()) {
            root.innerHTML = `<div class="card"><h2>Poster access required</h2><a class="btn btn--primary" href="#/">Go home</a></div>`;
            return;
        }

        root.innerHTML = `
            <div class="page-heading-row poster-post-job-heading">
                <div>
                    <h1 class="page-title">Post a Job</h1>
                    <p class="muted">Create a new job or manage jobs you have already submitted.</p>
                </div>
                <button class="btn btn--primary" type="button" id="post-job-open-form">
                    <i class="bi bi-plus-lg"></i> Post a Job
                </button>
            </div>

            <section class="card poster-posted-jobs" aria-labelledby="poster-posted-jobs-title">
                <div class="poster-posted-jobs__header">
                    <div>
                        <h2 id="poster-posted-jobs-title">Previously Posted Jobs</h2>
                        <p class="muted">Review each job's status, budget, and worker needs.</p>
                    </div>
                    <div class="poster-posted-jobs__tools">
                        <span class="poster-posted-jobs__count" id="poster-posted-jobs-count" aria-label="Number of jobs">0</span>
                        <button class="btn btn--ghost btn--sm" type="button" id="poster-posted-jobs-refresh">
                            <i class="bi bi-arrow-clockwise"></i> Refresh
                        </button>
                    </div>
                </div>
                <div class="stat-grid poster-task-summary">
                    <div class="stat-tile poster-task-summary__tile">
                        <i class="bi bi-person-check poster-stat-icon"></i>
                        <span class="muted">Tasks Given</span>
                        <strong data-task-summary="given">—</strong>
                    </div>
                    <div class="stat-tile poster-task-summary__tile">
                        <i class="bi bi-lightning-charge poster-stat-icon"></i>
                        <span class="muted">Tasks Running</span>
                        <strong data-task-summary="running">—</strong>
                    </div>
                    <div class="stat-tile poster-task-summary__tile">
                        <i class="bi bi-check2-circle poster-stat-icon"></i>
                        <span class="muted">Tasks Completed</span>
                        <strong data-task-summary="completed">—</strong>
                    </div>
                </div>
                <div id="poster-posted-jobs-list"><div class="spinner"></div></div>
            </section>

            <div class="modal poster-job-modal" id="post-job-modal" hidden aria-hidden="true">
                <div class="modal__backdrop" data-post-job-close></div>
                <section class="modal__content poster-job-modal__content" role="dialog" aria-modal="true" aria-labelledby="post-job-modal-title">
                    <button class="modal__close" type="button" data-post-job-close aria-label="Close post job form">×</button>
                    <div class="poster-job-modal__heading">
                        <span class="poster-job-modal__eyebrow">NEW LISTING</span>
                        <h2 id="post-job-modal-title">Post a Job</h2>
                        <p class="muted">Follow the steps to submit your job for review.</p>
                    </div>
                    <div id="poster-job-wizard"></div>
                </section>
            </div>
        `;

        let categories = null;
        let activeWizardState = null;
        let opening = false;
        const modal = root.querySelector('#post-job-modal');
        const wizardRoot = root.querySelector('#poster-job-wizard');
        const openButton = root.querySelector('#post-job-open-form');
        const refreshButton = root.querySelector('#poster-posted-jobs-refresh');

        const closeWizard = () => {
            modal.hidden = true;
            modal.setAttribute('aria-hidden', 'true');
            wizardRoot.innerHTML = '';
            activeWizardState = null;
            opening = false;
            openButton.focus();
        };

        const openWizard = async () => {
            if (opening) return;
            opening = true;
            modal.hidden = false;
            modal.setAttribute('aria-hidden', 'false');
            wizardRoot.innerHTML = '<div class="card poster-job-modal__loading"><div class="spinner"></div><p class="muted">Loading categories…</p></div>';
            modal.querySelector('.modal__close')?.focus();

            const wizardState = createWizardState();
            wizardState.closeModal = closeWizard;
            wizardState.refreshJobs = () => loadPostedJobs(root, openWizard);
            activeWizardState = wizardState;

            try {
                if (!categories) {
                    const response = await api.categories();
                    categories = response.data || [];
                }
                if (activeWizardState !== wizardState || !modal.isConnected) return;
                wizardState.categories = categories;
                renderWizard(wizardRoot, wizardState);
            } catch (error) {
                if (activeWizardState !== wizardState || !modal.isConnected) return;
                showFlash(error.message || 'Could not load categories.', 'error');
                wizardRoot.innerHTML = `
                    <div class="card poster-job-modal__loading">
                        <p>Could not load categories.</p>
                        <button class="btn btn--secondary" type="button" data-retry-categories>Try again</button>
                    </div>
                `;
                wizardRoot.querySelector('[data-retry-categories]')?.addEventListener('click', openWizard);
            } finally {
                if (activeWizardState === wizardState) opening = false;
            }
        };

        openButton.addEventListener('click', openWizard);
        refreshButton.addEventListener('click', () => loadPostedJobs(root, openWizard));
        modal.addEventListener('click', event => {
            if (event.target.closest('[data-post-job-close]')) closeWizard();
        });
        modal.addEventListener('keydown', event => {
            if (event.key === 'Escape') closeWizard();
        });

        await loadPostedJobs(root, openWizard);
    };
}

function createWizardState() {
    return {
        currentStep: 1,
        categories: [],
        mainCategoryId: '',
        subCategoryId: '',
        title: '',
        subtitle: '',
        description: '',
        thumbnailBase64: '',
        proofRequirements: [{ title: '', type: 'text' }],
        workerCount: 1,
        costPerWorker: 10,
        biddingValue: 3,
        biddingUnit: 'days',
        deadlineAt: '',
        feePercentage: 30
    };
}

async function loadPostedJobs(root, openWizard) {
    const list = root.querySelector('#poster-posted-jobs-list');
    const count = root.querySelector('#poster-posted-jobs-count');
    const refreshButton = root.querySelector('#poster-posted-jobs-refresh');
    if (!list) return;

    list.innerHTML = '<div class="card poster-posted-jobs__loading"><div class="spinner"></div><p class="muted">Loading your jobs…</p></div>';
    if (refreshButton) refreshButton.disabled = true;

    try {
        const response = await api.posterMyJobs();
        const jobs = Array.isArray(response.data) ? response.data : [];
        if (count) count.textContent = String(jobs.length);
        updateTaskSummary(root, jobs);

        if (!jobs.length) {
            list.innerHTML = `
                <div class="poster-posted-jobs__empty">
                    <span class="poster-posted-jobs__empty-icon"><i class="bi bi-briefcase"></i></span>
                    <strong>No jobs have been posted yet.</strong>
                    <span>Your submitted jobs will appear in this table.</span>
                    <button class="btn btn--primary btn--sm" type="button" data-post-first-job><i class="bi bi-plus-lg"></i> Post your first job</button>
                </div>
            `;
            list.querySelector('[data-post-first-job]')?.addEventListener('click', openWizard);
            return;
        }

        list.innerHTML = `
            <div class="poster-posted-jobs__table-wrap">
                <table class="poster-posted-jobs__table">
                    <thead><tr>
                        <th scope="col">Job</th>
                        <th scope="col">Job Status</th>
                        <th scope="col">Worker Progress</th>
                        <th scope="col">Total Cost</th>
                        <th scope="col">Posted</th>
                        <th scope="col">Actions</th>
                    </tr></thead>
                    <tbody>
                        ${jobs.map(renderPostedJobRow).join('')}
                    </tbody>
                </table>
            </div>
        `;
        list.querySelectorAll('[data-poster-manage-job]').forEach(button => {
            button.addEventListener('click', () => navigate(`/poster/jobs/${Number(button.dataset.posterManageJob)}`));
        });
    } catch {
        if (count) count.textContent = '—';
        updateTaskSummary(root, null);
        list.innerHTML = `
            <div class="poster-posted-jobs__error">
                <i class="bi bi-exclamation-circle"></i>
                <strong>Could not load your jobs.</strong>
                <button class="btn btn--ghost btn--sm" type="button" data-retry-posted-jobs>Try again</button>
            </div>
        `;
        list.querySelector('[data-retry-posted-jobs]')?.addEventListener('click', () => loadPostedJobs(root, openWizard));
    } finally {
        if (refreshButton) refreshButton.disabled = false;
    }
}

function updateTaskSummary(root, jobs) {
    const totals = { given: 0, running: 0, completed: 0 };
    if (Array.isArray(jobs)) {
        jobs.forEach(job => {
            totals.given += workerCount(job.assigned_workers_count);
            totals.running += workerCount(job.in_progress_workers);
            totals.completed += workerCount(job.completed_workers_count);
        });
    }

    root.querySelectorAll('[data-task-summary]').forEach(card => {
        const key = card.dataset.taskSummary;
        card.textContent = Array.isArray(jobs) && Object.prototype.hasOwnProperty.call(totals, key) ? String(totals[key]) : '—';
    });
}

function renderPostedJobRow(job) {
    const status = String(job.status || 'unknown');
    const statusLabel = {
        pending_approval: 'Pending Approval',
        open: 'Active',
        in_review: 'In Review',
        assigned: 'Assigned',
        submitted: 'Submitted',
        revision: 'Revision Requested',
        completed: 'Completed',
        declined: 'Declined',
        cancelled: 'Cancelled',
        disputed: 'Disputed',
        expired: 'Expired',
    }[status] || label(status);
    const statusClass = {
        pending_approval: 'badge--pending_approval',
        submitted: 'badge--pending_review',
        declined: 'badge--rejected',
        disputed: 'badge--revision',
        expired: 'badge--cancelled',
    }[status] || `badge--${status.replace(/[^a-z0-9_-]/gi, '')}`;
    const totalCost = Number(job.total_payable_amount || job.budget || 0);
    const jobId = Number(job.id) || 0;
    const needed = Math.max(1, workerCount(job.worker_count, 1));
    const engaged = workerCount(job.active_workers_count);
    const assigned = workerCount(job.assigned_workers_count);
    const working = workerCount(job.in_progress_workers);
    const awaitingReview = workerCount(job.pending_review_workers);
    const revision = workerCount(job.revision_workers);
    const rejected = workerCount(job.rejected_workers);
    const completed = workerCount(job.completed_workers_count);
    const cancelled = workerCount(job.cancelled_workers);
    const remaining = workerCount(job.remaining_tasks_count, Math.max(0, needed - assigned));
    const progress = Math.min(100, Math.round((engaged / needed) * 100));
    const titleMarkup = job.title
        ? `<strong class="poster-posted-jobs__job-title" data-i18n-ignore>${escapeHtml(job.title)}</strong>`
        : '<strong class="poster-posted-jobs__job-title">Untitled job</strong>';
    const subtitle = String(job.subtitle || '').trim();
    const workerMetrics = [
        ['Assigned', assigned],
        ['Working', working],
        ['Awaiting Review', awaitingReview],
        ['Revision', revision],
        ['Rejected', rejected],
        ['Completed', completed],
        ['Cancelled', cancelled],
        ['Slots left', remaining],
    ];

    return `
        <tr>
            <td class="poster-posted-jobs__job-cell">
                ${titleMarkup}
                ${subtitle ? `<small class="poster-posted-jobs__subtitle" data-i18n-ignore>${escapeHtml(subtitle)}</small>` : ''}
            </td>
            <td><span class="badge badge--status ${statusClass}">${escapeHtml(statusLabel)}</span></td>
            <td class="poster-posted-jobs__worker-cell">
                <div class="poster-worker-progress__summary">
                    <span><span>Engaged</span> <strong>${engaged}</strong> / <span>Needed</span> <strong>${needed}</strong></span>
                    <strong>${progress}%</strong>
                </div>
                <div class="poster-worker-progress__bar" role="progressbar" aria-label="Worker engagement" aria-valuemin="0" aria-valuemax="${needed}" aria-valuenow="${Math.min(engaged, needed)}">
                    <span style="width:${progress}%"></span>
                </div>
                <div class="poster-worker-progress__metrics">
                    ${workerMetrics.map(([metricLabel, count]) => `
                        <span class="poster-worker-progress__metric">
                            <small>${metricLabel}</small>
                            <strong>${count}</strong>
                        </span>
                    `).join('')}
                </div>
            </td>
            <td><strong>${escapeHtml(job.currency || 'BDT')} ${totalCost.toFixed(2)}</strong></td>
            <td>${escapeHtml(formatPostedDate(job.created_at))}</td>
            <td><button class="btn btn--ghost btn--sm" type="button" data-poster-manage-job="${jobId}">Manage Job</button></td>
        </tr>
    `;
}

function workerCount(value, fallback = 0) {
    const count = Number(value);
    return Number.isFinite(count) && count >= 0 ? Math.floor(count) : fallback;
}

function label(value) {
    return String(value || '').replace(/_/g, ' ').replace(/\b\w/g, character => character.toUpperCase());
}

function formatPostedDate(value) {
    if (!value) return '—';
    const date = new Date(String(value).replace(' ', 'T') + 'Z');
    return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function renderWizard(root, state) {
    root.innerHTML = `
        <div class="poster-wizard-steps" aria-label="Job posting steps">
            <div class="poster-wizard-step ${state.currentStep === 1 ? 'is-active' : ''} ${state.currentStep > 1 ? 'is-complete' : ''}"><span>1</span><strong>Category Selection</strong></div>
            <div class="poster-wizard-step ${state.currentStep === 2 ? 'is-active' : ''} ${state.currentStep > 2 ? 'is-complete' : ''}"><span>2</span><strong>Job Details & Proofs</strong></div>
            <div class="poster-wizard-step ${state.currentStep === 3 ? 'is-active' : ''}"><span>3</span><strong>Workers & Pricing</strong></div>
        </div>

        <div class="card" id="wizard-card-body">
            <!-- Step content dynamically rendered here -->
        </div>
    `;

    updateStepView(root, state);
}

function updateStepView(root, state) {
    const cardBody = root.querySelector('#wizard-card-body');
    if (!cardBody) return;

    if (state.currentStep === 1) {
        renderStep1(cardBody, root, state);
    } else if (state.currentStep === 2) {
        renderStep2(cardBody, root, state);
    } else if (state.currentStep === 3) {
        renderStep3(cardBody, root, state);
    }
}

// -----------------------------------------------------------------------------
// STEP 1: Category Selection
// -----------------------------------------------------------------------------
function renderStep1(container, root, state) {
    const selectedCategory = state.categories.find(c => Number(c.id) === Number(state.mainCategoryId));
    const subcategories = selectedCategory ? (selectedCategory.subcategories || []) : [];

    container.innerHTML = `
        <form id="step-1-form" class="poster-form">
            <h2>Step 1: Select Category</h2>
            
            <label>Main Category
                <select id="main-category-select" required>
                    <option value="">Choose Main Category…</option>
                    ${state.categories.map(c => `
                        <option value="${c.id}" ${Number(state.mainCategoryId) === Number(c.id) ? 'selected' : ''}>
                            ${escapeHtml(c.name)}
                        </option>
                    `).join('')}
                </select>
            </label>

            <label>Sub Category
                <select id="sub-category-select" ${!selectedCategory ? 'disabled' : ''}>
                    <option value="">Choose Sub Category (Optional)…</option>
                    ${subcategories.map(s => `
                        <option value="${s.id}" ${Number(state.subCategoryId) === Number(s.id) ? 'selected' : ''}>
                            ${escapeHtml(s.name)}
                        </option>
                    `).join('')}
                </select>
            </label>

            <div class="poster-form__actions" style="margin-top: 1.5rem; display: flex; justify-content: space-between;">
                <button type="button" class="btn btn--ghost" id="step-cancel">Cancel</button>
                <button type="submit" class="btn btn--primary" id="step-1-next">Next <i class="bi bi-arrow-right"></i></button>
            </div>
        </form>
    `;

    const mainSelect = container.querySelector('#main-category-select');
    const subSelect = container.querySelector('#sub-category-select');

    mainSelect.addEventListener('change', (e) => {
        state.mainCategoryId = e.target.value;
        state.subCategoryId = ''; // reset subcategory on main category change
        renderStep1(container, root, state);
    });

    subSelect.addEventListener('change', (e) => {
        state.subCategoryId = e.target.value;
    });

    container.querySelector('#step-cancel').addEventListener('click', () => handleCancel(state));

    container.querySelector('#step-1-form').addEventListener('submit', (e) => {
        e.preventDefault();
        if (!state.mainCategoryId) {
            showFlash('Please select a main category.', 'error');
            return;
        }

        const cat = state.categories.find(c => Number(c.id) === Number(state.mainCategoryId));
        let minCost = cat ? Number(cat.min_cost || 1.00) : 1.00;
        if (state.subCategoryId && cat && cat.subcategories) {
            const sub = cat.subcategories.find(s => Number(s.id) === Number(state.subCategoryId));
            if (sub && sub.min_cost) {
                minCost = Number(sub.min_cost);
            }
        }
        state.minCost = minCost;
        if (state.costPerWorker < state.minCost) {
            state.costPerWorker = state.minCost;
        }

        state.currentStep = 2;
        renderWizard(root, state);
    });
}

// -----------------------------------------------------------------------------
// STEP 2: Job Title, Task Instructions, Thumbnail & Proof Requirements
// -----------------------------------------------------------------------------
function renderStep2(container, root, state) {
    const hasScreenshot = state.proofRequirements.some(p => p.type === 'screenshot');
    const hasText = state.proofRequirements.some(p => p.type === 'text');

    container.innerHTML = `
        <form id="step-2-form" class="poster-form">
            <h2>Step 2: Job Details & Proof Requirements</h2>

            <label>Job Title
                <input id="job-title-input" type="text" maxlength="160" required placeholder="e.g. Design a modern business logo" value="${escapeHtml(state.title)}">
            </label>

            <label>Job Subtitle (Optional)
                <input id="job-subtitle-input" type="text" maxlength="255" placeholder="Short summary shown on job cards" value="${escapeHtml(state.subtitle)}">
            </label>

            <label>Task Instructions (Description)
                <textarea id="job-desc-input" rows="5" required placeholder="Explain step by step instructions for workers…">${escapeHtml(state.description)}</textarea>
            </label>

            <label>Thumbnail Image Upload (Optional)
                <input id="job-thumbnail-input" type="file" accept="image/*">
                ${state.thumbnailBase64 ? `<div style="margin-top:0.5rem;"><img src="${state.thumbnailBase64}" style="max-height:80px; border-radius:4px; border:1px solid #ccc;"></div>` : ''}
            </label>

            <div style="margin-top: 1.5rem; padding: 1.25rem; background: var(--bg-secondary, #f8fafc); border: 1px solid var(--border-color, #e2e8f0); border-radius: 8px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 0.5rem; flex-wrap:wrap; gap:8px;">
                    <div>
                        <div style="font-weight:600; font-size:14px;"><i class="bi bi-shield-check"></i> Proof Requirements</div>
                        <span class="muted" style="font-size:12px;">Choose whether proof will take images only, texts only, or both pairs of images and texts.</span>
                    </div>
                    <button type="button" class="btn btn--sm btn--ghost" id="add-proof-btn"><i class="bi bi-plus-circle"></i> Add Requirement Pair</button>
                </div>

                <!-- Quick Mode Presets -->
                <div class="proof-mode-presets" style="display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap;">
                    <button type="button" class="btn btn--sm ${hasScreenshot && !hasText ? 'btn--primary' : 'btn--outline'}" id="poster-mode-images"><i class="bi bi-image"></i> Images only</button>
                    <button type="button" class="btn btn--sm ${hasText && !hasScreenshot ? 'btn--primary' : 'btn--outline'}" id="poster-mode-texts"><i class="bi bi-file-text"></i> Texts only</button>
                    <button type="button" class="btn btn--sm ${hasScreenshot && hasText ? 'btn--primary' : 'btn--outline'}" id="poster-mode-both"><i class="bi bi-collection"></i> Both (Images & Texts)</button>
                </div>

                <div id="proof-pairs-container">
                    ${state.proofRequirements.map((proof, idx) => `
                        <div class="proof-pair-row" style="display:flex; gap:0.5rem; align-items:center; margin-bottom:0.5rem; flex-wrap:wrap;" data-index="${idx}">
                            <select class="proof-type-select" style="min-width: 150px;">
                                <option value="screenshot" ${proof.type === 'screenshot' ? 'selected' : ''}>📷 Screenshot Proof</option>
                                <option value="text" ${proof.type === 'text' ? 'selected' : ''}>📝 Text Proof</option>
                            </select>
                            <input type="text" class="proof-title-input" placeholder="${proof.type === 'screenshot' ? 'Screenshot requirement (e.g. Upload payment screenshot)' : 'Text requirement (e.g. Provide account username)'}" value="${escapeHtml(proof.title || '')}" style="flex:2; min-width: 180px;" required>
                            ${proof.type === 'screenshot' ? `
                                <div style="display:flex; align-items:center; gap:0.5rem;">
                                    <label class="btn btn--ghost btn--sm" style="margin:0; cursor:pointer; font-size:12px; white-space:nowrap;" title="Upload sample reference image for worker (optional)">
                                        <i class="bi bi-upload"></i> Sample image
                                        <input type="file" class="proof-file-input" accept="image/*" style="display:none;">
                                    </label>
                                    ${proof.fileBase64 || proof.image_url ? `<img src="${proof.fileBase64 || proof.image_url}" style="max-height:36px; max-width:50px; border-radius:4px; border:1px solid #ccc; object-fit:contain;">` : ''}
                                </div>
                            ` : ''}
                            ${state.proofRequirements.length > 1 ? `
                                <button type="button" class="btn btn--ghost remove-proof-btn" data-index="${idx}" style="color:#ef4444;" title="Remove requirement"><i class="bi bi-trash"></i></button>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="poster-form__actions" style="margin-top: 1.5rem; display: flex; justify-content: space-between;">
                <div>
                    <button type="button" class="btn btn--ghost" id="step-2-back"><i class="bi bi-arrow-left"></i> Back</button>
                    <button type="button" class="btn btn--ghost" id="step-cancel">Cancel</button>
                </div>
                <button type="submit" class="btn btn--primary" id="step-2-next">Next <i class="bi bi-arrow-right"></i></button>
            </div>
        </form>
    `;

    // Mode preset button events
    container.querySelector('#poster-mode-images')?.addEventListener('click', () => {
        saveStep2Inputs(container, state);
        state.proofRequirements = [{ title: 'Screenshot Proof', type: 'screenshot' }];
        renderStep2(container, root, state);
    });
    container.querySelector('#poster-mode-texts')?.addEventListener('click', () => {
        saveStep2Inputs(container, state);
        state.proofRequirements = [{ title: 'Written Text Proof', type: 'text' }];
        renderStep2(container, root, state);
    });
    container.querySelector('#poster-mode-both')?.addEventListener('click', () => {
        saveStep2Inputs(container, state);
        state.proofRequirements = [
            { title: 'Written Proof (e.g. Account username / ID)', type: 'text' },
            { title: 'Screenshot Proof (e.g. Completed task screenshot)', type: 'screenshot' }
        ];
        renderStep2(container, root, state);
    });

    // Proof pairs logic
    const pairsContainer = container.querySelector('#proof-pairs-container');

    // Dynamic dropdown type change
    pairsContainer.addEventListener('change', (e) => {
        if (e.target.classList.contains('proof-type-select')) {
            const row = e.target.closest('.proof-pair-row');
            const idx = Number(row.getAttribute('data-index'));
            saveStep2Inputs(container, state);
            state.proofRequirements[idx].type = e.target.value;
            renderStep2(container, root, state);
        } else if (e.target.classList.contains('proof-file-input')) {
            const row = e.target.closest('.proof-pair-row');
            const idx = Number(row.getAttribute('data-index'));
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (evt) => {
                    saveStep2Inputs(container, state);
                    state.proofRequirements[idx].fileBase64 = evt.target.result;
                    if (!state.proofRequirements[idx].title) {
                        state.proofRequirements[idx].title = 'Screenshot Proof';
                    }
                    renderStep2(container, root, state);
                };
                reader.readAsDataURL(file);
            }
        }
    });

    container.querySelector('#add-proof-btn').addEventListener('click', () => {
        saveStep2Inputs(container, state);
        const lastType = state.proofRequirements[state.proofRequirements.length - 1]?.type;
        const newType = lastType === 'screenshot' ? 'text' : 'screenshot';
        state.proofRequirements.push({ title: '', type: newType });
        renderStep2(container, root, state);
    });

    pairsContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.remove-proof-btn');
        if (btn) {
            const idx = Number(btn.getAttribute('data-index'));
            saveStep2Inputs(container, state);
            state.proofRequirements.splice(idx, 1);
            if (state.proofRequirements.length === 0) {
                state.proofRequirements.push({ title: 'Screenshot Proof', type: 'screenshot' });
            }
            renderStep2(container, root, state);
        }
    });

    // File input thumbnail
    const thumbInput = container.querySelector('#job-thumbnail-input');
    thumbInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (evt) => {
                state.thumbnailBase64 = evt.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    container.querySelector('#step-cancel').addEventListener('click', () => handleCancel(state));

    container.querySelector('#step-2-back').addEventListener('click', () => {
        saveStep2Inputs(container, state);
        state.currentStep = 1;
        renderWizard(root, state);
    });

    container.querySelector('#step-2-form').addEventListener('submit', (e) => {
        e.preventDefault();
        saveStep2Inputs(container, state);

        if (!state.title.trim()) {
            showFlash('Job title is required.', 'error');
            return;
        }
        if (!state.description.trim()) {
            showFlash('Task instructions are required.', 'error');
            return;
        }

        state.currentStep = 3;
        renderWizard(root, state);
    });
}

function saveStep2Inputs(container, state) {
    state.title = container.querySelector('#job-title-input')?.value || '';
    state.subtitle = container.querySelector('#job-subtitle-input')?.value || '';
    state.description = container.querySelector('#job-desc-input')?.value || '';

    const rows = container.querySelectorAll('.proof-pair-row');
    if (rows.length > 0) {
        state.proofRequirements = Array.from(rows).map((row, idx) => {
            const type = row.querySelector('.proof-type-select')?.value || 'screenshot';
            const titleInput = row.querySelector('.proof-title-input');
            const title = titleInput ? titleInput.value.trim() : (state.proofRequirements[idx]?.title || (type === 'screenshot' ? 'Screenshot Proof' : 'Text Proof'));
            const fileBase64 = state.proofRequirements[idx]?.fileBase64 || null;
            const imageUrl = state.proofRequirements[idx]?.image_url || null;

            return {
                title,
                type,
                fileBase64,
                image_url: imageUrl
            };
        });
    }
}

// -----------------------------------------------------------------------------
// STEP 3: Workers Needed, Cost Per Worker, Bidding Window, Deadline & Dynamic Fee
// -----------------------------------------------------------------------------
function renderStep3(container, root, state) {
    const subtotal = Number(state.workerCount || 0) * Number(state.costPerWorker || 0);
    const systemFee = subtotal * (state.feePercentage / 100);
    const totalCost = subtotal + systemFee;

    container.innerHTML = `
        <form id="step-3-form" class="poster-form">
            <h2>Step 3: Workers & Pricing</h2>

            <div class="poster-form__grid">
                <label>Workers Needed
                    <input id="worker-count-input" type="number" min="1" step="1" required value="${state.workerCount}">
                </label>

                <label>Cost Per Worker (৳)
                    <input id="cost-per-worker-input" type="number" min="${state.minCost}" step="0.01" required value="${Math.max(state.costPerWorker, state.minCost)}">
                    <small class="muted">Minimum cost per worker for selected category: ৳${Number(state.minCost).toFixed(2)}</small>
                </label>
            </div>

            <div class="poster-form__grid" style="margin-top: 1rem;">
                <label>
                    <span class="poster-form__label-head">
                        Bidding Window
                        <i class="bi bi-info-circle" title="Set 0 for unlimited" style="color: var(--muted, #6b7280); cursor: help; font-weight: normal; font-size: 14px;"></i>
                    </span>
                    <div class="poster-form__input-group">
                        <input id="bidding-val-input" type="number" min="0" step="any" value="${state.biddingValue}" required>
                        <select id="bidding-unit-input">
                            <option value="minutes" ${state.biddingUnit === 'minutes' ? 'selected' : ''}>Minutes</option>
                            <option value="hours" ${state.biddingUnit === 'hours' ? 'selected' : ''}>Hours</option>
                            <option value="days" ${state.biddingUnit === 'days' ? 'selected' : ''}>Days</option>
                            <option value="months" ${state.biddingUnit === 'months' ? 'selected' : ''}>Months</option>
                        </select>
                    </div>
                </label>

                <label>Deadline (Optional)
                    <input id="deadline-input" type="datetime-local" value="${state.deadlineAt}">
                </label>
            </div>

            <!-- Fee Calculation Summary Box -->
            <div class="fee-calculation-box" style="margin-top: 1.5rem; padding: 1rem; background: var(--card-bg, #f9fafb); border: 1px solid var(--border-color, #e5e7eb); border-radius: 8px;">
                <h3 style="margin-top:0; font-size:1.1rem; border-bottom:1px solid #e5e7eb; padding-bottom:0.5rem;">Fee Breakdown</h3>
                <div style="display:flex; justify-space-between; margin-bottom:0.5rem;">
                    <span>Subtotal (${state.workerCount} workers × ৳${Number(state.costPerWorker).toFixed(2)}):</span>
                    <strong id="summary-subtotal">৳${subtotal.toFixed(2)}</strong>
                </div>
                <div style="display:flex; justify-space-between; margin-bottom:0.5rem;">
                    <span>System Fee (${state.feePercentage}%):</span>
                    <strong id="summary-fee">৳${systemFee.toFixed(2)}</strong>
                </div>
                <div style="display:flex; justify-space-between; font-size:1.15rem; color:var(--primary, #4f46e5); border-top:1px solid #e5e7eb; padding-top:0.5rem;">
                    <span>Total Cost:</span>
                    <strong id="summary-total">৳${totalCost.toFixed(2)}</strong>
                </div>
            </div>

            <div class="poster-form__actions" style="margin-top: 1.5rem; display: flex; justify-content: space-between;">
                <div>
                    <button type="button" class="btn btn--ghost" id="step-3-back"><i class="bi bi-arrow-left"></i> Back</button>
                    <button type="button" class="btn btn--ghost" id="step-cancel">Cancel</button>
                </div>
                <button type="submit" class="btn btn--primary btn--xl" id="post-job-publish">Publish Job</button>
            </div>
        </form>
    `;

    const workerInput = container.querySelector('#worker-count-input');
    const costInput = container.querySelector('#cost-per-worker-input');

    const updateCalculations = () => {
        state.workerCount = Math.max(1, parseInt(workerInput.value, 10) || 1);
        state.costPerWorker = Math.max(0, parseFloat(costInput.value) || 0);

        const sub = state.workerCount * state.costPerWorker;
        const fee = sub * (state.feePercentage / 100);
        const tot = sub + fee;

        container.querySelector('#summary-subtotal').textContent = `৳${sub.toFixed(2)}`;
        container.querySelector('#summary-fee').textContent = `৳${fee.toFixed(2)}`;
        container.querySelector('#summary-total').textContent = `৳${tot.toFixed(2)}`;
    };

    workerInput.addEventListener('input', updateCalculations);
    costInput.addEventListener('input', updateCalculations);

    container.querySelector('#step-cancel').addEventListener('click', () => handleCancel(state));

    container.querySelector('#step-3-back').addEventListener('click', () => {
        saveStep3Inputs(container, state);
        state.currentStep = 2;
        renderWizard(root, state);
    });

    container.querySelector('#step-3-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        saveStep3Inputs(container, state);

        const submitBtn = container.querySelector('#post-job-publish');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Publishing…';

        let windowHours = 0;
        const val = Number(state.biddingValue || 0);
        if (val > 0) {
            if (state.biddingUnit === 'minutes') windowHours = val / 60;
            else if (state.biddingUnit === 'hours') windowHours = val;
            else if (state.biddingUnit === 'days') windowHours = val * 24;
            else if (state.biddingUnit === 'months') windowHours = val * 24 * 30;
        }

        try {
            const res = await api.posterCreateJob({
                category_id: Number(state.mainCategoryId),
                subcategory_id: state.subCategoryId ? Number(state.subCategoryId) : null,
                title: state.title.trim(),
                subtitle: state.subtitle.trim(),
                description: state.description.trim(),
                thumbnail: state.thumbnailBase64 || null,
                proof_requirements: state.proofRequirements,
                worker_count: Number(state.workerCount),
                cost_per_worker: Number(state.costPerWorker),
                budget: Number(state.workerCount) * Number(state.costPerWorker),
                deadline_at: toSqlDate(state.deadlineAt),
                bidding_window_hours: windowHours,
            });

            state.refreshJobs?.();
            showFlash('Job submitted for admin review.', 'success');
            
            const user = currentUser.get();
            const username = user ? (user.username || user.name || 'User') : 'User';
            const jobId = res?.data?.id || '';
            const jobLink = `${window.location.origin}/#/poster/jobs/${jobId}`;
            const message = `I, the user ${username}, has submitted this job ${jobLink} for publishing. Let's talk about payment and approval`;
            const waUrl = `https://wa.me/8801775722083?text=${encodeURIComponent(message)}`;

            const cardBody = root.querySelector('#wizard-card-body');
            if (cardBody) {
                cardBody.innerHTML = `
                    <div style="text-align:center; padding: 2rem 1rem;">
                        <div style="font-size:3rem; color:#f59e0b; margin-bottom:1rem;"><i class="bi bi-clock-history"></i></div>
                        <h2 style="margin-bottom:0.5rem;">Job Submitted & Pending Approval</h2>
                        <p class="muted" style="max-width:500px; margin:0 auto 1.5rem;">Your job has been submitted to the admin panel for review. Contact the admin on WhatsApp to talk about payment and job approval.</p>
                        
                        <div style="margin-bottom:1.5rem;">
                            <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn btn--primary btn--xl" style="background:#25D366; border-color:#25D366; color:#fff; display:inline-flex; align-items:center; gap:0.5rem; text-decoration:none;">
                                <i class="bi bi-whatsapp" style="font-size:1.25rem;"></i> Contact Whatsapp
                            </a>
                        </div>

                        <div>
                            <button type="button" class="btn btn--ghost" data-post-job-done>Return to posted jobs</button>
                        </div>
                    </div>
                `;
                cardBody.querySelector('[data-post-job-done]')?.addEventListener('click', () => state.closeModal?.());
            }
        } catch (error) {
            showFlash(error.message || 'Could not publish job.', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Publish Job';
        }
    });
}

function saveStep3Inputs(container, state) {
    state.workerCount = Number(container.querySelector('#worker-count-input')?.value || 1);
    state.costPerWorker = Number(container.querySelector('#cost-per-worker-input')?.value || 0);
    state.biddingValue = Number(container.querySelector('#bidding-val-input')?.value || 0);
    state.biddingUnit = container.querySelector('#bidding-unit-input')?.value || 'days';
    state.deadlineAt = container.querySelector('#deadline-input')?.value || '';
}

function handleCancel(state) {
    if (confirm('Are you sure you want to cancel posting this job?')) {
        if (typeof state?.closeModal === 'function') state.closeModal();
        else navigate('/poster');
    }
}

function toSqlDate(value) {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 19).replace('T', ' ');
}

function hasPosterAccess() {
    const user = currentUser.get();
    return !!user;
}

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
}
