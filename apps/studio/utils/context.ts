

export const STUDIO_CONTEXT_LS_KEY = "studioContext";
export type StudioContext = {
    level: 'workspace' | 'site';
    workspace: string;
    siteId: string | null; 
    siteTitle: string | null;
}

export function getStudioContext(workspace?: string): StudioContext {
    return localStorage.getItem(STUDIO_CONTEXT_LS_KEY) ? JSON.parse(localStorage.getItem(STUDIO_CONTEXT_LS_KEY)!) : {
        level: 'workspace',
        workspace: workspace ?? 'solskjerming',
        siteId: null,
        siteTitle: null,
    }
}

export function setStudioContext(context: StudioContext) {
    localStorage.setItem(STUDIO_CONTEXT_LS_KEY, JSON.stringify(context));
}