import { useState, useCallback } from "react";
import { Box, Button, Flex, Text } from "@sanity/ui";
import { AddIcon, DocumentIcon, FolderIcon, EditIcon } from "@sanity/icons";
import { ChevronDown, ChevronRight } from "lucide-react";

import { getAncestors, type TreeNode } from "@/utils/page-tree";
import { moduleRegistry } from "@/schemaTypes/documents/modules";
import { usePageCreation } from "@/context/PageCreationProvider";
import type { ExpandableTreeProps, ModalState } from "./types";
import { HoverCard } from "@/components/hover-card";

// ─────────────────────────────────────────────────────────────
// TreeNodeRow
// ─────────────────────────────────────────────────────────────

function TreeNodeRow({
  node,
  depth,
  isExpanded,
  enabledPackages,
  tree,
  onToggle,
  onEdit,
  onOpenModal,
}: {
  node: TreeNode;
  depth: number;
  isExpanded: boolean;
  enabledPackages: string[];
  tree: TreeNode[];
  onToggle: (id: string) => void;
  onEdit: (docId: string, docType: string) => void;
  onOpenModal: (state: ModalState) => void;
}) {
  const hasChildren = node.children.length > 0;
  const title = node.doc.title ?? "Uten tittel";
  const slug = node.doc.slug;

  // Ask the registry what can be created under this node
  const creationOptions = moduleRegistry.getCreationOptions(
    node.doc.internalRole,
    enabledPackages,
  );
  const canCreate = creationOptions.length > 0;

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const ancestors = getAncestors(tree, node.doc._id);
    onOpenModal({ options: creationOptions, parentNode: node, ancestors });
  };

  return (
    <Box>
      <HoverCard
        radius={0}
        paddingY={2}
        paddingRight={3}
        style={{
          paddingLeft: depth * 16 + 4,
          position: "relative",
        }}
      >
        {/* Indent guide line */}
        {depth > 0 && (
          <Box
            style={{
              position: "absolute",
              left: depth * 16,
              top: 0,
              bottom: 0,
              width: 1,
              background: "var(--card-border-color)",
            }}
          />
        )}

        <Flex
          align="center"
          gap={2}
        >
          {/* Expand/collapse toggle */}
          <Button
            mode="bleed"
            tone="primary"
            padding={1}
            style={{
              flexShrink: 0,
              height: 24,
              width: 24,
              opacity: hasChildren ? 1 : 0.15,
              pointerEvents: hasChildren ? "auto" : "none",
            }}
            onClick={() => onToggle(node.doc._id)}
          >
            <Flex
              justify="center"
              align="center"
            >
              {isExpanded ? (
                <ChevronDown style={{ width: 18, height: 18 }} />
              ) : (
                <ChevronRight style={{ width: 18, height: 18 }} />
              )}
            </Flex>
          </Button>

          {/* Title + slug */}
          <Flex
            flex={1}
            gap={1}
            direction="column"
            style={{ cursor: "pointer", minWidth: 0 }}
            onClick={() => onEdit(node.doc._id, node.doc._type)}
          >
            <Text
              size={1}
              weight="medium"
              style={{
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                marginBottom: slug ? 2 : 0,
              }}
            >
              {title}
            </Text>
            {slug && (
              <Text
                size={0}
                muted
                style={{ textOverflow: "ellipsis", whiteSpace: "nowrap" }}
              >
                {slug}
              </Text>
            )}
          </Flex>

          {/* Actions — only visible on hover */}
          <Flex
            gap={1}
            align="center"
            paddingRight={1}
            className="show-on-card-hover"
            style={{ transition: "opacity 120ms ease" }}
          >
            <Button
              icon={EditIcon}
              mode="ghost"
              tone="primary"
              style={{ flexShrink: 0, width: 24, height: 24 }}
              padding={1}
              onClick={(e) => {
                e.stopPropagation();
                onEdit(node.doc._id, node.doc._type);
              }}
            />
            {canCreate && (
              <Button
                icon={AddIcon}
                mode="ghost"
                tone="primary"
                padding={1}
                fontSize={0}
                style={{ flexShrink: 0, width: 24, height: 24 }}
                onClick={handleAddClick}
              />
            )}
          </Flex>

          {/* Page icon */}
          <Text
            size={1}
            muted
            style={{ flexShrink: 0 }}
            title={hasChildren ? "Har undersider" : "Ingen undersider"}
          >
            {hasChildren ? <FolderIcon /> : <DocumentIcon />}
          </Text>
        </Flex>
      </HoverCard>

      {/* Children */}
      {hasChildren && isExpanded && (
        <Box>
          {node.children.map((child) => (
            <ConnectedTreeNodeRow
              key={child.doc._id}
              node={child}
              depth={depth + 1}
              enabledPackages={enabledPackages}
              tree={tree}
              onEdit={onEdit}
              onOpenModal={onOpenModal}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}

function ConnectedTreeNodeRow({
  node,
  depth,
  enabledPackages,
  tree,
  onEdit,
  onOpenModal,
}: {
  node: TreeNode;
  depth: number;
  enabledPackages: string[];
  tree: TreeNode[];
  onEdit: (docId: string, docType: string) => void;
  onOpenModal: (state: ModalState) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const toggle = useCallback(() => setIsExpanded((v) => !v), []);

  return (
    <TreeNodeRow
      node={node}
      depth={depth}
      isExpanded={isExpanded}
      enabledPackages={enabledPackages}
      tree={tree}
      onToggle={toggle}
      onEdit={onEdit}
      onOpenModal={onOpenModal}
    />
  );
}

// ─────────────────────────────────────────────────────────────
// ExpandableTree
// ─────────────────────────────────────────────────────────────

export function ExpandableTree({
  tree,
  enabledPackages,
  onEdit,
}: ExpandableTreeProps) {
  const { openCreationModal } = usePageCreation();

  if (tree.length === 0) {
    return (
      <Box padding={4}>
        <Text
          muted
          size={1}
        >
          Ingen sider ennå.
        </Text>
      </Box>
    );
  }

  return (
    <Box padding={0}>
      {tree.map((node) => (
        <ConnectedTreeNodeRow
          key={node.doc._id}
          node={node}
          depth={0}
          enabledPackages={enabledPackages}
          tree={tree}
          onEdit={onEdit}
          onOpenModal={openCreationModal}
        />
      ))}
    </Box>
  );
}
