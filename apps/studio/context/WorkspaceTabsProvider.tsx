import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import type { WorkspaceKey } from "@/utils/constant";
import type { ActiveSite, Tab, TabsState } from "@/utils/types";
import {
    loadTabsState,
    makeDefaultTab,
    saveTabsState,
} from "@/utils/persistence/tabs";
import { emitSiteChanged } from "@/utils/structure/structure-channel";
import { StudioTabSettings } from "@/hooks/useStudioSettings";
import { useClient } from "sanity";
import { API_VERSION } from "@/utils/env";
import { getActiveSite, setActiveSite } from "@/utils/persistence/context";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WorkspaceTabsContextValue {
    workspace: WorkspaceKey;
    tabs: Tab[];
    activeTabId: string;
    activeTab: Tab;
    tabsEnabled: boolean;
    maxTabs: number;
    // ── Tab operations ──────────────────────────────────────────────────────
    addTab: (siteTitle?: string, siteId?: string) => void;
    removeTab: (id: string) => void;
    setActiveTab: (id: string) => void;
    renameTab: (id: string, label: string) => void;
    openDocumentInNewTab: (
        docId: string,
        type: string,
        siteId: string,
        siteTitle: string,
    ) => Promise<void>;
    /** Called by TabPathTracker inside each tab's RouterProvider scope.
     *  Records the current path for a specific tab. Because useRouter() is
     *  scoped per-tab, this is always self-reported — an inactive tab's
     *  navigation never writes to another tab's savedPath. */
    setTabPath: (tabId: string, path: string) => void;
    // ── Site operations ─────────────────────────────────────────────────────
    /** Selects a site for a tab (defaults to active tab) and triggers a
     *  structure rebuild via the ordered pendingEffect flush. */
    selectSite: (site: ActiveSite, tabId?: string) => void;
    /** Clears the site for a tab (defaults to active tab). */
    clearSite: (tabId?: string) => void;
    /** Low-level stamp — only updates tab state, no side-effects.
     *  Prefer selectSite/clearSite for user-initiated changes. */
    setActiveTabSite: (site: ActiveSite | null, tabId?: string) => void;
    /** Derived convenience — activeSite of the current active tab. */
    activeSite: ActiveSite | null;
}

// ─── Pending side-effect type ─────────────────────────────────────────────────

