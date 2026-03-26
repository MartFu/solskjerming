import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { useClient } from "sanity";
import { API_VERSION } from "@/utils/env";
import type { WorkspaceKey } from "@/utils/constant";
import type { ActiveSite } from "@/utils/types";
import { STUDIO_CONTEXT_LS_KEY } from "@/utils/persistence/context";
import { useWorkspaceTabsContext } from "./WorkspaceTabsProvider";
import { emitSiteChanged } from "@/utils/structure/structure-channel";

// ─── Session storage helpers ──────────────────────────────────────────────────

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
  } catch {}
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SiteContextValue {
  /** Active site for the current tab — derived from activeTab.activeSite */
  activeSite: ActiveSite | null;
  selectSite: (site: ActiveSite) => void;
  clearSite: () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const SiteContext = createContext<SiteContextValue | null>(null);

export function useSiteContext(): SiteContextValue {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error("useSiteContext must be used within SiteProvider");
  return ctx;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const { workspace, activeTab, activeTabId, setActiveTabSite } =
    useWorkspaceTabsContext();
  const client = useClient({ apiVersion: API_VERSION });

  // Derived — never independent state
  const activeSite = activeTab.activeSite;

  // Sync sessionStorage when active tab changes (for usePreviewResolver etc.)
  const prevTabIdRef = useRef<string>(activeTabId);
  useEffect(() => {
    if (prevTabIdRef.current === activeTabId) return;
    prevTabIdRef.current = activeTabId;
    writeToSession(workspace, activeSite);
  }, [activeTabId, activeSite, workspace]);

  // If workspace prop changes, re-read session into the active tab
  useEffect(() => {
    const stored = readFromSession(workspace);
    setActiveTabSite(stored);
  }, [workspace]); // eslint-disable-line react-hooks/exhaustive-deps

  // Capture ?site= deep-link on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const siteIdFromUrl = params.get("site");
    if (siteIdFromUrl && activeSite?._id !== siteIdFromUrl) {
      client
        .fetch(`*[_id == $siteId][0]`, { siteId: siteIdFromUrl })
        .then((newSite) => {
          if (newSite) selectSite(newSite as ActiveSite);
        });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Operations ───────────────────────────────────────────────────────────

  const selectSite = useCallback(
    (site: ActiveSite) => {
      writeToSession(workspace, site);
      setActiveTabSite(site);
      emitSiteChanged();
    },
    [workspace, setActiveTabSite],
  );

  const clearSite = useCallback(() => {
    writeToSession(workspace, null);
    setActiveTabSite(null);
  }, [workspace, setActiveTabSite]);

  const value = useMemo<SiteContextValue>(
    () => ({ activeSite, selectSite, clearSite }),
    [activeSite, selectSite, clearSite],
  );

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}
