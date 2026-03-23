import { WorkspaceKey } from "@/utils/constant";
import { STUDIO_CONTEXT_LS_KEY } from "@/utils/context";
import { API_VERSION } from "@/utils/env";
import { emitSiteChanged } from "@/utils/structure/structure-channel";
import { ActiveSite } from "@/utils/types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useClient } from "sanity";


// ─── Types ────────────────────────────────────────────────────────────────────

interface ToolLayoutContextValue {
  /** The Sanity workspace name this tool instance belongs to */
  workspace: WorkspaceKey;
  /** The currently active site, or null if at workspace level */
  activeSite: ActiveSite | null;
  /** Select a site — persists to sessionStorage */
  selectSite: (site: ActiveSite) => void;
  /** Return to workspace landing — clears active site */
  clearSite: () => void;

  previewHidden: boolean;
  togglePreviewHidden: () => void;
  hidePreview: () => void;

  /**
   * The preview URL for the currently open document, as written by usePreviewResolver.
   * Null when no previewable document is open.
   */
  previewUrl: string | null;
  /** Called by usePreviewResolver to register/unregister the current preview URL */
  setPreviewUrl: (url: string | null) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ToolLayoutContext = createContext<ToolLayoutContextValue | null>(null);

// ─── Storage helpers ──────────────────────────────────────────────────────────

function readFromSession(workspace: WorkspaceKey): ActiveSite | null {
  try {
    const raw = sessionStorage.getItem(STUDIO_CONTEXT_LS_KEY(workspace));
    return raw ? (JSON.parse(raw) as ActiveSite) : null;
  } catch {
    return null;
  }
}

function writeToSession(workspace: WorkspaceKey, site: ActiveSite | null) {
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
    // sessionStorage unavailable — degrade gracefully, state lives in memory only
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────

interface ToolLayoutProviderProps {
  workspace: WorkspaceKey;
  children: React.ReactNode;
}

export function ToolLayoutProvider({
  workspace,
  children,
}: ToolLayoutProviderProps) {
  const [activeSite, setActiveSiteState] = useState<ActiveSite | null>(() =>
    readFromSession(workspace),
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewHidden, setPreviewHidden] = useState(true);

  const client = useClient({ apiVersion: API_VERSION });

  const togglePreviewHidden = () => {
    setPreviewHidden((prev) => !prev);
  };

  const hidePreview = () => setPreviewHidden(true);

  // Capture linked traffic
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const siteIdFromUrl = params.get("site");

    if (siteIdFromUrl && activeSite?._id !== siteIdFromUrl) {
      client
        .fetch(`*[_id == $siteId][0]`, { siteId: siteIdFromUrl })
        .then((newSite) => {
          if (newSite) selectSite(newSite);
        });
    }
  }, []);

  // If workspace changes (shouldn't happen mid-session, but defensive), reset
  useEffect(() => {
    const stored = readFromSession(workspace);
    setActiveSiteState(stored);
  }, [workspace]);

  const selectSite = useCallback(
    (site: ActiveSite) => {
      writeToSession(workspace, site);
      setActiveSiteState(site);
      emitSiteChanged();
    },
    [workspace],
  );

  const clearSite = useCallback(() => {
    writeToSession(workspace, null);
    setActiveSiteState(null);
  }, [workspace]);

  return (
    <ToolLayoutContext.Provider
      value={{
        workspace,
        activeSite,
        selectSite,
        clearSite,
        previewHidden,
        togglePreviewHidden,
        hidePreview,
        previewUrl,
        setPreviewUrl,
      }}
    >
      {children}
    </ToolLayoutContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useToolLayout(): ToolLayoutContextValue {
  const ctx = useContext(ToolLayoutContext);
  if (!ctx) {
    throw new Error("useToolLayout must be used inside ToolLayoutProvider");
  }
  return ctx;
}
