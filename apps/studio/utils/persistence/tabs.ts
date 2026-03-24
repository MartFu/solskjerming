import { WorkspaceKey } from "../constant";
import type { Tab, TabsState } from "../types";

const storageKey = (workspace: WorkspaceKey) => `studio:tabs-v1:${workspace}`;

export function makeDefaultTab(): Tab {
  return {
    id: crypto.randomUUID(),
    label: "Fane 1",
    savedPath: null,
    activeSite: null,
  };
}

export function loadTabsState(workspace: WorkspaceKey): TabsState {
  try {
    const raw = localStorage.getItem(storageKey(workspace));
    if (raw) {
      const parsed = JSON.parse(raw) as TabsState;
      if (
        Array.isArray(parsed.tabs) &&
        parsed.tabs.length > 0 &&
        parsed.activeTabId
      ) {
        return parsed;
      }
    }
  } catch {
    // Corrupt data — fall through to default
  }
  const tab = makeDefaultTab();
  return { tabs: [tab], activeTabId: tab.id };
}

export function saveTabsState(workspace: WorkspaceKey, state: TabsState): void {
  try {
    localStorage.setItem(storageKey(workspace), JSON.stringify(state));
  } catch {
    // Quota exceeded or private mode — silently ignore
  }
}