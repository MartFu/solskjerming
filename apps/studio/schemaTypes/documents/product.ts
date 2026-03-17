import { GROUPS } from "@/utils/constant";
import { ogFields } from "@/utils/og-fields";
import { seoFields } from "@/utils/seo-fields";
import { defineField, defineType } from "sanity";

export const product = defineType({
  name: "product",
  title: "Produkt",
  type: "document",
  groups: GROUPS(),
  fields: [
    defineField({
      name: "title",
      title: "Produkttittel",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      description: "Genereres automatisk fra tittelen",
      type: "slug",
      options: { source: "title" },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "workspace",
      title: "Workspace",
      type: "string",
      hidden: true,
    }),
    defineField({
      name: "productType",
      title: "Product Type",
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
          { title: "Accessory", value: "accessory" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "images",
      title: "Bilder",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
      validation: (Rule) => Rule.min(1),
    }),
    defineField({
      name: "description",
      title: "Beskrivelse",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "specifications",
      title: "Spesifikasjoner",
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
    defineField({
      name: "pricing",
      title: "Pris",
      type: "pricing",
    }),
    ...seoFields,
    ...ogFields
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