import { Button, Flex, } from "@sanity/ui";
import React from "react";
import { ToolLink, ToolMenuProps } from "sanity";

export function ToolMenu(props: ToolMenuProps) {
  const { activeToolName, context, tools } = props;

  const isSidebar = context === "sidebar";
  const direction = isSidebar ? "column" : "row";


  const improvedTools = tools.map((t) => {
    if (t.name === "releases") {
      return {
        ...t,
        title: "Utgivelser",
      }
    } else if (t.name === "schedules") {
      return {
        ...t,
        title: "Tidsplaner",
      }
    } 

    return t
  } )

  const blacklist = ["presentation", "schedules"]

  return (
      <Flex
          direction={direction}
          gap={1}
          justify={"flex-start"}
      >
          {improvedTools.filter((t) => !blacklist.includes(t.name))
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
