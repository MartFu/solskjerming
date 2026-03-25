import { Quote, Award, Scroll, MessageSquareQuote } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";

import { imageWithAltField } from "@/schemaTypes/common";

// ── Testimonial ───────────────────────────────────────────────────────────────

export const testimonial = defineType({
    name: "testimonial",
    title: "Testimonial",
    type: "object",
    icon: Quote,
    description: "Customer quotes with attribution. Single or multi.",
    fields: [
        defineField({
            name: "eyebrow",
            title: "Eyebrow",
            type: "string",
            description:
                "Small label above the quotes, e.g. 'What our customers say'.",
        }),
        defineField({
            name: "title",
            title: "Title",
            type: "string",
            description: "Optional heading above the testimonials.",
        }),
        defineField({
            name: "items",
            title: "Testimonials",
            type: "array",
            description: "The individual quotes.",
            of: [
                defineArrayMember({
                    name: "testimonialItem",
                    type: "object",
                    fields: [
                        defineField({
                            name: "quote",
                            title: "Quote",
                            type: "text",
                            rows: 3,
                            description:
                                "The customer's words. Keep it concise.",
                            validation: (Rule) => Rule.required(),
                        }),
                        defineField({
                            name: "authorName",
                            title: "Author name",
                            type: "string",
                            description: "The person's full name.",
                            validation: (Rule) => Rule.required(),
                        }),
                        defineField({
                            name: "authorTitle",
                            title: "Author title",
                            type: "string",
                            description:
                                "Their role and company, e.g. 'CEO, Acme Corp'.",
                        }),
                        imageWithAltField({
                            title: "Author photo",
                            description: "Headshot or avatar.",
                        }),
                        defineField({
                            name: "rating",
                            title: "Star rating",
                            type: "number",
                            description: "Optional star rating out of 5.",
                            validation: (Rule) => Rule.min(1).max(5).integer(),
                        }),
                    ],
                    preview: {
                        select: {
                            name: "authorName",
                            title: "authorTitle",
                            media: "image",
                        },
                        prepare: ({ name, title, media }) => ({
                            title: name ?? "Testimonial",
                            subtitle: title,
                            media,
                        }),
                    },
                }),
            ],
            validation: (Rule) => Rule.min(1),
        }),
        defineField({
            name: "layout",
            title: "Layout",
            type: "string",
            description: "How multiple testimonials are displayed.",
            options: {
                list: [
                    { title: "Grid", value: "grid" },
                    { title: "Carousel", value: "carousel" },
                    { title: "Single featured", value: "featured" },
                ],
                layout: "radio",
            },
            initialValue: "grid",
        }),
    ],
    preview: {
        select: { title: "title", items: "items" },
        prepare: ({ title, items = [] }) => ({
            title: title ?? "Testimonial",
            subtitle: `Testimonial · ${items.length} quote${items.length === 1 ? "" : "s"}`,
        }),
    },
});

// ── LogoGrid ──────────────────────────────────────────────────────────────────

export const logoGrid = defineType({
    name: "logoGrid",
    title: "Logo grid",
    type: "object",
    icon: Award,
    description: "Static grid of partner, payment, or certification logos.",
    fields: [
        defineField({
            name: "title",
            title: "Title",
            type: "string",
            description:
                "Optional label above the logos, e.g. 'Trusted by' or 'We accept'.",
        }),
        defineField({
            name: "logos",
            title: "Logos",
            type: "array",
            description: "The logos to display.",
            of: [
                defineArrayMember({
                    name: "logoItem",
                    type: "object",
                    fields: [
                        imageWithAltField({
                            title: "Logo",
                            description:
                                "Use an SVG or PNG with a transparent background.",
                        }),
                        defineField({
                            name: "name",
                            title: "Name",
                            type: "string",
                            description:
                                "The company or brand name. Used for accessibility.",
                            validation: (Rule) => Rule.required(),
                        }),
                        defineField({
                            name: "url",
                            title: "Link",
                            type: "url",
                            description: "Optional URL. Makes the logo a link.",
                        }),
                    ],
                    preview: {
                        select: { title: "name", media: "image" },
                        prepare: ({ title, media }) => ({
                            title: title ?? "Logo",
                            media,
                        }),
                    },
                }),
            ],
            validation: (Rule) => Rule.min(1),
        }),
    ],
    preview: {
        select: { title: "title", logos: "logos" },
        prepare: ({ title, logos = [] }) => ({
            title: title ?? "Logo grid",
            subtitle: `Logo grid · ${logos.length} logo${logos.length === 1 ? "" : "s"}`,
        }),
    },
});

