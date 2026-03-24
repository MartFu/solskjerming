// ─── Tab ID context ───────────────────────────────────────────────────────────
// Consumed by createStructure (via a hook called at structure-resolve time) to
// know which BehaviorSubject to subscribe to for site changes.

import { createContext, useContext } from "react";

export const ActiveTabIdContext = createContext<string | null>(null);

export function useActiveTabId(): string | null {
  return useContext(ActiveTabIdContext);
}
