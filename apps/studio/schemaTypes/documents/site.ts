import { GROUP, GROUPS } from "@/utils/constant";
import { ComposeIcon, ColorWheelIcon, WrenchIcon } from "@sanity/icons";
import { defineField, defineType, FieldGroupDefinition } from "sanity";



export const site = defineType({
  name: "site",
  title: "Nettside",
  type: "document",
  groups: GROUPS(GROUP.BRANDING),
  icon: WrenchIcon,
  fields: [
    defineField({
      name: "title",
      title: "Tittel",
      type: "string",
      group: GROUP.MAIN_CONTENT,
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "workspace",
      title: "Arbeidsrom",
      type: "string",
      group: GROUP.MAIN_CONTENT,
      readOnly: true,
      options: {
        list: [
          { title: "Solskjerming", value: "solskjerming" },
          { title: "Vannsport", value: "vannsport" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "domain",
      title: "Domene",
      type: "string",
      group: GROUP.MAIN_CONTENT,
    }),
    defineField({
      name: "status",
      type: "string",
      options: { list: ["setting-up", "active", "suspended"] },
      initialValue: "setting-up",
    }),
    defineField({
      name: "logo",
      title: "Logo",
      type: "image",
      group: GROUP.BRANDING,
      options: { hotspot: true },
    }),
    defineField({
      name: "favicon",
      title: "Favicon",
      type: "image",
      group: GROUP.BRANDING,
    }),

    defineField({
      name: "social",
      group: GROUP.BRANDING,
      title: "SOME-lenker",
      type: "socialLinks",
    }),

    defineField({
      name: "contact",
      group: GROUP.BRANDING,
      title: "Kontaktinformasjon",
      description: "Arver fra organisasjon hvis tom",
      type: "address",
    }),
  ],
  preview: {
    select: {
      title: "title",
      workspace: "workspace",
    },
    prepare({ title, workspace }) {
      return {
        title:
          `${title.slice(0, 1).toUpperCase() + title.slice(1)} - Innstillinger` ||
          "Side uten tittel",
        subtitle: workspace.slice(0, 1).toUpperCase() + workspace.slice(1),
      };
    },
  },
});
