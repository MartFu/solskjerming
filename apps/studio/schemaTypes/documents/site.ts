import { GROUP, GROUPS, WORKSPACES } from "@/utils/constant";
import { createIntegrationFields } from "@/utils/factories/create-integration-fields";
import { createOrganizationFields } from "@/utils/factories/create-organization-fields";
import { createOGFields, createSocialFields } from "@/utils/factories";
import { createSEOFields } from "@/utils/factories";
import { EarthGlobeIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

import { ThemePresetFieldInput } from "@/components/inputs/theme-preset-field-input";
import {
  optionalColorModeField,
  optionalRadiusField,
} from "@/schemaTypes/definitions/theme-tokens";
import { SlugDomainInput } from "@/components/inputs/slug-domain-input";
import { enabledPackagesField } from "../definitions/enabled-packages";

export const site = defineType({
  name: "site",
  title: "Nettside",
  type: "document",
  groups: GROUPS(GROUP.IDENTITY),
  icon: EarthGlobeIcon,
  fields: [
    // ── IDENTITY ──────────────────────────────────────────────
    defineField({
      name: "title",
      title: "Tittel",
      type: "string",
      group: GROUP.IDENTITY,
      description: "Navnet på nettsiden slik det vises internt og i titler.",
      validation: (Rule) => Rule.required(),
    }),
    // #TODO -> When a site is created, automatically create a homePage
    defineField({
      name: "homePage",
      title: "Forside",
      type: "reference",
      to: [{ type: "page" }],
      group: GROUP.IDENTITY,
      description:
        "Siden som vises på rotnivå (/). Må settes for at nettstedet skal fungere korrekt.",
      options: {
        filter: ({ document }) => ({
          filter: "site._ref == $siteId",
          params: { siteId: document._id },
        }),
      },
      validation: (Rule) =>
        Rule.required().error(
          "Forside er påkrevd for riktig routing. Dersom du ignorerer denne feilen risikerer du at nettsiden ikke fungerer.",
        ),
    }),
    { ...enabledPackagesField, group: GROUP.IDENTITY },
    defineField({
      name: "siteIdentity",
      title: "Nettadresse",
      group: GROUP.IDENTITY,
      type: "object",
      components: {
        input: SlugDomainInput,
      },
      fields: [
        defineField({
          name: "slug",
          title: "Nettadresse-ID",
          type: "slug",
          description:
            "ID som brukes for teknisk identifikasjon og forhåndsvisning.",
          options: {
            source: "title",
            slugify: (input: string) =>
              input
                .toLowerCase()
                .trim()
                .replace(/\s+/g, "-")
                .replace(/[^a-z0-9-]/g, ""),
          },
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: "domain",
          title: "Domene",
          type: "string",
          description: "Produksjonsdomene (f.eks. domene.no).",
          validation: (Rule) =>
            Rule.custom((value) => {
              if (!value) return true;
              const pattern = /^[a-zA-Z0-9æøåäöüé-]+\.(no|se|dk)$/;
              if (!pattern.test(value)) {
                return "Vennligst oppgi et gyldig .no, .se eller .dk-domene";
              }
              return true;
            }),
        }),
      ],
    }),

    // ── SOME ──────────────────────────────────────────────────
    ...createSocialFields(),

    // ── ORGANIZATION ──────────────────────────────────────────
    ...createOrganizationFields(),

    // ── SEO ───────────────────────────────────────────────────
    ...createSEOFields({
      seoTitleFieldTitle: "Sidetittel (SEO)",
      seoTitleFieldDescription: "Tittelen som vises i søkeresultater.",
      seoDescriptionFieldTitle: "Beskrivelse (SEO)",
      seoDescriptionFieldDescription:
        "Kort tekst som oppsummerer siden for søkemotorer.",
    }),
    ...createOGFields({
      ogTitleFieldDescription:
        "Tittel optimalisert for deling på sosiale medier.",
      ogDescriptionFieldDescription:
        "Beskrivelse optimalisert for deling på sosiale medier.",
      ogImageFieldDescription: "Bilde som inkluderes når lenken deles.",
    }),

    // ── THEME ─────────────────────────────────────────────────
    defineField({
      name: "themePreset",
      title: "CSS Variabler",
      description: "Velg en visuell stil for denne nettsiden.",
      type: "string",
      group: GROUP.THEME,
      components: { input: ThemePresetFieldInput },
    }),
    { ...optionalColorModeField("light"), group: GROUP.THEME },
    { ...optionalColorModeField("dark"), group: GROUP.THEME },
    { ...optionalRadiusField, group: GROUP.THEME },

    // ── INTEGRATIONS ──────────────────────────────────────────
    ...createIntegrationFields({
      googleAnalyticsIdDescription:
        "Måle-ID for Google Analytics 4 (f.eks. G-XXXXXXXXXX).",
      gtmContainerIdDescription:
        "Container-ID for Google Tag Manager (f.eks. GTM-XXXXXXX).",
      facebookPixelIdDescription: "ID for Facebook/Meta Pixel-sporing.",
    }),

    // ── LEGAL ─────────────────────────────────────────────────
    defineField({
      name: "legalDocuments",
      title: "Juridiske dokumenter",
      type: "array",
      of: [{ type: "reference", to: [{ type: "documentation" }] }],
      group: GROUP.LEGAL,
      description:
        "Referanser til vilkår, personvern og andre juridiske tekster.",
    }),

    // ── RELATIONSHIPS ─────────────────────────────────────────
    defineField({
      name: "workspace",
      title: "Arbeidsrom",
      type: "string",
      group: GROUP.RELATIONSHIPS,
      readOnly: true,
      options: {
        list: WORKSPACES.map(({ title, value }) => ({ title, value })),
      },
      validation: (Rule) => Rule.required(),
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
          `${title.slice(0, 1).toUpperCase() + title.slice(1)}` ||
          "Nettsted uten tittel",
        subtitle: workspace.slice(0, 1).toUpperCase() + workspace.slice(1),
      };
    },
  },
});