// ── Marquee ───────────────────────────────────────────────────────────────────

export const marquee = defineType({
    name: "marquee",
    title: "Marquee",
    type: "object",
    icon: Scroll,
    description: "A continuously scrolling strip of logos or text.",
    fields: [
        defineField({
            name: "title",
            title: "Title",
            type: "string",
            description: "Optional label before the scrolling content.",
        }),
        defineField({
            name: "items",
            title: "Items",
            type: "array",
            description:
                "Logos or text items to scroll. They repeat automatically.",
            of: [
                defineArrayMember({
                    name: "marqueeItem",
                    type: "object",
                    fields: [
                        defineField({
                            name: "type",
                            title: "Item type",
                            type: "string",
                            options: {
                                list: [
                                    { title: "Logo", value: "logo" },
                                    { title: "Text", value: "text" },
                                ],
                                layout: "radio",
                            },
                            initialValue: "logo",
                        }),
                        imageWithAltField({
                            title: "Logo",
                            description: "Logo image.",
                        }),
                        defineField({
                            name: "text",
                            title: "Text",
                            type: "string",
                            description: "Text to display in the marquee.",
                            hidden: ({ parent }) => parent?.type !== "text",
                        }),
                    ],
                    preview: {
                        select: { type: "type", text: "text", media: "image" },
                        prepare: ({ type, text, media }) => ({
                            title: type === "text" ? (text ?? "Text") : "Logo",
                            media: type === "logo" ? media : undefined,
                        }),
                    },
                }),
            ],
            validation: (Rule) => Rule.min(1),
        }),
        defineField({
            name: "speed",
            title: "Speed",
            type: "string",
            description: "How fast the marquee scrolls.",
            options: {
                list: [
                    { title: "Slow", value: "slow" },
                    { title: "Medium", value: "medium" },
                    { title: "Fast", value: "fast" },
                ],
                layout: "radio",
            },
            initialValue: "medium",
        }),
        defineField({
            name: "pauseOnHover",
            title: "Pause on hover",
            type: "boolean",
            description:
                "Stop scrolling when the user hovers over the marquee.",
            initialValue: true,
        }),
    ],
    preview: {
        select: { title: "title", items: "items" },
        prepare: ({ title, items = [] }) => ({
            title: title ?? "Marquee",
            subtitle: `Marquee · ${items.length} item${items.length === 1 ? "" : "s"}`,
        }),
    },
});

// ── Callout ───────────────────────────────────────────────────────────────────

export const callout = defineType({
    name: "callout",
    title: "Callout",
    type: "object",
    icon: MessageSquareQuote,
    description:
        "A highlighted pull-quote or statement for editorial emphasis.",
    fields: [
        defineField({
            name: "text",
            title: "Text",
            type: "text",
            rows: 3,
            description: "The statement or pull-quote to highlight.",
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "attribution",
            title: "Attribution",
            type: "string",
            description:
                "Optional source — author name, publication, or document title.",
        }),
        defineField({
            name: "style",
            title: "Style",
            type: "string",
            description: "Visual treatment.",
            options: {
                list: [
                    { title: "Pull quote", value: "pullQuote" },
                    { title: "Highlight", value: "highlight" },
                    { title: "Warning", value: "warning" },
                    { title: "Info", value: "info" },
                ],
                layout: "radio",
            },
            initialValue: "pullQuote",
        }),
    ],
    preview: {
        select: { text: "text", style: "style" },
        prepare: ({ text, style }) => ({
            title: text
                ? `"${text.slice(0, 60)}${text.length > 60 ? "…" : ""}"`
                : "Callout",
            subtitle: `Callout · ${style ?? "pullQuote"}`,
        }),
    },
});
