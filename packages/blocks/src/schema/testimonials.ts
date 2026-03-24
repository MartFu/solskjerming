import { MessageSquareQuote } from "lucide-react";
import { defineField, defineType } from "sanity";

import { imageWithAltField } from "./primitives.js";

export const testimonials = defineType({
  name: "testimonials",
  title: "Testimonials",
  type: "object",
  icon: MessageSquareQuote,
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
      description: "The main heading for the testimonials section",
    }),
    defineField({
      name: "layout",
      title: "Layout",
      type: "string",
      description: "How the testimonials are arranged on the page",
      options: {
        list: [
          { title: "Grid", value: "grid" },
          { title: "Carousel", value: "carousel" },
          { title: "Masonry", value: "masonry" },
        ],
        layout: "radio",
      },
      initialValue: "grid",
    }),
    defineField({
      name: "items",
      title: "Testimonials",
      type: "array",
      description: "Add customer testimonials and reviews",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "quote",
              title: "Quote",
              type: "text",
              description: "The testimonial quote text",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "authorName",
              title: "Author Name",
              type: "string",
              description: "Full name of the person giving the testimonial",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "authorTitle",
              title: "Author Title",
              type: "string",
              description: "Job title or role of the author",
            }),
            defineField({
              name: "company",
              title: "Company",
              type: "string",
              description: "Company or organisation the author belongs to",
            }),
            defineField({
              name: "rating",
              title: "Rating",
              type: "number",
              description: "Star rating from 1 to 5",
              options: {
                list: [1, 2, 3, 4, 5],
              },
            }),
            imageWithAltField({
              name: "avatar",
              title: "Avatar",
              description: "Profile photo of the testimonial author",
            }),
          ],
          preview: {
            select: { title: "authorName", subtitle: "quote" },
            prepare: ({ title, subtitle }) => ({ title, subtitle }),
          },
        },
      ],
    }),
  ],
  preview: {
    select: { title: "title", items: "items" },
    prepare: ({ title, items = [] }) => ({
      title: title ?? "Testimonials",
      subtitle: `${items.length} testimonial${items.length === 1 ? "" : "s"}`,
    }),
  },
});
