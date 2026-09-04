// API wrapper. The browser fetch response is kept intact here so callers can
// inspect HTTP status codes and receive the JSON error payload from Nemesis.
// (Ghost's `ghostFetch` helper resolves the response body before returning.)

const cfg = window.EARNAPP_CONFIG || { apiBase: '/api' };

let _token = null;
let _onUnauthorized = null;

export function setAuthToken(token) {
    _token = token;
}

export function getAuthToken() {
    return _token;
}

export function onUnauthorized(handler) {
    _onUnauthorized = handler;
}

async function request(path, { method = 'GET', body, headers = {}, signal } = {}) {
    const url = path.startsWith('http') ? path : cfg.apiBase + path;
    const opts = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...headers,
        },
    };
    if (_token) {
        opts.headers.Authorization = `Bearer ${_token}`;
    }
    if (body !== undefined) {
        opts.body = JSON.stringify(body);
    }
    if (signal) {
        opts.signal = signal;
    }

    const res = await fetch(url, opts);
    if (res.status === 401) {
        if (_onUnauthorized) _onUnauthorized();
        throw new ApiError('Unauthorized', 401, null);
    }
    let data = null;
    const contentType = res.headers.get('content-type') || '';
    try {
        if (contentType.includes('application/json')) {
            data = await res.json();
        } else {
            const text = await res.text();
            data = text ? { message: text } : null;
        }
    } catch { /* empty or malformed response body */ }
    if (!res.ok) {
        const message = (data && data.message) || `HTTP ${res.status}`;
        throw new ApiError(message, res.status, data);
    }
    return data;
}

export class ApiError extends Error {
    constructor(message, status, payload) {
        super(message);
        this.status = status;
        this.payload = payload;
    }
}

export const api = {
    health: () => request('/health'),

    // Auth
    register: (body) => request('/auth/register', { method: 'POST', body }),
    login:    (body) => request('/auth/login',    { method: 'POST', body }),
    logout:   ()    => request('/auth/logout',   { method: 'POST' }),
    me:       ()    => request('/auth/me'),

    // Notifications
    notifications: (params = {}) => {
        const q = new URLSearchParams(params).toString();
        return request(`/notifications${q ? '?' + q : ''}`);
    },
    notificationRead: (id) => request(`/notifications/${encodeURIComponent(id)}/read`, { method: 'POST' }),
    notificationsReadAll: () => request('/notifications/read-all', { method: 'POST' }),

    // User
    meUser:        () => request('/user'),
    reward:        (body) => request('/user/reward',   { method: 'POST', body }),
    withdraw:      (body) => request('/user/withdraw', { method: 'POST', body }),
    withdrawals:   () => request('/user/withdrawals'),
    referrals:     () => request('/user/referrals'),
    adHistory:     () => request('/user/ads'),

    // Ads
    adsConfig:      () => request('/ads/config'),
    adsNext:        () => request('/ads/next'),

    // Web tasks
    webTasks:        () => request('/tasks/web'),
    webTaskStart:    (body) => request('/tasks/web/start', { method: 'POST', body }),
    webTaskClaim:    (body) => request('/tasks/web/claim', { method: 'POST', body }),

    // Telegram tasks
    tgTasks:         () => request('/tasks/telegram'),
    tgTaskVerify:    (body) => request('/tasks/telegram/verify', { method: 'POST', body }),

    // Admin
    adminStats:        () => request('/admin/stats'),
    adminWithdrawals:  (status = 'pending') => request(`/admin/withdrawals?status=${status}`),
    adminApprove:      (id, body = {}) => request(`/admin/withdrawals/${id}/approve`, { method: 'POST', body }),
    adminReject:       (id, body = {}) => request(`/admin/withdrawals/${id}/reject`,  { method: 'POST', body }),
    adminPay:          (id, body = {}) => request(`/admin/withdrawals/${id}/pay`,     { method: 'POST', body }),
    adminUsers:        () => request('/admin/users'),
    adminUpdateUserRole: (id, role) => request(`/admin/users/${id}/role`, { method: 'POST', body: { role } }),
    adminProviders:    () => request('/admin/ad-providers'),
    adminUpdateProvider: (id, body) => request(`/admin/ad-providers/${id}`, { method: 'POST', body }),

    // Payments (deposit / TRXID)
    paymentGateways:    () => request('/payment/gateways'),
    paymentSubmit:      (body) => request('/payment/submit', { method: 'POST', body }),
    paymentSubmissions: () => request('/payment/submissions'),

    // Admin payments
    adminPayments:        (status = '') => request(`/admin/payments?status=${status}`),
    adminApprovePayment:  (id, body = {}) => request(`/admin/payments/${id}/approve`, { method: 'POST', body }),
    adminRejectPayment:   (id, body = {}) => request(`/admin/payments/${id}/reject`,  { method: 'POST', body }),

    // Jobs marketplace — public (any auth user)
    categories:           () => request('/categories'),
    jobs:                 (params = {}) => {
        const q = new URLSearchParams(params).toString();
        return request(`/jobs${q ? '?' + q : ''}`);
    },
    job:                  (id) => request(`/jobs/${id}`),
    placeBid:             (id, body) => request(`/jobs/${id}/bid`, { method: 'POST', body }),
    withdrawBid:          (id) => request(`/bids/${id}`, { method: 'DELETE' }),
    workerBids:           () => request('/worker/bids'),
    workerActiveJobs:     () => request('/worker/active-jobs'),
    submitWork:           (id, body) => request(`/jobs/${id}/submit`, { method: 'POST', body }),
    workerSubmissions:    () => request('/worker/submissions'),

    // Poster
    posterStats:          () => request('/poster/stats'),
    posterCreateJob:      (body) => request('/poster/jobs', { method: 'POST', body }),
    posterMyJobs:         () => request('/poster/jobs'),
    posterJobBids:        (id) => request(`/poster/jobs/${id}/bids`),
    posterAcceptBid:      (id, bidId, body = {}) => request(`/poster/jobs/${id}/accept-bid`, { method: 'POST', body: { ...body, bid_id: bidId } }),
    posterRequestRevision: (id, body = {}) => request(`/poster/jobs/${id}/request-revision`, { method: 'POST', body }),
    posterReleasePayment: (id, body = {}) => request(`/poster/jobs/${id}/release`, { method: 'POST', body }),
    posterCancelJob:       (id, body = {}) => request(`/poster/jobs/${id}/cancel`, { method: 'POST', body }),

    // Admin categories + settings
    adminCategories:           () => request('/admin/categories'),
    adminCreateCategory:        (body) => request('/admin/categories', { method: 'POST', body }),
    adminUpdateCategory:        (id, body) => request(`/admin/categories/${id}`, { method: 'POST', body }),
    adminDeleteCategory:        (id) => request(`/admin/categories/${id}/delete`, { method: 'POST' }),
    adminSettings:              () => request('/admin/settings'),
    adminUpdateSettings:        (body) => request('/admin/settings', { method: 'POST', body }),
    adminJobs:                  (status = '') => request(`/admin/jobs${status ? `?status=${encodeURIComponent(status)}` : ''}`),
    adminFlagJobDispute:        (id) => request(`/admin/jobs/${id}/dispute`, { method: 'POST' }),
    adminResolveJob:             (id, body) => request(`/admin/jobs/${id}/resolve`, { method: 'POST', body }),
    adminTransactions:          (params = {}) => {
        const q = new URLSearchParams(params).toString();
        return request(`/admin/transactions${q ? '?' + q : ''}`);
    },
    adminReports:               () => request('/admin/reports'),
    adminRevenue:               () => request('/admin/revenue'),
};
