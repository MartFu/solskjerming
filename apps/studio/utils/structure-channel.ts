export const SITE_CHANGED_EVENT = "studio:site-changed";

export function emitSiteChanged() {
    window.dispatchEvent(new CustomEvent(SITE_CHANGED_EVENT));
}