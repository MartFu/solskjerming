import { ModuleCreationOptions } from "@/utils/modules";
import { TreeNode } from "@/utils/page-tree";
import { AddIcon } from "@sanity/icons";
import { Button, Card, Dialog, Flex, Grid, Stack, Text, TextInput } from "@sanity/ui";
import { useState } from "react";
import { PlacementBreadcrumb } from "./PlacementBreadcrumb";
import { OptionButton } from "./OptionButton";

export interface CreatePageModalProps {
  options: ModuleCreationOptions[];
  parentNode: TreeNode | null;
  ancestors: TreeNode[];
  onConfirm: (option: ModuleCreationOptions, title?: string) => void;
  onClose: () => void;
}

export function CreatePageModal({
  options,
  parentNode,
  ancestors,
  onConfirm,
  onClose,
}: CreatePageModalProps) {
  const [selected, setSelected] = useState<ModuleCreationOptions>(options[0]);
  const [title, setTitle] = useState("");

  const handleConfirm = () => {
    onConfirm(selected, title.trim());
  };

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
        {options.length > 1 && (
          <Stack space={3}>
            <Text
              size={0}
              weight="semibold"
              muted
              style={{ textTransform: "uppercase", letterSpacing: "0.05em" }}
            >
              Velg sidetype
            </Text>
            <Grid
              gap={2}
              columns={[1, 2]}
            >
              {options.map((option) => (
                <OptionButton
                  key={option.templateId}
                  option={option}
                  isSelected={selected.templateId === option.templateId}
                  onSelect={() => setSelected(option)}
                />
              ))}
            </Grid>
          </Stack>
        )}
      </Stack>
    </Dialog>
  );
}
