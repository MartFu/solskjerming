import { Box, Flex } from "@sanity/ui";
import { type ActiveToolLayoutProps } from "sanity";
import { TopBar } from "./TopBar";
import { useToolLayout } from "@/context/ToolLayoutProvider";
import { usePreviewResolver } from "@/hooks/usePreviewResolver";

import { PreviewPane } from "./PreviewPane";

function PreviewResolver() {
  usePreviewResolver();
  return null;
}

export function Layout(props: ActiveToolLayoutProps) {
  const { activeSite, previewUrl, previewHidden } = useToolLayout();

  const showPreview =
    props.activeTool.name === "structure" &&
    !!activeSite &&
    !previewHidden &&
    !!previewUrl;

  return (
    <Flex direction="column" height="fill">
      {props.activeTool.name !== "vision" && <TopBar />}

      <Flex flex={1} style={{ minHeight: 0 }}>
        <Box flex={1} style={{ minHeight: 0, overflow: "auto" }}>
          {props.renderDefault(props)}
        </Box>

        {props.activeTool.name === "structure" && activeSite && (
          <PreviewResolver />
        )}

        {showPreview && <PreviewPane url={previewUrl} loading={false} />}
      </Flex>
    </Flex>
  );
}
