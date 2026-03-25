import { Lightbulb, ListOrdered, Hash, ArrowLeftRight } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";

import { buttonsField, imageWithAltField } from "@/schemaTypes/common";
import { customRichText } from "@/schemaTypes/definitions/rich-text";

// ── Feature ───────────────────────────────────────────────────────────────────

/**
 * Feature — a single value proposition unit: heading, body, optional media.
 * The workhorse of marketing and editorial pages. Stacks naturally into
 * alternating split layouts when used in a sequence.
 */
export const feature = defineType({
    name: "feature",
    title: "Feature",
    type: "object",
    icon: Lightbulb,
    description: "A value proposition: heading, body text, and optional media.",
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
            description: "The feature heading.",
            validation: (Rule) => Rule.required(),
        }),
        customRichText(["block"], {
            name: "body",
            title: "Body",
        }),
        imageWithAltField({
            title: "Media",
            description: "Supporting image, screenshot, or illustration.",
        }),
        buttonsField,
    ],
    preview: {
        select: { title: "title", media: "image" },
        prepare: ({ title, media }) => ({
            title: title ?? "Feature",
            subtitle: "Feature",
            media,
        }),
    },
});

// ── Steps ─────────────────────────────────────────────────────────────────────

/**
 * Steps — a numbered sequence of actions or stages.
 * Common uses: how it works, onboarding flow, purchase process, course outline.
 */
export const steps = defineType({
    name: "steps",
    title: "Steps",
    type: "object",
    icon: ListOrdered,
    description: "A numbered sequence of steps or stages.",
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
            name: "steps",
            title: "Steps",
            type: "array",
            description:
                "The individual steps. Each gets a number automatically.",
            of: [
                defineArrayMember({
                    name: "step",
                    type: "object",
                    fields: [
                        defineField({
                            name: "title",
                            title: "Step title",
                            type: "string",
                            description: "Short label for this step.",
                            validation: (Rule) => Rule.required(),
                        }),
                        customRichText(["block"], {
                            name: "body",
                            title: "Description",
                        }),
                        imageWithAltField({
                            title: "Media",
                            description: "Optional image for this step.",
                        }),
                    ],
                    preview: {
                        select: { title: "title" },
                        prepare: ({ title }) => ({ title: title ?? "Step" }),
                    },
                }),
            ],
            validation: (Rule) => Rule.min(2),
        }),
        defineField({
            name: "layout",
            title: "Layout",
            type: "string",
            description: "How the steps are arranged.",
            options: {
                list: [
                    { title: "Vertical list", value: "vertical" },
                    { title: "Horizontal row", value: "horizontal" },
                ],
                layout: "radio",
            },
            initialValue: "vertical",
        }),
    ],
    preview: {
        select: { title: "title", steps: "steps" },
        prepare: ({ title, steps = [] }) => ({
            title: title ?? "Steps",
            subtitle: `Steps · ${steps.length} step${steps.length === 1 ? "" : "s"}`,
        }),
    },
});

// ── Stat ──────────────────────────────────────────────────────────────────────

/**
 * Stat — large impact numbers with labels.
 * Common uses: by-the-numbers section, social proof metrics, course stats.
 */
export const stat = defineType({
    name: "stat",
    title: "Stat",
    type: "object",
    icon: Hash,
    description: "Large numbers with labels. Impact metrics and social proof.",
    fields: [
        defineField({
            name: "eyebrow",
            title: "Eyebrow",
            type: "string",
            description: "Small label above the stats.",
        }),
        defineField({
            name: "title",
            title: "Title",
            type: "string",
            description: "Optional heading above the stats.",
        }),
        defineField({
            name: "stats",
            title: "Stats",
            type: "array",
            description: "The individual stat items.",
            of: [
                defineArrayMember({
                    name: "statItem",
                    type: "object",
                    fields: [
                        defineField({
                            name: "value",
                            title: "Value",
                            type: "string",
                            description:
                                "The number or metric, e.g. '10,000+' or '4.9★'.",
                            validation: (Rule) => Rule.required(),
                        }),
                        defineField({
                            name: "label",
                            title: "Label",
                            type: "string",
                            description:
                                "What the value represents, e.g. 'Active users'.",
                            validation: (Rule) => Rule.required(),
                        }),
                        defineField({
                            name: "description",
                            title: "Description",
                            type: "string",
                            description:
                                "Optional supporting detail below the label.",
                        }),
                    ],
                    preview: {
                        select: { value: "value", label: "label" },
                        prepare: ({ value, label }) => ({
                            title: value ?? "Stat",
                            subtitle: label,
                        }),
                    },
                }),
            ],
            validation: (Rule) => Rule.min(1).max(6),
        }),
    ],
    preview: {
        select: { title: "title", stats: "stats" },
        prepare: ({ title, stats = [] }) => ({
            title: title ?? "Stat",
            subtitle: `Stat · ${stats.length} item${stats.length === 1 ? "" : "s"}`,
        }),
    },
});

