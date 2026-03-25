// ── Group ─────────────────────────────────────────────────────────────────────

import { SquareIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

/**
 * Group — a wrapper for blocks that need to share a background or anchor.
 *
 * This is the only block that contains other blocks. It is intentionally
 * limited — its only purpose is to give adjacent blocks a shared background
 * color, background image, spacing, and anchor ID. It must never be nested.
 *
 * Editors should use this sparingly. Most pages do not need it.
 */
export const group = defineType({
    name: "group",
    title: "Group",
    type: "object",
    icon: SquareIcon,
    description:
        "Give adjacent blocks a shared background or anchor. Use sparingly.",
    fields: [
        defineField({
            name: "anchorId",
            title: "Anchor ID",
            type: "string",
            description:
                "Optional ID for deep linking, e.g. 'pricing' → /page#pricing.",
            validation: (Rule) =>
                Rule.custom((value) => {
                    if (!value) return true;
                    if (/^[a-z0-9-]+$/.test(value)) return true;
                    return "Use only lowercase letters, numbers, and hyphens.";
                }),
        }),
        defineField({
            name: "background",
            title: "Background",
            type: "string",
            description:
                "The background color for all blocks inside this group.",
            options: {
                list: [
                    { title: "Default", value: "default" },
                    { title: "Subtle (secondary surface)", value: "subtle" },
                    { title: "Inverted (dark)", value: "inverted" },
                    { title: "Accent", value: "accent" },
                ],
                layout: "radio",
            },
            initialValue: "default",
        }),
        defineField({
            name: "paddingY",
            title: "Vertical padding",
            type: "string",
            description: "Spacing above and below the grouped content.",
            options: {
                list: [
                    { title: "None", value: "none" },
                    { title: "Small", value: "sm" },
                    { title: "Medium", value: "md" },
                    { title: "Large", value: "lg" },
                ],
                layout: "radio",
            },
            initialValue: "md",
        }),
        defineField({
            name: "blocks",
            title: "Blocks",
            type: "pageBuilder",
            description:
                "The blocks inside this group. Groups cannot be nested.",
        }),
    ],
    preview: {
        select: {
            background: "background",
            blocks: "blocks",
            anchorId: "anchorId",
        },
        prepare: ({ background, blocks = [], anchorId }) => ({
            title: anchorId ? `#${anchorId}` : "Group",
            subtitle: `Group · ${background ?? "default"} bg · ${blocks.length} block${blocks.length === 1 ? "" : "s"}`,
        }),
    },
});
