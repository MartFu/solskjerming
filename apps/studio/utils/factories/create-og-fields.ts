import { defineField } from "sanity";
import { GROUP, GroupValue } from "../constant";
import { SocialPreview } from "@/components/social-preview";

interface CreateOGFieldsOptions {
  isDefault?: boolean;
  isSite?: boolean;
  isPage?: boolean;
  group?: GroupValue;
}

const DEFAULTS = {
  ogTitle: {
    title: "Tittel for sosiale medier (OG)",
    description:
      "Tittelen som vises når siden deles på Facebook, LinkedIn, etc.",
  },
  ogDescription: {
    title: "Beskrivelse for sosiale medier (OG)",
    description: "En kort, fengende tekst som vises under tittelen ved deling.",
  },
  ogImage: {
    title: "Bilde for sosiale medier (OG)",
    description: "Anbefalt 1200x630px. Brukes som forhåndsvisning ved deling.",
  },
};

export const createOGFields = (options: CreateOGFieldsOptions = {}) => {
  const { isDefault, isSite, isPage, group = GROUP.OG } = options;

  return [
    defineField({
      name: "ogTitle",
      title: DEFAULTS.ogTitle.title,
      description:
        DEFAULTS.ogTitle.description +
        (isDefault
          ? " Fungerer som standardtittel hvis siden mangler egen."
          : isPage
            ? " Overstyrer metatittelen ved deling på sosiale medier."
            : ""),
      type: "string",
      group,
      validation: (Rule) => {
        const rules = [
          Rule.max(60).warning(
            "Bør være under 60 tegn for å unngå kutting. Kortere titler fungerer best på mobil.",
          ),
        ];

        if (isSite || isDefault) {
          rules.push(
            Rule.required().warning(
              "En global OG-tittel sikrer at alle sider har en fornuftig standard ved deling.",
            ),
          );
        }

        return rules;
      },
    }),

    defineField({
      name: "ogDescription",
      title: DEFAULTS.ogDescription.title,
      description:
        DEFAULTS.ogDescription.description +
        (isDefault
          ? " Fungerer som standardbeskrivelse hvis siden mangler egen."
          : isPage
            ? " Overstyrer metabeskrivelsen ved deling på sosiale medier."
            : ""),
      type: "text",
      rows: 2,
      group,
      validation: (Rule) => {
        const rules = [Rule.max(160).warning("Bør være under 160 tegn.")];

        if (isSite || isDefault) {
          rules.push(
            Rule.required().warning(
              "En global OG-beskrivelse sikrer at alle sider ser bra ut ved deling.",
            ),
          );
        }

        return rules;
      },
    }),

    defineField({
      name: "ogImage",
      title: DEFAULTS.ogImage.title,
      description:
        DEFAULTS.ogImage.description +
        (isDefault
          ? " Dette er det globale standardbildet for hele nettstedet."
          : isSite
            ? " Brukes som fallback når sider mangler eget delingsbilde."
            : isPage
              ? " Overstyrer det globale standardbildet for denne siden."
              : ""),
      type: "image",
      options: { hotspot: true },
      group,
      validation: (Rule) =>
        Rule.custom((value) => {
          if (!value && (isDefault || isSite)) {
            return "Et globalt delingsbilde er sterkt anbefalt. Uten dette vises ingen forhåndsvisning ved deling.";
          }
          if (!value && isPage) {
            return {
              message:
                "Sider uten eget delingsbilde bruker det globale standardbildet. Et unikt bilde gir bedre klikkrate.",
              level: "warning",
            };
          }
          return true;
        }),
    }),

    // Site-level: og:type and og:site_name
    ...(isSite
      ? [
          defineField({
            name: "ogSiteName",
            title: "Nettstedsnavn (og:site_name)",
            description:
              "Vises som avsendernavn i sosiale medier-kort. Typisk bedriftsnavnet.",
            type: "string",
            group,
            validation: (Rule) =>
              Rule.required().warning(
                "og:site_name hjelper sosiale medier å vise hvem som eier innholdet.",
              ),
          }),
        ]
      : []),

    defineField({
      name: "socialPreview",
      title: "Forhåndsvisning",
      type: "string", // dummy type — overridden by component
      group: "seo",
      components: {
        input: (props) =>
          SocialPreview({
            ...props,
            siteUrl: "https://example.com",
            siteDefaults: {
              // In a real app, fetch these from your site config singleton
              titleSuffix: "| Bedrift AS",
              ogSiteName: "Bedrift AS",
            },
          }),
      },
    }),
  ];
};
