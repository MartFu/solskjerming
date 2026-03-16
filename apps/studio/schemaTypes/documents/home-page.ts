import { HomeIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

import { documentSlugField, pageBuilderField } from "@/schemaTypes/common";
import { GROUP, GROUPS } from "@/utils/constant";
import { ogFields } from "@/utils/og-fields";
import { seoFields } from "@/utils/seo-fields";
import { AutoSplitPreview } from "@/components/AutoSplitPreview";
import { createElement, Fragment } from "react";

export const homePage = defineType({
  name: "homePage",
  type: "document",
  title: "Forside",
  icon: HomeIcon,
  description:
    "Her oppretter du hovedsiden besøkende ser når de først kommer til nettstedet ditt. Tenk på det som inngangspartiet til ditt digitale hjem – du kan legge til en velkomsttittel, en kort beskrivelse og bygge siden med ulike seksjoner som bilder, tekst og knapper.",
  groups: GROUPS,
  fields: [
    defineField({
      name: "title",
      type: "string",
      title: "Tittel",
      description: "Dokumenttittelen som vises i nettleserfaner",
      group: GROUP.MAIN_CONTENT,
    }),
    defineField({
      name: "description",
      title: "Beskrivelse",
      type: "text",
      description:
        "Et kort sammendrag som forteller besøkende hva nettstedet handler om. Denne teksten hjelper også siden din med å bli synlig i Google-søk.",
      rows: 3,
      group: GROUP.MAIN_CONTENT,
      validation: (rule) => [
        rule
          .min(140)
          .warning(
            "Metabeskrivelsen bør være på minst 140 tegn for optimal SEO-synlighet i søkeresultater",
          ),
        rule
          .max(160)
          .warning(
            "Metabeskrivelsen bør ikke overstige 160 tegn, da den vil bli avkortet i søkeresultater",
          ),
      ],
    }),
    documentSlugField("homePage", {
      group: GROUP.MAIN_CONTENT,
    }),
    pageBuilderField,
    ...seoFields.filter(
      (field) => !["seoNoIndex", "seoHideFromLists"].includes(field.name),
    ),
    ...ogFields,
    defineField({
      name: "siteId",
      title: "Nettsteds-ID",
      type: "string",
    }),
    defineField({
      name: "site",
      title: "Nettsted",
      type: "reference",
      to: [{ type: "site" }],
    }),
    defineField({
      name: "deployment",
      title: "Publiseringsstatus",
      type: "deploymentMeta",
    }),
  ],
  preview: {
    select: {
      title: "title",
      slug: "slug.current",
    },
    prepare: ({ title, slug }) => ({
      title: title || "Forside uten tittel",
      media: HomeIcon,
      subtitle: slug || "Forside",
    }),
  },
});