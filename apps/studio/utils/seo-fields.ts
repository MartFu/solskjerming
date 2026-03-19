import { defineField } from "sanity";

import { GROUP } from "@/utils/constant";

// #TODO -> Implement a way to reset single fields and/or all SEO fields to the global defaults.
export const seoFields = [
  defineField({
    name: "seoTitle",
    title: "Metatitle",
    description: "Dette feltet overstyrer arbeidsrommets globale Metatittel.",
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
    description: "Dette feltet overstyrer arbeidsrommets globale SEO-Bildet.",
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
    description:
      "Hvis denne er krysset av, vil ikke innholdet vises i automatisk genererte lister (f.eks. en liste med blogginnlegg).",
    type: "boolean",
    initialValue: () => false,
    group: GROUP.SEO,
  }),
];

interface CreateSEOFieldsOptions {
  seoTitleFieldTitle: string;
  seoTitlePrefixFieldTitle?: string;
  seoTitlePrefixFieldDescription?: string;
  seoTitleSuffixFieldTitle?: string;
  seoTitleSuffixFieldDescription?: string;
  seoTitleFieldDescription?: string;
  seoDescriptionFieldTitle: string;
  seoDescriptionFieldDescription?: string;
  seoKeywordsFieldTitle?: string;
}

export const createSEOFields = ({
  seoTitleFieldTitle,
  seoTitlePrefixFieldTitle,
  seoTitlePrefixFieldDescription,
  seoTitleSuffixFieldTitle,
  seoTitleSuffixFieldDescription,
  seoTitleFieldDescription,
  seoDescriptionFieldTitle,
  seoDescriptionFieldDescription,
  seoKeywordsFieldTitle,
}: CreateSEOFieldsOptions) => [
  defineField({
    name: "titlePrefix",
    title: seoTitlePrefixFieldTitle ?? "Tittelstart",
    type: "string",
    group: GROUP.SEO,
    description:
      seoTitlePrefixFieldDescription ??
      'Tekst som legges til på starten av alle sidetitler, f.eks. "Bedrift AS |".',
  }),
  defineField({
    name: "titleSuffix",
    title: seoTitleSuffixFieldTitle ?? "Tittelending",
    type: "string",
    group: GROUP.SEO,
    description:
      seoTitleSuffixFieldDescription ??
      'Tekst som legges til på slutten av alle sidetitler, f.eks. "| Bedrift AS".',
  }),
  defineField({
    name: "metaTitle",
    title: seoTitleFieldTitle,
    description:
      seoTitleFieldDescription ||
      "Vises som tittelen i søkeresultater (Google).",
    type: "string",
    validation: (rule) => [
      rule.required().warning("Metatittel er anbefalt for SEO"),
      rule
        .max(60)
        .warning(
          "Tittelen bør være under 60 tegn for å unngå kutting i Google",
        ),
    ],
    group: GROUP.SEO,
  }),

  defineField({
    name: "metaDescription",
    title: seoDescriptionFieldTitle,
    description:
      seoDescriptionFieldDescription ||
      "Kort oppsummering av siden for søkemotorer.",
    type: "text",
    rows: 3,
    validation: (rule) => [
      rule.required().warning("Metabeskrivelse er viktig for klikkrate"),
      rule
        .max(160)
        .warning("Beskrivelser over 160 tegn blir ofte kuttet av Google"),
    ],
    group: GROUP.SEO,
  }),

  defineField({
    name: "metaKeywords",
    title: seoKeywordsFieldTitle,
    type: "array",
    group: GROUP.SEO,
    of: [{ type: "string" }],
    description: "Liste over søkeord.",
  }),
];
