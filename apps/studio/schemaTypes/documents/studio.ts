import { defineField, defineType } from "sanity";
import { asStudioIcon } from "@/utils/helper";
import { LayoutDashboard } from "lucide-react";
import { defineGlobal } from "@/utils/globals/define-global";

export const studioSettings = defineGlobal({
  sortFields: [],
  name: "studioSettings",
  title: "Studioinnstillinger",
  type: "document",
  icon: asStudioIcon(LayoutDashboard),
  fields: [
    defineField({
      name: "tabs",
      title: "Faner",
      type: "object",
      fields: [
        defineField({
          name: "enabled",
          title: "Aktiver faner",
          type: "boolean",
          description:
            "Slå av for å bruke studio uten faner. Eksisterende faner vil bli bevart, men bare den første vil vises.",
          initialValue: true,
        }),
        defineField({
          name: "maxTabs",
          title: "Maks antall faner",
          type: "number",
          description:
            "Begrens antall åpne faner. Lavere verdi reduserer minnebruk på eldre maskiner. Minimum 1, maksimum 10.",
          initialValue: 5,
          validation: (Rule) => Rule.min(1).max(10).integer(),
        }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: "Studioinnstillinger" }),
  },
});
