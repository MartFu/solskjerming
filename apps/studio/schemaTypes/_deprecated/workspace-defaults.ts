// @deprecated — superseded by globalTheme + globalSeo + globalBranding in documents/global/
import { CogIcon } from "lucide-react";
import { defineField, defineType } from "sanity";
import { GROUP, GROUPS } from "@/utils/constant";

export const workspaceDefaults = defineType({
  name: "workspaceDefault",
  type: "document",
  title: "Globale innstillinger",
  description:
    "Globale innstillinger og konfigurasjoner for alle nettsteder i dette arbeidsrommet. Nye sider arver disse innstillingene, men kan overskrive dem.",
  icon: CogIcon,
  groups: GROUPS(GROUP.SEO),
  fields: [
    defineField({
      name: "seoTitle",
      type: "string",
      title: "Tittel",
      group: GROUP.SEO,
      description:
        "Tittelen på nye nettsteder. Anvendes i nettleserfaner og SEO.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "seoDescription",
      type: "text",
      title: "Beskrivelse",
      group: GROUP.SEO,
      description:
        "En kort beskrivelse. På arbeidsrom nivå anbefales denne å være en kort beskrivelse av organisasjonen.",
      validation: (rule) => rule.required().min(50).max(160),
    }),
    defineField({
      name: "logo",
      type: "image",
      title: "Logo",
      group: GROUP.SEO,
      description: "Organisasjonens logo.",
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: "favicon",
      type: "image",
      title: "Favicon",
      group: GROUP.SEO,
      description: "Vises i nettleserfaner.",
    }),
    // Theme token fields moved to globalTheme in documents/global/theme.ts
  ],
  preview: {
    prepare() {
      return {
        title: "Standardinnstillinger",
      };
    },
  },
});
