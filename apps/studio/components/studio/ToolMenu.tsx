import { PlugIcon } from "@sanity/icons";
import { Button, Flex, Text, Tooltip,  } from "@sanity/ui";
import React from "react";
import { ToolLink, ToolMenuProps } from "sanity";

export function ToolMenu(props: ToolMenuProps) {
  const { activeToolName, context, tools } = props;

  const isSidebar = context === "sidebar";
  const direction = isSidebar ? "column" : "row";


  return (
    <Flex
      direction={direction}
      gap={1}
      justify={"flex-start"}
    >
      {tools
        .filter((t) => t.name !== "releases" && t.name !== "schedules")
        .map((tool) => (
            <Button
              as={ToolLink}
              key={tool.name}
              name={tool.name}
              text={tool.title || tool.name}
              paddingX={[2]}
              paddingY={[2]}
              size={2}
              selected={tool.name === activeToolName}
              tone="neutral"
              mode="bleed"
            />
        ))}
    </Flex>
  );
}
