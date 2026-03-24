import { BarChart3 } from "lucide-react";
import { defineField, defineType } from "sanity";

import { customRichText } from "./primitives.js";

export const stats = defineType({
  name: "stats",
  title: "Stats",
  type: "object",
  icon: BarChart3,
  fields: [
    defineField({
      name: "eyebrow",
      title: "Eyebrow",
      type: "string",
      description: "Small label text displayed above the section title",
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "The main heading for the stats section",
    }),
    customRichText(["block"], {
      name: "subtitle",
      title: "Subtitle",
      description: "Supporting text displayed below the title",
    }),
    defineField({
      name: "columns",
      title: "Columns",
      type: "string",
      description: "Number of stat items per row",
      options: {
        list: [
          { title: "2 columns", value: "2" },
          { title: "3 columns", value: "3" },
          { title: "4 columns", value: "4" },
        ],
        layout: "radio",
      },
      initialValue: "3",
    }),
    defineField({
      name: "items",
      title: "Stats",
      type: "array",
      description: "Add the individual statistics to display",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "value",
              title: "Value",
              type: "string",
              description: 'The statistic value, e.g. "10,000+" or "99%"',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "label",
              title: "Label",
              type: "string",
              description: "Short label describing what the value represents",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "description",
              title: "Description",
              type: "string",
              description: "Optional additional context for this statistic",
            }),
          ],
          preview: {
            select: { title: "value", subtitle: "label" },
            prepare: ({ title, subtitle }) => ({ title, subtitle }),
          },
        },
      ],
    }),
  ],
  preview: {
    select: { title: "title", items: "items" },
    prepare: ({ title, items = [] }) => ({
      title: title ?? "Stats",
      subtitle: `${items.length} stat${items.length === 1 ? "" : "s"}`,
    }),
  },
});
