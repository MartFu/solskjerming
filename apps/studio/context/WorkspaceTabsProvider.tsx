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
import { loadTabsState, makeDefaultTab } from "@/utils/persistence/tabs";
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
    addTab: (siteTitle?: string, siteId?: string) => void;
    removeTab: (id: string) => void;
    setActiveTab: (id: string) => void;
    renameTab: (id: string, label: string) => void;
    /** Stamps activeSite onto the specified tab (defaults to active tab) */
    setActiveTabSite: (site: ActiveSite | null, tabId?: string) => void;
    openDocumentInNewTab: (
        docId: string,
        type: string,
        siteId: string,
        siteTitle: string,
    ) => Promise<void>;
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

    // Flush any pending side-effects (site sync + URL navigation) after each
    // render so they never run inside a setState updater.
    useEffect(() => {
        const effect = pendingEffectRef.current;
        if (!effect) return;
        pendingEffectRef.current = null;

        setActiveSite(workspace, effect.site);
        emitSiteChanged();

        if (effect.savedPath) {
            history.pushState(null, "", effect.savedPath);
            window.dispatchEvent(new PopStateEvent("popstate"));
        }
    });

    // Always points to the latest tabs without adding tabs to effect deps.
    const tabsRef = useRef(tabsState.tabs);
    tabsRef.current = tabsState.tabs;

    const prevTabIdRef = useRef<string>(tabsState.activeTabId);
    useEffect(() => {
        const prevId = prevTabIdRef.current;
        const nextId = tabsState.activeTabId;
        if (prevId === nextId) return;

        const outgoingPath = window.location.pathname + window.location.search;
        // Read from ref so we always have the latest tabs without widening deps.
        const incoming = tabsRef.current.find((t) => t.id === nextId);
        const incomingPath = incoming?.savedPath ?? `/${workspace}/structure`;

        setTabsState((prev) => ({
            ...prev,
            tabs: prev.tabs.map((t) =>
                t.id === prevId ? { ...t, savedPath: outgoingPath } : t,
            ),
        }));

        history.replaceState(null, "", incomingPath);
        window.dispatchEvent(new PopStateEvent("popstate", { state: null }));
        emitSiteChanged();

        prevTabIdRef.current = nextId;
    }, [tabsState.activeTabId, workspace]);

    // ─── Operations ───────────────────────────────────────────────────────────

    const addTab = useCallback((siteTitle?: string, siteId?: string) => {
        setTabsState((prev) => {
            const currentTab = prev.tabs.find((t) => t.id === prev.activeTabId);
            const tab = makeDefaultTab();

            const countOfKind = prev.tabs.reduce((acc, t) => {
                if (t.activeSite?._id === siteId) {
                    return acc + 1;
                } else {
                    return acc;
                }
            }, 0);

            return {
                tabs: [
                    ...prev.tabs,
                    {
                        ...tab,
                        label: `${siteTitle ?? "Fane"}${countOfKind > 0 ? ` (${countOfKind})` : prev.tabs.length > 0 ? ` (${prev.tabs.length + 1}` : ""}`,
                        activeSite: currentTab?.activeSite ?? null,
                        savedPath: currentTab?.savedPath ?? null,
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

                // Schedule side-effects to run after this render commits,
                // never inside the updater function.
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
                // Schedule side-effects to run after this render commits,
                // never inside the updater function.
                pendingEffectRef.current = {
                    site: nextTab.activeSite,
                    savedPath: nextTab.savedPath ?? null,
                };
            }
            return { ...prev, activeTabId: id };
        });
    }, []);

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

    const openDocumentInNewTab = useCallback(
        async (
            docId: string,
            type: string,
            siteId: string,
            siteTitle: string,
        ) => {
            const site = await client.fetch(`*[_id == $id][0]`, { id: siteId });

            const path = `/${workspace}/structure/intent/edit/id=${docId.replace(/^drafts\./, "")};type=${type}?site=${siteId}`;

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

            history.pushState(null, "", path);
            window.dispatchEvent(
                new PopStateEvent("popstate", { state: null }),
            );
        },
        [workspace, client],
    );

    useEffect(() => {
        const stored = getActiveSite(workspace);
        if (stored) {
            setActiveTabSite(stored);
        }
    }, [workspace, setActiveTabSite]);

    // ─── Value ────────────────────────────────────────────────────────────────

    const value = useMemo<WorkspaceTabsContextValue>(
        () => ({
            workspace,
            tabs: tabsState.tabs,
            activeTabId: tabsState.activeTabId,
            activeTab,
            tabsEnabled,
            maxTabs,
            addTab,
            removeTab,
            setActiveTab,
            renameTab,
            setActiveTabSite,
            openDocumentInNewTab,
        }),
        [
            workspace,
            tabsState,
            activeTab,
            tabsEnabled,
            maxTabs,
            addTab,
            removeTab,
            setActiveTab,
            renameTab,
            setActiveTabSite,
            openDocumentInNewTab,
        ],
    );

    return (
        <WorkspaceTabsContext.Provider value={value}>
            {children}
        </WorkspaceTabsContext.Provider>
    );
}
