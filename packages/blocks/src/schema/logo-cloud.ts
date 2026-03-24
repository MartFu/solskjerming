import { Layers } from "lucide-react";
import { defineField, defineType } from "sanity";
import { imageWithAltField } from "./primitives.js";


export const logoCloud = defineType({
  name: "logoCloud",
  title: "Logo Cloud",
  type: "object",
  icon: Layers,
  fields: [
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      description:
        'Optional label displayed above the logos, e.g. "Trusted by"',
    }),
    defineField({
      name: "logos",
      title: "Logos",
      type: "array",
      description: "Add company or partner logos to display",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "name",
              title: "Company Name",
              type: "string",
              description: "Name of the company (used as alt text)",
              validation: (Rule) => Rule.required(),
            }),
            imageWithAltField({
              name: "logo",
              title: "Logo",
              description: "The company logo image",
            }),
            defineField({
              name: "url",
              title: "Website URL",
              type: "url",
              description:
                "Optional link to the company website (makes logo clickable)",
            }),
          ],
          preview: {
            select: { title: "name", media: "logo" },
            prepare: ({ title, media }) => ({ title, media }),
          },
        },
      ],
    }),
    defineField({
      name: "animate",
      title: "Animate",
      type: "boolean",
      description: "Scroll logos continuously in a marquee animation",
      initialValue: false,
    }),
  ],
  preview: {
    select: { label: "label", logos: "logos" },
    prepare: ({ label, logos = [] }) => ({
      title: label ?? "Logo Cloud",
      subtitle: `${logos.length} logo${logos.length === 1 ? "" : "s"}`,
    }),
  },
});
