import { Star } from "lucide-react";
import { defineField, defineType } from "sanity";

import { buttonsField, imageWithAltField } from "@/schemaTypes/common";
import { customRichText } from "@/schemaTypes/definitions/rich-text";

/**
 * Banner — dominant page opener.
 *
 * Replaces: hero.ts
 * Generalises: the badge field becomes eyebrow for consistency with other blocks.
 * Adds: layout option so Vibes can use the editor's intent as a hint.
 */
export const banner = defineType({
    name: "banner",
    title: "Banner",
    type: "object",
    icon: Star,
    description: "Full-width page opener with a dominant heading and media.",
    fields: [
        defineField({
            name: "eyebrow",
            title: "Eyebrow",
            type: "string",
            description:
                "Small text above the heading — a label, badge, or tagline.",
        }),
        defineField({
            name: "title",
            title: "Title",
            type: "string",
            description: "The main heading. Keep it short and impactful.",
            validation: (Rule) => Rule.required(),
        }),
        customRichText(["block"], {
            name: "body",
            title: "Body",
        }),
        imageWithAltField({
            title: "Media",
            description: "Background or hero image.",
        }),
        buttonsField,
        defineField({
            name: "layout",
            title: "Layout",
            type: "string",
            description:
                "How the content and media are arranged. The Vibe may interpret this differently.",
            options: {
                list: [
                    {
                        title: "Overlay — text on top of image",
                        value: "overlay",
                    },
                    { title: "Split — text beside image", value: "split" },
                    { title: "Stacked — text above image", value: "stacked" },
                ],
                layout: "radio",
            },
            initialValue: "overlay",
        }),
    ],
    preview: {
        select: { title: "title", media: "image" },
        prepare: ({ title, media }) => ({
            title: title ?? "Billboard",
            subtitle: "Billboard",
            media,
        }),
    },
});
