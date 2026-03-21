// ─── Types ────────────────────────────────────────────────────────────────────

export type BorderRadius = "0rem" | "0.25rem" | "0.5rem" | "0.75rem" | "1rem";

export interface ThemeTokens {
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
  radius?: BorderRadius;
}

export interface ThemeConfig {
  light: Partial<ThemeTokens>;
  dark: Partial<ThemeTokens>;

  // Tokens declared outside of a theme are applied to both.
  // This can be extended safely, as long as the properties remain
  // optional.

  /**
   * Assign the same radius to both themes
   */
  radius?: BorderRadius;
}

export interface Theme extends ThemeConfig {
  name: string;
  label: string;
}

export type TokenType = "color" | "unit" | "selection";

export interface TokenDefinition {
  name: string;
  title: string;
  type: TokenType;
  description?: string;
  options?: { title: string; value: string }[]; // For things like Radius
  default?: string | number;
}