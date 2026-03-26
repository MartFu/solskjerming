import { Box, Flex } from "@sanity/ui";
import { type ActiveToolLayoutProps } from "sanity";
import { TopBar } from "./TopBar";

export function Layout(props: ActiveToolLayoutProps) {
    const currentTool = props.activeTool.name;

    return (
        <Flex
            direction="column"
            height="fill"
        >
            {currentTool !== "vision" && (
                <TopBar currentTool={props.activeTool.name} />
            )}

            <Flex
                flex={1}
                style={{ minHeight: 0 }}
            >
                <Box
                    flex={1}
                    style={{ minHeight: 0, overflow: "auto" }}
                >
                    {props.renderDefault(props)}
                </Box>
            </Flex>
        </Flex>
    );
}
