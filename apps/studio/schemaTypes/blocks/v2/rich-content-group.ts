import { Type, ChevronDown, Table2, Image } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";

import { imageWithAltField } from "@/schemaTypes/common";
import { customRichText } from "@/schemaTypes/definitions/rich-text";

// ── RichText ──────────────────────────────────────────────────────────────────

export const richText = defineType({
    name: "richText",
    title: "Rich text",
    type: "object",
    icon: Type,
    description:
        "Long-form Portable Text. Articles, documentation, lesson bodies.",
    fields: [
        customRichText(["block", "image"], {
            name: "content",
            title: "Content",
        }),
        defineField({
            name: "maxWidth",
            title: "Max width",
            type: "string",
            description: "Constrains reading line length.",
            options: {
                list: [
                    { title: "Narrow (prose)", value: "narrow" },
                    { title: "Standard", value: "standard" },
                    { title: "Full width", value: "full" },
                ],
                layout: "radio",
            },
            initialValue: "narrow",
        }),
    ],
    preview: {
        select: { content: "content" },
        prepare: ({ content }) => {
            const firstBlock = content?.[0];
            const text =
                firstBlock?.children
                    ?.map((c: { text?: string }) => c.text ?? "")
                    .join("") ?? "";
            return {
                title: text ? text.slice(0, 60) : "Rich text",
                subtitle: "Rich text",
            };
        },
    },
});

// ── Accordion ─────────────────────────────────────────────────────────────────

/**
 * Accordion — expandable rows of content.
 *
 * Replaces: faqAccordion
 * Generalises: items can be inline content OR references to faq documents.
 *   Use sourceType to switch between the two modes.
 *
 * Common uses: FAQ, product specs, course curriculum, documentation sections.
 */
export const accordion = defineType({
    name: "accordion",
    title: "Accordion",
    type: "object",
    icon: ChevronDown,
    description: "Expandable rows. FAQ, specs, curriculum outlines.",
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
        defineField({
            name: "subtitle",
            title: "Subtitle",
            type: "string",
            description: "Optional supporting text below the heading.",
        }),
        defineField({
            name: "sourceType",
            title: "Content source",
            type: "string",
            description: "Where the accordion items come from.",
            options: {
                list: [
                    { title: "Written here — inline items", value: "inline" },
                    {
                        title: "From FAQ library — reference existing FAQs",
                        value: "faq",
                    },
                ],
                layout: "radio",
            },
            initialValue: "inline",
        }),
        defineField({
            name: "items",
            title: "Items",
            type: "array",
            description: "The accordion rows, written directly here.",
            hidden: ({ parent }) => parent?.sourceType !== "inline",
            of: [
                defineArrayMember({
                    name: "accordionItem",
                    type: "object",
                    fields: [
                        defineField({
                            name: "title",
                            title: "Question / heading",
                            type: "string",
                            validation: (Rule) => Rule.required(),
                        }),
                        customRichText(["block"], {
                            name: "body",
                            title: "Answer / body",
                        }),
                    ],
                    preview: {
                        select: { title: "title" },
                        prepare: ({ title }) => ({ title: title ?? "Item" }),
                    },
                }),
            ],
        }),
        defineField({
            name: "faqs",
            title: "FAQs",
            type: "array",
            description: "Pick from your FAQ library.",
            hidden: ({ parent }) => parent?.sourceType !== "faq",
            of: [
                defineArrayMember({
                    type: "reference",
                    to: [{ type: "faq" }],
                    options: { disableNew: true },
                }),
            ],
            validation: (Rule) => Rule.unique(),
        }),
        defineField({
            name: "link",
            title: "Link",
            type: "object",
            description:
                "Optional link displayed below the accordion, e.g. to a full FAQ page.",
            fields: [
                defineField({
                    name: "title",
                    title: "Link text",
                    type: "string",
                }),
                defineField({ name: "url", title: "URL", type: "customUrl" }),
            ],
        }),
    ],
    preview: {
        select: { title: "title", sourceType: "sourceType" },
        prepare: ({ title, sourceType }) => ({
            title: title ?? "Accordion",
            subtitle: `Accordion · ${sourceType === "faq" ? "FAQ refs" : "inline"}`,
        }),
    },
});

// ── Table ─────────────────────────────────────────────────────────────────────

