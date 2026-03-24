import { Box, Button, Card, Flex, Stack, Text } from "@sanity/ui";
import { DocumentIcon, EditIcon } from "@sanity/icons";
import { SearchResultsProps } from "./types";

export function SearchResults({
  results,
  onEdit,
  onClear,
}: SearchResultsProps) {
  if (results.length === 0) {
    return (
      <Box padding={4}>
        <Stack space={3}>
          <Text
            muted
            size={1}
          >
            Ingen resultater.
          </Text>
          <Button
            text="Tøm søk"
            mode="ghost"
            onClick={onClear}
          />
        </Stack>
      </Box>
    );
  }

  return (
    <Stack
      space={1}
      padding={2}
    >
      {results.map((node) => (
        <Card
          key={node.doc._id}
          padding={2}
          radius={2}
          style={{ cursor: "pointer" }}
          onClick={() => onEdit(node.doc._id, node.doc._type)}
        >
          <Flex
            align="center"
            gap={3}
          >
            <Box>
              <Text
                size={1}
                muted
              >
                <DocumentIcon />
              </Text>
            </Box>

            <Stack
              space={1}
              flex={1}
            >
              <Text
                size={1}
                weight="medium"
              >
                {node.doc.title ?? "Uten tittel"}
              </Text>
              {node.doc.slug && (
                <Text
                  size={0}
                  muted
                >
                  {node.doc.slug}
                </Text>
              )}
              {node.path.length > 1 && (
                <Text
                  size={0}
                  muted
                >
                  {node.path.slice(0, -1).join(" › ")}
                </Text>
              )}
            </Stack>

            <Button
              icon={EditIcon}
              mode="ghost"
              tone="primary"
              padding={2}
              onClick={(e) => {
                e.stopPropagation();
                onEdit(node.doc._id, node.doc._type);
              }}
            />
          </Flex>
        </Card>
      ))}
    </Stack>
  );
}
