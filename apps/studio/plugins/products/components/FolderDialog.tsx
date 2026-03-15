import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  Flex,
  Label,
  Stack,
  Text,
  TextInput,
} from "@sanity/ui";

interface FolderDialogProps {
  mode: "create" | "rename";
  initialName?: string;
  parentName?: string;
  onConfirm: (name: string, color?: string) => Promise<void>;
  onClose: () => void;
}

const PRESET_COLORS = [
  "#e63946",
  "#f4a261",
  "#2a9d8f",
  "#457b9d",
  "#9b5de5",
  "#f15bb5",
  "#00bbf9",
  "#00f5d4",
];

export function FolderDialog({
  mode,
  initialName = "",
  parentName,
  onConfirm,
  onClose,
}: FolderDialogProps) {
  const [name, setName] = useState(initialName);
  const [color, setColor] = useState<string | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName(initialName);
  }, [initialName]);

  const handleConfirm = async () => {
    if (!name.trim()) {
      setError("Folder name is required.");
      return;
    }
    setSaving(true);
    try {
      await onConfirm(name.trim(), color);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      header={mode === "create" ? "New folder" : "Rename folder"}
      id="folder-dialog"
      onClose={onClose}
      width={0}
      footer={
        <Flex
          justify="flex-end"
          gap={2}
          padding={3}
        >
          <Button
            mode="ghost"
            text="Cancel"
            onClick={onClose}
          />
          <Button
            tone="primary"
            text={mode === "create" ? "Create" : "Rename"}
            loading={saving}
            disabled={!name.trim()}
            onClick={handleConfirm}
          />
        </Flex>
      }
    >
      <Box padding={4}>
        <Stack space={4}>
          {parentName && (
            <Text
              size={1}
              muted
            >
              Inside: <strong>{parentName}</strong>
            </Text>
          )}

          <Stack space={2}>
            <Label size={1}>Folder name</Label>
            <TextInput
              value={name}
              onChange={(e) => {
                setName(e.currentTarget.value);
                setError(null);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
              autoFocus
            />
            {error && (
              <Text
                size={0}
                style={{ color: "var(--card-critical-fg-color)" }}
              >
                {error}
              </Text>
            )}
          </Stack>

          {mode === "create" && (
            <Stack space={2}>
              <Label size={1}>Color (optional)</Label>
              <Flex
                gap={2}
                wrap="wrap"
              >
                {PRESET_COLORS.map((c) => (
                  <Box
                    key={c}
                    as="button"
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      background: c,
                      cursor: "pointer",
                      border:
                        color === c
                          ? "2px solid var(--card-fg-color)"
                          : "2px solid transparent",
                      outline: "none",
                    }}
                    onClick={() =>
                      setColor((prev) => (prev === c ? undefined : c))
                    }
                    title={c}
                  />
                ))}
                {color && (
                  <Button
                    mode="ghost"
                    fontSize={0}
                    padding={1}
                    text="Clear"
                    onClick={() => setColor(undefined)}
                  />
                )}
              </Flex>
            </Stack>
          )}
        </Stack>
      </Box>
    </Dialog>
  );
}
