/**
 * Empty website placement reserved for the future Google AdSense integration.
 * Keep it hidden until a real ad SDK and a configured unit are available.
 */
export function createGoogleAdSlot(placement) {
    const slot = document.createElement('div');
    slot.className = 'google-ad-slot';
    slot.dataset.googleAdPlacement = placement;
    slot.dataset.googleAdProvider = 'google-adsense';
    slot.hidden = true;
    slot.setAttribute('aria-hidden', 'true');
    return slot;
}
