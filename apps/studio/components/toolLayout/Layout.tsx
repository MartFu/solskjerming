import { Box, Flex } from "@sanity/ui";
import {  type ActiveToolLayoutProps } from "sanity";
import { TopBar } from "./TopBar";
import { useToolLayout } from "@/context/ToolLayoutProvider";

import { PreviewPane } from "./PreviewPane";

export function Layout(props: ActiveToolLayoutProps) {
    const { activeSite, preview, previewUrl, previewHidden, previewLoading } =
        useToolLayout();

    const showPreview =
        props.activeTool.name === "structure" &&
        !!preview &&
        !!activeSite &&
        !previewHidden;

    return (
        <Flex
            direction="column"
            height="fill"
        >
            {props.activeTool.name !== "vision" && <TopBar />}

            <Flex
                flex={1}
                style={{ minHeight: 0 }}
            >
                <Box
                    flex={1}
                    style={{ minHeight: 0 }}
                >
                    {props.renderDefault(props)}
                </Box>

                {showPreview && previewUrl && <PreviewPane url={previewUrl} loading={previewLoading} />}
            </Flex>
        </Flex>
    );
}
