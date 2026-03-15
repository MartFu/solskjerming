import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ActiveSite {
  _id: string;
  title: string;
}

interface ToolLayoutContextValue {
  /** The Sanity workspace name this tool instance belongs to */
  workspace: string;
  /** The currently active site, or null if at workspace level */
  activeSite: ActiveSite | null;
  /** Select a site — persists to sessionStorage */
  selectSite: (site: ActiveSite) => void;
  /** Return to workspace landing — clears active site */
  clearSite: () => void;
  /**
   * The preview URL for the currently open document, as written by PreviewPane.
   * Null when no previewable document is open.
   */
  previewUrl: string | null;
  /** Called by PreviewPane to register/unregister the current preview URL */
  setPreviewUrl: (url: string | null) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ToolLayoutContext = createContext<ToolLayoutContextValue | null>(null);

// ─── Storage helpers ──────────────────────────────────────────────────────────

const storageKey = (workspace: string) =>
  `studio.navigator:${workspace}:active-site`;

function readFromSession(workspace: string): ActiveSite | null {
  try {
    const raw = sessionStorage.getItem(storageKey(workspace));
    return raw ? (JSON.parse(raw) as ActiveSite) : null;
  } catch {
    return null;
  }
}

function writeToSession(workspace: string, site: ActiveSite | null) {
  try {
    if (site) {
      sessionStorage.setItem(storageKey(workspace), JSON.stringify(site));
    } else {
      sessionStorage.removeItem(storageKey(workspace));
    }
  } catch {
    // sessionStorage unavailable — degrade gracefully, state lives in memory only
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────

interface ToolLayoutProviderProps {
  workspace: string;
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

  // If workspace changes (shouldn't happen mid-session, but defensive), reset
  useEffect(() => {
    const stored = readFromSession(workspace);
    setActiveSiteState(stored);
  }, [workspace]);

  const selectSite = useCallback(
    (site: ActiveSite) => {
      writeToSession(workspace, site);
      setActiveSiteState(site);
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
