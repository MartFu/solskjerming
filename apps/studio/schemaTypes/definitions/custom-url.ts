import { defineField, defineType } from "sanity";

import { createRadioListLayout, isValidUrl } from "@/utils/helper";
import { DOCUMENTS } from "../constant";

const allLinkableTypes = [
  { type: DOCUMENTS.page },
];

export const customUrl = defineType({
  name: "customUrl",
  type: "object",
  title: "Lenke",
  description:
    "Konfigurer en lenke som kan peke til en intern site eller et eksternt nettsted.",
  fields: [
    defineField({
      name: "type",
      type: "string",
      title: "Lenketype",
      description:
        "Velg om denne lenken peker til en annen side på ditt nettsted (intern) eller til en helt annen nettside (ekstern).",
      options: createRadioListLayout(["internal", "external"]),
      initialValue: () => "external",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "openInNewTab",
      title: "Åpne i ny fane",
      type: "boolean",
      description:
        "Når denne er aktivert, vil lenken åpnes i en ny nettleserfane i stedet for å navigere bort fra nåværende side.",
      initialValue: () => false,
    }),
    defineField({
      name: "external",
      type: "string",
      title: "URL",
      description:
        "Skriv inn fullstendig nettadresse som starter med https:// for eksterne sider, eller en relativ sti som /om-oss for interne sider.",
      hidden: ({ parent }) => parent?.type !== "external",
      validation: (Rule) => [
        Rule.custom((value, { parent }) => {
          const type = (parent as { type?: string })?.type;
          if (type === "external") {
            if (!value) {
              return "URL-feltet kan ikke være tomt";
            }
            const isValid = isValidUrl(value);
            if (!isValid) {
              return "Ugyldig URL";
            }
          }
          return true;
        }),
      ],
    }),
    defineField({
      name: "href",
      type: "string",
      description:
        "Teknisk felt som benyttes internt for å large komplett URL. Du behøver ikke endre denne.",
      initialValue: () => "#",
      hidden: true,
      readOnly: true,
    }),
    defineField({
      name: "internal",
      title: "Intern",
      type: "reference",
      description: "Velg en side på nettstedet som denne lenken skal peke til.",
      options: { disableNew: true },
      hidden: ({ parent }) => parent?.type !== "internal",
      to: allLinkableTypes,
      validation: (rule) => [
        rule.custom((value, { parent }) => {
          const type = (parent as { type?: string })?.type;
          if (type === "internal" && !value?._ref) {
            return "Intern-feltet kan ikke være tomt";
          }
          return true;
        }),
      ],
    }),
  ],
  preview: {
    select: {
      externalUrl: "external",
      urlType: "type",
      internalUrl: "internal.slug.current",
      openInNewTab: "openInNewTab",
    },
    prepare({ externalUrl, urlType, internalUrl, openInNewTab }) {
      const url = urlType === "external" ? externalUrl : `${internalUrl}`;
      const newTabIndicator = openInNewTab ? " ↗" : "";
      return {
        title: `${urlType === "external" ? "Ekstern" : "Intern"} Lenke`,
        subtitle: `${url}${newTabIndicator}`,
      };
    },
  },
});
