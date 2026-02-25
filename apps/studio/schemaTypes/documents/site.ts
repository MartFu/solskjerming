// schemaTypes/site.ts
import { EarthIcon } from "lucide-react";
import { defineField, defineType } from "sanity";

export const site = defineType({
  name: "site",
  title: "Site",
  type: "document",
  icon: EarthIcon,
  fields: [
    defineField({
      name: "title",
      title: "Site Name",
      type: "string",
      description: "e.g., Terrasse-Spesialisten",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "url",
      title: "Production URL",
      type: "url",
      description: "The live domain for this site",
    }),
    defineField({
      name: "market",
      title: "Market",
      type: "string",
      options: {
        list: [
          { title: "Solskjerming", value: "solskjerming" },
          { title: "Vannsport", value: "vannsport" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
  ],
});