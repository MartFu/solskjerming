import { Mail } from "lucide-react";
import { defineField, defineType } from "sanity";

import { customRichText } from "./primitives.js";

export const subscribeNewsletter = defineType({
  name: "subscribeNewsletter",
  title: "Subscribe Newsletter",
  type: "object",
  icon: Mail,
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "The main heading for the newsletter signup section",
    }),
    customRichText(["block"], {
      name: "subTitle",
      title: "SubTitle",
      description: "Supporting text shown below the title",
    }),
    customRichText(["block"], {
      name: "helperText",
      title: "Helper Text",
      description: "Small text shown below the email input field",
    }),
  ],
  preview: {
    select: { title: "title" },
    prepare: ({ title }) => ({
      title: title ?? "Untitled",
      subtitle: "Subscribe Newsletter",
    }),
  },
});
