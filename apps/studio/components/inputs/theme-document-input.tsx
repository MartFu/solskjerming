import { Box, Stack } from "@sanity/ui";
import { useCallback } from "react";
import { set } from "sanity";
import type { ObjectInputProps } from "sanity";

import type { Theme } from "@/utils/themes";

import { ThemePresetPicker } from "./theme-preset-picker";

// ─── Shared helper ────────────────────────────────────────────────────────────

function applyThemePatches(
    onChange: ObjectInputProps["onChange"],
    theme: Theme,
) {
    // Each call emits an independent FormPatch
    onChange(set(theme.light, ["light"]));
    onChange(set(theme.dark, ["dark"]));
    onChange(set(theme.radius, ["radius"]));
}

// ─── globalTheme document wrapper ────────────────────────────────────────────

/**
 * Wraps the standard globalTheme document form with a preset picker strip
 * at the top. Selecting a preset replaces the light, dark, and radius fields
 * in one operation; the editor can then tweak individual tokens below.
 */
export function GlobalThemeDocumentInput(props: ObjectInputProps) {
    const { onChange, renderDefault } = props;

    const handleApply = useCallback(
        (theme: Theme) => applyThemePatches(onChange, theme),
        [onChange],
    );

    return (
        <Stack space={0}>
            <Box
                paddingY={4}
                paddingBottom={3}
            >
                <ThemePresetPicker onApply={handleApply} />
            </Box>
            {renderDefault(props)}
        </Stack>
    );
}

// ─── siteTheme document wrapper ───────────────────────────────────────────────

/**
 * Same as GlobalThemeDocumentInput, but also sets `useGlobalDefaults: false`
 * when a preset is applied — because choosing a preset is an explicit override.
 */
export function SiteThemeDocumentInput(props: ObjectInputProps) {
    const { onChange, renderDefault } = props;

    const handleApply = useCallback(
        (theme: Theme) => {
            onChange(set(false, ["useGlobalDefaults"]));
            applyThemePatches(onChange, theme);
        },
        [onChange],
    );

    return (
        <Stack space={0}>
            <Box
                padding={4}
                paddingBottom={3}
            >
                <ThemePresetPicker onApply={handleApply} />
            </Box>
            {renderDefault(props)}
        </Stack>
    );
}
