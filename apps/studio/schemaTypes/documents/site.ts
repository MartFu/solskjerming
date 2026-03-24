import { GROUP, GROUPS, WORKSPACES } from "@/utils/constant";
import { createIntegrationFields } from "@/utils/factories/create-integration-fields";
import { EarthGlobeIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";
import { SlugDomainInput } from "@/components/inputs/slug-domain-input";
import { enabledPackagesField } from "../definitions/enabled-packages";
import { DOCUMENT_NAMES } from "../constant";

export const site = defineType({
    name: DOCUMENT_NAMES.site,
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
            description:
                "Navnet på nettsiden slik det vises internt og i titler.",
            validation: (Rule) => Rule.required(),
        }),
        // #TODO -> When a site is created, automatically create a homePage
        defineField({
            name: "homePage",
            title: "Forside",
            type: "reference",
            to: [{ type: DOCUMENT_NAMES.page }],
            group: GROUP.IDENTITY,
            description:
                "Siden som vises på rotnivå (/). Må settes for at nettstedet skal fungere korrekt.",
            options: {
                filter: ({ document }) => {
                    const siteId = document._id.replace("drafts.", "");

                    return {
                        filter: "site._ref == $siteId",
                        params: { siteId },
                    };
                },
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
                            const pattern =
                                /^[a-zA-Z0-9æøåäöüé-]+\.(no|se|dk)$/;
                            if (!pattern.test(value)) {
                                return "Vennligst oppgi et gyldig .no, .se eller .dk-domene";
                            }
                            return true;
                        }),
                }),
            ],
        }),

        // ── COOKIE CONSENT ──────────────────────────────────────────────────
        defineField({
            name: "cookieBanner",
            title: "Cookiebanner",
            type: "cookies",
            group: GROUP.COOKIES,
        }),

        // ── SOME ──────────────────────────────────────────────────
        defineField({
            name: "socialLinks",
            title: "Sosiale medier",
            type: "defaultSocials",
            group: GROUP.SOME,
        }),

        // ── ORGANIZATION ──────────────────────────────────────────
        defineField({
            name: "organization",
            title: "Organisasjon",
            description:
                "Definer organisasjonens identitet så nøyaktig som mulig",
            type: "organization",
            group: GROUP.ORGANIZATION,
        }),

        // ── SEO ───────────────────────────────────────────────────
        defineField({
            name: "SEO",
            title: "SEO",
            type: "siteSEO",
            group: GROUP.SEO,
        }),

        // ── THEME ─────────────────────────────────────────────────
        defineField({
            title: "Tema",
            description: "Velg en visuell stil for denne nettsiden.",
            name: "theme",
            type: "theme",
            group: GROUP.THEME,
        }),

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
            description:
                "Du trenger ikke å foreta deg noe her. Feltet er skrivebeskyttet for å sikre dataintegritet. Dersom feltet ikke er forhåndsutfylt med nåværende arbeidsrom eller tomt, er det tekniske problemer med studioet internt.",
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
                subtitle:
                    workspace.slice(0, 1).toUpperCase() + workspace.slice(1),
            };
        },
    },
});