interface PendingEffect {
    site: ActiveSite | null;
    savedPath: string | null;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const WorkspaceTabsContext = createContext<WorkspaceTabsContextValue | null>(
    null,
);

export function useWorkspaceTabsContext(): WorkspaceTabsContextValue {
    const ctx = useContext(WorkspaceTabsContext);
    if (!ctx)
        throw new Error(
            "useWorkspaceTabsContext must be used within WorkspaceTabsProvider",
        );
    return ctx;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

interface WorkspaceTabsProviderProps {
    workspace: WorkspaceKey;
    tabSettings: StudioTabSettings;
    children: React.ReactNode;
}

export function WorkspaceTabsProvider({
    workspace,
    tabSettings,
    children,
}: WorkspaceTabsProviderProps) {
    const client = useClient({ apiVersion: API_VERSION });
    const [tabsState, setTabsState] = useState<TabsState>(() =>
        loadTabsState(workspace),
    );

    // Holds side-effects that must run after the next render commit.
    // Using a ref avoids making it part of state (which would cause extra renders).
    const pendingEffectRef = useRef<PendingEffect | null>(null);

    const tabsEnabled = tabSettings.enabled;
    const maxTabs = tabSettings.maxTabs;

    const activeTab = useMemo(
        () =>
            tabsState.tabs.find((t) => t.id === tabsState.activeTabId) ??
            tabsState.tabs[0],
        [tabsState],
    );

    // Derived convenience so consumers don't have to reach into activeTab.
    const activeSite = activeTab.activeSite;

    // Persist tabs state to localStorage on every change so tabs survive a refresh.
    useEffect(() => {
        saveTabsState(workspace, tabsState);
    }, [workspace, tabsState]);

    // ─── Pending-effect flush ─────────────────────────────────────────────────
    useEffect(() => {
        const effect = pendingEffectRef.current;
        if (!effect) return;
        pendingEffectRef.current = null;

        setActiveSite(workspace, effect.site); //

        if (effect.savedPath) {
            // 1. Update the browser URL
            history.pushState(null, "", effect.savedPath); //

            // 2. Trigger a 'popstate' manually.
            // Sanity's router listens to this to synchronize its internal 'state'
            window.dispatchEvent(new PopStateEvent("popstate"));
        }

        emitSiteChanged(); //
    }, [workspace]);

    // ─── Operations ───────────────────────────────────────────────────────────

    const addTab = useCallback((siteTitle?: string, siteId?: string) => {
        setTabsState((prev) => {
            const currentTab = prev.tabs.find((t) => t.id === prev.activeTabId);
            const tab = makeDefaultTab();

            const countOfKind = prev.tabs.reduce(
                (acc, t) => (t.activeSite?._id === siteId ? acc + 1 : acc),
                0,
            );

            const label = siteTitle
                ? countOfKind > 0
                    ? `${siteTitle} (${countOfKind})`
                    : siteTitle
                : `Fane ${prev.tabs.length + 1}`;

            return {
                tabs: [
                    ...prev.tabs,
                    {
                        ...tab,
                        label,
                        // New tab starts at the workspace root, not the current
                        // path. The current tab's site is inherited as a
                        // convenience default so the user lands in context.
                        activeSite: currentTab?.activeSite ?? null,
                        savedPath: null,
                    },
                ],
                activeTabId: tab.id,
            };
        });
    }, []);

   const removeTab = useCallback(
       (id: string) => {
           setTabsState((prev) => {
               if (prev.tabs.length <= 1) return prev;

               const tabIndex = prev.tabs.findIndex((t) => t.id === id);
               const isClosingActive = prev.activeTabId === id;
               const nextTabs = prev.tabs.filter((t) => t.id !== id);
               let nextActiveId = prev.activeTabId;

               if (isClosingActive) {
                   const neighbor =
                       prev.tabs[tabIndex - 1] || prev.tabs[tabIndex + 1];
                   nextActiveId = neighbor.id;

                   // CRITICAL: Force the global environment to match the newly focused neighbor
                   pendingEffectRef.current = {
                       site: neighbor.activeSite,
                       savedPath:
                           neighbor.savedPath ?? `/${workspace}/structure`,
                   };
               }

               return { tabs: nextTabs, activeTabId: nextActiveId };
           });
       },
       [workspace],
   );

    const renameTab = useCallback((id: string, label: string) => {
        setTabsState((prev) => ({
            ...prev,
            tabs: prev.tabs.map((t) => (t.id === id ? { ...t, label } : t)),
        }));
    }, []);

   const setActiveTab = useCallback(
       (id: string) => {
           setTabsState((prev) => {
               const nextTab = prev.tabs.find((t) => t.id === id);

               if (nextTab) {
                   // We set the pending effect so the useEffect flush
                   // restores the URL and Site ID for the Sanity Structure.
                   pendingEffectRef.current = {
                       site: nextTab.activeSite,
                       savedPath:
                           nextTab.savedPath ?? `/${workspace}/structure`,
                   };
               }
               return { ...prev, activeTabId: id };
           });
       },
       [workspace],
   );

    // Called by TabPathTracker — each tab's own RouterProvider scope guarantees
    // this is always self-reported. No global cursor, no filtering needed.
    const setTabPath = useCallback((tabId: string, path: string) => {
        setTabsState((prev) => ({
            ...prev,
            tabs: prev.tabs.map((t) =>
                t.id === tabId ? { ...t, savedPath: path } : t,
            ),
        }));
    }, []);

    // Low-level: only stamps tab state, no sessionStorage or emitSiteChanged.
    // Use selectSite for user-initiated site changes.
    const setActiveTabSite = useCallback(
        (site: ActiveSite | null, tabId?: string) => {
            setTabsState((prev) => ({
                ...prev,
                tabs: prev.tabs.map((t) =>
                    t.id === (tabId ?? prev.activeTabId)
                        ? {
                              ...t,
                              label: site?.title ?? t.label,
                              activeSite: site,
                          }
                        : t,
                ),
            }));
        },
        [],
    );

    const selectSite = useCallback((site: ActiveSite, tabId?: string) => {
        setTabsState((prev) => {
            const targetId = tabId ?? prev.activeTabId;
            const isTargetActive = targetId === prev.activeTabId;

            // ONLY trigger side-effects if we are modifying the tab currently in view
            if (isTargetActive) {
                pendingEffectRef.current = {
                    site,
                    // If it's the active tab, we stay on the current path but change the site context
                    savedPath:
                        window.location.pathname + window.location.search,
                };
            }

            return {
                ...prev,
                tabs: prev.tabs.map((t) =>
                    t.id === targetId
                        ? {
                              ...t,
                              label: site.title ?? t.label,
                              activeSite: site,
                              // If it's a background tab, it keeps its old savedPath,
                              // just with a new site assigned to it.
                          }
                        : t,
                ),
            };
        });
    }, []);

    const clearSite = useCallback((tabId?: string) => {
        setTabsState((prev) => {
            const targetId = tabId ?? prev.activeTabId;

            if (targetId === prev.activeTabId) {
                pendingEffectRef.current = { site: null, savedPath: null };
            }

            return {
                ...prev,
                tabs: prev.tabs.map((t) =>
                    t.id === targetId ? { ...t, activeSite: null } : t,
                ),
            };
        });
    }, []);

    // Uses an AbortController so a stale fetch after unmount cannot mutate state.
    const openDocumentInNewTab = useCallback(
        async (
            docId: string,
            type: string,
            siteId: string,
            siteTitle: string,
        ) => {
            const site = await client
                .fetch<ActiveSite>(
                    `*[_id == $id][0]`,
                    { id: siteId },
                    { signal: new AbortController().signal },
                )
                .catch(() => null);

            if (!site) return;

            const path = `/${workspace}/structure/intent/edit/id=${docId.replace(/^drafts\./, "")};type=${type}?site=${siteId}`;

            pendingEffectRef.current = { site, savedPath: path };

            setTabsState((prev) => {
                const newTab = makeDefaultTab();
                return {
                    tabs: [
                        ...prev.tabs,
                        {
                            ...newTab,
                            label: `${siteTitle} | [${type}]...`,
                            activeSite: site,
                            savedPath: path,
                        },
                    ],
                    activeTabId: newTab.id,
                };
            });
        },
        [workspace, client],
    );

    // ─── Mount: hydrate from sessionStorage + handle ?site= deep-link ────────

  useEffect(() => {
      const searchParams = new URLSearchParams(window.location.search);
      const siteIdFromUrl = searchParams.get("site");
      const stored = getActiveSite(workspace);

      // 1. If we have a URL param, it's the strongest source of truth
      if (siteIdFromUrl) {
          client
              .fetch<ActiveSite>(`*[_id == $siteId][0]`, {
                  siteId: siteIdFromUrl,
              })
              .then((site) => {
                  if (site) {
                      // Update tab state AND set as active globally
                      setTabsState((prev) => ({
                          ...prev,
                          tabs: prev.tabs.map((t) =>
                              t.id === prev.activeTabId
                                  ? {
                                        ...t,
                                        activeSite: site,
                                        label: site.title ?? t.label,
                                    }
                                  : t,
                          ),
                      }));
                      setActiveSite(workspace, site);
                      emitSiteChanged();
                  }
              });
      }
      // 2. Fallback to storage ONLY if the URL doesn't have a site param
      else if (stored) {
          setTabsState((prev) => {
              const active = prev.tabs.find((t) => t.id === prev.activeTabId);
              if (active?.activeSite) return prev;
              return {
                  ...prev,
                  tabs: prev.tabs.map((t) =>
                      t.id === prev.activeTabId
                          ? {
                                ...t,
                                activeSite: stored,
                                label: stored.title ?? t.label,
                            }
                          : t,
                  ),
              };
          });
      }
  }, [workspace, client]);

    // ─── Value ────────────────────────────────────────────────────────────────

    const value = useMemo<WorkspaceTabsContextValue>(
        () => ({
            workspace,
            tabs: tabsState.tabs,
            activeTabId: tabsState.activeTabId,
            activeTab,
            activeSite,
            tabsEnabled,
            maxTabs,
            addTab,
            removeTab,
            setActiveTab,
            renameTab,
            setTabPath,
            setActiveTabSite,
            selectSite,
            clearSite,
            openDocumentInNewTab,
        }),
        [
            workspace,
            tabsState,
            activeTab,
            activeSite,
            tabsEnabled,
            maxTabs,
            addTab,
            removeTab,
            setActiveTab,
            renameTab,
            setTabPath,
            setActiveTabSite,
            selectSite,
            clearSite,
            openDocumentInNewTab,
        ],
    );

    return (
        <WorkspaceTabsContext.Provider value={value}>
            {children}
        </WorkspaceTabsContext.Provider>
    );
}
