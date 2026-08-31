import { flash } from '../state.js';

export function Toast() {
    const f = flash.get();
    if (!f) {
        return { tag: 'div', props: { class: 'toast-container' }, children: [] };
    }
    return {
        tag: 'div',
        props: { class: 'toast-container' },
        children: [{
            tag: 'div',
            props: { class: 'toast toast--' + (f.type || 'info'), key: f.id || 'toast' },
            children: [{ tag: 'span', props: {}, children: [f.message] }],
        }],
    };
}
