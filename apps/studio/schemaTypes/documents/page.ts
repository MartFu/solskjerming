// ===========================================================================
// STANDALONE DOCUMENT: Generic page
// ===========================================================================
//
// The `page` type is the universal building block — it doesn't belong to any
// package and is always available. It uses the composable field sets directly,
// which makes it a good reference for how the primitives work.
// ===========================================================================

import { defineType } from "sanity";
import { DOCUMENT_NAMES } from "../constant";
import { GROUP, GROUPS } from "@/utils/constant";
import {
  createIdentityFields,
  createPagebuilderField,
  createPageSEOFields,
  createParentField,
  createSortOrderField,
} from "@/utils/factories/create-page-fields";

export const page = defineType({
  name: DOCUMENT_NAMES.page,
  title: "Side",
  type: "document",
  groups: GROUPS(GROUP.IDENTITY),
  fields: [
    ...createIdentityFields(),
    ...createParentField(["page"]),
    ...createSortOrderField(),
    ...createPageSEOFields(),
    ...createPagebuilderField("pageBuilder"),
  ],
  preview: {
    select: {
      title: "title",
      slug: "slug.current",
      media: "ogImage",
      isPrivate: "seoNoIndex",
    },
    prepare: ({ title, slug, media, isPrivate }) => {
      const status = isPrivate ? "skjult" : "indeksert";
      return {
        title: title || "Side uten tittel",
        subtitle: slug ? `${slug} · ${status}` : status,
        media,
      };
    },
  },
});
