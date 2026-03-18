import { defineField } from "sanity";
import { GROUP } from "@/utils/constant";

// ─────────────────────────────────────────────────────────────
// Package options
// ─────────────────────────────────────────────────────────────
// This list must stay in sync with the PACKAGES registry in
// structure.ts. When you add a new package, add an entry here.
// ─────────────────────────────────────────────────────────────

export const PACKAGE_OPTIONS = [
    { title: "Artikler", value: "articles" },
    { title: "Netthandel", value: "commerce" },
    // { title: "Arrangementer", value: "eventRoot" },
] as const;

export type PackageKey = (typeof PACKAGE_OPTIONS)[number]["value"];

/**
 * Field for the site document that controls which packages
 * are available. Only enabled packages show up in the structure
 * sidebar and allow creation of root/child documents.
 */
export const enabledPackagesField = defineField({
    name: "enabledPackages",
    title: "Aktiverte pakker",
    type: "array",
    group: GROUP.RELATIONSHIPS,
    description:
        "Velg hvilke innholdstyper som skal være tilgjengelige for dette nettstedet. Kun aktiverte pakker vises i studioet og kan opprettes/utvides. Noter at kun aktiverte pakker vil ha tilgjengelige URL-er på nettstedets frontend.",
    of: [{ type: "string" }],
    options: {
        list: [...PACKAGE_OPTIONS],
        layout: "grid",
    },
});
