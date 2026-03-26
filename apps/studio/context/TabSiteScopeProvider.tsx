/**
 * TabSiteScope.tsx
 *
 * Scopes selectSite and clearSite to a specific tabId so that inactive
 * mounted tabs cannot accidentally stamp their site onto the wrong tab.
 *
 * Wraps each TabShell — overrides only the site-write operations while
 * leaving everything else (activeSite, preview, tabs) from the real context.
 */

import { createContext, useCallback, useContext, useMemo } from "react";
import { emitSiteChanged } from "@/utils/structure/structure-channel";
import type { ActiveSite } from "@/utils/types";
import { STUDIO_CONTEXT_LS_KEY } from "@/utils/persistence/context";
import { WorkspaceKey } from "@/utils/constant";
import { useWorkspaceTabsContext } from "./WorkspaceTabsProvider";

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

interface TabSiteScopeContextValue {
  selectSite: (site: ActiveSite) => void;
  clearSite: () => void;
}

const TabSiteScopeContext = createContext<TabSiteScopeContextValue | null>(
  null,
);

export function useTabSiteScope(): TabSiteScopeContextValue | null {
  return useContext(TabSiteScopeContext);
}

interface TabSiteScopeProps {
  tabId: string;
  children: React.ReactNode;
}

export function TabSiteScopeProvider({ tabId, children }: TabSiteScopeProps) {
  const { workspace, setActiveTabSite } = useWorkspaceTabsContext();

  const selectSite = useCallback(
    (site: ActiveSite) => {
      writeToSession(workspace, site);
      // Stamp onto this specific tab, not whatever activeTabId currently is
      setActiveTabSite(site, tabId);
      emitSiteChanged();
    },
    [workspace, tabId, setActiveTabSite],
  );

  const clearSite = useCallback(() => {
    writeToSession(workspace, null);
    setActiveTabSite(null, tabId);
  }, [workspace, tabId, setActiveTabSite]);

  const value = useMemo(
    () => ({ selectSite, clearSite }),
    [selectSite, clearSite],
  );

  return (
    <TabSiteScopeContext.Provider value={value}>
      {children}
    </TabSiteScopeContext.Provider>
  );
}
