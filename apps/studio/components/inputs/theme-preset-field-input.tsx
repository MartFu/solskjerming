import { useCallback, useEffect, useMemo } from "react";
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

export function ThemePresetFieldInput({
    path,
    ...props
}: ObjectInputProps & { focusTheme?: "light" | "dark" | undefined }) {
    const rawId = useFormValue(["_id"]) as string;
    const documentId = rawId?.replace(/^drafts\./, "");
    const documentType = useFormValue(["_type"]) as string;
    const { patch } = useDocumentOperation(documentId, documentType);

    const light = useFormValue(["light"]) as Theme["light"];
    const dark = useFormValue(["dark"]) as Theme["dark"];

    const themeObjectPath = useMemo(() => path.slice(0, -1), [path]);
    const currentPreset = useMemo(() => {
        return isCurrentPreset(light, dark);
    }, [light, dark]);

    const handleApply = useCallback(
        (theme: Theme) => {
            const pathPrefix = themeObjectPath.join(".");
            const key = (field: string) =>
                pathPrefix ? `${pathPrefix}.${field}` : field;

            patch.execute([
                {
                    set: {
                        [key("light")]: theme.light,
                        [key("dark")]: theme.dark,
                    },
                },
            ]);
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

export function SiteThemePresetFieldInput({ path }: ObjectInputProps) {
    const rawId = useFormValue(["_id"]) as string;
    const documentId = rawId?.replace(/^drafts\./, "");
    const documentType = useFormValue(["_type"]) as string;
    const { patch } = useDocumentOperation(documentId, documentType);

    const light = useFormValue(["light"]) as Theme["light"];
    const dark = useFormValue(["dark"]) as Theme["dark"];

    const themeObjectPath = useMemo(() => path.slice(0, -1), [path]);
    const currentPreset = useMemo(() => {
        return isCurrentPreset(light, dark);
    }, [light, dark]);


    const handleApply = useCallback(
        (theme: Theme) => {
            const pathPrefix = themeObjectPath.join(".");
            const key = (field: string) =>
                pathPrefix ? `${pathPrefix}.${field}` : field;

            patch.execute([
                {
                    set: {
                        [key("light")]: theme.light,
                        [key("dark")]: theme.dark,
                        [key("preset")]: theme.name,
                        [key("useGlobalDefaults")]: false,
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
