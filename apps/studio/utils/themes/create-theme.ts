// ─── Types ────────────────────────────────────────────────────────────────────

export type BorderRadius = "0rem" | "0.25rem" | "0.5rem" | "0.75rem" | "1rem";

export interface ColorTokens {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  warning: string;
  warningForeground: string;
  success: string;
  successForeground: string;
  border: string;
  input: string;
  ring: string;
}

export interface ThemeConfig {
  light: Partial<ColorTokens>;
  dark: Partial<ColorTokens>;
  radius: BorderRadius;
}

export interface Theme extends ThemeConfig {
  name: string;
  label: string;
}

// ─── Factory ──────────────────────────────────────────────────────────────────

/**
 * Define a named theme preset with light/dark token sets and a border radius.
 * All color values must be valid oklch() strings, e.g. "oklch(0.985 0 0)".
 * Use these presets to offer one-click theme starters in the Studio UI.
 */
export function createTheme(
  name: string,
  label: string,
  config: ThemeConfig,
): Theme {
  return { name, label, ...config };
}
