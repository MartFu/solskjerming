import { GROUPS } from "@/utils/constant";
import { ogFields } from "@/utils/og-fields";
import { seoFields } from "@/utils/seo-fields";
import { defineField, defineType } from "sanity";

export const product = defineType({
  name: "product",
  title: "Product",
  type: "document",
  groups: GROUPS,
  fields: [
    defineField({
      name: "title",
      title: "Product Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title" },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "siteId",
      title: "Site",
      type: "string",
      hidden: true,
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
          { title: "Terrace Awning", value: "terrace-awning" },
          { title: "Pergola", value: "pergola" },
          { title: "Vertical Screen", value: "vertical-screen" },
          { title: "Parasol", value: "parasol" },
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
      title: "Product Images",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
      validation: (Rule) => Rule.min(1),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "specifications",
      title: "Specifications",
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
      title: "Pricing",
      type: "pricing",
    }),
 
    defineField({
      name: "deployment",
      title: "Publishing Status",
      type: "deploymentMeta",
    }),
    
    ...seoFields,
    ...ogFields
  ],
  preview: {
    select: {
      title: "title",
      productType: "productType",
      siteId: "siteId",
      status: "deployment.status",
      media: "images.0",
    },
    prepare({ title, productType, siteId, status, media }) {
      const emoji = { draft: "📝", preview: "👁️", staged: "🚀", published: "✅" };
      return {
        title: `${title} ${emoji?.[status as keyof typeof emoji] || ""}`,
        subtitle: `${productType || "Product"} • ${siteId}`,
        media,
      };
    },
  },
});