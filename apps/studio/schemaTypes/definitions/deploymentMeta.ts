import { defineField, defineType } from "sanity";

export const deploymentMeta = defineType({
  name: "deploymentMeta",
  title: "Publishing Status",
  type: "object",
  fieldsets: [
    {
      name: "deployment",
      title: "Deployment Information",
      options: { collapsible: true, collapsed: false },
    },
  ],
  fields: [
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "📝 Draft (Studio only)", value: "draft" },
          { title: "👁️ Ready for Preview", value: "preview" },
          { title: "🚀 Staged for Deploy", value: "staged" },
          { title: "✅ Published Live", value: "published" },
        ],
        layout: "radio",
      },
      initialValue: "draft",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "lastModified",
      title: "Last Modified",
      type: "datetime",
      readOnly: true,
      options: {
        dateFormat: "YYYY-MM-DD",
        timeFormat: "HH:mm",
      },
    }),
    defineField({
      name: "lastDeployed",
      title: "Last Deployed",
      type: "datetime",
      readOnly: true,
      hidden: ({ parent }) => parent?.status !== "published",
    }),
    defineField({
      name: "deployedBy",
      title: "Deployed By",
      type: "string",
      readOnly: true,
      hidden: ({ parent }) => parent?.status !== "published",
    }),
    defineField({
      name: "buildLog",
      title: "Build Log",
      type: "text",
      rows: 4,
      readOnly: true,
      hidden: ({ parent }) => !parent?.buildLog,
    }),
  ],
});