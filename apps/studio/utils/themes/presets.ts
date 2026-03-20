

// ─── Shared semantic colours ──────────────────────────────────────────────────
// Warning and success are semantic tokens that stay consistent across themes.
// They are intentionally not theme-specific so that UI states (toasts, badges,
// alerts) look the same regardless of the active brand palette.

import { createTheme } from "../factories/create-theme";

const SEMANTIC = {
  light: {
    warning: "oklch(0.75 0.18 85)",
    warningForeground: "oklch(0.28 0.06 55)",
    success: "oklch(0.65 0.2 145)",
    successForeground: "oklch(0.98 0 0)",
  },
  dark: {
    warning: "oklch(0.7 0.2 85)",
    warningForeground: "oklch(0.28 0.06 55)",
    success: "oklch(0.6 0.2 145)",
    successForeground: "oklch(0.98 0 0)",
  },
};

// ─── Presets ──────────────────────────────────────────────────────────────────

/**
 * Slate — clean neutral palette, closely aligned with the shadcn/ui default.
 * Works for any brand that hasn't defined its own colours yet.
 */
export const slate = createTheme("slate", "Nøytral", {
  light: {
    background: "oklch(0.985 0 0)",
    foreground: "oklch(0.145 0.008 264)",
    card: "oklch(0.985 0 0)",
    cardForeground: "oklch(0.145 0.008 264)",
    popover: "oklch(0.985 0 0)",
    popoverForeground: "oklch(0.145 0.008 264)",
    primary: "oklch(0.21 0.034 264)",
    primaryForeground: "oklch(0.985 0 0)",
    secondary: "oklch(0.961 0.004 264)",
    secondaryForeground: "oklch(0.145 0.008 264)",
    muted: "oklch(0.961 0.004 264)",
    mutedForeground: "oklch(0.556 0.004 264)",
    accent: "oklch(0.961 0.004 264)",
    accentForeground: "oklch(0.145 0.008 264)",
    destructive: "oklch(0.577 0.245 27)",
    destructiveForeground: "oklch(0.985 0 0)",
    ...SEMANTIC.light,
    border: "oklch(0.922 0.004 264)",
    input: "oklch(0.922 0.004 264)",
    ring: "oklch(0.708 0.004 264)",
  },
  dark: {
    background: "oklch(0.145 0.008 264)",
    foreground: "oklch(0.985 0 0)",
    card: "oklch(0.205 0.008 264)",
    cardForeground: "oklch(0.985 0 0)",
    popover: "oklch(0.205 0.008 264)",
    popoverForeground: "oklch(0.985 0 0)",
    primary: "oklch(0.985 0 0)",
    primaryForeground: "oklch(0.145 0.008 264)",
    secondary: "oklch(0.269 0.008 264)",
    secondaryForeground: "oklch(0.985 0 0)",
    muted: "oklch(0.269 0.008 264)",
    mutedForeground: "oklch(0.708 0.004 264)",
    accent: "oklch(0.269 0.008 264)",
    accentForeground: "oklch(0.985 0 0)",
    destructive: "oklch(0.396 0.141 25)",
    destructiveForeground: "oklch(0.985 0 0)",
    ...SEMANTIC.dark,
    border: "oklch(0.269 0.008 264)",
    input: "oklch(0.269 0.008 264)",
    ring: "oklch(0.439 0 0)",
  },
  radius: "0.5rem",
});

/**
 * Solskjerming — warm terracotta and sand palette inspired by the sun-shading
 * outdoor brand. Earthy, grounded, Mediterranean.
 */
export const solskjerming = createTheme("solskjerming", "Solskjerming", {
  light: {
    background: "oklch(0.98 0.005 80)",
    foreground: "oklch(0.22 0.02 60)",
    card: "oklch(0.98 0.005 80)",
    cardForeground: "oklch(0.22 0.02 60)",
    popover: "oklch(0.98 0.005 80)",
    popoverForeground: "oklch(0.22 0.02 60)",
    primary: "oklch(0.56 0.16 47)",
    primaryForeground: "oklch(0.98 0 0)",
    secondary: "oklch(0.93 0.02 85)",
    secondaryForeground: "oklch(0.22 0.02 60)",
    muted: "oklch(0.93 0.015 80)",
    mutedForeground: "oklch(0.56 0.01 80)",
    accent: "oklch(0.8 0.1 80)",
    accentForeground: "oklch(0.22 0.02 60)",
    destructive: "oklch(0.577 0.245 27)",
    destructiveForeground: "oklch(0.98 0 0)",
    ...SEMANTIC.light,
    border: "oklch(0.88 0.02 80)",
    input: "oklch(0.88 0.02 80)",
    ring: "oklch(0.56 0.16 47)",
  },
  dark: {
    background: "oklch(0.17 0.02 60)",
    foreground: "oklch(0.93 0.01 80)",
    card: "oklch(0.22 0.02 60)",
    cardForeground: "oklch(0.93 0.01 80)",
    popover: "oklch(0.22 0.02 60)",
    popoverForeground: "oklch(0.93 0.01 80)",
    primary: "oklch(0.65 0.17 50)",
    primaryForeground: "oklch(0.17 0.02 60)",
    secondary: "oklch(0.28 0.02 65)",
    secondaryForeground: "oklch(0.93 0.01 80)",
    muted: "oklch(0.28 0.015 65)",
    mutedForeground: "oklch(0.7 0.01 80)",
    accent: "oklch(0.35 0.05 80)",
    accentForeground: "oklch(0.93 0.01 80)",
    destructive: "oklch(0.45 0.2 27)",
    destructiveForeground: "oklch(0.93 0.01 80)",
    ...SEMANTIC.dark,
    border: "oklch(0.28 0.02 65)",
    input: "oklch(0.28 0.02 65)",
    ring: "oklch(0.65 0.17 50)",
  },
  radius: "0.25rem",
});

