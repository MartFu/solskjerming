import { defineField } from "sanity";
import { GROUP, GroupValue } from "../constant";

interface CreateSEOFieldsOptions {
  isDefault?: boolean;
  isSite?: boolean;
  isPage?: boolean;
  group?: GroupValue;
}

const DEFAULTS = {
  focusKeyphrase: {
    title: "Fokus-nøkkelord",
    description:
      "Det primære ordet eller frasen du ønsker at denne siden skal rangere på i søkeresultater.",
  },
  metaTitle: {
    title: "Metatittel",
    description: "Vises som tittelen i søkeresultater (Google).",
  },
  metaDescription: {
    title: "Metabeskrivelse",
    description: "Kort oppsummering av siden for søkemotorer.",
  },
  prefix: {
    title: "Metatittel-prefiks",
    description: 'Tekst på starten av alle titler, f.eks. "Bedrift AS |".',
  },
  suffix: {
    title: "Metatittel-suffiks",
    description: 'Tekst på slutten av alle titler, f.eks. "| Bedrift AS".',
  },
  verification: {
    googleTitle: "Google Search Console-bekreftelse",
    googleDesc: "Kun 'content'-verdien fra meta-tagen.",
    bingTitle: "Bing Webmaster Tools-bekreftelse",
    bingDesc: "Verifiseringskoden for Bing/Microsoft.",
  },
};

export const createSEOFields = (options: CreateSEOFieldsOptions = {}) => {
  const { isDefault, isSite, isPage, group = GROUP.SEO } = options;

  return [
    // 1. Focus Keyphrase (Mainly for Pages)
    ...(isPage
      ? [
          defineField({
            name: "focusKeyphrase",
            title: DEFAULTS.focusKeyphrase.title,
            description:
              DEFAULTS.focusKeyphrase.description +
              (isDefault
                ? " Bør være ganske generelt i globale innstillinger. Arves av nye sider."
                : ""),
            type: "string",
            group,
          }),
        ]
      : []),

    // 2. Core Meta
    defineField({
      name: "metaTitle",
      title: DEFAULTS.metaTitle.title,
      description:
        DEFAULTS.metaTitle.description +
        (isDefault ? " Arves av nye sider." : ""),
      type: "string",
      group,
      validation: (Rule) => [
        Rule.required().warning(
          "Uten tittel velger Google noe tilfeldig fra siden.",
        ),
        Rule.max(60).warning(
          "Tittelen er for lang og vil bli kuttet i søkeresultater.",
        ),
      ],
    }),

    // 3. Global Site Decoration (Only for Site Config)
    ...(isSite
      ? [
          defineField({
            name: "titlePrefix",
            title: DEFAULTS.prefix.title,
            description:
              DEFAULTS.prefix.description +
              (isDefault ? " Arves ikke automatisk av nye sider." : ""),
            type: "string",
            group,
          }),
          defineField({
            name: "titleSuffix",
            title: DEFAULTS.suffix.title,
            description:
              DEFAULTS.suffix.description +
              (isDefault ? " Arves ikke automatisk av nye sider." : ""),
            type: "string",
            group,
          }),
        ]
      : []),

    defineField({
      name: "metaDescription",
      title: DEFAULTS.metaDescription.title,
      description:
        DEFAULTS.metaDescription.description +
        (isDefault ? " Arves av nye sider." : ""),
      type: "text",
      rows: 3,
      group,
      validation: (Rule) => [
        Rule.required().warning(
          "Beskrivelse mangler. Dette er din 'elevator pitch' i Google.",
        ),
        Rule.max(160).warning("Beskrivelsen er for lang (maks 160 tegn)."),
      ],
    }),

    // 4. Technical SEO
    ...(isPage
      ? [
          defineField({
            name: "canonicalUrl",
            title: "Canonical URL",
            description: "Lenke til originalside ved duplisert innhold.",
            type: "url",
            group,
          }),
        ]
      : []),

    // 5. Site Verification (Only for Site Config)
    ...(isSite
      ? [
          defineField({
            name: "googleSiteVerification",
            title: DEFAULTS.verification.googleTitle,
            description: DEFAULTS.verification.googleDesc,
            type: "string",
            group,
          }),
          defineField({
            name: "bingSiteVerification",
            title: DEFAULTS.verification.bingTitle,
            description: DEFAULTS.verification.bingDesc,
            type: "string",
            group,
          }),
        ]
      : []),
  ];
};
