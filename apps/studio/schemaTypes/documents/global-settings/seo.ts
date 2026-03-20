import { GROUP, GROUPS } from "@/utils/constant";
import { createOGFields, createSEOFields } from "@/utils/factories";

import { SearchIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const globalSeo = defineType({
  name: "globalSeo",
  title: "Søkemotoroptimalisering",
  type: "document",
  icon: SearchIcon,
  groups: GROUPS(GROUP.SEO),
  fields: [
    ...createSEOFields({
      seoTitleFieldTitle: "Standard Metatittel",
      seoTitleFieldDescription: "Bør være 50-60 tegn. Arves av nye sider.",
      seoDescriptionFieldTitle: "Standard Metabeskrivelse",
      seoDescriptionFieldDescription:
        "Bør være 50-160 tegn. Arves av nye sider.",
      seoKeywordsFieldTitle: "Standard nøkkelord",
      seoTitlePrefixFieldDescription:
        'Tekst som legges til på starten av alle sidetitler, f.eks. "Bedrift AS |". Arves ikke automatisk av nye sider.',
      seoTitleSuffixFieldDescription:
        'Tekst som legges til på slutten av alle sidetitler, f.eks. "| Bedrift AS". Arves ikke automatisk av nye sider.',
    }),
    ...createOGFields({
      ogTitleFieldTitle: "Standard tittel for deling",
      ogTitleFieldDescription:
        "Dette er tittelen som vises når nettsiden deles på sosiale medier (Facebook, LinkedIn osv.) Bør være fengende og under 60 tegn. Arves av nye sider.",

      ogDescriptionFieldTitle: "Standard beskrivelse for deling",
      ogDescriptionFieldDescription:
        "En kort oppsummering som vises under tittelen ved deling. Hold den mellom 50 og 160 tegn. Arves av nye sider.",

      ogImageFieldTitle: "Standard bilde for sosiale medier",
      ogImageFieldDescription:
        "Dette bildet vises som forhåndsvisning ved deling. Anbefalt størrelse er 1200x630 piksler. Arves av nye sider.",
    }),

    defineField({
      name: "robots",
      title: "Robots-direktiv",
      type: "string",
      group: GROUP.SEO,
      description:
        "Kontrollerer hvordan søkemotorer indekserer nettsidene som standard.",
      options: {
        list: [
          {
            title: "Indekser og følg lenker (anbefalt)",
            value: "index,follow",
          },
          { title: "Ikke indekser, men følg lenker", value: "noindex,follow" },
          {
            title: "Ikke indekser og ikke følg lenker",
            value: "noindex,nofollow",
          },
        ],
        layout: "radio",
      },
      initialValue: "index,follow",
    }),
    defineField({
      name: "googleSiteVerification",
      title: "Google Search Console-bekreftelse",
      type: "string",
      group: GROUP.SEO,
      description:
        "Bekreftelseskode fra Google Search Console (kun meta-tagen, ikke hele tagen).",
    }),
    defineField({
      name: "schemaType",
      title: "Virksomhetstype",
      type: "string",
      group: GROUP.STRUCTURED_DATA,
      options: {
        list: [
          { title: "Organisasjon (Generell)", value: "Organization" },
          {
            title: "Lokal bedrift (Fysisk butikk/kontor)",
            value: "LocalBusiness",
          },
        ],
        layout: "radio",
      },
      initialValue: "Organization",
    }),

    defineField({
      name: "orgName",
      title: "Navn på virksomhet",
      type: "string",
      group: GROUP.STRUCTURED_DATA,
      description: "Navnet slik det skal vises i Google Knowledge Graph.",
    }),

    defineField({
      name: "orgLogo",
      title: "Logo",
      type: "image",
      group: GROUP.STRUCTURED_DATA,
      description: "Anbefalt minimum 112x112 piksler.",
    }),

    defineField({
      name: "orgUrl",
      title: "Hjemmeside-URL",
      type: "url",
      group: GROUP.STRUCTURED_DATA,
      placeholder: "https://www.domene.no",
    }),

    // Local Business specific fields (shown only if Type is LocalBusiness)
    defineField({
      name: "location",
      title: "Adresse",
      type: "object",
      group: GROUP.STRUCTURED_DATA,
      hidden: ({ document }) => document?.schemaType !== "LocalBusiness",
      fields: [
        { name: "street", type: "string", title: "Gateadresse" },
        { name: "postalCode", type: "string", title: "Postnummer" },
        { name: "city", type: "string", title: "Poststed" },
      ],
    }),

    defineField({
      name: "socialLinks",
      title: "Sosiale profiler",
      type: "array",
      group: GROUP.STRUCTURED_DATA,
      of: [{ type: "url" }],
      description: "Lenker til Facebook, Instagram, LinkedIn osv.",
    }),
  ],
  preview: {
    prepare() {
      return { title: "Søkemotoroptimalisering" };
    },
  },
});
