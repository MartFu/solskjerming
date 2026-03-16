import { ComposeIcon, ColorWheelIcon, WrenchIcon } from "@sanity/icons";
import { defineField, defineType, FieldGroupDefinition } from "sanity";

export const _GROUP = {
  MAIN_CONTENT: "main-content",
  BRANDING: "branding",
};

export const _GROUPS: FieldGroupDefinition[] = [
  {
    name: _GROUP.MAIN_CONTENT,
    icon: ComposeIcon,
    title: "Innhold",
    default: true,
  },
  { name: _GROUP.BRANDING, icon: ColorWheelIcon, title: "Branding" },
];

export const site = defineType({
  name: "site",
  title: "Nettside",
  type: "document",
  groups: _GROUPS,
  icon: WrenchIcon,
  fields: [
    defineField({
      name: "title",
      title: "Tittel",
      type: "string",
      group: _GROUP.MAIN_CONTENT,
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "workspace",
      title: "Arbeidsrom",
      type: "string",
      group: _GROUP.MAIN_CONTENT,
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
      group: _GROUP.MAIN_CONTENT,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "deployment",
      group: _GROUP.MAIN_CONTENT,
      title: "Distribusjonsstatus",
      type: "deploymentMeta",
    }),

    defineField({
      name: "logo",
      title: "Logo",
      type: "image",
      group: _GROUP.BRANDING,
      options: { hotspot: true },
    }),
    defineField({
      name: "favicon",
      title: "Favicon",
      type: "image",
      group: _GROUP.BRANDING,
    }),

    defineField({
      name: "social",
      group: _GROUP.BRANDING,
      title: "SOME-lenker",
      type: "socialLinks",
    }),

    defineField({
      name: "contact",
      group: _GROUP.BRANDING,
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
    prepare({  title, workspace }) {
      return {
        title: title.slice(0, 1).toUpperCase() + title.slice(1) || "Side uten tittel",
        subtitle: workspace === "solskjerming" ? "Solskjerming" : "Vannsport",
      };
    },
  },
});