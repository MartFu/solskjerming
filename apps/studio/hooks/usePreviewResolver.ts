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

  useEffect(() => {
    const siteSlug = activeSite?.slug

    if (!preview || !activeSite || (!siteSlug && !PREVIEW_BASE && !activeSite.domain)) {
      setPreviewUrl(null);
      return;
    }

    let cancelled = false;
    setPreviewUrl(null);

    const pkgMeta = packageRegistry.lookup(preview.type);
    const isRoutable = preview.type === "page" || !!pkgMeta;

    if (!isRoutable) {
      buildPreviewUrl(client, activeSite, preview).then((url) => {
        if (!cancelled) setPreviewUrl(url);
      });
      return () => {
        cancelled = true;
      };
    }

    client
      .fetch<{ slug?: { current: string } }>(
        `*[_id == $id || _id == $draftId][0] { slug }`,
        { id: preview.docId, draftId: `drafts.${preview.docId}` },
      )
      .then(async (doc) => {
        if (cancelled) return;
        const url = await buildPreviewUrl(
          client,
          activeSite,
          preview,
          doc?.slug?.current,
        );
        if (!cancelled) setPreviewUrl(url);
      });

    return () => {
      cancelled = true;
    };
  }, [preview?.docId, activeSite?._id, activeSite?.domain]);
}
