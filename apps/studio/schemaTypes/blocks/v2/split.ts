import { Columns2 } from "lucide-react";
import { defineField, defineType } from "sanity";

import { buttonsField, imageWithAltField } from "@/schemaTypes/common";
import { customRichText } from "@/schemaTypes/definitions/rich-text";

/**
 * Split — two-column layout with text on one side and media on the other.
 * Useful for feature introductions, about sections, and course overviews.
 */
export const split = defineType({
    name: "split",
    title: "Split",
    type: "object",
    icon: Columns2,
    description:
        "Text on one side, media on the other. Configurable weight and order.",
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
        imageWithAltField({
            title: "Media",
            description: "Image or illustration displayed beside the text.",
        }),
        buttonsField,
        defineField({
            name: "mediaPosition",
            title: "Media position",
            type: "string",
            description: "Which side the media appears on.",
            options: {
                list: [
                    { title: "Right", value: "right" },
                    { title: "Left", value: "left" },
                ],
                layout: "radio",
            },
            initialValue: "right",
        }),
        defineField({
            name: "mediaWeight",
            title: "Media weight",
            type: "string",
            description: "How much horizontal space the media takes up.",
            options: {
                list: [
                    { title: "Equal (50 / 50)", value: "equal" },
                    { title: "Media larger (40 / 60)", value: "mediaLarger" },
                    { title: "Text larger (60 / 40)", value: "textLarger" },
                ],
                layout: "radio",
            },
            initialValue: "equal",
        }),
    ],
    preview: {
        select: {
            title: "title",
            media: "image",
            mediaPosition: "mediaPosition",
        },
        prepare: ({ title, media, mediaPosition }) => ({
            title: title ?? "Split",
            subtitle: `Split · media ${mediaPosition ?? "right"}`,
            media,
        }),
    },
});
