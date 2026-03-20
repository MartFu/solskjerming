import { ColorWheelIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const globalBranding = defineType({
  name: "globalBranding",
  title: "Merkevare",
  type: "document",
  icon: ColorWheelIcon,
  fields: [
    defineField({
      name: "logo",
      title: "Logo",
      type: "image",
      description:
        "Organisasjonens logo. Arves av nye nettsteder som ikke har sin egen logo.",
      options: { hotspot: true },
    }),
    defineField({
      name: "favicon",
      title: "Favicon",
      type: "image",
      description:
        "Ikonet som vises i nettleserfanen. Arves av nye nettsteder som ikke har sitt eget favicon.",
    }),
  ],
  preview: {
    prepare() {
      return { title: "Merkevare" };
    },
  },
});
