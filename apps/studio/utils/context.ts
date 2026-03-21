import { WorkspaceKey } from "./constant";
import { ActiveSite } from "./types";

export const STUDIO_CONTEXT_LS_KEY = (
  workspace: WorkspaceKey | undefined = "solskjerming",
) => `studio.navigator:${workspace}:active-site`;
export type StudioContext = {
  level: "workspace" | "site";
  workspace: WorkspaceKey;
  siteId: string | null;
  siteTitle: string | null;
};

export function getActiveSite(workspace: WorkspaceKey): ActiveSite | null {
  try {
    const raw = sessionStorage.getItem(STUDIO_CONTEXT_LS_KEY(workspace));
    return raw ? (JSON.parse(raw) as ActiveSite) : null;
  } catch {
    return null;
  }
}

// Unified helper to write the site
export function setActiveSite(workspace: WorkspaceKey, site: ActiveSite | null) {
  try {
    if (site) {
      sessionStorage.setItem(
        STUDIO_CONTEXT_LS_KEY(workspace),
        JSON.stringify(site),
      );
    } else {
      sessionStorage.removeItem(STUDIO_CONTEXT_LS_KEY(workspace));
    }
  } catch {
    // Fail silently
  }
}