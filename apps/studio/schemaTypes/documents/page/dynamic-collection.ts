// ===========================================================================
// BLOCK: Dynamic Collection (Query Builder)
// ===========================================================================
//
// Replaces the pattern of having a dedicated `catalogRoot` or `blogIndex`
// document type with baked-in listing logic. Instead, editors (or blueprint
// templates) drop a `dynamicCollection` block into any page and configure
// what it fetches.
//
// The block defines WHAT to fetch, HOW to filter, and HOW to display.
// The frontend resolves this into a GROQ query at render time.
//
// Register this as an object type available in your pageBuilder:
//
//   // In your pagebuilder definition:
//   of: [
//     { type: "dynamicCollection" },
//     { type: "hero" },
//     // ... other block types
//   ]
// ===========================================================================

import { defineField, defineType } from "sanity";
import { DatabaseIcon } from "@sanity/icons";

const COLLECTION_SOURCES = [
  { title: "Produkter", value: "product" },
  { title: "Sider (etter rolle)", value: "page" },
] as const;

const LAYOUT_OPTIONS = [
  { title: "Rutenett", value: "grid" },
  { title: "Liste", value: "list" },
  { title: "Karusell", value: "carousel" },
] as const;

export const dynamicCollection = defineType({
  name: "dynamicCollection",
  title: "Dynamisk samling",
  type: "object",
  icon: DatabaseIcon,
  description:
    "Henter og viser en samling elementer basert på kilde og filtre.",

  fields: [
    // ── WHAT TO FETCH ─────────────────────────────────────────
    defineField({
      name: "source",
      title: "Kilde",
      type: "string",
      description: "Hvilken type innhold skal hentes?",
      options: {
        list: [...COLLECTION_SOURCES],
        layout: "radio",
      },
      validation: (Rule) => Rule.required(),
    }),

    // When source is "page", optionally filter by internalRole
    defineField({
      name: "sourceRole",
      title: "Siderolle",
      type: "string",
      description:
        "Filtrer sider etter intern rolle (f.eks. 'article'). " +
        "La stå tom for å inkludere alle sider.",
      hidden: ({ parent }) => parent?.source !== "page",
    }),

    // ── FILTER MODE ───────────────────────────────────────────
    defineField({
      name: "filterMode",
      title: "Filtreringsmodus",
      type: "string",
      options: {
        list: [
          { title: "Automatisk (regelbasert)", value: "auto" },
          { title: "Manuell (håndplukket)", value: "manual" },
        ],
        layout: "radio",
      },
      initialValue: "auto",
    }),

    // ── AUTO FILTERS ──────────────────────────────────────────
    defineField({
      name: "filterCategories",
      title: "Filterkategorier",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
      description: "Filtrer etter kategorier. Tom = alle.",
      hidden: ({ parent }) => parent?.filterMode !== "auto",
    }),

    defineField({
      name: "filterTags",
      title: "Filtertagger",
      type: "array",
      of: [{ type: "reference", to: [{ type: "tag" }] }],
      hidden: ({ parent }) => parent?.filterMode !== "auto",
    }),

    // ── MANUAL SELECTION ──────────────────────────────────────
    defineField({
      name: "manualItems",
      title: "Håndplukkede elementer",
      type: "array",
      of: [
        {
          type: "reference",
          to: [{ type: "product" }, { type: "page" }],
        },
      ],
      description: "Velg spesifikke elementer i ønsket rekkefølge.",
      hidden: ({ parent }) => parent?.filterMode !== "manual",
    }),

    // ── SORT & DISPLAY ────────────────────────────────────────
    defineField({
      name: "sortBy",
      title: "Sortering",
      type: "string",
      options: {
        list: [
          { title: "Nyeste først", value: "_createdAt desc" },
          { title: "Eldste først", value: "_createdAt asc" },
          { title: "Tittel A-Å", value: "title asc" },
          { title: "Manuell rekkefølge", value: "sortOrder asc" },
        ],
      },
      initialValue: "_createdAt desc",
    }),

    defineField({
      name: "layout",
      title: "Visning",
      type: "string",
      options: {
        list: [...LAYOUT_OPTIONS],
        layout: "radio",
      },
      initialValue: "grid",
    }),

    defineField({
      name: "limit",
      title: "Maks antall",
      type: "number",
      description: "Maks antall elementer. 0 = ubegrenset.",
      initialValue: 12,
      validation: (Rule) => Rule.min(0).integer(),
    }),
  ],

  preview: {
    select: {
      source: "source",
      filterMode: "filterMode",
      layout: "layout",
      limit: "limit",
    },
    prepare: ({ source, filterMode, layout, limit }) => {
      const sourceLabel =
        COLLECTION_SOURCES.find((s) => s.value === source)?.title ?? source;
      const mode = filterMode === "manual" ? "manuell" : "auto";
      return {
        title: `Samling: ${sourceLabel}`,
        subtitle: `${mode} · ${layout} · maks ${limit ?? "∞"}`,
      };
    },
  },
});
