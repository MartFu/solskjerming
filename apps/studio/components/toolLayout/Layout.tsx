import { Flex } from "@sanity/ui";
import type { ActiveToolLayoutProps } from "sanity";
import { TopBar } from "./TopBar";

export function Layout(props: ActiveToolLayoutProps) {
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
        {props.renderDefault(props)}
      </Flex>
    </Flex>
  );
}
