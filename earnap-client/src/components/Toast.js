import { flash } from '../state.js';
import { when } from '@ghost-js/core';

export function Toast() {
    return when(
        () => !!flash.get(),
        () => {
            const f = flash.get();
            return {
                tag: 'div',
                props: { class: 'toast-container' },
                children: [{
                    tag: 'div',
                    props: { class: 'toast toast--' + (f.type || 'info'), key: f.id || 'toast' },
                    children: [{ tag: 'span', props: {}, children: [f.message] }],
                }],
            };
        },
        () => ({ tag: 'div', props: { class: 'toast-container' }, children: [] }),
    );
}
