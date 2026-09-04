// PosterWalletPage — poster wallet balances and deposit history.

import { api } from '../api.js';
import { currentUser, navigate } from '../state.js';

export function PosterWalletPage() {
    return async () => {
        const root = document.querySelector('[data-view]');
        if (!root) return;
        root.innerHTML = '';
        root.className = 'view view--poster-wallet';
        const user = currentUser.get();
        if (!user || (!user.is_admin && user.role !== 'poster')) {
            root.innerHTML = `<div class="card"><h2>Poster access required</h2><a class="btn btn--primary" href="#/">Go home</a></div>`;
            return;
        }
        root.innerHTML = `<h1 class="page-title">Poster Wallet</h1><p class="muted">Fund your available wallet, monitor escrow, and review deposits.</p><div id="poster-wallet-content"><div class="spinner"></div></div>`;
        try {
            const [statsResponse, depositsResponse] = await Promise.all([api.posterStats(), api.paymentSubmissions()]);
            render(root.querySelector('#poster-wallet-content'), statsResponse.data || {}, depositsResponse.data || []);
        } catch (error) {
            root.querySelector('#poster-wallet-content').innerHTML = `<p class="muted">Failed to load wallet: ${escapeHtml(error.message || 'unknown error')}</p>`;
        }
    };
}

function render(content, stats, deposits) {
    const wallet = money(stats.wallet_balance);
    const frozen = money(stats.frozen_balance);
    const spent = money(stats.total_spent);
    content.innerHTML = `
        <div class="stat-grid poster-wallet-stat-grid"><div class="stat-tile poster-stat-tile"><span class="muted">Available wallet</span><strong>৳${wallet}</strong></div><div class="stat-tile poster-stat-tile"><span class="muted">Frozen in escrow</span><strong>৳${frozen}</strong></div><div class="stat-tile poster-stat-tile"><span class="muted">Total spent</span><strong>৳${spent}</strong></div></div>
        <div class="card poster-wallet-actions"><div><h2 class="card__title">Need more wallet funds?</h2><p class="muted">Submit a bKash, Nagad, Rocket, or Upay TRXID deposit for admin verification.</p></div><button class="btn btn--primary" id="poster-wallet-deposit">Make a deposit</button></div>
        <div class="card"><h2 class="card__title">Deposit history</h2><div class="poster-deposit-list">${renderDeposits(deposits)}</div></div>
    `;
    content.querySelector('#poster-wallet-deposit').addEventListener('click', () => navigate('/deposit'));
}
function renderDeposits(deposits) { if (!deposits.length) return '<p class="muted">No deposits submitted yet.</p>'; return deposits.map(deposit => `<div class="poster-deposit-row"><span><strong>${escapeHtml((deposit.gateway || '').toUpperCase())}</strong><small>${escapeHtml(deposit.trxid)} · ${formatDate(deposit.created_at)}</small></span><span><strong>৳${Number(deposit.amount || 0).toFixed(2)}</strong><small>${escapeHtml(deposit.status || '')}</small></span></div>`).join(''); }
function money(value) { const amount = Number(value || 0); return Number.isFinite(amount) ? amount.toFixed(2) : '0.00'; }
function formatDate(value) { if (!value) return 'unknown'; const date = new Date(String(value).replace(' ', 'T') + 'Z'); return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString(); }
function escapeHtml(value) { return String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character])); }
