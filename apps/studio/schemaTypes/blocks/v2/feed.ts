import { Rss } from "lucide-react";
import { defineField, defineType } from "sanity";

/**
 * Feed — a queried, dynamic listing of documents.
 *
 * Replaces: articleFeed, productGrid
 * Generalises: sourceType drives which document type is queried.
 *   The frontend resolves the query at request time using the config here
 *   as a declarative query hint.
 *
 * Unlike ReferenceGrid (manual curation), Feed is automatic — it pulls
 * the latest matching documents based on the editor's filter config.
 *
 * Common uses: latest articles, product catalog, course listing, FAQ index.
 */
export const feed = defineType({
    name: "feed",
    title: "Feed",
    type: "object",
    icon: Rss,
    description:
        "An automatic listing of content — articles, products, or other documents.",
    fields: [
        defineField({
            name: "eyebrow",
            title: "Eyebrow",
            type: "string",
            description: "Small label above the heading.",
        }),
        defineField({
            name: "title",
            title: "Title",
            type: "string",
            description: "The section heading.",
        }),
        defineField({
            name: "sourceType",
            title: "Content type",
            type: "string",
            description: "Which kind of content to list.",
            options: {
                list: [
                    { title: "Articles", value: "article" },
                    { title: "Products", value: "product" },
                    { title: "FAQs", value: "faq" },
                    // { title: "Courses", value: "course" },
                ],
                layout: "radio",
            },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "filterCategory",
            title: "Filter by category",
            type: "reference",
            description:
                "Only show content from this category. Leave blank for all.",
            to: [{ type: "category" }],
            options: { disableNew: true },
        }),
        defineField({
            name: "limit",
            title: "Maximum items",
            type: "number",
            description: "How many items to show. Leave blank to show all.",
            validation: (Rule) => Rule.min(1).max(100).integer(),
        }),
        defineField({
            name: "sortOrder",
            title: "Sort order",
            type: "string",
            description: "How to order the items.",
            options: {
                list: [
                    { title: "Newest first", value: "publishedAt_desc" },
                    { title: "Oldest first", value: "publishedAt_asc" },
                    { title: "Title A–Z", value: "title_asc" },
                    { title: "Title Z–A", value: "title_desc" },
                ],
                layout: "radio",
            },
            initialValue: "publishedAt_desc",
        }),
        defineField({
            name: "displayStyle",
            title: "Display style",
            type: "string",
            description: "How to lay out the items.",
            options: {
                list: [
                    { title: "Grid", value: "grid" },
                    { title: "List", value: "list" },
                    { title: "Magazine", value: "magazine" },
                ],
                layout: "radio",
            },
            initialValue: "grid",
        }),
        defineField({
            name: "columns",
            title: "Columns",
            type: "string",
            description: "Number of columns (grid display only).",
            options: {
                list: [
                    { title: "2", value: "2" },
                    { title: "3", value: "3" },
                    { title: "4", value: "4" },
                ],
                layout: "radio",
            },
            initialValue: "3",
            hidden: ({ parent }) => parent?.displayStyle !== "grid",
        }),
        defineField({
            name: "showFilters",
            title: "Show filter controls",
            type: "boolean",
            description: "Display category filter controls above the listing.",
            initialValue: false,
        }),
    ],
    preview: {
        select: {
            title: "title",
            sourceType: "sourceType",
            displayStyle: "displayStyle",
        },
        prepare: ({ title, sourceType, displayStyle }) => ({
            title: title ?? "Feed",
            subtitle: `Feed · ${sourceType ?? "?"} · ${displayStyle ?? "grid"}`,
        }),
    },
});
