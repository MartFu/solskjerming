import { ChevronDownIcon, ChevronRightIcon } from "@sanity/icons";
import { Button, Card, Flex, Stack, Text } from "@sanity/ui";
import { useState } from "react";

export const CollapsibleFieldWrapper = ({
  title,
  children,
  defaultCollapsed = false,
}: {title: string; children: React.ReactNode; defaultCollapsed?: boolean}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  return (
    <Card
      border
      radius={2}
      marginBottom={4}
    >
      <Button
        mode="bleed"
        onClick={() => setIsCollapsed(!isCollapsed)}
        style={{ width: "100%" }}
        padding={3}
      >
        <Stack space={3}>
          <Flex
            align="center"
            justify="space-between"
          >
            <Text weight="semibold">{title}</Text>
            {isCollapsed ? <ChevronRightIcon /> : <ChevronDownIcon />}
          </Flex>
        </Stack>
      </Button>

      {!isCollapsed && (
        <Card
          padding={3}
          borderTop
        >
          {children}
        </Card>
      )}
    </Card>
  );
};
