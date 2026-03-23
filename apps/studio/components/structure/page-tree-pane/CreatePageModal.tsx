import { useState } from "react";
import {
  Box,
  Button,
  Card,
  Dialog,
  Flex,
  Grid,
  Stack,
  Text,
  TextInput,
} from "@sanity/ui";
import { AddIcon, ChevronRightIcon, DocumentIcon } from "@sanity/icons";
import { type ChildTypeInfo, type TreeNode } from "@/utils/page-tree";
import { CreatePageModalProps } from "./types";

// ─────────────────────────────────────────────────────────────
// PlacementBreadcrumb — shows where the new page will live
// ─────────────────────────────────────────────────────────────

function PlacementBreadcrumb({
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

// ─────────────────────────────────────────────────────────────
// TypeButton — selectable type option
// ─────────────────────────────────────────────────────────────

function TypeButton({
  typeInfo,
  isSelected,
  isChild,
  onSelect,
}: {
  typeInfo: ChildTypeInfo;
  isSelected: boolean;
  isChild: boolean;
  onSelect: () => void;
}) {
  const { title, description } = typeInfo;

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
        direction={"column"}
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
              {title}
            </Text>
          </Stack>
          <Text
            size={2}
            muted={!isSelected}
          >
            <DocumentIcon />
          </Text>
        </Flex>
          {(description) && (
            <Text
              size={1}
              muted
              style={{ whiteSpace: "normal" }}
            >
              {description}
            </Text>
          )}
      </Flex>
    </Button>
  );
}

// ─────────────────────────────────────────────────────────────
// CreatePageModal
// ─────────────────────────────────────────────────────────────

export function CreatePageModal({
  types,
  parentNode,
  ancestors,
  onConfirm,
  onClose,
}: CreatePageModalProps) {
  const [selectedType, setSelectedType] = useState<ChildTypeInfo>(types[0]);
  const [title, setTitle] = useState("");

  const handleConfirm = () => {
    onConfirm(selectedType.type, selectedType.templateId, title.trim());
  };

  const isChild = Boolean(parentNode);

  return (
    <Dialog
      id="create-page-modal"
      header="Ny side"
      width={1}
      onClose={onClose}
      footer={
        <Card
          padding={3}
          borderTop
        >
          <Flex
            justify="flex-end"
            gap={2}
          >
            <Button
              text="Avbryt"
              mode="ghost"
              onClick={onClose}
            />
            <Button
              text="Opprett side"
              tone="primary"
              icon={AddIcon}
              disabled={!title.trim()}
              onClick={handleConfirm}
            />
          </Flex>
        </Card>
      }
    >
      <Stack
        space={5}
        paddingX={4}
        paddingTop={2}
        paddingBottom={4}
      >
        {/* Placement */}
        <Stack space={3}>
          <Text
            size={0}
            weight="semibold"
            muted
            style={{ textTransform: "uppercase", letterSpacing: "0.05em" }}
          >
            Plassering
          </Text>
          <PlacementBreadcrumb
            ancestors={ancestors}
            parentNode={parentNode}
            newPageTitle={title}
          />
        </Stack>

        {/* Title */}
        <Stack space={2}>
          <Text
            size={0}
            weight="semibold"
            muted
            style={{ textTransform: "uppercase", letterSpacing: "0.05em" }}
          >
            Tittel
          </Text>
          <TextInput
            placeholder="Sidens tittel…"
            value={title}
            onChange={(e) => setTitle(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && title.trim()) handleConfirm();
            }}
            autoFocus
          />
        </Stack>

        {/* Type selection — only shown when there's a choice */}
        {types.length > 1 && (
          <Stack space={3}>
            <Text
              size={0}
              weight="semibold"
              muted
              style={{ textTransform: "uppercase", letterSpacing: "0.05em" }}
            >
              Velg Sidetype
            </Text>
            <Grid
              gap={2}
              columns={[1, 2]}
            >
              {types.map((typeInfo) => (
                <TypeButton
                  key={typeInfo.type}
                  typeInfo={typeInfo}
                  isChild={isChild}
                  isSelected={selectedType.type === typeInfo.type}
                  onSelect={() => setSelectedType(typeInfo)}
                />
              ))}
            </Grid>
          </Stack>
        )}
      </Stack>
    </Dialog>
  );
}
