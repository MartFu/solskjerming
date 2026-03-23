// ===========================================================================
// PACKAGE: Articles
// ===========================================================================
//
// Root: articleRoot — the article listing/index page.
//   Nests under generic pages: /resources/articles
//   Adds config for pagination, featured articles, and categories.
//
// Child: articlePage — individual article with editorial content.
//   Nests under articleRoot: /resources/articles/my-post
// ===========================================================================

import { DOCUMENT_NAMES } from "@/schemaTypes/constant";
import { definePackage } from "./define-package";
import { BookOpen, FileText } from "lucide-react";
import { defineArrayMember, defineField } from "sanity";
import { GROUP } from "@/utils/constant";
import { PACKAGE_KEYS } from "./constant";

export const articles = definePackage({
  key: PACKAGE_KEYS.articles,
  title: "Artikler",
  globals: {
    author: true,
    article: true,
  },
  documents: {
    articleRoot: {
      name: DOCUMENT_NAMES.articleRoot,
      title: "Arkiv",
      description: "En side som støtter søkbare lister over alle artikler.",
      icon: BookOpen,
      allowPageAsParent: true,
      pagebuilderType: "articleRootPageBuilder",
      setParentAllowed: true,
      extraFields: [
        defineField({
          name: "postsPerPage",
          title: "Innlegg per side.",
          type: "number",
          group: GROUP.MAIN_CONTENT,
          description: "Antall innlegg som vises per paginerte side.",
          initialValue: 12,
          validation: (Rule) => Rule.min(1).max(100),
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
          name: "categories",
          title: "Kategorier",
          type: "array",
          group: GROUP.MAIN_CONTENT,
          of: [{ type: "string" }],
          description:
            "Tilgjengelige kategorier for blogginnlegg under denne roten.",
          options: { layout: "tags" },
        }),
      ],
    },

    articlePage: {
      name: DOCUMENT_NAMES.articlePage,
      title: "Artikkelside",
      icon: FileText,
      allowedParentRoles: ["articleRoot"],
      extraFields: [
        defineField({
          name: "excerpt",
          title: "Sammendrag",
          type: "text",
          group: GROUP.MAIN_CONTENT,
          rows: 3,
          description:
            "Kort oppsummering som brukes i lister og metabeskrivelser.",
          validation: (Rule) => Rule.max(300),
        }),
        defineField({
          name: "coverImage",
          title: "Hovedbilde",
          type: "image",
          group: GROUP.MAIN_CONTENT,
          options: { hotspot: true },
        }),
        defineField({
          name: "authors",
          type: "array",
          title: "Forfattere",
          description:
            "Hvem som skrev denne artikkelen (velg fra arbeidsområdets globale forfattere)",
          of: [
            defineArrayMember({
              type: "reference",
              to: [
                {
                  type: "author",
                  options: { disableNew: true },
                },
              ],
              options: { disableNew: true },
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
          name: "category",
          title: "Kategori",
          type: "string",
          group: GROUP.MAIN_CONTENT,
          description:
            "Bør samsvare med en av kategoriene definert på bloggens hovedside.",
        }),
        defineField({
          name: "publishedAt",
          title: "Publisert dato",
          type: "date",
          initialValue: () => new Date().toISOString().split("T")[0],
          group: GROUP.MAIN_CONTENT,
          description: "Datoen artikkelen ble publisert.",
        }),
        defineField({
          name: "body",
          title: "Brødtekst",
          type: "richText",
          group: GROUP.MAIN_CONTENT,
          description:
            "Artikkelens hovedinnhold i tekst, bilder og formattering.",
        }),
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
          let visibility = "Offentlig";
          if (isPrivate) {
            visibility = "Privat";
          } else if (isHidden) {
            visibility = "Skjult";
          }

          const authorInfo = author ? `${author}` : "Ingen forfatter";
          const dateInfo = publishDate
            ? `${new Date(publishDate).toLocaleDateString()}`
            : "Utkast";

          return {
            title: title || "Artikkel uten tittel",
            media,
            subtitle: `🔗 ${slug} | ${visibility} | ${authorInfo} | ${dateInfo}`,
          };
        },
      },
    },
  },
});
