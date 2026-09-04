// JobsAvailablePage — workers browse, filter, sort, and page through open jobs.
import { api } from '../api.js';
import { navigate } from '../state.js';

let _state = {
    jobs: [],
    categories: [],
    loading: false,
    search: '',
    categoryId: '',
    minBudget: '',
    maxBudget: '',
    sort: 'latest',
    page: 1,
    perPage: 12,
    total: 0,
    lastPage: 1,
    requestSerial: 0,
};

export function JobsAvailablePage() {
    return async () => {
        const root = document.querySelector('[data-view]');
        if (!root) return;
        root.innerHTML = '';
        root.className = 'view view--jobs-available';

        root.innerHTML = `
            <h1 class="page-title">Browse Jobs</h1>
            <p class="muted">Find work that matches your skills. Place a bid to get started.</p>

            <div class="card jobs-filters">
                <div class="jobs-filters__row">
                    <label class="jobs-filters__field jobs-filters__field--search">
                        <span>Search</span>
                        <input type="search" class="jobs-filters__search" id="jobs-search" maxlength="80" placeholder="Search jobs…" value="${escapeHtml(_state.search)}">
                    </label>
                    <label class="jobs-filters__field">
                        <span>Category</span>
                        <select class="jobs-filters__select" id="jobs-category">
                            ${categoryOptions()}
                        </select>
                    </label>
                    <label class="jobs-filters__field jobs-filters__field--amount">
                        <span>Min budget</span>
                        <input type="number" min="0" step="0.01" inputmode="decimal" id="jobs-min-budget" placeholder="৳0" value="${escapeHtml(_state.minBudget)}">
                    </label>
                    <label class="jobs-filters__field jobs-filters__field--amount">
                        <span>Max budget</span>
                        <input type="number" min="0" step="0.01" inputmode="decimal" id="jobs-max-budget" placeholder="No limit" value="${escapeHtml(_state.maxBudget)}">
                    </label>
                    <label class="jobs-filters__field">
                        <span>Sort by</span>
                        <select class="jobs-filters__select" id="jobs-sort">
                            <option value="latest" ${_state.sort === 'latest' ? 'selected' : ''}>Newest first</option>
                            <option value="budget_low" ${_state.sort === 'budget_low' ? 'selected' : ''}>Lowest budget</option>
                            <option value="budget_high" ${_state.sort === 'budget_high' ? 'selected' : ''}>Highest budget</option>
                            <option value="closing" ${_state.sort === 'closing' ? 'selected' : ''}>Closing soon</option>
                        </select>
                    </label>
                    <div class="jobs-filters__actions">
                        <button class="btn btn--primary" id="jobs-apply">Apply filters</button>
                        <button class="btn btn--secondary" id="jobs-reset" type="button">Reset</button>
                    </div>
                </div>
            </div>

            <div class="jobs-results-meta muted" id="jobs-results-meta"></div>
            <div class="jobs-grid" id="jobs-grid">
                <div class="spinner"></div>
            </div>
            <nav class="jobs-pagination" id="jobs-pagination" aria-label="Job pages"></nav>
        `;

        if (_state.categories.length === 0) {
            try {
                const response = await api.categories();
                _state.categories = Array.isArray(response.data) ? response.data : [];
                const select = document.getElementById('jobs-category');
                if (select) select.innerHTML = categoryOptions();
            } catch (error) {
                // Jobs remain usable if category loading fails.
            }
        }

        document.getElementById('jobs-apply')?.addEventListener('click', () => {
            readFilterControls();
            _state.page = 1;
            loadJobs();
        });
        document.getElementById('jobs-reset')?.addEventListener('click', () => {
            _state.search = '';
            _state.categoryId = '';
            _state.minBudget = '';
            _state.maxBudget = '';
            _state.sort = 'latest';
            _state.page = 1;
            syncFilterControls();
            loadJobs();
        });
        document.getElementById('jobs-search')?.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') document.getElementById('jobs-apply')?.click();
        });

        await loadJobs();
    };
}

function categoryOptions() {
    return '<option value="">All categories</option>' + _state.categories
        .map(category => `<option value="${escapeHtml(category.id)}" ${String(category.id) === String(_state.categoryId) ? 'selected' : ''}>${escapeHtml(category.name)}</option>`)
        .join('');
}

function readFilterControls() {
    _state.search = document.getElementById('jobs-search')?.value.trim() || '';
    _state.categoryId = document.getElementById('jobs-category')?.value || '';
    _state.minBudget = document.getElementById('jobs-min-budget')?.value.trim() || '';
    _state.maxBudget = document.getElementById('jobs-max-budget')?.value.trim() || '';
    _state.sort = document.getElementById('jobs-sort')?.value || 'latest';
}