// ── Comparison ────────────────────────────────────────────────────────────────

/**
 * Comparison — two-column contrast layout.
 * Common uses: before/after, us vs competitor, old way vs new way.
 * For pricing plan comparisons, use the Pricing block instead.
 */
export const comparison = defineType({
    name: "comparison",
    title: "Comparison",
    type: "object",
    icon: ArrowLeftRight,
    description: "Two-column contrast. Before/after, us vs them.",
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
            name: "left",
            title: "Left column",
            type: "object",
            description: "The 'before' or 'them' side.",
            fields: [
                defineField({
                    name: "label",
                    title: "Label",
                    type: "string",
                    description:
                        "Column heading, e.g. 'Before' or 'Competitor'.",
                    validation: (Rule) => Rule.required(),
                }),
                defineField({
                    name: "items",
                    title: "Items",
                    type: "array",
                    description: "The points or features on this side.",
                    of: [
                        defineArrayMember({
                            name: "item",
                            type: "object",
                            fields: [
                                defineField({
                                    name: "text",
                                    title: "Text",
                                    type: "string",
                                    validation: (Rule) => Rule.required(),
                                }),
                                defineField({
                                    name: "sentiment",
                                    title: "Sentiment",
                                    type: "string",
                                    options: {
                                        list: [
                                            {
                                                title: "Negative",
                                                value: "negative",
                                            },
                                            {
                                                title: "Neutral",
                                                value: "neutral",
                                            },
                                        ],
                                        layout: "radio",
                                    },
                                    initialValue: "negative",
                                }),
                            ],
                            preview: {
                                select: { title: "text" },
                                prepare: ({ title }) => ({ title }),
                            },
                        }),
                    ],
                }),
            ],
        }),
        defineField({
            name: "right",
            title: "Right column",
            type: "object",
            description: "The 'after' or 'us' side.",
            fields: [
                defineField({
                    name: "label",
                    title: "Label",
                    type: "string",
                    description:
                        "Column heading, e.g. 'After' or 'Our product'.",
                    validation: (Rule) => Rule.required(),
                }),
                defineField({
                    name: "items",
                    title: "Items",
                    type: "array",
                    description: "The points or features on this side.",
                    of: [
                        defineArrayMember({
                            name: "item",
                            type: "object",
                            fields: [
                                defineField({
                                    name: "text",
                                    title: "Text",
                                    type: "string",
                                    validation: (Rule) => Rule.required(),
                                }),
                                defineField({
                                    name: "sentiment",
                                    title: "Sentiment",
                                    type: "string",
                                    options: {
                                        list: [
                                            {
                                                title: "Positive",
                                                value: "positive",
                                            },
                                            {
                                                title: "Neutral",
                                                value: "neutral",
                                            },
                                        ],
                                        layout: "radio",
                                    },
                                    initialValue: "positive",
                                }),
                            ],
                            preview: {
                                select: { title: "text" },
                                prepare: ({ title }) => ({ title }),
                            },
                        }),
                    ],
                }),
            ],
        }),
    ],
    preview: {
        select: { title: "title", left: "left.label", right: "right.label" },
        prepare: ({ title, left, right }) => ({
            title: title ?? "Comparison",
            subtitle: left && right ? `${left} vs ${right}` : "Comparison",
        }),
    },
});
