/**
 * TabSiteScopeProvider.tsx
 *
 * Scopes selectSite and clearSite to a specific tabId so that inactive
 * mounted tabs cannot accidentally stamp their site onto the wrong tab.
 *
 * Previously this provider duplicated sessionStorage writes and called
 * emitSiteChanged() directly. Both are now handled by the ordered
 * pendingEffect flush in WorkspaceTabsProvider, so this component only
 * needs to curry the tabId into the context-level operations.
 */

import { createContext, useCallback, useContext, useMemo } from "react";
import type { ActiveSite } from "@/utils/types";
import { useWorkspaceTabsContext } from "./WorkspaceTabsProvider";

// ─── Context ──────────────────────────────────────────────────────────────────

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

// ─── Provider ─────────────────────────────────────────────────────────────────

interface TabSiteScopeProps {
    tabId: string;
    children: React.ReactNode;
}

export function TabSiteScopeProvider({ tabId, children }: TabSiteScopeProps) {
    const { selectSite: ctxSelectSite, clearSite: ctxClearSite } =
        useWorkspaceTabsContext();

    // Curry tabId so callers don't need to know which tab they belong to.
    const selectSite = useCallback(
        (site: ActiveSite) => ctxSelectSite(site, tabId),
        [ctxSelectSite, tabId],
    );

    const clearSite = useCallback(
        () => ctxClearSite(tabId),
        [ctxClearSite, tabId],
    );

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
