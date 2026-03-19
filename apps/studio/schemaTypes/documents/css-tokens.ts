import { defineField, defineType } from "sanity";

import { SiteThemePresetFieldInput } from "@/components/inputs/theme-preset-field-input";
import {
  optionalColorModeField,
  optionalRadiusField,
} from "@/schemaTypes/definitions/theme-tokens";

/**
 * Per-site CSS token overrides.
 *
 * Every field is optional. When a field is left unset the frontend falls back
 * to the corresponding value from the `globalTheme` workspace document.
 * Toggle `useGlobalDefaults` to inherit everything at once, or leave it off to
 * override individual tokens while inheriting the rest.
 */
export const siteTheme = defineType({
  name: "siteTheme",
  title: "Tema",
  type: "document",
  groups: [
    { name: "light", title: "Lys modus", default: true },
    { name: "dark", title: "Mørk modus" },
    { name: "general", title: "Generelt" },
  ],
  fields: [
    defineField({
      name: "siteId",
      title: "Nettsted-ID",
      type: "string",
      readOnly: true,
      hidden: true,
    }),
    defineField({
      name: "site",
      title: "Nettsted",
      type: "reference",
      to: [{ type: "site" }],
      readOnly: true,
    }),
    // No group → renders above the tab bar, always visible
    defineField({
      name: "themePreset",
      title: "Forhåndsinnstilte temaer",
      type: "string",
      components: { input: SiteThemePresetFieldInput },
    }),
    defineField({
      name: "useGlobalDefaults",
      title: "Arv globalt tema",
      type: "boolean",
      description:
        "Slå på for å arve alle farger og kantavrunding fra det globale temaet. Slå av for å overstyre individuelle tokens.",
      initialValue: true,
      group: "general",
    }),
    {
      ...optionalColorModeField("light"),
      group: "light",
      hidden: ({ document }: { document: Record<string, unknown> | null }) =>
        document?.useGlobalDefaults === true,
    },
    {
      ...optionalColorModeField("dark"),
      group: "dark",
      hidden: ({ document }: { document: Record<string, unknown> | null }) =>
        document?.useGlobalDefaults === true,
    },
    {
      ...optionalRadiusField,
      group: "general",
      hidden: ({ document }: { document: Record<string, unknown> | null }) =>
        document?.useGlobalDefaults === true,
    },
  ],
  preview: {
    select: { siteId: "siteId" },
    prepare: ({ siteId }) => ({
      title: "Tema",
      subtitle: siteId ? `Nettsted: ${siteId}` : undefined,
    }),
  },
});
