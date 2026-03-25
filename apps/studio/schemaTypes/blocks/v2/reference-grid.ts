import { Grid2x2 } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * ReferenceGrid — a manually curated grid of document references.
 *
 * The editor hand-picks which documents appear. Use Feed for queried/
 * automatic listings. Use ReferenceGrid when curation matters —
 * "these three articles" or "these featured products."
 *
 * Supports: article, product, course (extend `to` as new types are added).
 *
 * Common uses: featured articles, highlighted products, related courses.
 */
export const referenceGrid = defineType({
    name: "referenceGrid",
    title: "Reference grid",
    type: "object",
    icon: Grid2x2,
    description:
        "A curated grid of content from elsewhere — articles, products, or courses.",
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
            name: "items",
            title: "Items",
            type: "array",
            description: "Hand-pick the documents to display. Order them here.",
            of: [
                defineArrayMember({
                    type: "reference",
                    to: [
                        { type: "article" },
                        { type: "product" },
                        // { type: "course" }, // uncomment when learning module is added
                    ],
                    options: { disableNew: true },
                }),
            ],
            validation: (Rule) => [Rule.min(1), Rule.unique()],
        }),
        defineField({
            name: "columns",
            title: "Columns",
            type: "string",
            description: "How many columns to show on desktop.",
            options: {
                list: [
                    { title: "2", value: "2" },
                    { title: "3", value: "3" },
                    { title: "4", value: "4" },
                ],
                layout: "radio",
            },
            initialValue: "3",
        }),
    ],
    preview: {
        select: { title: "title", items: "items" },
        prepare: ({ title, items = [] }) => ({
            title: title ?? "Reference grid",
            subtitle: `Reference grid · ${items.length} item${items.length === 1 ? "" : "s"}`,
        }),
    },
});
