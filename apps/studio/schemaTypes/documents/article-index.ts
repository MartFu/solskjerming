import { defineField, defineType } from "sanity";

import { documentSlugField, pageBuilderField } from "@/schemaTypes/common";
import { GROUP, GROUPS } from "@/utils/constant";
import { ogFields } from "@/utils/og-fields";
import { seoFields } from "@/utils/seo-fields";

export const articleIndex = defineType({
  name: "articleIndex",
  type: "document",
  title: "Arkiv",
  description:
    "Dette er hovedsiden som viser alle artiklene dine. Her kan du tilpasse hvordan oversiktssiden ser ut, hvilken tittel den har, og hvilke artikler du ønsker å fremheve øverst.",
  groups: GROUPS(),
  fields: [
    defineField({
      name: "title",
      title: "Tittel",
      type: "string",
      description: "Dokumenttittelen som vises i nettleserfaner",
      group: GROUP.MAIN_CONTENT,
    }),
    defineField({
      name: "description",
      title: "Beskrivelse",
      type: "text",
      description:
        "Et kort sammendrag av hva besøkende kan finne i artiklene dine. Dette hjelper folk å forstå hva innholdet handler om.",
      group: GROUP.MAIN_CONTENT,
    }),
    documentSlugField("articleIndex", {
      group: GROUP.MAIN_CONTENT,
    }),
    defineField({
      name: "displayFeaturedArticles",
      title: "Vis fremhevede artikler",
      description:
        "Når denne er aktivert, vil de øverste artiklene fra den sorterte listen vises som fremhevede elementer øverst på siden.",
      type: "string",
      options: {
        list: [
          { title: "Ja", value: "yes" },
          { title: "Nei", value: "no" },
        ],
        layout: "radio",
      },
      initialValue: "yes",
      group: GROUP.MAIN_CONTENT,
    }),
    defineField({
      name: "featuredArticlesCount",
      title: "Antall fremhevede artikler",
      description: "Velg hvor mange artikler som skal vises som fremhevet.",
      type: "string",
      options: {
        list: [
          { title: "1", value: "1" },
          { title: "2", value: "2" },
          { title: "3", value: "3" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
      initialValue: "1",
      hidden: ({ parent }) => parent?.displayFeaturedArticles !== "yes",
      group: GROUP.MAIN_CONTENT,
    }),
    defineField({
      name: "site",
      title: "Nettsted",
      type: "reference",
      to: [{ type: "site" }],
    }),
    defineField({
      name: "siteId",
      title: "Nettsteds-ID",
      type: "string",
    }),
    pageBuilderField,
    ...seoFields.filter(
      (field) => !["seoNoIndex", "seoHideFromLists"].includes(field.name),
    ),
    ...ogFields,
  ],
  preview: {
    select: {
      title: "title",
      description: "description",
      slug: "slug.current",
    },
    prepare: ({ title, description, slug }) => ({
      title: title || "Arkiv uten tittel",
      subtitle: description || slug || "Artikkelarkiv",
    }),
  },
});