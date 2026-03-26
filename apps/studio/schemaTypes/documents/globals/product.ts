import { DOCUMENTS } from "@/schemaTypes/constant";
import { GROUP, GROUPS } from "@/utils/constant";
import { defineField } from "sanity";
import { defineGlobal } from "@/utils/globals/define-global";

export const product = defineGlobal({
  name: DOCUMENTS.productAsset,
  title: "Produkt",
  sortFields: [],
  type: "document",
  groups: GROUPS(),
  fields: [
    defineField({
      name: "title",
      title: "Produkttittel",
      type: "string",
      group: GROUP.MAIN_CONTENT,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      description: "Genereres automatisk fra tittelen",
      type: "slug",
      group: GROUP.MAIN_CONTENT,
      options: { source: "title" },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "workspace",
      title: "Workspace",
      group: GROUP.MAIN_CONTENT,
      type: "string",
      hidden: true,
    }),
    defineField({
      name: "category",
      title: "Kategori",
      group: GROUP.MAIN_CONTENT,
      type: "string",
      options: {
        list: [
          // Solskjerming types
          { title: "Terrassemarkise", value: "terrace-awning" },
          { title: "Pergola", value: "pergola" },
          { title: "Zip Screen", value: "zip-screen" },
          { title: "Lamellgardin", value: "slat-curtain" },
          { title: "Persienne", value: "shutter" },
          // Vannsport types
          { title: "E-Foil Board", value: "efoil-board" },
          { title: "E-Foil Motor", value: "efoil-motor" },
          { title: "Tilbehør", value: "accessory" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "description",
      title: "Beskrivelse",
      group: GROUP.MAIN_CONTENT,
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "images",
      title: "Bilder",
      group: GROUP.MAIN_CONTENT,
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
      validation: (Rule) => Rule.min(1),
    }),
    defineField({
      name: "specifications",
      title: "Spesifikasjoner",
      group: GROUP.MAIN_CONTENT,
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "label", type: "string", title: "Label" },
            { name: "value", type: "string", title: "Value" },
          ],
        },
      ],
    }),
    // defineField({
    //   name: "pricing",
    //   title: "Pris",
    //   type: "pricing",
    // }),
    // ...seoFields,
    // ...ogFields,
  ],
  preview: {
    select: {
      title: "title",
      productType: "productType",
      media: "images.0",
    },
    prepare({ title, productType, media }) {
      return {
        title: `${title}`,
        subtitle: `${productType || "Produkt"}`,
        media,
      };
    },
  },
});