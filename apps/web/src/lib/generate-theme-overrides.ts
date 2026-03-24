import { QuerySiteConfigResult } from "@workspace/sanity/types";
const toKebab = (str: string) =>
  str.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

/**
 * Utility to transform Sanity theme object into a CSS string
 * @param theme 
 * @returns 
 */
export const generateThemeOverrides = (
  theme: NonNullable<QuerySiteConfigResult>["theme"],
) => {
  if (!theme?.light) return "";

  const mapVariables = (obj: Record<string, any>) => {
    return Object.entries(obj)
      .map(([key, value]) => {
        const name = toKebab(key);
        // If it's radius, don't add the color prefix
        const variableName =
          name === "radius" ? `--${name}` : `--color-${name}`;
        return `${variableName}: ${value};`;
      })
      .join("\n");
  };

  const lightVars = mapVariables(theme.light);
  const darkVars = theme.dark ? mapVariables(theme.dark) : "";

  return `
    html:root { 
      ${lightVars} 
    }
    
    html.dark { 
      ${darkVars} 
    } 
    
    @media (prefers-color-scheme: dark) {
      html:root:not(.light) { 
        ${darkVars} 
      }
    }
  `;
};