/**
 * Ocean — cool deep-blue palette evoking open water and maritime environments.
 */
export const ocean = createTheme("ocean", "Hav", {
  light: {
    background: "oklch(0.985 0.003 220)",
    foreground: "oklch(0.18 0.025 220)",
    card: "oklch(0.985 0.003 220)",
    cardForeground: "oklch(0.18 0.025 220)",
    popover: "oklch(0.985 0.003 220)",
    popoverForeground: "oklch(0.18 0.025 220)",
    primary: "oklch(0.5 0.22 255)",
    primaryForeground: "oklch(0.985 0 0)",
    secondary: "oklch(0.93 0.02 220)",
    secondaryForeground: "oklch(0.18 0.025 220)",
    muted: "oklch(0.93 0.015 220)",
    mutedForeground: "oklch(0.55 0.015 220)",
    accent: "oklch(0.72 0.15 195)",
    accentForeground: "oklch(0.18 0.025 220)",
    destructive: "oklch(0.577 0.245 27)",
    destructiveForeground: "oklch(0.985 0 0)",
    ...SEMANTIC.light,
    border: "oklch(0.9 0.01 220)",
    input: "oklch(0.9 0.01 220)",
    ring: "oklch(0.5 0.22 255)",
  },
  dark: {
    background: "oklch(0.17 0.025 245)",
    foreground: "oklch(0.93 0.005 220)",
    card: "oklch(0.22 0.025 245)",
    cardForeground: "oklch(0.93 0.005 220)",
    popover: "oklch(0.22 0.025 245)",
    popoverForeground: "oklch(0.93 0.005 220)",
    primary: "oklch(0.6 0.22 255)",
    primaryForeground: "oklch(0.17 0.025 245)",
    secondary: "oklch(0.27 0.025 240)",
    secondaryForeground: "oklch(0.93 0.005 220)",
    muted: "oklch(0.27 0.02 240)",
    mutedForeground: "oklch(0.7 0.01 220)",
    accent: "oklch(0.45 0.15 195)",
    accentForeground: "oklch(0.93 0.005 220)",
    destructive: "oklch(0.45 0.2 27)",
    destructiveForeground: "oklch(0.93 0.005 220)",
    ...SEMANTIC.dark,
    border: "oklch(0.27 0.025 240)",
    input: "oklch(0.27 0.025 240)",
    ring: "oklch(0.6 0.22 255)",
  },
  radius: "0.5rem",
});

/**
 * Amethyst — A deep purple and indigo palette with high-contrast surfaces.
 */
export const amethyst = createTheme("amethyst", "Ametyst", {
  light: {
    background: "oklch(1.0000 0 0)",
    foreground: "oklch(0.1452 0.0021 286.1313)",
    card: "oklch(0.9707 0.0027 286.3504)",
    cardForeground: "oklch(0.1452 0.0021 286.1313)",
    popover: "oklch(1.0000 0 0)",
    popoverForeground: "oklch(0.1452 0.0021 286.1313)",
    primary: "oklch(0.5106 0.2301 276.9656)",
    primaryForeground: "oklch(1.0000 0 0)",
    secondary: "oklch(0.9163 0.0420 285.5407)",
    secondaryForeground: "oklch(0.2573 0.0861 281.2883)",
    muted: "oklch(0.9560 0.0040 286.3240)",
    mutedForeground: "oklch(0.5007 0.0047 286.2288)",
    accent: "oklch(0.5854 0.2041 277.1173)",
    accentForeground: "oklch(1.0000 0 0)",
    destructive: "oklch(0.6368 0.2078 25.3313)",
    destructiveForeground: "oklch(1.0000 0 0)",
    ...SEMANTIC.light,
    border: "oklch(0.9225 0.0027 286.3471)",
    input: "oklch(0.9225 0.0027 286.3471)",
    ring: "oklch(0.5106 0.2301 276.9656)",
  },
  dark: {
    background: "oklch(0 0 0)",
    foreground: "oklch(1.0000 0 0)",
    card: "oklch(0.1457 0.0043 285.8570)",
    cardForeground: "oklch(0.9626 0.0066 286.2742)",
    popover: "oklch(0 0 0)",
    popoverForeground: "oklch(0.9626 0.0066 286.2742)",
    primary: "oklch(0.5679 0.2113 276.7065)",
    primaryForeground: "oklch(1.0000 0 0)",
    secondary: "oklch(0.2542 0.0611 281.1423)",
    secondaryForeground: "oklch(0.9163 0.0420 285.5407)",
    muted: "oklch(0.1743 0.0227 283.7998)",
    mutedForeground: "oklch(0.6822 0.0116 286.0877)",
    accent: "oklch(0.3340 0.1038 279.1852)",
    accentForeground: "oklch(0.7853 0.1041 274.7134)",
    destructive: "oklch(0.6633 0.2236 28.2919)",
    destructiveForeground: "oklch(1.0000 0 0)",
    ...SEMANTIC.dark,
    border: "oklch(0.2286 0.0096 285.6168)",
    input: "oklch(0.2286 0.0096 285.6168)",
    ring: "oklch(0.5679 0.2113 276.7065)",
  },
  radius: "0.75rem",
});

export const themes = [slate, solskjerming, ocean, amethyst];
