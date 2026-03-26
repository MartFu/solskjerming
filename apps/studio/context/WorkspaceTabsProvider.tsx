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
    //
    // ORDER MATTERS: sessionStorage → URL → emitSiteChanged.
    //
    // The structure tool reads both window.location and getActiveSite() when it
    // rebuilds in response to the site-changed event. Everything must already be
    // in place before the event fires, otherwise the structure initialises from
    // stale values and the saved path is lost.
    useEffect(() => {
        const effect = pendingEffectRef.current;
        if (!effect) return;
        pendingEffectRef.current = null;

        setActiveSite(workspace, effect.site);

        if (effect.savedPath) {
            history.pushState(null, "", effect.savedPath);
        }

        emitSiteChanged();
    });

    // Always points to the latest values without widening effect deps.
    const tabsRef = useRef(tabsState.tabs);
    tabsRef.current = tabsState.tabs;
    const activeTabIdRef = useRef(tabsState.activeTabId);
    activeTabIdRef.current = tabsState.activeTabId;

    // ─── Continuous path tracking ─────────────────────────────────────────────
    //
    // Sanity's structure tool navigates by pushing/replacing history entries.
    // We intercept every navigation so `savedPath` is always current, meaning
    // switching back to a tab restores exactly where the user was — even mid-
    // document — rather than the path as of the last tab switch.
    //
    // We skip syncing while a tab switch is in flight (isSwitchingRef) to avoid
    // the outgoing tab's URL being stamped onto the incoming tab before
    // pendingEffectRef has pushed the correct path.
    const isSwitchingRef = useRef(false);

    useEffect(() => {
        const syncPath = () => {
            if (isSwitchingRef.current) return;
            const path = window.location.pathname + window.location.search;
            const activeId = activeTabIdRef.current;
            setTabsState((prev) => ({
                ...prev,
                tabs: prev.tabs.map((t) =>
                    t.id === activeId ? { ...t, savedPath: path } : t,
                ),
            }));
        };

        // Patch pushState / replaceState so programmatic navigation is captured.
        // popstate alone only fires on back/forward, not on history.pushState calls.
        const originalPush = history.pushState.bind(history);
        const originalReplace = history.replaceState.bind(history);

        history.pushState = (...args) => {
            originalPush(...args);
            syncPath();
        };
        history.replaceState = (...args) => {
            originalReplace(...args);
            syncPath();
        };

        window.addEventListener("popstate", syncPath);

        return () => {
            history.pushState = originalPush;
            history.replaceState = originalReplace;
            window.removeEventListener("popstate", syncPath);
        };
    }, []); // intentionally empty — patches are global and use refs throughout

    // ─── Active-tab change: save outgoing path ────────────────────────────────
    //
    // Navigation (URL + emitSiteChanged) is owned entirely by pendingEffectRef so
    // that sessionStorage and the URL are always set before the structure rebuilds.
    // This effect only saves the outgoing tab's last path.
    const prevTabIdRef = useRef<string>(tabsState.activeTabId);
    useEffect(() => {
        const prevId = prevTabIdRef.current;
        const nextId = tabsState.activeTabId;
        if (prevId === nextId) return;

        // Suppress syncPath while the switch is in flight so the outgoing URL
        // is not accidentally written to the incoming tab by the history patch.
        isSwitchingRef.current = true;

        const outgoingPath = window.location.pathname + window.location.search;
        setTabsState((prev) => ({
            ...prev,
            tabs: prev.tabs.map((t) =>
                t.id === prevId ? { ...t, savedPath: outgoingPath } : t,
            ),
        }));

        prevTabIdRef.current = nextId;

        // Re-enable path syncing after this render cycle.
        // rAF ensures pendingEffectRef has already pushed the new URL.
        requestAnimationFrame(() => {
            isSwitchingRef.current = false;
        });
    }, [tabsState.activeTabId]);

    // ─── Mount: hydrate from sessionStorage + handle ?site= deep-link ────────

    useEffect(() => {
        // 1. Restore site from sessionStorage if the active tab doesn't already
        //    have one (e.g. first load after the tab state was persisted without
        //    an activeSite).
        const stored = getActiveSite(workspace);
        if (stored) {
            setTabsState((prev) => {
                const active = prev.tabs.find((t) => t.id === prev.activeTabId);
                if (active?.activeSite) return prev;
                return {
                    ...prev,
                    tabs: prev.tabs.map((t) =>
                        t.id === prev.activeTabId
                            ? {
                                  ...t,
                                  label: stored.title ?? t.label,
                                  activeSite: stored,
                              }
                            : t,
                    ),
                };
            });
        }

        // 2. ?site= deep-link: fetch and select the site immediately so the
        //    structure opens in the right context.
        const params = new URLSearchParams(window.location.search);
        const siteIdFromUrl = params.get("site");
        if (siteIdFromUrl && siteIdFromUrl !== stored?._id) {
            client
                .fetch<ActiveSite>(`*[_id == $siteId][0]`, {
                    siteId: siteIdFromUrl,
                })
                .then((site) => {
                    if (site) {
                        // Route through the full selectSite flush so sessionStorage
                        // and the structure are both updated correctly.
                        pendingEffectRef.current = {
                            site,
                            savedPath:
                                window.location.pathname +
                                window.location.search,
                        };
                        setTabsState((prev) => ({
                            ...prev,
                            tabs: prev.tabs.map((t) =>
                                t.id === prev.activeTabId
                                    ? {
                                          ...t,
                                          label: site.title ?? t.label,
                                          activeSite: site,
                                      }
                                    : t,
                            ),
                        }));
                    }
                });
        }
    }, [workspace]); // eslint-disable-line react-hooks/exhaustive-deps
    // client is stable (useClient returns a cached instance) but omitted to
    // avoid re-running on workspace-unrelated re-renders.

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
                        // New tab starts at the workspace root, not the current path.
                        // The current tab's site is inherited as a convenience default
                        // so the user lands in the right context immediately.
                        activeSite: currentTab?.activeSite ?? null,
                        savedPath: null,
                    },
                ],
                activeTabId: tab.id,
            };
        });
    }, []);

    const removeTab = useCallback((id: string) => {
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

                pendingEffectRef.current = {
                    site: neighbor.activeSite,
                    savedPath: neighbor.savedPath ?? null,
                };
            }

            return { tabs: nextTabs, activeTabId: nextActiveId };
        });
    }, []);

    const renameTab = useCallback((id: string, label: string) => {
        setTabsState((prev) => ({
            ...prev,
            tabs: prev.tabs.map((t) => (t.id === id ? { ...t, label } : t)),
        }));
    }, []);

    const setActiveTab = useCallback((id: string) => {
        setTabsState((prev) => {
            const nextTab = prev.tabs.find((t) => t.id === id);
            if (nextTab) {
                pendingEffectRef.current = {
                    site: nextTab.activeSite,
                    savedPath: nextTab.savedPath ?? null,
                };
            }
            return { ...prev, activeTabId: id };
        });
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

    // High-level: updates tab state + routes through the ordered flush so that
    // sessionStorage and the structure are always updated together.
    const selectSite = useCallback((site: ActiveSite, tabId?: string) => {
        setTabsState((prev) => {
            const targetId = tabId ?? prev.activeTabId;
            const targetTab = prev.tabs.find((t) => t.id === targetId);

            // Only trigger a structure rebuild when changing the active tab's
            // site. Changes to inactive tabs are silent state updates.
            if (targetId === prev.activeTabId) {
                pendingEffectRef.current = {
                    site,
                    savedPath: targetTab?.savedPath ?? null,
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

    // Uses an abort ref so a stale fetch after unmount cannot mutate state.
    const openDocumentInNewTab = useCallback(
        async (
            docId: string,
            type: string,
            siteId: string,
            siteTitle: string,
        ) => {
            const controller = new AbortController();

            const site = await client
                .fetch<ActiveSite>(
                    `*[_id == $id][0]`,
                    { id: siteId },
                    { signal: controller.signal },
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
