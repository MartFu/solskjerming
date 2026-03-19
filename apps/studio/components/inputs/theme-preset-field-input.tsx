import { useCallback } from "react";
import { useDocumentOperation, useFormValue } from "sanity";
import type { StringInputProps } from "sanity";

import type { Theme } from "@/utils/themes";

import { ThemePresetPicker } from "./theme-preset-picker";

// ─── globalTheme variant ──────────────────────────────────────────────────────

export function ThemePresetFieldInput(_props: StringInputProps) {
  const rawId = useFormValue(["_id"]) as string;
  const documentId = rawId?.replace(/^drafts\./, "");
  const documentType = useFormValue(["_type"]) as string;
  const { patch } = useDocumentOperation(documentId, documentType);

  const handleApply = useCallback(
    (theme: Theme) => {
      patch.execute([
        { set: { light: theme.light, dark: theme.dark, radius: theme.radius } },
      ]);
    },
    [patch],
  );

  return <ThemePresetPicker onApply={handleApply} />;
}

// ─── siteTheme variant ────────────────────────────────────────────────────────
// Also sets useGlobalDefaults: false so the token fields become visible
// immediately after a preset is applied.

export function SiteThemePresetFieldInput(_props: StringInputProps) {
  const rawId = useFormValue(["_id"]) as string;
  const documentId = rawId?.replace(/^drafts\./, "");
  const documentType = useFormValue(["_type"]) as string;
  const { patch } = useDocumentOperation(documentId, documentType);

  const handleApply = useCallback(
    (theme: Theme) => {
      patch.execute([
        {
          set: {
            light: theme.light,
            dark: theme.dark,
            radius: theme.radius,
            useGlobalDefaults: false,
          },
        },
      ]);
    },
    [patch],
  );

  return <ThemePresetPicker onApply={handleApply} />;
}
