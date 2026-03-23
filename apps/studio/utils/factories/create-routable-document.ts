import { GROUP, GROUPS, GroupValue } from "@/utils/constant";
import {
  defineField,
  defineType,
  FieldDefinition,
  PreviewConfig,
  SanityDocument,
} from "sanity";
import { createSiteScopedSlugField } from "./create-site-scoped-slug-field";
import { createSEOFields } from "./create-seo-fields";
import { createOGFields } from "./create-og-fields";
import { createStructuredDataFields } from "./create-structured-data-fields";
import { createRobotsFields } from "./create-robots-fields";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Configuration for createRoutableDocument.
 *
 * Every routable document gets: title, site (ref), slug (site-scoped unique),
 * parent (optional, type-constrained), SEO fields, and OG fields.
 *
 * Root / standalone documents additionally receive a pagebuilder.
 * Child documents receive type-specific content fields instead.
 */
export interface RoutableDocumentConfig<N extends string = string>{
  /** Schema type name, e.g. "blogRoot" or "blogPost" */
  name: N;

  /** Human-readable title shown in the Studio, e.g. "Blog" or "Blog Post" */
  title: string;

  /**
   * Which document types this can be a child of.
   * Omit or pass empty array for top-level-only documents.
   * Examples:
   *   page        → ["page"]           (pages can nest under pages)
   *   blogRoot    → ["page"]           (blog can nest under a generic page)
   *   blogPost    → ["blogRoot"]       (posts belong to a blog root)
   */
  parentTypes?: string[];

  /**
   * Name of the pagebuilder array type to use.
   * Only provided for root / standalone documents.
   * Omit for child documents (they use extraFields for content instead).
   */
  pagebuilderType?: string;

  /**
   * Type-specific fields appended after the common fields.
   * For roots: e.g. postsPerPage, featuredPost, categories.
   * For children: e.g. body, author, coverImage, product ref.
   */
  extraFields?: FieldDefinition[];

  /** Override the default preview config */
  preview?: PreviewConfig;

  /** Override which group tab opens by default */
  defaultGroup?: GroupValue;
}

// ---------------------------------------------------------------------------
// Shared field builders
// ---------------------------------------------------------------------------

const routableDocumentFields: FieldDefinition[] = [
  defineField({
    name: "title",
    title: "Tittel",
    type: "string",
    group: GROUP.IDENTITY,
    description:
      "Sidens H1-overskrift. Bør inneholde nøkkelord som samsvarer med ord som finnes både i innholdet og Metatittel.",
    validation: (Rule) => Rule.required(),
  }),
  defineField({
    name: "description",
    title: "Beskrivelse",
    type: "text",
    description:
      "Et kort sammendrag av hva besøkende kan finne på denne siden. Bør gjenta nøkkelord for optimal søkemotorsynlighet.",
    group: GROUP.MAIN_CONTENT,
  }),
  defineField({
    name: "site",
    title: "Nettsted",
    type: "reference",
    group: GROUP.RELATIONSHIPS,
    to: [{ type: "site" }],
    description:
      "Nye sider kobles automatisk til aktivt nettstedet. Du trenger ikke å foreta deg noe her, feltet er skrivebeskyttet for å sikre dataintegritet.",
    readOnly: true,
    validation: (Rule) => Rule.required(),
  }),
  createSiteScopedSlugField(),
];

function _createParentField(parentTypes: string[]): FieldDefinition {
  return defineField({
    name: "parent",
    title: "Sidens forelder",
    type: "reference",
    group: GROUP.RELATIONSHIPS,
    description:
      "Definerer sidens plassering i sidehierarkiet. Nye sider referer automatisk til rett forelder avhengig av hvor i hierarkiet de opprettes. Du trenger ikke å foreta deg noe her, feltet er skrivebeskyttet for å sikre dataintegritet.",
    to: parentTypes.map((type) => ({ type })),
    initialValue: undefined,
    options: {
      filter: ({ document }) => {
        const doc = document as SanityDocument & { site?: { _ref: string } };

        return {
          filter: "site._ref == $siteId && _type in $allowedTypes",
          params: {
            siteId: doc.site?._ref,
            allowedTypes: parentTypes,
          },
        };
      },
    },
    validation: (Rule) =>
      Rule.custom((value, context) => {
        // Top-level pages intentionally have no parent
        return true; 
      }),
    readOnly: true,
  });
}

function _createPagebuilderField(pagebuilderType: string): FieldDefinition {
  return defineField({
    name: "pagebuilder",
    title: "Sidebygger",
    type: pagebuilderType,
    group: GROUP.MAIN_CONTENT,
  });
}

// ---------------------------------------------------------------------------
// Default preview
// ---------------------------------------------------------------------------

const defaultPreview: PreviewConfig = {
  select: {
    title: "title",
    slug: "slug.current",
    media: "ogImage",
    isPrivate: "seoNoIndex",
  },
  prepare: ({ title, slug, media, isPrivate }) => {
    const status = isPrivate ? "skjult" : "indeksert";
    return {
      title: title || "Side uten tittel",
      subtitle: slug ? `${slug} · ${status}` : status,
      media,
    };
  },
};

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export function createRoutableDocument<N extends string>(
  config: RoutableDocumentConfig<N>,
) { 
  const {
    name,
    title,
    parentTypes = [],
    pagebuilderType,
    extraFields = [],
    preview = defaultPreview,
    defaultGroup,
  } = config;

  // Assemble fields in a consistent order
  const fields: FieldDefinition[] = [
    // 1. Core identity & routing
    ...routableDocumentFields,

    // 2. Parent reference (if this type can have a parent)
    ...(parentTypes.length > 0 ? [_createParentField(parentTypes)] : []),

    defineField({
      name: "sortOrder",
      title: "Sorteringsrekkefølge",
      type: "number",
      group: GROUP.RELATIONSHIPS,
      description: "Bestemmer plasseringen blant søskensider i lister.",
      initialValue: 0,
    }),

    // 3. SEO & OG
    ...createSEOFields({
      isPage: true,
    }),
    ...createOGFields({
      isPage: true,
    }),
    ...createStructuredDataFields({
      isPage: true,
      group: GROUP.STRUCTURED_DATA,
    }),

    // ── ROBOTS ─────────────────────────────────────────
    ...createRobotsFields({
      isPage: true,
      group: GROUP.ROBOTS,
    }),

    // 4. Pagebuilder (roots / standalone only)
    ...(pagebuilderType ? [_createPagebuilderField(pagebuilderType)] : []),

    // 5. Type-specific fields
    ...extraFields,
  ];

  return defineType({
    name,
    title,
    type: "document",
    groups: GROUPS(defaultGroup ? defaultGroup : GROUP.IDENTITY),
    fields,
    preview,
  });
}