export const table = defineType({
    name: "table",
    title: "Table",
    type: "object",
    icon: Table2,
    description: "Structured data table. Specs, feature comparison matrix.",
    fields: [
        defineField({
            name: "title",
            title: "Title",
            type: "string",
            description: "Optional heading above the table.",
        }),
        defineField({
            name: "tableStyle",
            title: "Table style",
            type: "string",
            description:
                "Controls how the table is rendered. Comparison style adds a highlighted column.",
            options: {
                list: [
                    { title: "Standard — rows and columns", value: "standard" },
                    {
                        title: "Comparison — feature matrix with highlight column",
                        value: "comparison",
                    },
                ],
                layout: "radio",
            },
            initialValue: "standard",
        }),
        defineField({
            name: "headers",
            title: "Column headers",
            type: "array",
            description: "The column header labels.",
            of: [
                defineArrayMember({
                    name: "header",
                    type: "object",
                    fields: [
                        defineField({
                            name: "label",
                            title: "Label",
                            type: "string",
                            validation: (Rule) => Rule.required(),
                        }),
                        defineField({
                            name: "highlight",
                            title: "Highlight this column",
                            type: "boolean",
                            description:
                                "Mark this as the recommended or featured column (comparison style only).",
                            initialValue: false,
                        }),
                    ],
                    preview: {
                        select: { title: "label" },
                        prepare: ({ title }) => ({ title }),
                    },
                }),
            ],
            validation: (Rule) => Rule.min(2),
        }),
        defineField({
            name: "rows",
            title: "Rows",
            type: "array",
            description:
                "Each row is a set of cells matching the column headers.",
            of: [
                defineArrayMember({
                    name: "tableRow",
                    type: "object",
                    fields: [
                        defineField({
                            name: "cells",
                            title: "Cells",
                            type: "array",
                            description: "One cell per column, in order.",
                            of: [
                                defineArrayMember({
                                    name: "tableCell",
                                    type: "object",
                                    fields: [
                                        defineField({
                                            name: "content",
                                            title: "Content",
                                            type: "string",
                                            description:
                                                "Text, or use 'yes'/'no' for checkmarks in comparison tables.",
                                        }),
                                    ],
                                    preview: {
                                        select: { title: "content" },
                                        prepare: ({ title }) => ({ title }),
                                    },
                                }),
                            ],
                        }),
                    ],
                    preview: {
                        select: { cells: "cells" },
                        prepare: ({ cells = [] }) => ({
                            title:
                                cells
                                    .map(
                                        (c: { content?: string }) =>
                                            c.content ?? "",
                                    )
                                    .join(" · ") || "Row",
                        }),
                    },
                }),
            ],
        }),
    ],
    preview: {
        select: { title: "title", rows: "rows", tableStyle: "tableStyle" },
        prepare: ({ title, rows = [], tableStyle }) => ({
            title: title ?? "Table",
            subtitle: `Table · ${tableStyle ?? "standard"} · ${rows.length} row${rows.length === 1 ? "" : "s"}`,
        }),
    },
});

// ── Media ─────────────────────────────────────────────────────────────────────

export const media = defineType({
    name: "media",
    title: "Media",
    type: "object",
    icon: Image,
    description: "A standalone image or video, full-bleed or contained.",
    fields: [
        defineField({
            name: "mediaType",
            title: "Media type",
            type: "string",
            options: {
                list: [
                    { title: "Image", value: "image" },
                    { title: "Video (embed URL)", value: "video" },
                ],
                layout: "radio",
            },
            initialValue: "image",
        }),
        imageWithAltField({
            title: "Image",
            description: "The image to display.",
        }),
        defineField({
            name: "videoUrl",
            title: "Video URL",
            type: "url",
            description: "YouTube, Vimeo, or other embed URL.",
            hidden: ({ parent }) => parent?.mediaType !== "video",
        }),
        defineField({
            name: "caption",
            title: "Caption",
            type: "string",
            description: "Optional caption displayed below the media.",
        }),
        defineField({
            name: "width",
            title: "Width",
            type: "string",
            description: "How wide the media should be.",
            options: {
                list: [
                    { title: "Full bleed", value: "full" },
                    { title: "Contained", value: "contained" },
                    { title: "Narrow", value: "narrow" },
                ],
                layout: "radio",
            },
            initialValue: "contained",
        }),
    ],
    preview: {
        select: {
            media: "image",
            caption: "caption",
            mediaType: "mediaType",
            videoUrl: "videoUrl",
        },
        prepare: ({ media, caption, mediaType, videoUrl }) => ({
            title:
                caption ??
                (mediaType === "video" ? (videoUrl ?? "Video") : "Image"),
            subtitle: `Media · ${mediaType ?? "image"}`,
            media,
        }),
    },
});
