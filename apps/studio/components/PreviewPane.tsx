import { useEffect, useMemo } from "react";
import { Flex, Text, Spinner, Card } from "@sanity/ui";
import { usePaneRouter, type UserViewComponent } from "sanity/structure";
import { resolvePreviewUrl } from "@/utils/preview";
import { useToolLayout } from "@/context/ToolLayoutProvider";

// ─────────────────────────────────────────────────────────────
// PreviewPane
//
// Replaces sanity-plugin-iframe-pane as the preview view.
// Typed as UserViewComponent so it receives the live document
// directly from Sanity's view system — no subscriptions needed.
//
// Side effect: writes the current preview URL into ToolLayoutProvider
// so TopBar can read it. Cleans up (sets null) on unmount.
// ─────────────────────────────────────────────────────────────

export const PreviewPane: UserViewComponent = ({
  document: { displayed },
  schemaType,
}) => {
  const { setPreviewUrl } = useToolLayout();
  const { setView, groupIndex, hasGroupSiblings } = usePaneRouter();

  useEffect(() => {
    // If this pane is the sibling (index 1), force it to show 'preview' view
    if (hasGroupSiblings && groupIndex === 1) {
      setView("preview");
    }
  }, []);

  const url = useMemo(
    () =>
      resolvePreviewUrl(schemaType.name, displayed as Record<string, unknown>),
    [displayed, schemaType.name],
  );

  // Keep ToolLayoutProvider in sync with the current preview URL.
  // Cleanup on unmount so TopBar doesn't show a stale URL after
  // the user navigates away from this document.
  useEffect(() => {
    setPreviewUrl(url);
    return () => setPreviewUrl(null);
  }, [url, setPreviewUrl]);

  if (!url) {
    return (
      <Flex
        height="fill"
        align="center"
        justify="center"
        padding={6}
      >
        <Card
          padding={5}
          radius={2}
          tone="transparent"
          border
        >
          <Text
            size={1}
            muted
            align="center"
          >
            Forhåndsvisning er ikke tilgjengelig for dette dokumentet ennå.
            <br />
            Fyll inn alle påkrevde felt for å aktivere den.
          </Text>
        </Card>
      </Flex>
    );
  }

  return (
    <iframe
      src={url}
      style={{
        width: "100%",
        height: "100%",
        border: "none",
        display: "block",
      }}
      title="Forhåndsvisning"
    />
  );
};
