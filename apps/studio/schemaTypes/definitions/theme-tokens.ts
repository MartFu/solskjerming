import {
  OklchColorInput,
  OklchColorInputOptional,
} from "@/components/inputs/oklch-color-input";
import { OKLCH_PATTERN, TOKEN_DEFS } from "@/utils/constant";
import { defineField } from "sanity";



// ─── Field builders ───────────────────────────────────────────────────────────

/**
 * Required color token fields — used for the global theme document.
 * Editors must provide a value; no inheritance fallback.
 */
export function requiredColorTokenFields() {
  return TOKEN_DEFS.map(({ name, title, description }) =>
    defineField({
      name,
      title,
      type: "string",
      description,
      components: { input: OklchColorInput },
      validation: (Rule) =>
        Rule.required().regex(OKLCH_PATTERN, {
          name: "oklch",
          invert: false,
        }),
    }),
  );
}

/**
 * Optional color token fields — used for the site theme document.
 * An unset field inherits its value from the global theme at render time.
 */
export function optionalColorTokenFields() {
  return TOKEN_DEFS.map(({ name, title, description }) =>
    defineField({
      name,
      title,
      type: "string",
      description,
      components: { input: OklchColorInputOptional },
      validation: (Rule) =>
        Rule.custom((value) => {
          if (!value) return true; // null = inherit from global
          return OKLCH_PATTERN.test(value) || "Må være en gyldig oklch()-verdi";
        }),
    }),
  );
}

// ─── Color mode object fields ─────────────────────────────────────────────────

export function requiredColorModeField(mode: "light" | "dark") {
  return defineField({
    name: mode,
    title: mode === "light" ? "Lys modus" : "Mørk modus",
    type: "object",
    fields: requiredColorTokenFields(),
  });
}

export function optionalColorModeField(mode: "light" | "dark") {
  return defineField({
    name: mode,
    title: mode === "light" ? "Lys modus" : "Mørk modus",
    type: "object",
    fields: optionalColorTokenFields(),
  });
}

// ─── Radius field ─────────────────────────────────────────────────────────────

export const RADIUS_OPTIONS = [
  { title: "Ingen", value: "0rem" },
  { title: "Liten", value: "0.25rem" },
  { title: "Medium", value: "0.5rem" },
  { title: "Stor", value: "0.75rem" },
  { title: "Rund", value: "1rem" },
];

export const requiredRadiusField = defineField({
  name: "radius",
  title: "Kantavrunding",
  type: "string",
  description: "Kantavrunding for knapper, kort og skjemafelt.",
  options: { list: RADIUS_OPTIONS },
  initialValue: "0.5rem",
  validation: (Rule) => Rule.required(),
});

export const optionalRadiusField = defineField({
  name: "radius",
  title: "Kantavrunding",
  type: "string",
  description:
    "Overstyrer global kantavrunding for dette nettstedet. La stå tom for å arve fra globalt tema.",
  options: { list: RADIUS_OPTIONS },
});
