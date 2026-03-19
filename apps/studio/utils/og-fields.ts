import { defineField } from "sanity";

import { GROUP } from "@/utils/constant";

export const ogFields = [
  defineField({
    name: "ogTitle",
    title: "OG-Tittel for deling i sosiale medier",
    description:
      "Overstyrer arbeidsromådets globale Open Graph tittel. Hvis feltet er tomt, brukes sidens tittel. Benyttes ved deling i sosiale medier.",
    type: "string",
    validation: (Rule) => Rule.warning("Tittel er påkrevd"),
    group: GROUP.OG,
  }),
  defineField({
    name: "ogDescription",
    title: "OG-Beskrivelse for sosiale medier",
    description:
      "Overstyrer arbeidsromådets globale Open Graph beskrivelse. Hvis tomt, hentes beskrivelsen fra det korresponderende SEO-feltet eller globale innstillinger. Benyttes ved deling i sosiale medier.",
    type: "text",
    rows: 2,
    validation: (Rule) => [
      Rule.warning("Beskrivelse er påkrevd"),
      Rule.max(160).warning("Makismalt 160 tegn"),
    ],
    group: GROUP.OG,
  }),
];

interface CreateOGFieldsOptions {
  ogTitleFieldTitle?: string;
  ogTitleFieldDescription?: string;
  ogDescriptionFieldTitle?: string;
  ogDescriptionFieldDescription?: string;
  ogImageFieldTitle?: string;
  ogImageFieldDescription?: string;
}

export const createOGFields = ({
  ogTitleFieldTitle,
  ogTitleFieldDescription,
  ogDescriptionFieldTitle,
  ogDescriptionFieldDescription,
  ogImageFieldTitle,
  ogImageFieldDescription,
}: CreateOGFieldsOptions) => [
  defineField({
    name: "ogTitle",
    title: ogTitleFieldTitle ?? "Tittel for deling",
    description:
      ogTitleFieldDescription ??
      "Dette er tittelen som vises når nettsiden deles på sosiale medier (Facebook, LinkedIn osv.) Bør være fengende og under 60 tegn.",
    type: "string",
    validation: (rule) => [
      rule.warning("Metatittel er påkrevd"),
      rule.max(60).warning("Metabeskrivelse bør ikke overstige 60 tegn"),
    ],
    group: GROUP.OG,
  }),
  defineField({
    name: "ogDescription",
    title: ogDescriptionFieldTitle ?? "Beskrivelse for deling",
    description:
      ogDescriptionFieldDescription ??
      "En kort oppsummering som vises under tittelen ved deling. Hold den mellom 50 og 160 tegn.",
    type: "text",
    rows: 2,
    validation: (rule) => [
      rule.warning("Beskrivelse er påkrevd"),
      rule.max(160).warning("Makismalt 160 tegn"),
    ],
    group: GROUP.OG,
  }),

  defineField({
    name: "ogImage",
    title: ogImageFieldTitle ?? "Bilde for sosiale medier",
    type: "image",
    group: GROUP.OG,
    description: ogImageFieldDescription ?? "Dette bildet vises som forhåndsvisning ved deling. Anbefalt størrelse er 1200x630 piksler.",
    options: { hotspot: true },
  }),
];
