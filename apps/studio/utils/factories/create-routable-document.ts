import { API_VERSION, GROUP, GROUPS, GroupValue } from "@/utils/constant";
import { ogFields } from "@/utils/og-fields";
import { seoFields } from "@/utils/seo-fields";
import {
    defineField,
    defineType,
    FieldDefinition,
    PreviewConfig,
    SanityDocument,
    SchemaTypeDefinition,
} from "sanity";
import { isSiteDocument } from "../types";
import { createSiteScopedSlugField } from "./create-slug-field";

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
export interface RoutableDocumentConfig {
    /** Schema type name, e.g. "blogRoot" or "blogPost" */
    name: string;

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
            "Et kort sammendrag av hva besøkende kan på denne siden. Dette hjelper folk å forstå hva innholdet handler om. Bør gjenta nøkkelord for optimal søkemotorsynlighet.",
        group: GROUP.MAIN_CONTENT,
    }),
    defineField({
        name: "site",
        title: "Nettsted",
        type: "reference",
        group: GROUP.RELATIONSHIPS,
        to: [{ type: "site" }],
        description:
            "Settes automatisk ved opprettelse. Skrivebeskyttet for å sikre dataintegritet.",
        readOnly: true,
        validation: (Rule) => Rule.required(),
    }),
    createSiteScopedSlugField(),
    defineField({
        name: "sortOrder",
        title: "Sorteringsrekkefølge",
        type: "number",
        group: GROUP.RELATIONSHIPS,
        description: "Bestemmer plasseringen blant søskensider.",
        initialValue: 0,
    }),
];

const seoOgFields: FieldDefinition[] = [
    ...seoFields.filter((field) => field.name !== "seoHideFromLists"),
    ...ogFields,
];

function createParentField(parentTypes: string[]): FieldDefinition {
    return defineField({
        name: "parent",
        title: "Sidens forelder",
        type: "reference",
        group: GROUP.RELATIONSHIPS,
        description:
            "Definerer sidens plassering i sidekartet (både i generering av Sitemap, og i trafikkruting). La feltet stå tomt for sider på toppnivå, f.eks. forsiden ('/') eller kontakt-siden ('/kontakt').",
        to: parentTypes.map((type) => ({ type })),
        initialValue: undefined,
    });
}

function createPagebuilderField(pagebuilderType: string): FieldDefinition {
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
            subtitle: slug ? `/${slug} · ${status}` : status,
            media,
        };
    },
};

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export function createRoutableDocument(
    config: RoutableDocumentConfig,
): SchemaTypeDefinition {
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
        ...(parentTypes.length > 0 ? [createParentField(parentTypes)] : []),

        // 3. SEO & OG
        ...seoOgFields,

        // 4. Pagebuilder (roots / standalone only)
        ...(pagebuilderType ? [createPagebuilderField(pagebuilderType)] : []),

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
