import { GROUPS } from "@/utils/constant";
// import { ogFields } from "@/utils/og-fields";
// import { seoFields } from "@/utils/seo-fields";
import { defineField, defineType } from "sanity";

export const video = defineType({
  name: "video",
  title: "Video",
  type: "document",
  groups: GROUPS(),
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title" },
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
      name: "videoUrl",
      title: "Video URL",
      type: "url",
      description: "YouTube, Vimeo, or direct video URL",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "thumbnail",
      title: "Custom Thumbnail",
      type: "image",
      description: "Optional - will auto-fetch from YouTube if empty",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "duration",
      title: "Duration",
      type: "string",
      description: "e.g., '5:30'",
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "Installation", value: "installation" },
          { title: "Maintenance", value: "maintenance" },
          { title: "Product Guide", value: "product-guide" },
        ],
      },
    }),

    // ...seoFields,
    // ...ogFields,
  ],
  preview: {
    select: {
      title: "title",
      siteId: "siteId",
      status: "deployment.status",
    },
    prepare({ title, siteId, status }) {
      const emoji = { draft: "📝", preview: "👁️", staged: "🚀", published: "✅" };
      return {
        title: `${title} ${emoji?.[status as keyof typeof emoji] || ""}`,
        subtitle: `Video • ${siteId}`,
      };
    },
  },
});