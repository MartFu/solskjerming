// context/ArchiveSiteContext.tsx
import React, { createContext, useContext, useMemo } from "react";
import {
  useDrilldownState,
  DrilldownSection,
  SectionView,
} from "@/hooks/useDrilldownState";
import { useToolLayout } from "@/context/ToolLayoutProvider";
import { WorkspaceKey } from "@/utils/constant";

interface ArchiveSiteContextValue {
  state: Record<DrilldownSection, SectionView>;
  drill: (section: DrilldownSection, id: string) => void;
  back: (section: DrilldownSection) => void;
  siteId: string; // The ID of the site being archived
  workspace: WorkspaceKey;
  generateStudioHref: (docId: string, docType: string) => string;
}

const ArchiveSiteContext = createContext<ArchiveSiteContextValue | null>(
  null,
);

export function ArchiveSiteProvider({
  siteId,
  children,
}: {
  siteId: string;
  children: React.ReactNode;
}) {
  const { state, drill, back } = useDrilldownState();
  const { workspace } = useToolLayout();

  const value = useMemo(
    () => ({
      state,
      drill,
      back,
      siteId,
      workspace,
      /**
       * Constructs the intent URL.
       * We append ?site={siteId} so the ToolLayoutProvider
       * can auto-switch context in the new tab.
       */
      generateStudioHref: (docId: string, docType: string) => {
        const cleanId = docId.replace(/^drafts\./, "");
        return `/${workspace}/intent/edit/id=${cleanId};type=${docType}?site=${siteId}`;
      },
    }),
    [state, drill, back, siteId, workspace],
  );

  return (
    <ArchiveSiteContext.Provider value={value}>
      {children}
    </ArchiveSiteContext.Provider>
  );
}

export const useArchiveSite = () => {
  const ctx = useContext(ArchiveSiteContext);
  if (!ctx)
    throw new Error(
      "useArchiveSite must be used within ArchiveSiteProvider",
    );
  return ctx;
};


