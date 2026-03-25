// ===========================================================================
// UNIVERSAL DOCUMENT: page
// ===========================================================================
//
// The single schema type for ALL page-like documents in the system.
// Specialization happens at the Template/Blueprint level, not the schema
// level. A "Catalog" page and a "Blog Hub" page are both `type: "page"` —
// they differ only in their `internalRole` value and the blocks pre-populated
// in their `pageBuilder`.
//
// Strict data documents (Product, Author, Tag) remain unique types because
// they represent Source-of-Truth data, not renderable pages.
// ===========================================================================

import { defineField, defineType, type Rule } from "sanity";
import { GROUP, GROUPS } from "@/utils/constant";
import {
  createIdentityFields,
  createPagebuilderField,
  createParentField,
  createSortOrderField,
} from "@/utils/factories/create-page-fields";
import { DOCUMENT_NAMES } from "@/schemaTypes/constant";
import { InternalRole, ROLE_RULES} from "@/utils/modules";

// ---------------------------------------------------------------------------
// Conditional validation helper
// ---------------------------------------------------------------------------

/**
 * Creates a Sanity validation rule that delegates to a role-specific
 * validator when one exists, otherwise falls back to the base rule.
 *
 * This is how we enforce "ogImage required for articles but optional for
 * standard pages" without needing separate schema types.
 */
function conditionalRule(fieldName: string): (rule: Rule) => Rule {
  return (rule: Rule) => {
    return rule.custom((value, context) => {
      const doc = context.document as
        | { internalRole?: InternalRole }
        | undefined;
      const role = doc?.internalRole;

      // No role set → no conditional validation applies, field is valid
      if (!role || role === "standard") return true;

      const roleRules = ROLE_RULES[role];
      if (!roleRules || !roleRules[fieldName]) {
        return true; // no special rule for this role+field → valid
      }

      return roleRules[fieldName](value, context);
    });
  };
}
 

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

export const page = defineType({
  name: DOCUMENT_NAMES.page,
  title: "Side",
  type: "document",
  groups: GROUPS(GROUP.IDENTITY),

  fields: [
    // ── INTERNAL ROLE ─────────────────────────────────────────
    // Hidden anchor that blueprints set on creation. Tells the Studio and
    // frontend what "kind" of page this is without needing a separate type.
    defineField({
      name: "internalRole",
      title: "Intern rolle",
      type: "string",
      group: GROUP.IDENTITY,
      readOnly: true,
      hidden: true,
      description:
        "Set automatically by the creation blueprint. " +
        "Used for conditional validation, structure grouping, and frontend routing.",
    }),

    // ── BLUEPRINT KEY ─────────────────────────────────────────
    // Tracks which blueprint created this document. Useful for UI badges
    // and for re-applying a blueprint's defaults if needed.
    defineField({
      name: "blueprintKey",
      title: "Blueprint",
      type: "string",
      group: GROUP.IDENTITY,
      readOnly: true,
      hidden: true,
    }),

    // ── STANDARD FIELDS ───────────────────────────────────────
    ...createIdentityFields(),
    ...createParentField(["page"]), // all pages can nest under other pages
    ...createSortOrderField(),

    // ── SEO ─────────────────────
    defineField({
      name: "SEO",
      title: "SEO",
      type: "pageSEO",
      group: GROUP.SEO,
    }),
  

    // ── PAGEBUILDER ───────────────────────────────────────────
    // Single universal pagebuilder that accepts ALL block types.
    // Blueprints pre-populate this with appropriate blocks on creation.
    ...createPagebuilderField("pageBuilder"),

    // ── STRICT DATA REFERENCES ────────────────────────────────
    // Optional references to strict data documents. These only appear
    // when the internalRole warrants it (hidden via conditional logic
    // in the Studio, but always present in the schema).
    defineField({
      name: "dataRefs",
      title: "Datakilder",
      type: "object",
      group: GROUP.MAIN_CONTENT,
      hidden: ({ document }) => {
        const role = (document as { internalRole?: string })?.internalRole;
        // Only show for roles that use strict data references
        return !role || role === "standard";
      },
      fields: [
        defineField({
          name: "product",
          title: "Produkt",
          type: "reference",
          to: [{ type: "product" }],
          hidden: ({ document }) =>
            (document as { internalRole?: string })?.internalRole !==
            "productPage",
          description:
            "Referanse til det globale produktobjektet. Produktets faste data " +
            "som pris og spesifikasjoner hentes derfra.",
        }),
        defineField({
          name: "author",
          title: "Forfatter",
          type: "reference",
          to: [{ type: "author" }],
          hidden: ({ document }) => {
            const role = (document as { internalRole?: string })?.internalRole;
            return role !== "article" && role !== "articleHub";
          },
          description: "Referanse til forfatteren av denne artikkelen.",
        }),
      ],
    }),

    // ── BLUEPRINT-SPECIFIC METADATA ───────────────────────────
    // Lightweight fields that replace the old `extraFields` approach.
    // Conditionally visible based on internalRole.
    defineField({
      name: "filterCategories",
      title: "Filterkategorier",
      type: "array",
      group: GROUP.MAIN_CONTENT,
      of: [{ type: "string" }],
      description:
        "Kategorier som er tilgjengelige for filtrering i denne katalogen.",
      options: { layout: "tags" },
      hidden: ({ document }) =>
        (document as { internalRole?: string })?.internalRole !== "catalog",
    }),

    defineField({
      name: "publishedAt",
      title: "Publiseringsdato",
      type: "date",
      group: GROUP.IDENTITY,
      hidden: ({ document }) =>
        (document as { internalRole?: string })?.internalRole !== "article",
    }),
  ],

  preview: {
    select: {
      title: "title",
      slug: "slug.current",
      media: "ogImage",
      isPrivate: "seoNoIndex",
      role: "internalRole",
    },
    prepare: ({ title, slug, media, isPrivate, role }) => {
      const status = isPrivate ? "skjult" : "indeksert";
      const roleLabel = role && role !== "standard" ? `[${role}] ` : "";
      return {
        title: `${title || "Side uten tittel"}`,
        subtitle: slug ? `${slug} · ${status}` : status,
        media,
      };
    },
  },
});


