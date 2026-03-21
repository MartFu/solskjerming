import { camelToKebabCase } from "../helper";
import { Theme, ThemeTokens } from "./types";

/**
 * Converts ThemeTokens to a string of CSS variables
 * e.g., { primary: "oklch..." } -> --primary: oklch...;
 */
export const formatThemeAsCSS = (
  tokens: Partial<ThemeTokens>,
  selector: string = ":root",
): string => {
  const lines = Object.entries(tokens)
    .filter(([_, value]) => value !== undefined)
    .map(([key, value]) => `  --${camelToKebabCase(key)}: ${value};`)
    .join("\n");

  return `${selector} {\n${lines}\n}`;
};

/**
 * Formats a theme of type Theme as CSS.
 */
export const getThemeVariables = (theme: Theme) => {
  const light = formatThemeAsCSS(theme.light, ":root");
  const dark = formatThemeAsCSS(theme.dark, ".dark");
  return `${light}\n\n${dark}`;
};