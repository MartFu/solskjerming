import { QuerySiteConfigResult } from "@workspace/sanity/types";


/**
 * Utility to transform Sanity theme object into a CSS string
 * @param theme 
 * @returns 
 */
export const generateThemeOverrides = (
  theme: NonNullable<QuerySiteConfigResult>["theme"],
) => {
  if (!theme?.light) return "";

  const lightVars = Object.entries(theme.light)
    .map(([key, value]) => `--${key}: ${value};`)
    .join("\n");

  const darkVars = theme.dark
    ? Object.entries(theme.dark)
        .map(([key, value]) => `--${key}: ${value};`)
        .join("\n")
    : "";

  return `
    :root { ${lightVars} }
    
    .dark { ${darkVars} } 
    
    @media (prefers-color-scheme: dark) {
      :root { ${darkVars} }
    }
  `;
};