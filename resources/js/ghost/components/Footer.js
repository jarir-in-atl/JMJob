// Footer — global site footer with copyright and developer credit.

export function Footer() {
    const year = new Date().getFullYear();
    return {
        tag: 'footer',
        props: { class: 'app-footer' },
        children: [
            {
                tag: 'div',
                props: { class: 'app-footer__copy' },
                children: [`© ${year} JMJob`],
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

