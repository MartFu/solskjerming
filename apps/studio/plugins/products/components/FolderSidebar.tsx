import React, { useState, useCallback } from "react";
import {
  Box,
  Button,
  Card,
  Flex,
  Spinner,
  Stack,
  Text,
  TextInput,
  Tooltip,
  Badge,
} from "@sanity/ui";
import {
  ChevronRightIcon,
  ChevronDownIcon,
  FolderIcon,
  AddIcon,
  EditIcon,
  TrashIcon,
} from "@sanity/icons";
import type { FolderTreeNode, ProductListItem } from "../types";
import { collectProducts } from "../folderTree";

interface FolderSidebarProps {
  roots: FolderTreeNode[];
  unassigned: ProductListItem[];
  selectedFolderId: string | null;
  onSelectFolder: (id: string | null) => void;
  onCreateFolder: (parentId: string | null) => void;
  onRenameFolder: (id: string, currentName: string) => void;
  onDeleteFolder: (id: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

function FolderRow({
  node,
  depth,
  selectedFolderId,
  onSelect,
  onCreateChild,
  onRename,
  onDelete,
}: {
  node: FolderTreeNode;
  depth: number;
  selectedFolderId: string | null;
  onSelect: (id: string | null) => void;
  onCreateChild: (parentId: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const [hovered, setHovered] = useState(false);
  const isSelected = selectedFolderId === node._id;
  const totalProducts = collectProducts(node).length;

  return (
    <Stack space={0}>
      <Card
        as="button"
        tone={isSelected ? "primary" : "default"}
        selected={isSelected}
        padding={2}
        radius={2}
        style={{
          cursor: "pointer",
          paddingLeft: `${(depth + 1) * 12}px`,
          borderLeft: node.color
            ? `3px solid ${node.color}`
            : "3px solid transparent",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => onSelect(isSelected ? null : node._id)}
      >
        <Flex
          align="center"
          gap={1}
        >
          {/* Expand / collapse toggle */}
          {node.children.length > 0 ? (
            <Box
              as="span"
              style={{ cursor: "pointer", flexShrink: 0 }}
              onClick={(e) => {
                e.stopPropagation();
                setExpanded((v) => !v);
              }}
            >
              {expanded ? (
                <ChevronDownIcon style={{ fontSize: 12 }} />
              ) : (
                <ChevronRightIcon style={{ fontSize: 12 }} />
              )}
            </Box>
          ) : (
            <Box style={{ width: 16, flexShrink: 0 }} />
          )}

          <FolderIcon
            style={{
              flexShrink: 0,
              color: node.color ?? undefined,
              fontSize: 14,
            }}
          />

          <Text
            size={1}
            weight={isSelected ? "semibold" : "regular"}
            style={{ flex: 1, textAlign: "left" }}
          >
            {node.name}
          </Text>

          {totalProducts > 0 && (
            <Badge
              tone="default"
              size={1}
              style={{ flexShrink: 0 }}
            >
              {totalProducts}
            </Badge>
          )}

          {/* Action buttons — shown on hover */}
          {hovered && (
            <Flex
              gap={1}
              style={{ flexShrink: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Tooltip
                content={<Text size={0}>Add subfolder</Text>}
                placement="top"
              >
                <Button
                  icon={AddIcon}
                  mode="ghost"
                  padding={1}
                  fontSize={1}
                  onClick={() => onCreateChild(node._id)}
                />
              </Tooltip>
              <Tooltip
                content={<Text size={0}>Rename</Text>}
                placement="top"
              >
                <Button
                  icon={EditIcon}
                  mode="ghost"
                  padding={1}
                  fontSize={1}
                  onClick={() => onRename(node._id, node.name)}
                />
              </Tooltip>
              <Tooltip
                content={<Text size={0}>Delete folder</Text>}
                placement="top"
              >
                <Button
                  icon={TrashIcon}
                  mode="ghost"
                  padding={1}
                  fontSize={1}
                  tone="critical"
                  onClick={() => onDelete(node._id)}
                />
              </Tooltip>
            </Flex>
          )}
        </Flex>
      </Card>

      {expanded && node.children.length > 0 && (
        <Stack space={0}>
          {node.children.map((child) => (
            <FolderRow
              key={child._id}
              node={child}
              depth={depth + 1}
              selectedFolderId={selectedFolderId}
              onSelect={onSelect}
              onCreateChild={onCreateChild}
              onRename={onRename}
              onDelete={onDelete}
            />
          ))}
        </Stack>
      )}
    </Stack>
  );
}

export function FolderSidebar({
  roots,
  unassigned,
  selectedFolderId,
  onSelectFolder,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  searchQuery,
  onSearchChange,
}: FolderSidebarProps) {
  return (
    <Flex
      direction="column"
      style={{
        width: 240,
        minWidth: 200,
        maxWidth: 300,
        borderRight: "1px solid var(--card-border-color)",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {/* Search */}
      <Box
        paddingY={[2]}
        paddingX={[2]}
        style={{ borderBottom: "1px solid var(--card-border-color)" }}
      >
        <TextInput
          placeholder="Search products…"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.currentTarget.value)}
          fontSize={1}
        />
      </Box>

      {/* Folder tree */}
      <Box
        flex={1}
        overflow="auto"
        padding={2}
      >
        <Stack space={1}>
          {/* "All products" root */}
          <Card
            as="button"
            tone={
              selectedFolderId === null && !searchQuery ? "primary" : "default"
            }
            selected={selectedFolderId === null && !searchQuery}
            padding={2}
            radius={2}
            style={{ cursor: "pointer" }}
            onClick={() => {
              onSelectFolder(null);
              onSearchChange("");
            }}
          >
            <Flex
              align="center"
              gap={2}
            >
              <Text
                size={1}
                weight="semibold"
              >
                All products
              </Text>
            </Flex>
          </Card>

          {/* Folder tree nodes */}
          {roots.map((root) => (
            <FolderRow
              key={root._id}
              node={root}
              depth={0}
              selectedFolderId={selectedFolderId}
              onSelect={onSelectFolder}
              onCreateChild={onCreateFolder}
              onRename={onRenameFolder}
              onDelete={onDeleteFolder}
            />
          ))}

          {/* Unassigned bucket */}
          {unassigned.length > 0 && (
            <Card
              as="button"
              tone={
                selectedFolderId === "__unassigned__" ? "primary" : "default"
              }
              selected={selectedFolderId === "__unassigned__"}
              padding={2}
              radius={2}
              style={{
                cursor: "pointer",
                borderLeft: "3px solid var(--card-border-color)",
              }}
              onClick={() => onSelectFolder("__unassigned__")}
            >
              <Flex
                align="center"
                gap={2}
              >
                <Text
                  size={1}
                  muted
                >
                  Unfiled
                </Text>
                <Badge
                  tone="default"
                  size={1}
                >
                  {unassigned.length}
                </Badge>
              </Flex>
            </Card>
          )}
        </Stack>
      </Box>

      {/* Add root folder button */}
      <Box
        padding={2}
        style={{ borderTop: "1px solid var(--card-border-color)" }}
      >
        <Button
          icon={AddIcon}
          text="New folder"
          mode="ghost"
          fontSize={1}
          style={{ width: "100%" }}
          onClick={() => onCreateFolder(null)}
        />
      </Box>
    </Flex>
  );
}
