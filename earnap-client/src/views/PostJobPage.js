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

        // State holder for the 3-step wizard
        const state = {
            currentStep: 1,
            categories: [],
            // Step 1
            mainCategoryId: '',
            subCategoryId: '',
            // Step 2
            title: '',
            subtitle: '',
            description: '', // Task Instructions
            thumbnailBase64: '',
            proofRequirements: [
                { title: '', type: 'text' }
            ],
            // Step 3
            workerCount: 1,
            costPerWorker: 10,
            biddingValue: 3,
            biddingUnit: 'days',
            deadlineAt: '',
            feePercentage: 30 // Default 30% system fee
        };

        try {
            const response = await api.categories();
            state.categories = response.data || [];
        } catch (error) {
            showFlash(error.message || 'Could not load categories.', 'error');
        }

        renderWizard(root, state);
    };
}

function renderWizard(root, state) {
    root.innerHTML = `
        <a href="#/poster" class="back-link"><i class="bi bi-arrow-left"></i> Poster dashboard</a>
        <h1 class="page-title">Post a Job</h1>
        
        <!-- Step Indicator -->
        <div class="wizard-steps" style="display: flex; gap: 1rem; margin-bottom: 1.5rem; justify-content: space-between;">
            <div class="wizard-step ${state.currentStep === 1 ? 'active' : ''} ${state.currentStep > 1 ? 'completed' : ''}" style="flex: 1; padding: 0.75rem; background: ${state.currentStep === 1 ? 'var(--primary-light, #e0e7ff)' : '#f3f4f6'}; border-radius: 8px; text-align: center; font-weight: bold; color: ${state.currentStep === 1 ? 'var(--primary, #4f46e5)' : '#4b5563'};">
                1. Category Selection
            </div>
            <div class="wizard-step ${state.currentStep === 2 ? 'active' : ''} ${state.currentStep > 2 ? 'completed' : ''}" style="flex: 1; padding: 0.75rem; background: ${state.currentStep === 2 ? 'var(--primary-light, #e0e7ff)' : '#f3f4f6'}; border-radius: 8px; text-align: center; font-weight: bold; color: ${state.currentStep === 2 ? 'var(--primary, #4f46e5)' : '#4b5563'};">
                2. Job Details & Proofs
            </div>
            <div class="wizard-step ${state.currentStep === 3 ? 'active' : ''}" style="flex: 1; padding: 0.75rem; background: ${state.currentStep === 3 ? 'var(--primary-light, #e0e7ff)' : '#f3f4f6'}; border-radius: 8px; text-align: center; font-weight: bold; color: ${state.currentStep === 3 ? 'var(--primary, #4f46e5)' : '#4b5563'};">
                3. Workers & Pricing
            </div>
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

    container.querySelector('#step-cancel').addEventListener('click', handleCancel);

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

            <div style="margin-top: 1.5rem;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 0.5rem;">
                    <label style="margin:0; font-weight:bold;">Proof Requirements</label>
                    <button type="button" class="btn btn--sm btn--ghost" id="add-proof-btn"><i class="bi bi-plus-circle"></i> Add Requirement Pair</button>
                </div>
                <p class="muted" style="font-size:0.875rem;">Specify requirement title and whether worker provides Text Proof or Screenshot Proof.</p>

                <div id="proof-pairs-container">
                    ${state.proofRequirements.map((proof, idx) => `
                        <div class="proof-pair-row" style="display:flex; gap:0.5rem; align-items:center; margin-bottom:0.5rem;" data-index="${idx}">
                            <select class="proof-type-select" style="flex:1;">
                                <option value="text" ${proof.type === 'text' ? 'selected' : ''}>Text Proof</option>
                                <option value="screenshot" ${proof.type === 'screenshot' ? 'selected' : ''}>Screenshot Proof</option>
                            </select>
                            ${proof.type === 'screenshot' ? `
                                <div style="flex:2; display:flex; align-items:center; gap:0.5rem;">
                                    <input type="file" class="proof-file-input" accept="image/*" style="flex:1;">
                                    ${proof.fileBase64 ? `<img src="${proof.fileBase64}" style="max-height:40px; max-width:60px; border-radius:4px; border:1px solid #ccc;">` : ''}
                                </div>
                            ` : `
                                <input type="text" class="proof-title-input" placeholder="Proof Requirement Title (e.g. Provide Username)" value="${escapeHtml(proof.title || '')}" style="flex:2;" required>
                            `}
                            ${state.proofRequirements.length > 1 ? `
                                <button type="button" class="btn btn--ghost remove-proof-btn" data-index="${idx}" style="color:#ef4444;"><i class="bi bi-trash"></i></button>
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

    // Proof pairs logic
    const pairsContainer = container.querySelector('#proof-pairs-container');

    // Dynamic dropdown type change
    pairsContainer.addEventListener('change', (e) => {
        if (e.target.classList.contains('proof-type-select')) {
            saveStep2Inputs(container, state);
            renderStep2(container, root, state);
        } else if (e.target.classList.contains('proof-file-input')) {
            const row = e.target.closest('.proof-pair-row');
            const idx = Number(row.getAttribute('data-index'));
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (evt) => {
                    state.proofRequirements[idx].fileBase64 = evt.target.result;
                    state.proofRequirements[idx].title = file.name;
                    renderStep2(container, root, state);
                };
                reader.readAsDataURL(file);
            }
        }
    });

    container.querySelector('#add-proof-btn').addEventListener('click', () => {
        saveStep2Inputs(container, state);
        state.proofRequirements.push({ title: '', type: 'text' });
        renderStep2(container, root, state);
    });

    pairsContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.remove-proof-btn');
        if (btn) {
            const idx = Number(btn.getAttribute('data-index'));
            saveStep2Inputs(container, state);
            state.proofRequirements.splice(idx, 1);
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

    container.querySelector('#step-cancel').addEventListener('click', handleCancel);

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
    state.proofRequirements = Array.from(rows).map((row, idx) => {
        const type = row.querySelector('.proof-type-select')?.value || 'text';
        const titleInput = row.querySelector('.proof-title-input');
        const title = titleInput ? titleInput.value : (state.proofRequirements[idx]?.title || 'Screenshot Proof');
        const fileBase64 = state.proofRequirements[idx]?.fileBase64 || null;

        return {
            title,
            type,
            fileBase64
        };
    });
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

    container.querySelector('#step-cancel').addEventListener('click', handleCancel);

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
                            <a href="#/poster/jobs" class="btn btn--ghost">Go to My Jobs</a>
                        </div>
                    </div>
                `;
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

function handleCancel() {
    if (confirm('Are you sure you want to cancel posting this job?')) {
        navigate('/poster');
    }
}

function toSqlDate(value) {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 19).replace('T', ' ');
}

function hasPosterAccess() {
    const user = currentUser.get();
    return !!user && (user.is_admin || user.role === 'poster');
}

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
}
