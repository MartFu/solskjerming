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

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WorkspaceTabsContextValue {
  workspace: WorkspaceKey;
  tabs: Tab[];
  activeTabId: string;
  activeTab: Tab;
  tabsEnabled: boolean;
  maxTabs: number;
  addTab: () => void;
  removeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  renameTab: (id: string, label: string) => void;
  /** Stamps activeSite onto the specified tab (defaults to active tab) */
  setActiveTabSite: (site: ActiveSite | null, tabId?: string) => void;
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
  const [tabsState, setTabsState] = useState<TabsState>(() =>
    loadTabsState(workspace),
  );

  const tabsEnabled = tabSettings.enabled;
  const maxTabs = tabSettings.maxTabs;

  // Persist to localStorage on every change
  useEffect(() => {
    saveTabsState(workspace, tabsState);
  }, [workspace, tabsState]);

  const activeTab = useMemo(
    () =>
      tabsState.tabs.find((t) => t.id === tabsState.activeTabId) ??
      tabsState.tabs[0],
    [tabsState],
  );

  // On tab switch: save outgoing URL, restore incoming URL
  const prevTabIdRef = useRef<string>(tabsState.activeTabId);
  useEffect(() => {
    const prevId = prevTabIdRef.current;
    const nextId = tabsState.activeTabId;
    if (prevId === nextId) return;

    const outgoingPath = window.location.pathname + window.location.search;

    setTabsState((prev) => {
      const incoming = prev.tabs.find((t) => t.id === nextId);
      history.replaceState(
        null,
        "",
        incoming?.savedPath ?? `/${workspace}/structure`,
      );
      window.dispatchEvent(new PopStateEvent("popstate", { state: null }));
      emitSiteChanged();
      return {
        ...prev,
        tabs: prev.tabs.map((t) =>
          t.id === prevId ? { ...t, savedPath: outgoingPath } : t,
        ),
      };
    });

    prevTabIdRef.current = nextId;
  }, [tabsState.activeTabId, workspace]);

  // ─── Operations ───────────────────────────────────────────────────────────

  const addTab = useCallback(() => {
    setTabsState((prev) => {
      const currentTab = prev.tabs.find((t) => t.id === prev.activeTabId);
      const tab = makeDefaultTab();
      return {
        tabs: [
          ...prev.tabs,
          {
            ...tab,
            label: `Fane ${prev.tabs.length + 1}`,
            // Inherit site and position from the current tab so the new tab
            // lands in the structure rather than dropping back to WorkspaceView
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
      if (prev.tabs.length === 1) return prev;
      const idx = prev.tabs.findIndex((t) => t.id === id);
      const next = prev.tabs.filter((t) => t.id !== id);
      const nextActiveId =
        prev.activeTabId === id
          ? (next[Math.min(idx, next.length - 1)]?.id ?? next[0].id)
          : prev.activeTabId;
      return { tabs: next, activeTabId: nextActiveId };
    });
  }, []);

  const setActiveTab = useCallback((id: string) => {
    setTabsState((prev) => ({ ...prev, activeTabId: id }));
  }, []);

  const renameTab = useCallback((id: string, label: string) => {
    setTabsState((prev) => ({
      ...prev,
      tabs: prev.tabs.map((t) => (t.id === id ? { ...t, label } : t)),
    }));
  }, []);

  const setActiveTabSite = useCallback(
    (site: ActiveSite | null, tabId?: string) => {
      setTabsState((prev) => ({
        ...prev,
        tabs: prev.tabs.map((t) =>
          t.id === (tabId ?? prev.activeTabId) ? { ...t, activeSite: site } : t,
        ),
      }));
    },
    [],
  );

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
    ],
  );

  return (
    <WorkspaceTabsContext.Provider value={value}>
      {children}
    </WorkspaceTabsContext.Provider>
  );
}