function syncFilterControls() {
    const values = {
        'jobs-search': _state.search,
        'jobs-category': _state.categoryId,
        'jobs-min-budget': _state.minBudget,
        'jobs-max-budget': _state.maxBudget,
        'jobs-sort': _state.sort,
    };
    Object.entries(values).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.value = value;
    });
}

async function loadJobs() {
    const grid = document.getElementById('jobs-grid');
    if (!grid) return;
    const serial = ++_state.requestSerial;
    _state.loading = true;
    grid.innerHTML = '<div class="spinner"></div>';
    try {
        const params = {
            page: _state.page,
            per_page: _state.perPage,
            sort: _state.sort,
        };
        if (_state.search) params.search = _state.search;
        if (_state.categoryId) params.category_id = _state.categoryId;
        if (_state.minBudget !== '') params.min_budget = _state.minBudget;
        if (_state.maxBudget !== '') params.max_budget = _state.maxBudget;

        const response = await api.jobs(params);
        if (serial !== _state.requestSerial) return;
        _state.jobs = Array.isArray(response.data) ? response.data : [];
        _state.total = Number(response.meta?.total || 0);
        _state.lastPage = Math.max(1, Number(response.meta?.last_page || 1));
        renderJobs();
    } catch (error) {
        if (serial !== _state.requestSerial) return;
        grid.innerHTML = `<p class="muted">Failed to load jobs: ${escapeHtml(error.message || 'unknown error')}</p>`;
        renderResultsMeta();
        renderPagination();
    } finally {
        if (serial === _state.requestSerial) _state.loading = false;
    }
}

function renderJobs() {
    const grid = document.getElementById('jobs-grid');
    if (!grid) return;
    renderResultsMeta();
    renderPagination();
    if (_state.jobs.length === 0) {
        grid.innerHTML = '<p class="muted">No jobs match your filters. Try clearing them.</p>';
        return;
    }
    grid.innerHTML = _state.jobs.map(job => `
        <a class="job-card" href="#/jobs/${encodeURIComponent(job.id)}" data-id="${escapeHtml(job.id)}">
            <div class="job-card__head">
                ${job.category && job.category.icon_class ? `<i class="bi ${safeIcon(job.category.icon_class)} job-card__cat-icon"></i>` : ''}
                <span class="job-card__cat">${escapeHtml(job.category?.name || '')}</span>
                ${job.is_featured ? '<span class="job-card__badge">Featured</span>' : ''}
            </div>
            <h3 class="job-card__title">${escapeHtml(job.title)}</h3>
            <p class="job-card__desc">${escapeHtml(truncate(job.description, 140))}</p>
            <div class="job-card__foot">
                <span class="job-card__budget">৳${Number.parseFloat(job.budget || 0).toFixed(2)}</span>
                <span class="job-card__bids"><i class="bi bi-people"></i> ${Number(job.bid_count || 0)} bid${Number(job.bid_count) === 1 ? '' : 's'}</span>
            </div>
        </a>
    `).join('');
    grid.querySelectorAll('a.job-card').forEach(card => {
        card.addEventListener('click', event => {
            event.preventDefault();
            navigate(`/jobs/${card.getAttribute('data-id')}`);
        });
    });
}

function renderResultsMeta() {
    const meta = document.getElementById('jobs-results-meta');
    if (!meta) return;
    if (_state.total === 0) {
        meta.textContent = 'No open jobs found';
        return;
    }
    const first = ((_state.page - 1) * _state.perPage) + 1;
    const last = Math.min(_state.page * _state.perPage, _state.total);
    meta.textContent = `Showing ${first}-${last} of ${_state.total} open jobs`;
}

function renderPagination() {
    const pagination = document.getElementById('jobs-pagination');
    if (!pagination) return;
    if (_state.lastPage <= 1) {
        pagination.innerHTML = '';
        return;
    }
    pagination.innerHTML = `
        <button class="btn btn--secondary btn--sm" data-jobs-page="${_state.page - 1}" ${_state.page <= 1 ? 'disabled' : ''}>← Previous</button>
        <span class="jobs-pagination__status">Page ${_state.page} of ${_state.lastPage}</span>
        <button class="btn btn--secondary btn--sm" data-jobs-page="${_state.page + 1}" ${_state.page >= _state.lastPage ? 'disabled' : ''}>Next →</button>
    `;
    pagination.querySelectorAll('[data-jobs-page]').forEach(button => {
        button.addEventListener('click', () => {
            const page = Number(button.getAttribute('data-jobs-page'));
            if (page < 1 || page > _state.lastPage || page === _state.page) return;
            _state.page = page;
            loadJobs();
        });
    });
}

function safeIcon(value) {
    return /^bi-[a-z0-9-]+$/.test(String(value || '')) ? value : 'bi-briefcase';
}

function truncate(value, length) {
    const text = (value || '').toString();
    return text.length > length ? text.slice(0, length - 1) + '…' : text;
}

function escapeHtml(value) {
    if (value === null || value === undefined) return '';
    return String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
}
