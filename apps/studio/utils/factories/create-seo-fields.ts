import { defineField } from "sanity";
import { GROUP } from "../constant";

interface CreateSEOFieldsOptions {
  seoTitleFieldTitle?: string;
  seoTitlePrefixFieldTitle?: string;
  seoTitlePrefixFieldDescription?: string;
  seoTitleSuffixFieldTitle?: string;
  seoTitleSuffixFieldDescription?: string;
  seoTitleFieldDescription?: string;
  seoDescriptionFieldTitle?: string;
  seoDescriptionFieldDescription?: string;
  seoKeywordsFieldTitle?: string;
  includeSeoHideFromList?: boolean;
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
}: CreateSEOFieldsOptions | undefined = {}) => [
  defineField({
    name: "metaTitle",
    title: seoTitleFieldTitle ?? "Metatittel",
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
    name: "titlePrefix",
    title: seoTitlePrefixFieldTitle ?? "Metatittel-prefiks",
    type: "string",
    group: GROUP.SEO,
    description:
      seoTitlePrefixFieldDescription ??
      'Tekst som legges til på starten av alle sidetitler, f.eks. "Bedrift AS |".',
  }),
  defineField({
    name: "titleSuffix",
    title: seoTitleSuffixFieldTitle ?? "Metatittel-suffiks",
    type: "string",
    group: GROUP.SEO,
    description:
      seoTitleSuffixFieldDescription ??
      'Tekst som legges til på slutten av alle sidetitler, f.eks. "| Bedrift AS".',
  }),
  defineField({
    name: "metaDescription",
    title: seoDescriptionFieldTitle ?? "Metabeskrivelse",
    description:
      seoDescriptionFieldDescription ??
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
    title: seoKeywordsFieldTitle ?? "Nøkkelord",
    type: "array",
    group: GROUP.SEO,
    of: [{ type: "string" }],
    description: "Liste over nøkkelord for søkemotorer.",
  }),
  defineField({
    name: "seoNoIndex",
    title: "Ikke indekser denne siden",
    description:
      "Hvis denne er krysset av, vil ikke siden dukke opp i søkemotorer som Google.",
    type: "boolean",
    initialValue: false,
    group: GROUP.SEO,
  }),
//   defineField({
//     name: "seoHideFromLists",
//     title: "Skjul fra lister",
//     description:
//       "Hvis denne er krysset av, vil ikke innholdet vises i automatisk genererte lister (f.eks. en liste med blogginnlegg).",
//     type: "boolean",
//     initialValue: () => false,
//     group: GROUP.SEO,
//   }),
];
