import { useCallback, useMemo, useState } from "react";
import { Box, Button, Card, Flex, Stack, Text } from "@sanity/ui";
import {
  AddIcon,
  ChevronRightIcon,
  DocumentIcon,
  EditIcon,
} from "@sanity/icons";

import { findNode, getAncestors, type TreeNode } from "@/utils/page-tree";
import { moduleRegistry } from "@/schemaTypes/documents/modules";
import { usePageCreation } from "@/context/PageCreationProvider";
import type { DrillDownTreeProps } from "./types";

// ─────────────────────────────────────────────────────────────
// Breadcrumb
// ─────────────────────────────────────────────────────────────

function Breadcrumb({
  crumbs,
  onNavigate,
}: {
  crumbs: TreeNode[];
  onNavigate: (id: string | null) => void;
}) {
  return (
    <Card
      padding={1}
      borderBottom
      style={{
        borderStyle: "dashed",
        borderTop: "none",
        borderLeft: "none",
        borderRight: "none",
      }}
    >
      <Flex
        align="center"
        gap={1}
        wrap="wrap"
      >
        <Button
          mode="bleed"
          padding={2}
          onClick={() => onNavigate(null)}
          style={{ fontWeight: crumbs.length === 0 ? 700 : 400 }}
        >
          <Text size={1}>Sider</Text>
        </Button>

        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          return (
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
              <Button
                mode="bleed"
                padding={2}
                onClick={() => onNavigate(crumb.doc._id)}
                style={{ fontWeight: isLast ? 700 : 400 }}
              >
                <Text size={1}>{crumb.doc.title ?? "Uten tittel"}</Text>
              </Button>
            </Flex>
          );
        })}
      </Flex>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────
// DrillDownRow
// ─────────────────────────────────────────────────────────────

function DrillDownRow({
  node,
  onNavigate,
  onEdit,
}: {
  node: TreeNode;
  onNavigate: (id: string) => void;
  onEdit: (docId: string, docType: string) => void;
}) {
  const title = node.doc.title ?? "Uten tittel";
  const slug = node.doc.slug;
  const isPrivate = node.doc.seoNoIndex;

  return (
    <Card
      padding={2}
      radius={2}
      style={{ cursor: "pointer" }}
      onClick={() =>
        node.canHaveChildren
          ? onNavigate(node.doc._id)
          : onEdit(node.doc._id, node.doc._type)
      }
      as="button"
      tone="neutral"
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
            {title}
          </Text>
          {slug && (
            <Text
              size={0}
              muted
            >
              {slug}
              {isPrivate && " · skjult"}
            </Text>
          )}
        </Stack>

        {node.canHaveChildren && (
          <>
            <Button
              icon={EditIcon}
              mode="ghost"
              tone="primary"
              style={{ marginLeft: "auto" }}
              padding={2}
              onClick={(e) => {
                e.stopPropagation();
                onEdit(node.doc._id, node.doc._type);
              }}
            />
            <Text
              size={1}
              muted
            >
              <ChevronRightIcon />
            </Text>
          </>
        )}
      </Flex>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────
// DrillDownTree
// ─────────────────────────────────────────────────────────────

export function DrillDownTree({
  tree,
  enabledPackages,
  onEdit,
}: DrillDownTreeProps) {
  const [currentParentId, setCurrentParentId] = useState<string | null>(null);
  const { openCreationModal } = usePageCreation();

  const navigateTo = useCallback((id: string | null) => {
    setCurrentParentId(id);
  }, []);

  const currentNode = useMemo(
    () => (currentParentId ? findNode(tree, currentParentId) : null),
    [tree, currentParentId],
  );

  const currentChildren = useMemo(
    () => (currentParentId ? (currentNode?.children ?? []) : tree),
    [tree, currentParentId, currentNode],
  );

  const breadcrumbs = useMemo(() => {
    if (!currentParentId) return [];
    const ancestors = getAncestors(tree, currentParentId);
    if (currentNode) return [...ancestors, currentNode];
    return ancestors;
  }, [tree, currentParentId, currentNode]);

  // Ask the registry what can be created under the current node
  const creationOptions = useMemo(
    () =>
      moduleRegistry.getCreationOptions(
        currentNode?.doc.internalRole,
        enabledPackages,
      ),
    [currentNode, enabledPackages],
  );

  const handleOpenModal = () => {
    const ancestors = currentNode
      ? getAncestors(tree, currentNode.doc._id)
      : [];
    openCreationModal({
      options: creationOptions,
      parentNode: currentNode,
      ancestors,
    });
  };

  return (
    <Stack
      space={0}
      style={{ height: "100%" }}
    >
      <Breadcrumb
        crumbs={breadcrumbs}
        onNavigate={navigateTo}
      />

      <Box
        flex={1}
        overflow="auto"
        padding={2}
      >
        {currentChildren.length === 0 ? (
          <Box padding={3}>
            <Text
              muted
              size={1}
            >
              Ingen undersider ennå.
            </Text>
          </Box>
        ) : (
          <Stack space={1}>
            {currentChildren.map((node) => (
              <DrillDownRow
                key={node.doc._id}
                node={node}
                onNavigate={navigateTo}
                onEdit={onEdit}
              />
            ))}
          </Stack>
        )}
      </Box>

      {creationOptions.length > 0 && (
        <Card
          padding={3}
          borderTop
        >
          <Button
            icon={AddIcon}
            text={currentNode ? "Ny underside" : "Ny side"}
            mode="ghost"
            tone="primary"
            onClick={handleOpenModal}
          />
        </Card>
      )}
    </Stack>
  );
}
