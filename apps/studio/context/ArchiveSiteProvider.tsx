// context/ArchiveSiteContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  useDrilldownState,
  DrilldownSection,
  SectionView,
} from "@/hooks/useDrilldownState";
import { useToolLayout } from "@/context/ToolLayoutProvider";
import { WorkspaceKey } from "@/utils/constant";
import {
  getSiteDeletionPreview,
  SiteDeletionPreview,
} from "@/utils/site/getSiteDeletionPreview";
import { useClient } from "sanity";
import { API_VERSION } from "@/utils/env";
import {
  PreparedDeletionData,
  prepareDeletionData,
} from "@/utils/site/buildSiteDocumentTree";
import { archiveSite } from "@/utils/site/archiveSite";

interface ArchiveSiteContextValue {
  state: Record<DrilldownSection, SectionView>;
  siteId: string;
  data: PreparedDeletionData | null;
  previewLoading: string | null;
  archiving: boolean;
  workspace: WorkspaceKey;
  isAlreadyArchived: boolean;
  error: string | null;
  archiveSite: () => Promise<void>;
  drill: (section: DrilldownSection, id: string) => void;
  back: (section: DrilldownSection) => void;
  generateStudioHref: (docId: string, docType: string) => string;
  close: () => void;
}

const ArchiveSiteContext = createContext<ArchiveSiteContextValue | null>(null);

export function ArchiveSiteProvider({
  siteId,
  children,
  onClose,
  onArchived,
}: {
  siteId: string;
  children: React.ReactNode;
  onClose: () => void;
  onArchived?: (siteId: string) => void;
}) {
  const [preview, setPreview] = useState<SiteDeletionPreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState<string | null>(null);
  const [archiving, setArchiving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PreparedDeletionData | null>(null);

  const client = useClient({ apiVersion: API_VERSION });
  const { state, drill, back } = useDrilldownState();
  const { workspace } = useToolLayout();

  const isAlreadyArchived = preview ? preview.site.isAlreadyArchived : false;

  const handleArchiveSite = async () => {
    setArchiving(true);
    if (!preview) {
      setArchiving(false);
      return;
    }

    try {
      const result = await archiveSite(client, preview);
      if (!result.success) {
        throw new Error(result.error);
      }
      setError(null);
      setArchiving(false);
      onArchived?.(siteId);
    } catch (err) {
      // FIX #4: Always set a meaningful error message, even for non-Error throws
      setError(
        err instanceof Error
          ? err.message
          : "Ukjent feil ved arkivering. Prøv igjen.",
      );
    } finally {
      setArchiving(false);
    }
  };

  useEffect(() => {
    setPreviewLoading(siteId);
    const fetchPreview = async () => {
      try {
        const result = await getSiteDeletionPreview(client, siteId);
        const prepared = prepareDeletionData(result);
        setData(prepared);
        setPreview(result);
      } catch (err) {
        console.error("Kunne ikke hente arkiveringsdata", err);
        setError("Kunne ikke hente arkiveringsdata. Prøv igjen.");
      } finally {
        setPreviewLoading(null);
      }
    };

    fetchPreview();
  }, [siteId, client]);

  // FIX #2: close() tells the parent to unmount this provider entirely,
  // which is the proper way to dismiss the dialog.
  const close = () => {
    onClose();
  };

  // FIX #3: Include ALL captured state in the dependency array so consumers
  // never see stale values.
  const value = useMemo(
    () => ({
      state,
      siteId,
      workspace,
      previewLoading,
      data,
      archiving,
      isAlreadyArchived,
      error,
      drill,
      back,
      archiveSite: handleArchiveSite,
      close,
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
    [
      state,
      drill,
      back,
      siteId,
      workspace,
      previewLoading,
      data,
      archiving,
      isAlreadyArchived,
      error,
    ],
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
    throw new Error("useArchiveSite must be used within ArchiveSiteProvider");
  return ctx;
};
