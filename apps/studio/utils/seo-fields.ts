import { defineField } from "sanity";

import { GROUP } from "@/utils/constant";


// #TODO -> Implement a way to reset single fields and/or all SEO fields to the global defaults.
export const seoFields = [
    defineField({
        name: "seoTitle",
        title: "Metatitle",
        description:
            "Dette feltet overstyrer arbeidsrommets globale Metatittel.",
        type: "string",
        validation: (rule) => rule.warning("A page title is required"),
        group: GROUP.SEO,
    }),
    defineField({
        name: "seoDescription",
        title: "Metabeskrivelse",
        description:
            "Dette feltet overstyrer arbeidsrommets globale Metabeskrivelse.",
        type: "text",
        rows: 2,
        validation: (rule) => [
            rule.warning("A description is required"),
            rule.max(160).warning("No more than 160 characters"),
        ],
        group: GROUP.SEO,
    }),
    defineField({
        name: "seoImage",
        title: "SEO-Bilde",
        description:
            "Dette feltet overstyrer arbeidsrommets globale SEO-Bildet.",
        type: "image",
        group: GROUP.SEO,
        options: {
            hotspot: true,
        },
    }),
    defineField({
        name: "seoNoIndex",
        title: "Ikke indekser denne siden",
        description:
            "Hvis denne er krysset av, vil ikke siden dukke opp i søkemotorer som Google.",
        type: "boolean",
        initialValue: () => false,
        group: GROUP.SEO,
    }),
    defineField({
        name: "seoHideFromLists",
        title: "Skjul fra lister",
        description: "Hvis denne er krysset av, vil ikke innholdet vises i automatisk genererte lister (f.eks. en liste med blogginnlegg).",
        type: "boolean",
        initialValue: () => false,
        group: GROUP.SEO,
    }),
];
