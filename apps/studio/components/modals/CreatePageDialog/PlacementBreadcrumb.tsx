import { TreeNode } from "@/utils/page-tree";
import { ChevronRightIcon } from "@sanity/icons";
import { Flex, Text } from "@sanity/ui";

export function PlacementBreadcrumb({
  ancestors,
  parentNode,
  newPageTitle,
}: {
  ancestors: TreeNode[];
  parentNode: TreeNode | null;
  newPageTitle: string;
}) {
  const crumbs = parentNode ? [...ancestors, parentNode] : ancestors;

  return (
    <Flex
      align="center"
      gap={1}
      wrap="wrap"
    >
      <Text
        size={1}
        muted
      >
        Sider
      </Text>
      {crumbs.map((crumb) => (
        <Flex
          key={crumb.doc._id}
          align="center"
          gap={1}
        >
          <Text
            size={1}
            muted
          >
            <ChevronRightIcon />
          </Text>
          <Text
            size={1}
            muted
          >
            {crumb.doc.title ?? "Uten tittel"}
          </Text>
        </Flex>
      ))}
      <Flex
        align="center"
        gap={1}
      >
        <Text
          size={1}
          muted
        >
          <ChevronRightIcon />
        </Text>
        <Text
          size={1}
          weight="medium"
        >
          {newPageTitle || "Ny side"}
        </Text>
      </Flex>
    </Flex>
  );
}
