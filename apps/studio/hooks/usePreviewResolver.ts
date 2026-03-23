import { packageRegistry } from "@/schemaTypes/documents/packages";
import { useToolLayout } from "@/context/ToolLayoutProvider";
import { API_VERSION, PREVIEW_BASE } from "@/utils/env";
import { buildPreviewUrl, getPreviewContext } from "@/utils/preview";
import { useEffect } from "react";
import { useClient } from "sanity";
import { useRouter } from "sanity/router";
import { RouterPanes } from "sanity/structure";

export function usePreviewResolver() {
  const { state } = useRouter();
  const { activeSite, setPreviewUrl } = useToolLayout();
  const client = useClient({ apiVersion: API_VERSION });

  const panes = (state?.panes ?? []) as RouterPanes;
  const preview = getPreviewContext(panes);
  // Track the raw pane ID of the open document editor — changes on every navigation
  const openPaneId = panes[1]?.[0]?.id;

    useEffect(() => {
      const siteSlug = activeSite?.slug;

    if (!preview || !activeSite || (!siteSlug && !PREVIEW_BASE && !activeSite.domain)) {
      setPreviewUrl(null);
      return;
    }

    
    let cancelled = false;
    setPreviewUrl(null);
    
    async function resolve() {
      if (!preview || !activeSite) return;
      
      // Fetch slug (and _type if unknown) in one query
      const doc = await client.fetch<{ _type: string; slug?: { current: string } }>(
        `*[_id == $id || _id == $draftId][0] { _type, slug }`,
        { id: preview.docId, draftId: `drafts.${preview.docId}` },
      );
      
      if (cancelled) return;
      
      const type = preview.type ?? doc?._type;
      if (!type) {
        setPreviewUrl(null);
        return;
      }
      
      const pkgMeta = packageRegistry.lookup(type);
      const isRoutable = type === "page" || !!pkgMeta;
      
      if (!isRoutable) {
        setPreviewUrl(null);
        return;
      }

      const url = await buildPreviewUrl(
        client,
        activeSite,
        { ...preview, type },
        doc?.slug?.current,
      );

      if (!cancelled) setPreviewUrl(url);
    }

    resolve();

    return () => {
      cancelled = true;
    };
  }, [openPaneId, activeSite?._id, activeSite?.domain]);
}
