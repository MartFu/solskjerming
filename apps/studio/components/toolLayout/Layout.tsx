import { Flex } from "@sanity/ui";
import { useDocumentForm, type ActiveToolLayoutProps } from "sanity";
import { TopBar } from "./TopBar";
import { useRouter, useRouterState } from "sanity/router";
import { useToolLayout } from "@/context/ToolLayoutProvider";

export function Layout(props: ActiveToolLayoutProps) {
  const routerState = useRouterState();
  const {state} = useRouter()
  const { activeSite, previewUrl } = useToolLayout();
 
  console.log("LAYOUT: ", activeSite, routerState, state)

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

        {/*
           When appropriate (a document with a preview url is open),
           render a preview pane here
        */}
      </Flex>
    </Flex>
  );
}
