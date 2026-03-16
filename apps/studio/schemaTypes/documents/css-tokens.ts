// schemaTypes/themeTokens.ts
import { defineField, defineType } from "sanity";

const colorField = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: "string",
    description: "oklch(L C H) — e.g. oklch(0.985 0 0)",
    validation: (Rule) =>
      Rule.regex(/^oklch\(\s*[\d.]+\s+[\d.]+\s+[\d.]+\s*\)$/, {
        name: "oklch",
        invert: false,
      }).warning("Should be a valid oklch() value"),
  });

const colorPaletteFields = [
  colorField("background", "Background"),
  colorField("foreground", "Foreground"),
  colorField("card", "Card"),
  colorField("cardForeground", "Card Foreground"),
  colorField("popover", "Popover"),
  colorField("popoverForeground", "Popover Foreground"),
  colorField("primary", "Primary"),
  colorField("primaryForeground", "Primary Foreground"),
  colorField("secondary", "Secondary"),
  colorField("secondaryForeground", "Secondary Foreground"),
  colorField("muted", "Muted"),
  colorField("mutedForeground", "Muted Foreground"),
  colorField("accent", "Accent"),
  colorField("accentForeground", "Accent Foreground"),
  colorField("destructive", "Destructive"),
  colorField("destructiveForeground", "Destructive Foreground"),
  colorField("border", "Border"),
  colorField("input", "Input"),
  colorField("ring", "Ring"),
];

const colorModeObject = (name: "light" | "dark") =>
  defineField({
    name,
    title: name === "light" ? "Lys modus" : "Mørk modus",
    type: "object",
    fields: colorPaletteFields,
  });

export const themeDefaults = defineType({
  name: "themeDefaults",
  title: "Global CSS",
  type: "document",
  fields: [
    colorModeObject("light"),
    colorModeObject("dark"),
    defineField({
      name: "radius",
      title: "Border Radius",
      type: "string",
      options: { list: ["0rem", "0.25rem", "0.5rem", "0.75rem", "1rem"] },
      initialValue: "0.5rem",
    }),
  ],
});

export const siteTheme = defineType({
  name: "siteTheme",
  title: "CSS",
  type: "document",
  fields: [
    defineField({ name: "siteId", type: "string", readOnly: true }),
    defineField({
      name: "useGlobalDefaults",
      title: "Arv globalt tema",
      type: "boolean",
      initialValue: true,
    }),
    colorModeObject("light"),
    colorModeObject("dark"),
    defineField({
      name: "radius",
      title: "Border Radius",
      type: "string",
      options: { list: ["0rem", "0.25rem", "0.5rem", "0.75rem", "1rem"] },
    }),
    defineField({
      name: "site",
      type: "reference",
      to: [{ type: "site" }],
      readOnly: true,
    }),
  ],
  // Hide all theme fields when inheriting global
  // Conditionally hide light/dark/radius based on useGlobalDefaults
});
