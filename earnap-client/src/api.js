// API wrapper — ghostFetch helper. Auth header is auto-injected from
// the current `authToken` signal.

import { ghostFetch } from '@ghost-js/core';

const cfg = window.EARNAPP_CONFIG || { apiBase: '/api' };

let _token = null;
let _onUnauthorized = null;

export function setAuthToken(token) {
    _token = token;
    if (!token) {
        delete ghostFetch.defaults?.headers?.Authorization;
    }
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

    const res = await ghostFetch(url, opts);
    if (res.status === 401) {
        if (_onUnauthorized) _onUnauthorized();
        throw new ApiError('Unauthorized', 401, null);
    }
    let data = null;
    try { data = await res.json(); } catch { /* not JSON */ }
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
    adminProviders:    () => request('/admin/ad-providers'),
    adminUpdateProvider: (id, body) => request(`/admin/ad-providers/${id}`, { method: 'POST', body }),
};
