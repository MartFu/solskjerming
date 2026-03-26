import { defineField, FieldDefinition } from "sanity";
import { GROUP } from "@/utils/constant";
import { createSiteScopedSlugField } from "@/utils/factories";
import { PageBuilderType } from "@/schemaTypes/definitions/pagebuilder";
import { siteRelationField } from "@/schemaTypes/common";

// ---------------------------------------------------------------------------
// Field Sets
// ---------------------------------------------------------------------------
//
// Each function returns a FieldDefinition[] representing a logical group of
// fields that routable documents can opt into. These are the lowest-level
// building blocks — both `definePackage` and standalone document definitions
// (like the generic `page` type) compose from these.
//
// Why this exists:
//   The previous `createRoutableDocument` factory assembled all fields
//   internally, making it hard to skip or reorder groups. With field sets,
//   each document type explicitly declares what it includes. The tradeoff
//   is slightly more verbose definitions, but full transparency and
//   flexibility when a new type doesn't fit the standard mold.
// ---------------------------------------------------------------------------

/**
 * Core identity fields every routable document needs:
 * title, description, site reference, and a site-scoped slug.
 */
export function createIdentityFields(): FieldDefinition[] {
    return [
      siteRelationField,
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
      createSiteScopedSlugField(),
    ];
}

/**
 * Parent reference field for documents that live under other documents.
 *
 * The `parentTypes` array constrains which document types can be selected
 * as a parent. The filter ensures only documents belonging to the same
 * site are shown.
 *
 * @param parentTypes - Array of document type names this can be a child of.
 */
export function createPageParentField(parentTypes: string[]): FieldDefinition[] {
    if (parentTypes.length === 0) return [];

    return [
        defineField({
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
                    const doc = document as Record<string, any>;
                    return {
                        filter: "site._ref == $siteId && _type in $allowedTypes",
                        params: {
                            siteId: doc.site?._ref,
                            allowedTypes: parentTypes,
                        },
                    };
                },
            },
            readOnly: true,
        }),
    ];
}

/**
 * Sort order field for controlling sibling order in lists and navigation.
 */
export function createSortOrderField(): FieldDefinition[] {
    return [
        defineField({
            name: "sortOrder",
            title: "Sorteringsrekkefølge",
            type: "number",
            group: GROUP.RELATIONSHIPS,
            description: "Bestemmer plasseringen blant søskensider i lister.",
            initialValue: 0,
        }),
    ];
}

/**
 * Pagebuilder field for root/standalone documents.
 *
 * @param pagebuilderType - The name of the pagebuilder array type to use,
 *                          e.g. "pageBuilder", "articleRootPageBuilder".
 */
export function createPagebuilderField(
    pagebuilderType: PageBuilderType,
): FieldDefinition[] {
    return [
        defineField({
            name: "pagebuilder",
            title: "Sidebygger",
            type: pagebuilderType,
            group: GROUP.MAIN_CONTENT,
        }),
    ];
}
