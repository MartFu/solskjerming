/**
 * index.ts — apps/studio/schemaTypes/blocks
 *
 * Single import point for all block schemas.
 *
 * Two exports:
 *
 *   1. Individual named exports — for use in createPageBuilder() calls
 *      where you want a specific subset.
 *
 *   2. Domain group collections — for use in defineModule() initialBlocks
 *      and for building domain-scoped pagebuilders. These are the building
 *      blocks of option B (blueprint pre-population).
 *
 * Usage in createPageBuilder:
 *   import { allBlocks } from "@/schemaTypes/blocks";
 *   createPageBuilder("pageBuilder", allBlocks)
 *
 * Usage in defineModule initialBlocks:
 *   import { BLOCK_SEEDS } from "@/schemaTypes/blocks";
 *   initialBlocks: [BLOCK_SEEDS.banner, BLOCK_SEEDS.feed({ sourceType: "article" })]
 */

// ── Hero ──────────────────────────────────────────────────────────────────────
export { banner } from "./banner";
export { split } from "./split";
export { intro } from "./intro";

// ── Cards ─────────────────────────────────────────────────────────────────────
export { cardGrid } from "./card-grid";
export { referenceGrid } from "./reference-grid";
export { feed } from "./feed";

// ── Feature ───────────────────────────────────────────────────────────────────
export { feature, steps, stat, comparison } from "./feature-group";

// ── Trust ─────────────────────────────────────────────────────────────────────
export { testimonial, logoGrid, marquee, callout } from "./trust-group";

// ── Rich content ──────────────────────────────────────────────────────────────
export { richText, accordion, table, media } from "./rich-content-group";

// ── Conversion ────────────────────────────────────────────────────────────────
export { cta, form, pricing } from "./conversion-group";

// ── Flat array of all blocks ──────────────────────────────────────────────────
//
// Used in createPageBuilder("pageBuilder", allBlocks) for the default
// full-palette pagebuilder. Domain-specific builders import individual
// blocks instead.

import { banner } from "./banner";
import { split } from "./split";
import { intro } from "./intro";
import { cardGrid } from "./card-grid";
import { referenceGrid } from "./reference-grid";
import { feed } from "./feed";
import { feature, steps, stat, comparison } from "./feature-group";
import { testimonial, logoGrid, marquee, callout } from "./trust-group";
import { richText, accordion, table, media } from "./rich-content-group";
import { cta, form, pricing } from "./conversion-group";
import { BlueprintBlock } from "@/utils/modules";
import { group } from "./group";

export const allBlocks = [
    // Hero
    banner,
    split,
    intro,
    // Cards
    cardGrid,
    referenceGrid,
    feed,
    // Feature
    feature,
    steps,
    stat,
    comparison,
    // Trust
    testimonial,
    logoGrid,
    marquee,
    callout,
    // Rich content
    accordion,
    table,
    media,
    // Conversion
    cta,
    form,
    pricing,
    group,
] as const;

// ── Block seeds for defineModule initialBlocks (option B) ─────────────────────
//
// BLOCK_SEEDS provides factory functions and plain objects for seeding
// blueprint initial content. Each entry maps directly to a BlueprintBlock
// shape: { _type, initialData? }.
//
// Plain seeds (no config needed):
//   BLOCK_SEEDS.banner
//   BLOCK_SEEDS.cta
//
// Factory seeds (require config):
//   BLOCK_SEEDS.feed({ sourceType: "article", displayStyle: "magazine" })
//   BLOCK_SEEDS.accordion({ sourceType: "faq" })
//
// Usage in defineModule:
//   initialBlocks: [
//     BLOCK_SEEDS.banner,
//     BLOCK_SEEDS.feed({ sourceType: "article" }),
//     BLOCK_SEEDS.cta,
//   ]


export const BLOCK_SEEDS = {
    // Hero
    banner: { _type: "banner" } satisfies BlueprintBlock,
    split: { _type: "split" } satisfies BlueprintBlock,
    intro: { _type: "intro" } satisfies BlueprintBlock,

    // Cards
    cardGrid: { _type: "cardGrid" } satisfies BlueprintBlock,
    referenceGrid: { _type: "referenceGrid" } satisfies BlueprintBlock,
    feed: (initialData: {
        sourceType: "article" | "product" | "faq";
        displayStyle?: "grid" | "list" | "magazine";
        limit?: number;
        showFilters?: boolean;
    }): BlueprintBlock => ({
        _type: "feed",
        initialData,
    }),

    // Feature
    feature: { _type: "feature" } satisfies BlueprintBlock,
    steps: { _type: "steps" } satisfies BlueprintBlock,
    stat: { _type: "stat" } satisfies BlueprintBlock,
    comparison: { _type: "comparison" } satisfies BlueprintBlock,

    // Trust
    testimonial: { _type: "testimonial" } satisfies BlueprintBlock,
    logoGrid: { _type: "logoGrid" } satisfies BlueprintBlock,
    marquee: { _type: "marquee" } satisfies BlueprintBlock,
    callout: { _type: "callout" } satisfies BlueprintBlock,

    // Rich content
    richText: { _type: "richText" } satisfies BlueprintBlock,
    accordion: (initialData?: {
        sourceType?: "inline" | "faq";
    }): BlueprintBlock => ({
        _type: "accordion",
        initialData,
    }),
    table: { _type: "table" } satisfies BlueprintBlock,
    media: { _type: "media" } satisfies BlueprintBlock,

    // Conversion
    cta: { _type: "cta" } satisfies BlueprintBlock,
    form: (initialData?: {
        formType?: "newsletter" | "contact" | "lead";
    }): BlueprintBlock => ({
        _type: "form",
        initialData,
    }),
    pricing: { _type: "pricing" } satisfies BlueprintBlock,
    group: { _type: "group" } satisfies BlueprintBlock,
} as const;
