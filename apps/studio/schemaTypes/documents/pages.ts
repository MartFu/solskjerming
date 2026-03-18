import { defineArrayMember, defineField } from "sanity";
import { createRoutableDocument } from "@/utils/factories";
import { GROUP } from "@/utils/constant";

// ===========================================================================
// ROOT / STANDALONE DOCUMENTS (with pagebuilder)
// ===========================================================================

/**
 * Generic page — the default content page.
 * Can nest under other pages: /about, /about/team, /about/team/leadership
 */
export const page = createRoutableDocument({
    name: "page",
    title: "Side",
    parentTypes: ["page"],
    pagebuilderType: "pageBuilder",
});

/**
 * Article root — the article index/listing page.
 * Can nest under a generic page: /resources/article
 * Children are articlePost documents.
 */
export const articleRoot = createRoutableDocument({
    name: "articleRoot",
    title: "Arkiv",
    parentTypes: ["page"],
    pagebuilderType: "articleRootPageBuilder",
    extraFields: [
        defineField({
            name: "postsPerPage",
            title: "Innlegg per side.",
            type: "number",
            group: GROUP.MAIN_CONTENT,
            description: "Antall innlegg som vises per paginerte side.",
            initialValue: 12,
            validation: (Rule) => Rule.min(1).max(100),
        }),
        defineField({
            name: "displayFeaturedArticles",
            title: "Vis fremhevede artikler",
            description:
                "Når denne er aktivert, vil de øverste artiklene fra den sorterte listen vises som fremhevede elementer øverst på siden.",
            type: "string",
            options: {
                list: [
                    { title: "Ja", value: "yes" },
                    { title: "Nei", value: "no" },
                ],
                layout: "radio",
            },
            initialValue: "yes",
            group: GROUP.MAIN_CONTENT,
        }),
        defineField({
            name: "featuredArticlesCount",
            title: "Antall fremhevede artikler",
            description:
                "Velg hvor mange artikler som skal vises som fremhevet.",
            type: "string",
            options: {
                list: [
                    { title: "1", value: "1" },
                    { title: "2", value: "2" },
                    { title: "3", value: "3" },
                ],
                layout: "radio",
                direction: "horizontal",
            },
            initialValue: "1",
            hidden: ({ parent }) => parent?.displayFeaturedArticles !== "yes",
            group: GROUP.MAIN_CONTENT,
        }),
        defineField({
            name: "categories",
            title: "Kategorier",
            type: "array",
            group: GROUP.MAIN_CONTENT,
            of: [{ type: "string" }],
            description:
                "Tilgjengelige kategorier for blogginnlegg under denne roten.",
            options: { layout: "tags" },
        }),
    ],
});

/**
 * Catalog root — the product listing/catalog page.
 * Can nest under a generic page: /shop/catalog
 * Children are productPage documents.
 */
export const catalogRoot = createRoutableDocument({
    name: "catalogRoot",
    title: "Catalog",
    parentTypes: ["page"],
    pagebuilderType: "catalogRootPageBuilder",
    extraFields: [
        defineField({
            name: "filterCategories",
            title: "Filterkategorier",
            type: "array",
            group: GROUP.MAIN_CONTENT,
            of: [{ type: "string" }],
            description:
                "Kategorier som er tilgjengelige for filtrering av produkter i denne katalogen.",
            options: { layout: "tags" },
        }),
    ],
});

// ===========================================================================
// CHILD DOCUMENTS (no pagebuilder — type-specific content fields)
// ===========================================================================

/**
 * Article Page — child of a articleRoot.
 * Carries its own editorial content: body, author, cover image.
 */
export const articlePage = createRoutableDocument({
    name: "articlePage",
    title: "Artikkelside",
    parentTypes: ["articleRoot"],
    extraFields: [ 
        defineField({
            name: "excerpt",
            title: "Sammendrag",
            type: "text",
            group: GROUP.MAIN_CONTENT,
            rows: 3,
            description:
                "Kort oppsummering som brukes i lister og metabeskrivelser.",
            validation: (Rule) => Rule.max(300),
        }),
        defineField({
            name: "coverImage",
            title: "Hovedbilde",
            type: "image",
            group: GROUP.MAIN_CONTENT,
            options: { hotspot: true },
        }),
        defineField({
            name: "authors",
            type: "array",
            title: "Forfattere",
            description:
                "Hvem som skrev denne artikkelen (velg fra arbeidsområdets globale forfattere)",
            of: [
                defineArrayMember({
                    type: "reference",
                    to: [
                        {
                            type: "author",
                            options: {
                                disableNew: true,
                            },
                        },
                    ],
                    options: {
                        disableNew: true,
                    },
                }),
            ],
            validation: (Rule) => [
                Rule.required(),
                Rule.max(1),
                Rule.min(1),
                Rule.unique(),
            ],
            group: GROUP.MAIN_CONTENT,
        }),
        defineField({
            name: "category",
            title: "Kategori",
            type: "string",
            group: GROUP.MAIN_CONTENT,
            description:
                "Bør samsvare med en av kategoriene definert på bloggens hovedside.",
        }),
        defineField({
            name: "body",
            title: "Brødtekst",
            type: "richText",
            group: GROUP.MAIN_CONTENT,
            description:
                "Artikkelens hovedinnhold i tekst, bilder og formattering.",
        }),
    ],
    preview: {
        select: {
            title: "title",
            media: "image",
            isPrivate: "seoNoIndex",
            isHidden: "seoHideFromLists",
            slug: "slug.current",
            author: "authors.0.name",
            publishDate: "publishedAt",
        },
        prepare: ({
            title,
            media,
            isPrivate,
            isHidden,
            author,
            slug,
            publishDate,
        }) => {
            // Status indicators
            let visibility = "Offentlig";
            if (isPrivate) {
                visibility = "Privat";
            } else if (isHidden) {
                visibility = "Skjult";
            }

            // Author and date
            const authorInfo = author ? `${author}` : "👻 Ingen forfatter";
            const dateInfo = publishDate
                ? `📅 ${new Date(publishDate).toLocaleDateString()}`
                : "⏳ Utkast";

            return {
                title: title || "Artikkel uten tittel",
                media,
                subtitle: `🔗 ${slug} | ${visibility} | ${authorInfo} | ${dateInfo}`,
            };
        },
    },
});

/**
 * Product page — child of a catalogRoot.
 * A site-specific proxy for a workspace-global product.
 * Holds marketing copy and presentation while the product itself is shared.
 */
export const productPage = createRoutableDocument({
    name: "productPage",
    title: "Produktside",
    parentTypes: ["catalogRoot"],
    extraFields: [
        defineField({
            name: "product",
            title: "Produkt",
            type: "reference",
            group: GROUP.MAIN_CONTENT,
            to: [{ type: "product" }],
            description:
                "Referanse til det globale produktobjektet. Produktets faste data som pris og spesifikasjoner hentes derfra.",
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "marketingCopy",
            title: "Markedsmessig innhold",
            type: "richText",
            group: GROUP.MAIN_CONTENT,
            description:
                "Nettstedsspesifikt kampanjeinnhold for dette produktet.",
        }),
        defineField({
            name: "coverImage",
            title: "Hovedbilde",
            type: "image",
            group: GROUP.MAIN_CONTENT,
            options: { hotspot: true },
            description:
                "Spesifikt bilde for dette nettstedet. Bruker produktets standardbilde hvis feltet er tomt.",
        }),
    ],
});
