import { useCallback, useMemo } from "react";
import { useDocumentOperation, useFormValue } from "sanity";
import type { ObjectInputProps } from "sanity";

import { themes, type Theme } from "@/utils/themes";

import { ThemePresetPicker } from "./theme-preset-picker";

// ─── globalTheme variant ──────────────────────────────────────────────────────

const isCurrentPreset = (
  light: Partial<Theme["light"]>,
  dark: Partial<Theme["dark"]>,
) =>
  themes.find(
    (preset) =>
      JSON.stringify(preset.light) === JSON.stringify(light) &&
      JSON.stringify(preset.dark) === JSON.stringify(dark),
  );

export function ThemePresetFieldInput(
  props: ObjectInputProps & { focusTheme?: "light" | "dark" | undefined },
) {
  const rawId = useFormValue(["_id"]) as string;
  const documentId = rawId?.replace(/^drafts\./, "");
  const documentType = useFormValue(["_type"]) as string;
  const { patch } = useDocumentOperation(documentId, documentType);

  const light = useFormValue(["light"]) as Theme["light"];
  const dark = useFormValue(["dark"]) as Theme["dark"];

  const currentPreset = useMemo(() => {
    return isCurrentPreset(light, dark);
  }, [light, dark]);

  const handleApply = useCallback(
    (theme: Theme) => {
      patch.execute([{ set: { light: theme.light, dark: theme.dark } }]);
    },
    [patch],
  );

  return (
    <ThemePresetPicker
      onApply={handleApply}
      focusTheme={props.focusTheme}
      currentPreset={currentPreset?.name}
    />
  );
}

export function LightThemePresetFieldInput(props: ObjectInputProps) {
  return (
    <ThemePresetFieldInput
      {...props}
      focusTheme="light"
    />
  );
}

// ─── siteTheme variant ────────────────────────────────────────────────────────
// Also sets useGlobalDefaults: false so the token fields become visible
// immediately after a preset is applied.

export function SiteThemePresetFieldInput(_props: ObjectInputProps) {
  const rawId = useFormValue(["_id"]) as string;
  const documentId = rawId?.replace(/^drafts\./, "");
  const documentType = useFormValue(["_type"]) as string;
  const { patch } = useDocumentOperation(documentId, documentType);

  const light = useFormValue(["light"]) as Theme["light"];
  const dark = useFormValue(["dark"]) as Theme["dark"];

  const currentPreset = useMemo(() => {
    return isCurrentPreset(light, dark);
  }, [light, dark]);

  const handleApply = useCallback(
    (theme: Theme) => {
      patch.execute([
        {
          set: {
            light: theme.light,
            dark: theme.dark,
            useGlobalDefaults: false,
            preset: theme.name,
          },
        },
      ]);
    },
    [patch],
  );

  return (
    <ThemePresetPicker
      onApply={handleApply}
      currentPreset={currentPreset?.name}
    />
  );
}
