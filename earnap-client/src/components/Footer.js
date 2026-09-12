// Footer — global site footer with copyright, social links, and developer credit.
import { api } from '../api.js';

export function Footer() {
    const year = new Date().getFullYear();

    return {
        tag: 'footer',
        props: {
            class: 'app-footer',
            ghostStyle: {
                mount: (el) => {
                    api.socialLinks().then(links => {
                        const socialEl = el.querySelector('#app-footer-social');
                        if (!socialEl || !links) return;
                        const items = [];

                        if (links.facebook) {
                            items.push(`<a href="${escapeHtml(links.facebook)}" target="_blank" rel="noopener noreferrer" title="Facebook" class="app-footer__social-link"><i class="bi bi-facebook"></i></a>`);
                        }
                        if (links.instagram) {
                            items.push(`<a href="${escapeHtml(links.instagram)}" target="_blank" rel="noopener noreferrer" title="Instagram" class="app-footer__social-link"><i class="bi bi-instagram"></i></a>`);
                        }
                        if (links.whatsapp) {
                            items.push(`<a href="${escapeHtml(links.whatsapp)}" target="_blank" rel="noopener noreferrer" title="WhatsApp" class="app-footer__social-link"><i class="bi bi-whatsapp"></i></a>`);
                        }
                        if (links.telegram) {
                            items.push(`<a href="${escapeHtml(links.telegram)}" target="_blank" rel="noopener noreferrer" title="Telegram" class="app-footer__social-link"><i class="bi bi-telegram"></i></a>`);
                        }

                        socialEl.innerHTML = items.join('');
                    }).catch(() => {});
                }
            }
        },
        children: [
            {
                tag: 'div',
                props: { class: 'app-footer__copy' },
                children: [`© ${year} JMJob`],
            },
            {
                tag: 'div',
                props: { class: 'app-footer__social', id: 'app-footer-social' },
                children: [],
            },
            {
                tag: 'div',
                props: { class: 'app-footer__developed' },
                children: [
                    { tag: 'span', props: {}, children: ['Developed By: '] },
                    {
                        tag: 'a',
                        props: {
                            class: 'app-footer__link',
                            href: 'https://nextstagesoftware.com/',
                            target: '_blank',
                            rel: 'noopener noreferrer',
                        },
                        children: ['NextStageSoftware'],
                    },
                ],
            },
        ],
    };
}

function escapeHtml(s) {
    if (!s) return '';
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
