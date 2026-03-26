import {
  orderRankField,
  orderRankOrdering,
} from "@sanity/orderable-document-list";
import { defineArrayMember, defineField } from "sanity";
import { documentSlugField, imageWithAltField } from "@/schemaTypes/common";
import { GROUP, GROUPS } from "@/utils/constant";
import { DOCUMENTS } from "@/schemaTypes/constant";
import { defineGlobal } from "@/utils/globals/define-global";

export const article = defineGlobal({
  name: DOCUMENTS.articleAsset,
  title: "Artikkel",
  type: "document",
  // icon: FileTextIcon,
  groups: GROUPS(),
  sortFields: ["title", "description", "publishedAt"],
  orderings: [orderRankOrdering],
  description:
    "En artikkel som vil bli publisert på nettsiden. Legg til tittel, beskrivelse, forfatter og innhold for å opprette en ny artikkel.",
  fields: [
    orderRankField({ type: DOCUMENTS.articleAsset }),
    defineField({
      name: "title",
      type: "string",
      title: "Tittel",
      description: "Overskriften på artikkelen som leserne ser først",
      group: GROUP.MAIN_CONTENT,
      validation: (Rule) => Rule.required().error("Artikkelen må ha en tittel"),
    }),
    defineField({
      title: "Beskrivelse",
      name: "description",
      type: "text",
      rows: 3,
      description:
        "Et kort sammendrag av hva artikkelen handler om (vises i søkeresultater)",
      group: GROUP.MAIN_CONTENT,
      validation: (rule) => [
        rule
          .min(140)
          .warning(
            "Metabeskrivelsen bør være på minst 140 tegn for optimal synlighet i søkemotorer",
          ),
        rule
          .max(160)
          .warning(
            "Metabeskrivelsen bør ikke overstige 160 tegn, da den vil bli avkortet i søkeresultater",
          ),
      ],
    }),
    documentSlugField("article", {
      group: GROUP.MAIN_CONTENT,
    }),
    defineField({
      name: "authors",
      type: "array",
      title: "Forfattere",
      description: "Hvem har skrevet denne artikkelen?",
      of: [
        defineArrayMember({
          type: "reference",
          to: [
            {
              type: DOCUMENTS.authorAsset,
              options: {
                disableNew: true,
              },
            },
          ],
          options: {
            disableNew: true,
          },
        }),
      ],
      validation: (Rule) => [
        Rule.required(),
        Rule.max(1),
        Rule.min(1),
        Rule.unique(),
      ],
      group: GROUP.MAIN_CONTENT,
    }),
    defineField({
      name: "publishedAt",
      type: "date",
      initialValue: () => new Date().toISOString().split("T")[0],
      title: "Publiseringsdato",
      description:
        "Datoen som skal vises som publiseringstidspunkt for artikkelen",
      group: GROUP.MAIN_CONTENT,
    }),
    imageWithAltField({
      title: "Hovedbilde",
      description:
        "Hovedbildet som vises øverst på artikkelsiden og i forhåndsvisninger.",
      group: GROUP.MAIN_CONTENT,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "richText",
      type: "richText",
      title: "Brødtekst",
      description: "Artikkelens hovedinnhold med tekst, bilder og formatering.",
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
      type: "reference",
      to: [{ type: DOCUMENTS.site }],
    }),

    // ...seoFields,
    // ...ogFields,
  ],
  preview: {
    select: {
      title: "title",
      media: "image",
      isPrivate: "seoNoIndex",
      isHidden: "seoHideFromLists",
      slug: "slug.current",
      author: "authors.0.name",
      publishDate: "publishedAt",
    },
    prepare: ({
      title,
      media,
      isPrivate,
      isHidden,
      author,
      slug,
      publishDate,
    }) => {
      // Status-indikatorer
      let visibility = "Offentlig";
      if (isPrivate) {
        visibility = "Privat";
      } else if (isHidden) {
        visibility = "Skjult";
      }

      // Forfatter og dato
      const authorInfo = author ? `${author}` : "Ukjent forfatter";
      const dateInfo = publishDate
        ? `${new Date(publishDate).toLocaleDateString("nb-NO")}`
        : "Utkast";

      return {
        title: title || "Artikkel uten tittel",
        media,
        subtitle: `🔗 ${slug} | ${visibility} | ${authorInfo} | ${dateInfo}`,
      };
    },
  },
});


