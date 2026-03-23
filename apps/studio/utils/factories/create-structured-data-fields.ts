import { defineField } from "sanity";
import { GroupValue } from "../constant";
import { PageSchemaInput } from "@/components/inputs/schema-org-select-field";

interface CreateStructuredDataFieldsOptions {
  isDefault?: boolean;
  isSite?: boolean;
  isPage?: boolean;
  group?: GroupValue;
}

const DEFAULTS = {
  structuredData: {
    title: "Strukturerte data (JSON-LD)",
    description:
      "Schema.org-data som hjelper søkemotorer å forstå innholdet og vise rike resultater.",
  },
};

export const createStructuredDataFields = (
  options: CreateStructuredDataFieldsOptions = {},
) => {
  const { isDefault, isSite, group = undefined } = options;

  // ─── Site-level: Organization + WebSite schema ──────────────────────────
  if (isSite || isDefault) {
    return [
      defineField({
        name: "structuredData",
        title: "Strukturerte data for nettstedet",
        description:
          "Definerer organisasjon og nettsted for Google Knowledge Panel og nettstedslenker.",
        type: "object",
        group,
        fields: [
          // Organization
          {
            name: "organization",
            title: "Organisasjon (schema.org/Organization)",
            description:
              "Informasjon som vises i Googles Knowledge Panel for bedriften.",
            type: "object",
            fields: [
              {
                name: "name",
                title: "Navn",
                description: "Offisielt organisasjonsnavn.",
                type: "string",
                validation: (Rule: any) =>
                  Rule.required().warning(
                    "Organisasjonsnavn er viktig for Knowledge Panel.",
                  ),
              },
              {
                name: "legalName",
                title: "Juridisk navn",
                description: "Formelt registrert firmanavn (valgfritt).",
                type: "string",
              },
              {
                name: "url",
                title: "Nettside-URL",
                description: "Hovedadressen til nettstedet.",
                type: "url",
              },
              {
                name: "logo",
                title: "Logo",
                description:
                  "Organisasjonens logo. Anbefalt min. 112x112px, kvadratisk.",
                type: "image",
                options: { hotspot: true },
              },
              {
                name: "description",
                title: "Beskrivelse",
                description: "Kort beskrivelse av organisasjonen.",
                type: "text",
                rows: 3,
              },
              {
                name: "foundingDate",
                title: "Grunnlagt",
                description: "Dato organisasjonen ble grunnlagt (YYYY-MM-DD).",
                type: "date",
              },
              {
                name: "contactPoint",
                title: "Kontaktinformasjon",
                type: "object",
                fields: [
                  {
                    name: "telephone",
                    title: "Telefon",
                    type: "string",
                  },
                  {
                    name: "email",
                    title: "E-post",
                    type: "string",
                  },
                  {
                    name: "contactType",
                    title: "Type",
                    type: "string",
                    options: {
                      list: [
                        { title: "Kundeservice", value: "customer service" },
                        {
                          title: "Teknisk support",
                          value: "technical support",
                        },
                        { title: "Salg", value: "sales" },
                        { title: "Fakturering", value: "billing support" },
                      ],
                    },
                  },
                ],
              },
              {
                name: "address",
                title: "Adresse",
                type: "object",
                fields: [
                  {
                    name: "streetAddress",
                    title: "Gateadresse",
                    type: "string",
                  },
                  { name: "postalCode", title: "Postnummer", type: "string" },
                  { name: "addressLocality", title: "Sted", type: "string" },
                  {
                    name: "addressRegion",
                    title: "Region/Fylke",
                    type: "string",
                  },
                  {
                    name: "addressCountry",
                    title: "Land (ISO 3166-1)",
                    description: 'F.eks. "NO", "SE", "US".',
                    type: "string",
                  },
                ],
              },
              {
                name: "sameAs",
                title: "Sosiale profiler",
                description:
                  "URLer til offisielle profiler (Facebook, LinkedIn, X/Twitter, Instagram, etc.).",
                type: "array",
                of: [{ type: "url" }],
              },
            ],
          },

          // WebSite (for sitelinks search box)
          {
            name: "website",
            title: "Nettsted (schema.org/WebSite)",
            description: "Aktiverer søkeboks i Google-søkeresultater.",
            type: "object",
            fields: [
              {
                name: "name",
                title: "Nettstedsnavn",
                description: "Vises i Googles søkeresultater over URLen.",
                type: "string",
              },
              {
                name: "alternateName",
                title: "Alternativt navn",
                description:
                  "Alternativt eller forkortet navn (f.eks. akronym).",
                type: "string",
              },
              {
                name: "searchUrlTemplate",
                title: "Søke-URL-mal",
                description:
                  'URL-mal for intern søkeside. Bruk {search_term_string} som plassholder, f.eks. "https://example.com/sok?q={search_term_string}".',
                type: "string",
              },
            ],
          },
        ],
      }),
    ];
  }

  // ─── Page-level: flexible per-page schema ──────────────────────────────
  return [
    defineField({
      name: "structuredData",
      title: DEFAULTS.structuredData.title,
      description: DEFAULTS.structuredData.description,
      type: "object",
      group,
      fields: [
        {
          name: "enabled",
          title: "Aktiver strukturerte data",
          description: "Slå på for å legge til JSON-LD på denne siden.",
          type: "boolean",
          initialValue: false,
        },
        {
          name: "type",
          title: "Schema-type",
          description:
            'Velg schema.org-typen som best beskriver sidens innhold. NB!: Feltet inneholder alle typer, hentet fra https://schema.org/. Typer markert med "✨" er anbefalt basert på konteksten.',
          type: "string",
          components: {
            input: PageSchemaInput,
          },
          hidden: ({ parent }: { parent?: { enabled?: boolean } }) =>
            !parent?.enabled,
        },

        // ── Article / BlogPosting / NewsArticle ────────────────────────
        {
          name: "article",
          title: "Artikkeldata",
          type: "object",
          hidden: ({
            parent,
          }: {
            parent?: { enabled?: boolean; type?: string };
          }) =>
            !parent?.enabled ||
            !["Article", "BlogPosting", "NewsArticle"].includes(
              parent?.type ?? "",
            ),
          fields: [
            { name: "headline", title: "Overskrift", type: "string" },
            {
              name: "datePublished",
              title: "Publiseringsdato",
              type: "datetime",
            },
            { name: "dateModified", title: "Sist oppdatert", type: "datetime" },
            {
              name: "authorName",
              title: "Forfatter",
              type: "string",
            },
            {
              name: "authorUrl",
              title: "Forfatter-URL",
              description: "Lenke til forfatterens profil.",
              type: "url",
            },
            {
              name: "publisherName",
              title: "Utgiver",
              description:
                "Organisasjonens navn (arves fra nettstedinnstillinger om tomt).",
              type: "string",
            },
          ],
        },

        // ── Product ────────────────────────────────────────────────────
        {
          name: "product",
          title: "Produktdata",
          type: "object",
          hidden: ({
            parent,
          }: {
            parent?: { enabled?: boolean; type?: string };
          }) => !parent?.enabled || parent?.type !== "Product",
          fields: [
            { name: "name", title: "Produktnavn", type: "string" },
            {
              name: "description",
              title: "Beskrivelse",
              type: "text",
              rows: 3,
            },
            { name: "sku", title: "SKU / Varenummer", type: "string" },
            { name: "brand", title: "Merkevare", type: "string" },
            {
              name: "price",
              title: "Pris",
              type: "number",
            },
            {
              name: "priceCurrency",
              title: "Valuta (ISO 4217)",
              description: 'F.eks. "NOK", "USD", "EUR".',
              type: "string",
              initialValue: "NOK",
            },
            {
              name: "availability",
              title: "Tilgjengelighet",
              type: "string",
              options: {
                list: [
                  { title: "På lager", value: "https://schema.org/InStock" },
                  { title: "Utsolgt", value: "https://schema.org/OutOfStock" },
                  {
                    title: "Forhåndsbestilling",
                    value: "https://schema.org/PreOrder",
                  },
                  { title: "Utgått", value: "https://schema.org/Discontinued" },
                ],
              },
            },
            {
              name: "additionalProperties",
              title: "Ekstra egenskaper",
              type: "array",
              of: [
                {
                  type: "object",
                  title: "Ekstra egenskap",
                  fields: [
                    { name: "name", title: "Navn", type: "string" },
                    { name: "value", title: "Verdi", type: "string" },
                  ],
                  preview: {
                    select: { title: "name" },
                  },
                },
              ],
            },
            {
              name: "ratingValue",
              title: "Vurdering (1-5)",
              type: "number",
              validation: (Rule: any) => Rule.min(1).max(5),
            },
            {
              name: "reviewCount",
              title: "Antall anmeldelser",
              type: "number",
              validation: (Rule: any) => Rule.min(0).integer(),
            },
          ],
        },

        // ── FAQPage ────────────────────────────────────────────────────
        {
          name: "faq",
          title: "Spørsmål og svar",
          type: "array",
          hidden: ({
            parent,
          }: {
            parent?: { enabled?: boolean; type?: string };
          }) => !parent?.enabled || parent?.type !== "FAQPage",
          of: [
            {
              type: "object",
              title: "Spørsmål",
              fields: [
                {
                  name: "question",
                  title: "Spørsmål",
                  type: "string",
                  validation: (Rule: any) => Rule.required(),
                },
                {
                  name: "answer",
                  title: "Svar",
                  type: "text",
                  rows: 4,
                  validation: (Rule: any) => Rule.required(),
                },
              ],
              preview: {
                select: { title: "question" },
              },
            },
          ],
        },

        // ── Event ──────────────────────────────────────────────────────
        {
          name: "event",
          title: "Arrangementsdata",
          type: "object",
          hidden: ({
            parent,
          }: {
            parent?: { enabled?: boolean; type?: string };
          }) => !parent?.enabled || parent?.type !== "Event",
          fields: [
            { name: "name", title: "Arrangementsnavn", type: "string" },
            { name: "startDate", title: "Startdato", type: "datetime" },
            { name: "endDate", title: "Sluttdato", type: "datetime" },
            { name: "locationName", title: "Sted / Venue", type: "string" },
            { name: "locationAddress", title: "Adresse", type: "string" },
            {
              name: "eventAttendanceMode",
              title: "Deltakelsesmodus",
              type: "string",
              options: {
                list: [
                  {
                    title: "Fysisk",
                    value: "https://schema.org/OfflineEventAttendanceMode",
                  },
                  {
                    title: "Online",
                    value: "https://schema.org/OnlineEventAttendanceMode",
                  },
                  {
                    title: "Hybrid",
                    value: "https://schema.org/MixedEventAttendanceMode",
                  },
                ],
              },
            },
            {
              name: "eventStatus",
              title: "Status",
              type: "string",
              options: {
                list: [
                  {
                    title: "Planlagt",
                    value: "https://schema.org/EventScheduled",
                  },
                  {
                    title: "Avlyst",
                    value: "https://schema.org/EventCancelled",
                  },
                  {
                    title: "Utsatt",
                    value: "https://schema.org/EventPostponed",
                  },
                  {
                    title: "Flyttet online",
                    value: "https://schema.org/EventMovedOnline",
                  },
                ],
              },
            },
            {
              name: "organizerName",
              title: "Arrangør",
              type: "string",
            },
            {
              name: "offerPrice",
              title: "Pris",
              type: "number",
            },
            {
              name: "offerCurrency",
              title: "Valuta (ISO 4217)",
              type: "string",
              initialValue: "NOK",
            },
            {
              name: "offerUrl",
              title: "Billett-URL",
              type: "url",
            },
          ],
        },

        // ── LocalBusiness ──────────────────────────────────────────────
        {
          name: "localBusiness",
          title: "Lokal bedrift",
          type: "object",
          hidden: ({
            parent,
          }: {
            parent?: { enabled?: boolean; type?: string };
          }) => !parent?.enabled || parent?.type !== "LocalBusiness",
          fields: [
            { name: "name", title: "Bedriftsnavn", type: "string" },
            {
              name: "description",
              title: "Beskrivelse",
              type: "text",
              rows: 3,
            },
            { name: "telephone", title: "Telefon", type: "string" },
            { name: "email", title: "E-post", type: "string" },
            { name: "streetAddress", title: "Gateadresse", type: "string" },
            { name: "postalCode", title: "Postnummer", type: "string" },
            { name: "addressLocality", title: "Sted", type: "string" },
            {
              name: "addressCountry",
              title: "Land (ISO 3166-1)",
              type: "string",
            },
            {
              name: "geo",
              title: "Koordinater",
              type: "object",
              fields: [
                { name: "latitude", title: "Breddegrad", type: "number" },
                { name: "longitude", title: "Lengdegrad", type: "number" },
              ],
            },
            {
              name: "priceRange",
              title: "Prisklasse",
              description: 'F.eks. "$$", "NOK 200-500".',
              type: "string",
            },
            {
              name: "openingHours",
              title: "Åpningstider",
              description:
                'Én oppføring per periode, f.eks. "Mo-Fr 09:00-17:00".',
              type: "array",
              of: [{ type: "string" }],
            },
          ],
        },

        // ── VideoObject ────────────────────────────────────────────────
        {
          name: "video",
          title: "Videodata",
          type: "object",
          hidden: ({
            parent,
          }: {
            parent?: { enabled?: boolean; type?: string };
          }) => !parent?.enabled || parent?.type !== "VideoObject",
          fields: [
            { name: "name", title: "Videotittel", type: "string" },
            {
              name: "description",
              title: "Beskrivelse",
              type: "text",
              rows: 3,
            },
            { name: "uploadDate", title: "Opplastingsdato", type: "datetime" },
            {
              name: "duration",
              title: "Varighet (ISO 8601)",
              description: 'F.eks. "PT1H30M"',
              type: "string",
            },
            { name: "contentUrl", title: "Video-URL", type: "url" },
            { name: "embedUrl", title: "Embed-URL", type: "url" },
            { name: "thumbnailUrl", title: "Miniatyrbilde-URL", type: "url" },
          ],
        },

        // ── HowTo ──────────────────────────────────────────────────────
        {
          name: "howTo",
          title: "Fremgangsmåte (steg)",
          type: "object",
          hidden: ({
            parent,
          }: {
            parent?: { enabled?: boolean; type?: string };
          }) => !parent?.enabled || parent?.type !== "HowTo",
          fields: [
            { name: "name", title: "Tittel", type: "string" },
            {
              name: "description",
              title: "Kort beskrivelse",
              type: "text",
              rows: 2,
            },
            {
              name: "totalTime",
              title: "Total tid (ISO 8601)",
              description: 'F.eks. "PT30M" for 30 minutter.',
              type: "string",
            },
            {
              name: "steps",
              title: "Steg",
              type: "array",
              of: [
                {
                  type: "object",
                  title: "Steg",
                  fields: [
                    { name: "name", title: "Stegtittel", type: "string" },
                    {
                      name: "text",
                      title: "Beskrivelse",
                      type: "text",
                      rows: 2,
                    },
                  ],
                  preview: {
                    select: { title: "name" },
                  },
                },
              ],
            },
          ],
        },

        // ── Custom JSON-LD ─────────────────────────────────────────────
        {
          name: "customJsonLd",
          title: "Egendefinert JSON-LD",
          description:
            "Lim inn rå JSON-LD for schema-typer som ikke har egne felt. Må være gyldig JSON.",
          type: "text",
          rows: 10,
          hidden: ({
            parent,
          }: {
            parent?: { enabled?: boolean; type?: string };
          }) => !parent?.enabled || parent?.type !== "Custom",
          validation: (Rule: any) =>
            Rule.custom((value: string | undefined) => {
              if (!value) return true;
              try {
                const parsed = JSON.parse(value);
                if (!parsed["@type"]) {
                  return 'JSON-LD mangler "@type"-felt.';
                }
                return true;
              } catch {
                return "Ugyldig JSON. Kontroller syntaksen.";
              }
            }),
        },
      ],
    }),
  ];
};
