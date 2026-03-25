import { LayoutGrid } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";

import { iconField, imageWithAltField } from "@/schemaTypes/common";
import { lucideIconPreview } from "@/components/icon-preview";
import { customRichText } from "@/schemaTypes/definitions/rich-text";

/**
 * CardGrid — a grid of inline (non-reference) cards.
 *
 * Replaces: featureCardsIcon, imageLinkCards
 * Generalises: cards can carry an icon, an image, or neither — controlled
 * per card via the mediaType field. This avoids needing separate block types
 * for "icon cards" vs "image cards."
 *
 * Common uses: features, services, benefits, team members, categories.
 */

const card = defineField({
    name: "card",
    title: "Card",
    type: "object",
    fields: [
        defineField({
            name: "mediaType",
            title: "Media type",
            type: "string",
            description: "What kind of media to show on this card, if any.",
            options: {
                list: [
                    { title: "None", value: "none" },
                    { title: "Icon", value: "icon" },
                    { title: "Image", value: "image" },
                ],
                layout: "radio",
            },
            initialValue: "none",
        }),
        iconField,
        imageWithAltField({
            title: "Image",
            description: "Card image or illustration.",
        }),
        defineField({
            name: "title",
            title: "Title",
            type: "string",
            description: "The card heading.",
            validation: (Rule) => Rule.required(),
        }),
        customRichText(["block"], {
            name: "body",
            title: "Body",
        }),
        defineField({
            name: "url",
            title: "Link URL",
            type: "customUrl",
            description: "Optional link. Makes the whole card clickable.",
        }),
    ],
    preview: {
        select: {
            title: "title",
            icon: "icon",
            media: "image",
            mediaType: "mediaType",
        },
        prepare: ({ title, icon, media, mediaType }) => ({
            title: title ?? "Card",
            media: mediaType === "icon" ? lucideIconPreview(icon) : media,
        }),
    },
});

export const cardGrid = defineType({
    name: "cardGrid",
    title: "Card grid",
    type: "object",
    icon: LayoutGrid,
    description:
        "A grid of inline cards — features, services, benefits, or categories.",
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
        customRichText(["block"], {
            name: "body",
            title: "Body",
        }),
        defineField({
            name: "cards",
            title: "Cards",
            type: "array",
            description:
                "The cards to display. All content is written here — not pulled from elsewhere.",
            of: [defineArrayMember(card)],
            validation: (Rule) => Rule.min(1),
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
        select: { title: "title", cards: "cards" },
        prepare: ({ title, cards = [] }) => ({
            title: title ?? "Card grid",
            subtitle: `Card grid · ${cards.length} card${cards.length === 1 ? "" : "s"}`,
        }),
    },
});
