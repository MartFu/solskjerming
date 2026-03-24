import { defineField, FieldDefinition } from "sanity";
import { Theme, ThemeConfig } from "../themes";
import { LightThemePresetFieldInput, ThemePresetFieldInput } from "@/components/inputs/theme-preset-field-input";
import {
  OklchColorInput,
  OklchColorInputOptional,
} from "@/components/inputs/oklch-color-input";
import { OKLCH_PATTERN } from "../constant";
import { TOKEN_DEFS } from "../themes/constant";

/**
 * Define a named theme preset with light/dark token sets and a border radius.
 * All color values must be valid oklch() strings, e.g. "oklch(0.985 0 0)".
 * Use these presets to offer one-click theme starters in the Studio UI.
 */
export function createTheme(
  name: string,
  label: string,
  { light, dark, ...shared }: ThemeConfig,
): Theme {
  return {
    name,
    label,
    light: { ...shared, ...light },
    dark: { ...shared, ...dark },
  };
}

interface CreateThemeFieldsConfig {
  title?: string;
  description?: string;
}

export function createTokenFields(isOptional: boolean) {
  return TOKEN_DEFS.map((token) => {
    const base = {
      name: token.name,
      title: token.title,
      description: token.description,
      type: "string",
    };

    // Handle selection-based tokens (Radius)
    if (token.type === "unit") {
      return defineField({
        ...base,
        options: { list: token.options },
        initialValue: token.default,
        validation: (Rule) => Rule.required(),
      });
    }

    // Handle color tokens (OKLCH)
    return defineField({
      ...base,
      components: {
        input: isOptional ? OklchColorInputOptional : OklchColorInput,
      },
      validation: (Rule) => {
        const reg = Rule.regex(OKLCH_PATTERN, { name: "oklch" });
        return isOptional ? reg : reg.required();
      },
    });
  });
}

export function createThemeFields(
  { title, description }: CreateThemeFieldsConfig = {
    title: "Forhåndsdefinerte Temaer",
    description:
      "Kom raskt i gang med et harmonisk, forhåndsdefinert tema eller definer et helt eget.",
  },
): FieldDefinition[] {
  return [
      defineField({
          name: "themePreset",
          type: "object",
          title,
          description,
          group: ["light", "dark"],
          fields: [defineField({ name: "nouse", type: "string" })],
          components: {
              input: LightThemePresetFieldInput,
          },
      }),

      // Generates all color AND unit fields for light mode
      defineField({
          name: "light",
          title: "Lys modus",
          type: "object",
          group: "light",
          fields: createTokenFields(false),
      }),

      // Generates all color AND unit fields for dark mode
      defineField({
          name: "dark",
          title: "Mørk modus",
          type: "object",
          group: "dark",
          fields: createTokenFields(false),
      }),
  ];
}
