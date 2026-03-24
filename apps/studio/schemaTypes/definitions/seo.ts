import { GROUP, GROUPS } from "@/utils/constant";
import { createOGFields, createSEOFields } from "@/utils/factories";
import { createRobotsFields } from "@/utils/factories/create-robots-fields";
import { createStructuredDataFields } from "@/utils/factories/create-structured-data-fields";
import { defineType } from "sanity";

/**
 * All SEO-related field sets: meta tags, Open Graph, structured data, robots.
 * Bundled together since routable pages almost always want all of these.
 *
 * If a document type needs only a subset, call the individual creators
 * directly instead of using this convenience function.
 */
export const pageSeo = defineType({
    name: "pageSEO",
    title: "SEO",
    type: "object",
    groups: GROUPS(),
    fields: [
        ...createSEOFields({ isPage: true }),
        ...createOGFields({ isPage: true }),
        ...createStructuredDataFields({
            isPage: true,
            group: GROUP.STRUCTURED_DATA,
        }),
        ...createRobotsFields({ isPage: true, group: GROUP.ROBOTS }),
    ],
});

export const siteSeo = defineType({
    name: "siteSEO",
    title: "SEO",
    type: "object",
    groups: GROUPS(),
    fields: [
        // ── SEO ───────────────────────────────────────────────────
        ...createSEOFields({
            isSite: true,
        }),
        ...createOGFields({
            isSite: true,
        }),

        // ── STRUCTURED DATA ─────────────────────────────────────────
        ...createStructuredDataFields({
            isSite: true,
            group: GROUP.STRUCTURED_DATA,
        }),

        // ── ROBOTS ─────────────────────────────────────────
        ...createRobotsFields({
            isSite: true,
            group: GROUP.ROBOTS,
        }),
    ],
});
