import { ModuleCreationOptions } from "@/utils/modules";
import { DocumentIcon } from "@sanity/icons";
import { Button, Flex, Stack, Text } from "@sanity/ui";

export function OptionButton({
  option,
  isSelected,
  onSelect,
}: {
  option: ModuleCreationOptions;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <Button
      padding={3}
      radius={2}
      tone={isSelected ? "neutral" : undefined}
      mode={isSelected ? "ghost" : "bleed"}
      style={{ cursor: "pointer" }}
      onClick={onSelect}
    >
      <Flex
        direction="column"
        gap={3}
      >
        <Flex
          align="center"
          justify="space-between"
          gap={3}
        >
          <Stack space={1}>
            <Text
              size={1}
              weight="semibold"
            >
              {option.title}
            </Text>
          </Stack>
          <Text
            size={2}
            muted={!isSelected}
          >
            <DocumentIcon />
          </Text>
        </Flex>
        {option.description && (
          <Text
            size={1}
            muted
            style={{ whiteSpace: "normal" }}
          >
            {option.description}
          </Text>
        )}
      </Flex>
    </Button>
  );
}
