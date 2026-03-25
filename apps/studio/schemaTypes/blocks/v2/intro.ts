import { AlignCenter } from "lucide-react";
import { defineField, defineType } from "sanity";

import { customRichText } from "@/schemaTypes/definitions/rich-text";

/**
 * Intro — a centered heading and subheading with no other baggage.
 * Used to introduce a new chapter of a page without the weight of a
 * Feature or Billboard block.
 *
 * Common uses: section openers, article leads, course chapter titles.
 */
export const intro = defineType({
    name: "intro",
    title: "Intro",
    type: "object",
    icon: AlignCenter,
    description: "A centered heading and subheading to open a page section.",
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
            validation: (Rule) => Rule.required(),
        }),
        customRichText(["block"], {
            name: "body",
            title: "Body",
        }),
        defineField({
            name: "align",
            title: "Alignment",
            type: "string",
            description: "Text alignment within the block.",
            options: {
                list: [
                    { title: "Center", value: "center" },
                    { title: "Left", value: "left" },
                ],
                layout: "radio",
            },
            initialValue: "center",
        }),
    ],
    preview: {
        select: { title: "title" },
        prepare: ({ title }) => ({
            title: title ?? "Intro",
            subtitle: "Intro",
        }),
    },
});
