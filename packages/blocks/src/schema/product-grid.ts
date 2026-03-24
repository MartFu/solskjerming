import { ShoppingBag } from "lucide-react";
import { defineField, defineType } from "sanity";

export const productGrid = defineType({
  name: "productGrid",
  title: "Product Grid",
  type: "object",
  icon: ShoppingBag,
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
      description: "Heading displayed above the product grid",
    }),
    defineField({
      name: "columns",
      title: "Columns",
      type: "string",
      description: "Number of columns in the product grid",
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
      name: "sortOrder",
      title: "Sort Order",
      type: "string",
      description: "Default order in which products are displayed",
      options: {
        list: [
          { title: "Default", value: "default" },
          { title: "Name A-Z", value: "title_asc" },
          { title: "Name Z-A", value: "title_desc" },
        ],
        layout: "radio",
      },
      initialValue: "default",
    }),
    defineField({
      name: "showFilters",
      title: "Show Filter Controls",
      type: "boolean",
      description: "Display category filter controls above the product grid",
      initialValue: true,
    }),
    defineField({
      name: "showCategoryTabs",
      title: "Use Category Tabs",
      type: "boolean",
      description:
        "Use tabs instead of a dropdown for category filters (only applies when filters are enabled)",
      initialValue: false,
      hidden: ({ parent }) => !parent?.showFilters,
    }),
    defineField({
      name: "showProductCount",
      title: "Show Product Count",
      type: "boolean",
      description:
        'Display the total number of products above the grid (e.g. "24 products")',
      initialValue: true,
    }),
    defineField({
      name: "showPrice",
      title: "Show Price",
      type: "boolean",
      description: "Display the price on product cards",
      initialValue: false,
    }),
  ],
  preview: {
    select: { title: "title", columns: "columns" },
    prepare: ({ title, columns }) => ({
      title: title ?? "Product Grid",
      subtitle: `Product Grid · ${columns ?? "3"} columns`,
    }),
  },
});
