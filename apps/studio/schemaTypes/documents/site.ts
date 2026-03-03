import { Globe } from "lucide-react";
import { defineField, defineType } from "sanity";

export const site = defineType({
  name: "site",
  title: "Site",
  type: "document",
  icon: Globe,
  fields: [
    defineField({
      name: "id",
      title: "Site ID",
      type: "string",
      validation: (Rule) => Rule.required(),
      description: "Unique identifier (e.g., terrasse-spesialisten)",
    }),
    defineField({
      name: "title",
      title: "Site Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "domain",
      title: "Live Domain",
      type: "url",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "workspace",
      title: "Workspace",
      type: "string",
      options: {
        list: [
          { title: "Solskjerming", value: "solskjerming" },
          { title: "Vannsport", value: "vannsport" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "logo",
      title: "Logo",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "favicon",
      title: "Favicon",
      type: "image",
    }),
    defineField({
      name: "contact",
      title: "Contact Information",
      type: "object",
      fields: [
        { name: "phone", type: "string", title: "Phone" },
        { name: "email", type: "string", title: "Email" },
        { name: "address", type: "address" },
      ],
    }),
    defineField({
      name: "social",
      title: "Social Media",
      type: "socialLinks",
    }),
    defineField({
      name: "deployment",
      title: "Deployment Status",
      type: "deploymentMeta",
    }),
  ],
  preview: {
    select: {
      title: "title",
      id: "id",
      workspace: "workspace",
    },
    prepare({ title, id, workspace }) {
      return {
        title: `${title} (${id})`,
        subtitle: workspace === "solskjerming" ? "Solskjerming" : "Vannsport",
      };
    },
  },
});