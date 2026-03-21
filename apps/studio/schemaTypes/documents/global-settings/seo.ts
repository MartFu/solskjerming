import { DOCUMENT_NAMES } from "@/schemaTypes/constant";
import { GROUP, GROUPS } from "@/utils/constant";
import { createOGFields, createSEOFields } from "@/utils/factories";

import { SearchIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const globalSeo = defineType({
  name: DOCUMENT_NAMES.globalSeo,
  title: "Søkemotoroptimalisering",
  type: "document",
  icon: SearchIcon,
  groups: GROUPS(),
  fields: [
    ...createSEOFields({
      isDefault: true,
    }),
    ...createOGFields({
      isDefault: true,
    }),
    defineField({
      name: "googleSiteVerification",
      title: "Google Search Console-bekreftelse",
      type: "string",
      group: GROUP.SEO,
      description:
        "Lim inn koden fra 'HTML-tag' i Search Console. Ser ofte ut som en tilfeldig streng med tegn.",
      validation: (Rule) =>
        Rule.custom((value) => {
          if (value?.includes("<")) {
            return "Vennligst lim inn kun selve koden (content-verdien), ikke hele HTML-tagen.";
          }
          return true;
        }),
    }),
  ],
  preview: {
    prepare() {
      return { title: "Søkemotoroptimalisering" };
    },
  },
});
