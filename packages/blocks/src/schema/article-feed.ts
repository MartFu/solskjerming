import { Rss } from "lucide-react";
import { defineField, defineType } from "sanity";

export const articleFeed = defineType({
  name: "articleFeed",
  title: "Article Feed",
  type: "object",
  icon: Rss,
  fields: [
    defineField({
      name: "eyebrow",
      title: "Eyebrow",
      type: "string",
      description: "Optional small text displayed above the main heading",
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "Heading displayed above the article listing",
    }),
    defineField({
      name: "layout",
      title: "Layout",
      type: "string",
      description: "How articles are arranged on the page",
      options: {
        list: [
          { title: "Grid", value: "grid" },
          { title: "List", value: "list" },
          { title: "Magazine", value: "magazine" },
        ],
        layout: "radio",
      },
      initialValue: "grid",
    }),
    defineField({
      name: "columns",
      title: "Columns",
      type: "string",
      description:
        "Number of columns in the grid (only applies to grid layout)",
      options: {
        list: [
          { title: "2 columns", value: "2" },
          { title: "3 columns", value: "3" },
          { title: "4 columns", value: "4" },
        ],
        layout: "radio",
      },
      initialValue: "3",
      hidden: ({ parent }) => parent?.layout !== "grid",
    }),
    defineField({
      name: "sortOrder",
      title: "Sort Order",
      type: "string",
      description: "Order in which articles are displayed",
      options: {
        list: [
          { title: "Newest first", value: "publishedAt_desc" },
          { title: "Oldest first", value: "publishedAt_asc" },
        ],
        layout: "radio",
      },
      initialValue: "publishedAt_desc",
    }),
    defineField({
      name: "showCategories",
      title: "Show Category Filters",
      type: "boolean",
      description: "Display category filter tabs above the article listing",
      initialValue: true,
    }),
    defineField({
      name: "showDate",
      title: "Show Publication Date",
      type: "boolean",
      description: "Display the publication date on article cards",
      initialValue: true,
    }),
    defineField({
      name: "showAuthor",
      title: "Show Author",
      type: "boolean",
      description: "Display the author name on article cards",
      initialValue: true,
    }),
    defineField({
      name: "showExcerpt",
      title: "Show Excerpt",
      type: "boolean",
      description: "Display the article summary on article cards",
      initialValue: true,
    }),
  ],
  preview: {
    select: { title: "title", layout: "layout" },
    prepare: ({ title, layout }) => ({
      title: title ?? "Article Feed",
      subtitle: `Article Feed · ${layout ?? "grid"} layout`,
    }),
  },
});
