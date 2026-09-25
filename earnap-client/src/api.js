// API wrapper. The browser fetch response is kept intact here so callers can
// inspect HTTP status codes and receive the JSON error payload from Nemesis.
// (Ghost's `ghostFetch` helper resolves the response body before returning.)

const cfg = window.JMJOB_CONFIG || { apiBase: '/api' };

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
    const multipart = typeof FormData !== 'undefined' && body instanceof FormData;
    const opts = {
        method,
        headers: {
            'Accept': 'application/json',
            ...(multipart ? {} : { 'Content-Type': 'application/json' }),
            ...headers,
        },
    };
    if (_token) {
        opts.headers.Authorization = `Bearer ${_token}`;
    }
    if (body !== undefined) {
        opts.body = multipart ? body : JSON.stringify(body);
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

async function downloadRequest(path) {
    const url = path.startsWith('http') ? path : cfg.apiBase + path;
    const headers = { Accept: 'text/csv' };
    if (_token) headers.Authorization = `Bearer ${_token}`;
    const res = await fetch(url, { headers });
    if (!res.ok) {
        let message = `HTTP ${res.status}`;
        try {
            const data = await res.json();
            message = data?.message || message;
        } catch { /* keep the HTTP status */ }
        throw new ApiError(message, res.status, null);
    }
    return res.blob();
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
    requestRegistrationOtp: (body) => request('/auth/register/request-otp', { method: 'POST', body }),
    verifyRegistrationOtp: (body) => request('/auth/register/verify-otp', { method: 'POST', body }),
    login:    (body) => request('/auth/login',    { method: 'POST', body }),
    forgotPassword: (body) => request('/auth/forgot-password', { method: 'POST', body }),
    resetPassword: (body) => request('/auth/reset-password', { method: 'POST', body }),
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
    videoAds:       () => request('/ads/videos'),
    videoAdStart:   (body) => request('/ads/videos/start', { method: 'POST', body }),
    videoAdClaim:   (body) => request('/ads/videos/claim', { method: 'POST', body }),

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
    adminBanUser:      (id, body = {}) => request(`/admin/users/${id}/ban`, { method: 'POST', body }),
    adminUnbanUser:    (id, body = {}) => request(`/admin/users/${id}/unban`, { method: 'POST', body }),
    adminBanHistory:   (id) => request(`/admin/users/${id}/ban-history`),
    adminProviders:    () => request('/admin/ad-providers'),
    adminUpdateProvider: (id, body) => request(`/admin/ad-providers/${id}`, { method: 'POST', body }),
    adminVideoAds:        () => request('/admin/video-ads'),
    adminCreateVideoAd:   (formData) => request('/admin/video-ads', { method: 'POST', body: formData }),
    adminUpdateVideoAd:   (id, formData) => request(`/admin/video-ads/${id}`, { method: 'POST', body: formData }),
    adminDeleteVideoAd:   (id) => request(`/admin/video-ads/${id}`, { method: 'DELETE' }),
    adminResetDailyCounters: () => request('/admin/reset-daily-counters', { method: 'POST' }),

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
    createWorkflowJob:    (body) => request('/jobs/workflow', { method: 'POST', body }),
    applyForJob:          (id, body = {}) => request(`/jobs/${id}/apply`, { method: 'POST', body }),
    extendDeadline:       (id, body = {}) => request(`/jobs/${id}/extend-deadline`, { method: 'POST', body }),
    placeBid:             (id, body) => request(`/jobs/${id}/bid`, { method: 'POST', body }),
    withdrawBid:          (id) => request(`/bids/${id}`, { method: 'DELETE' }),
    workerBids:           () => request('/worker/bids'),
    workerActiveJobs:     () => request('/worker/active-jobs'),
    submitWork:           (id, body) => request(`/jobs/${id}/submit`, { method: 'POST', body }),
    proofAttachment:      (id) => downloadRequest(`/jobs/submissions/${encodeURIComponent(id)}/attachment`),
    workerCancelAssignment: (id, body = {}) => request(`/worker/assignments/${id}/cancel`, { method: 'POST', body }),
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

    // Admin categories + subcategories + settings
    adminCategories:           () => request('/admin/categories'),
    adminCreateCategory:        (body) => request('/admin/categories', { method: 'POST', body }),
    adminUpdateCategory:        (id, body) => request(`/admin/categories/${id}`, { method: 'POST', body }),
    adminDeleteCategory:        (id) => request(`/admin/categories/${id}/delete`, { method: 'POST' }),
    adminSubcategories:        () => request('/admin/subcategories'),
    adminCreateSubcategory:     (body) => request('/admin/subcategories', { method: 'POST', body }),
    adminUpdateSubcategory:     (id, body) => request(`/admin/subcategories/${id}`, { method: 'POST', body }),
    adminDeleteSubcategory:     (id) => request(`/admin/subcategories/${id}/delete`, { method: 'POST' }),
    adminSettings:              () => request('/admin/settings'),
    adminUpdateSettings:        (body) => request('/admin/settings', { method: 'POST', body }),

    // Social Links
    socialLinks:          () => request('/social-links'),
    adminUpdateSocialLinks: (body) => request('/admin/social-links', { method: 'POST', body }),

    // Dynamic Notices & Banners
    notices:              () => request('/notices'),
    adminUpdateNotices:   (body) => request('/admin/notices', { method: 'POST', body }),
    adminUploadBannerImage: async (formData) => {
        const url = cfg.apiBase + '/admin/notices/upload';
        const headers = {};
        const token = getAuthToken();
        if (token) headers.Authorization = `Bearer ${token}`;
        const res = await fetch(url, { method: 'POST', headers, body: formData });
        const data = await res.json();
        if (!res.ok) throw new ApiError(data.message || 'Upload failed', res.status, data);
        return data;
    },

    adminJobs:                  (status = '') => request(`/admin/jobs${status ? `?status=${encodeURIComponent(status)}` : ''}`),
    adminCreateJob:              (body) => request('/admin/jobs', { method: 'POST', body }),
    adminJobDetail:              (id) => request(`/admin/jobs/${id}/detail`),
    adminUpdateJob:              (id, body) => request(`/admin/jobs/${id}/edit`, { method: 'POST', body }),
    adminDeleteJob:              (id) => request(`/admin/jobs/${id}`, { method: 'DELETE' }),
    adminJobSubmissions:        (id) => request(`/admin/jobs/${id}/submissions`),
    adminFraudSubmissions:      () => request('/admin/fraud/submissions'),
    adminReviewFraud:           (id, body = {}) => request(`/admin/fraud/submissions/${id}/review`, { method: 'POST', body }),
    adminReviewSubmission:      (id, body = {}) => request(`/admin/submissions/${id}/review`, { method: 'POST', body }),
    adminCancelAssignment:      (id, body = {}) => request(`/admin/assignments/${id}/cancel`, { method: 'POST', body }),
    adminReassignAssignment:    (id, body = {}) => request(`/admin/assignments/${id}/reassign`, { method: 'POST', body }),
    adminApproveJob:            (id, body = {}) => request(`/admin/jobs/${id}/approve`, { method: 'POST', body }),
    adminDeclineJob:            (id, body = {}) => request(`/admin/jobs/${id}/decline`, { method: 'POST', body }),
    adminApproveApplication:    (id, body = {}) => request(`/admin/applications/${id}/approve`, { method: 'POST', body }),
    adminFlagJobDispute:        (id) => request(`/admin/jobs/${id}/dispute`, { method: 'POST' }),
    adminResolveJob:             (id, body) => request(`/admin/jobs/${id}/resolve`, { method: 'POST', body }),
    adminTransactions:          (params = {}) => {
        const q = new URLSearchParams(params).toString();
        return request(`/admin/transactions${q ? '?' + q : ''}`);
    },
    adminReports:               () => request('/admin/reports'),
    adminReportsExport:         () => downloadRequest('/admin/reports?format=csv'),
    adminRevenue:               () => request('/admin/revenue'),
};
