import { Theme, ThemeConfig } from "../themes";

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
