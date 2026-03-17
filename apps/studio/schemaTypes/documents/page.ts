import { DocumentIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

import {
  documentSlugField,
  imageWithAltField,
  pageBuilderField,
} from "@/schemaTypes/common";
import { GROUP, GROUPS } from "@/utils/constant";
import { ogFields } from "@/utils/og-fields";
import { seoFields } from "@/utils/seo-fields";
import { createElement, Fragment } from "react";
import { AutoSplitPreview } from "@/components/AutoSplitPreview";

export const page = defineType({
  name: "page",
  title: "Side",
  type: "document",
  icon: DocumentIcon,
  description:
    "Opprett en ny side for nettstedet ditt, som for eksempel en 'Om oss'- eller 'Kontakt'-side. Hver side har sin egen nettadresse og innhold som du kan tilpasse.",
  groups: GROUPS(),
  components: {
    input: (props) =>
      createElement(
        Fragment,
        null,
        createElement(AutoSplitPreview, null),
        props.renderDefault(props),
      ),
  },
  fields: [
    defineField({
      name: "title",
      type: "string",
      title: "Tittel",
      description:
        "Dokumenttittelen som vises i nettleserfaner",
      group: GROUP.MAIN_CONTENT,
      validation: (Rule) => Rule.required().error("En sidetittel er påkrevd"),
    }),
    defineField({
      name: "description",
      type: "text",
      title: "Beskrivelse",
      description:
        "Et kort sammendrag av hva denne siden handler om. Denne teksten hjelper søkemotorer å forstå siden din og kan vises i søkeresultater.",
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
    documentSlugField("page", {
      group: GROUP.MAIN_CONTENT,
    }),
    imageWithAltField({
      title: "Bilde",
      description:
        "Et hovedbilde for denne siden som kan brukes ved deling i sosiale medier eller i søkeresultater",
      group: GROUP.MAIN_CONTENT,
    }),
    defineField({
      name: "siteId",
      title: "Nettsteds-ID",
      type: "string",
      readOnly: true,
      hidden: true,
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
    pageBuilderField,
    ...seoFields.filter((field) => field.name !== "seoHideFromLists"),
    ...ogFields,
  ],
  preview: {
    select: {
      title: "title",
      slug: "slug",
      media: "image",
      siteId: "siteId",
      isPrivate: "seoNoIndex",
    },
    prepare: ({ title, slug, media, isPrivate, siteId }) => {
      const status = isPrivate ? "privat" : "indeksert";

      return {
        title: `${title || "Side uten tittel"}`,
        subtitle: `${slug && typeof slug === "string" ? `${slug} • ${status}` : status}`,
        media,
      };
    },
  },
});
