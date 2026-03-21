import { defineField } from "sanity";
import { GROUP, GroupValue } from "../constant";

interface CreateRobotsFieldsOptions {
  isDefault?: boolean;
  isSite?: boolean;
  isPage?: boolean;
  group?: GroupValue;
}

const DEFAULTS = {
  robots: {
    title: "Søkemotorkontroll (Robots)",
    description:
      "Styr hvordan søkemotorer indekserer og følger lenker på siden.",
  },
  noIndex: {
    title: "noindex",
    description: "Skjul siden fra søkeresultater.",
  },
  noFollow: {
    title: "nofollow",
    description: "Be søkemotorer ikke å følge lenker på siden.",
  },
  noArchive: {
    title: "noarchive",
    description: "Hindre at søkemotorer lagrer en bufret kopi av siden.",
  },
  noImageIndex: {
    title: "noimageindex",
    description: "Hindre at bilder på siden vises i Google Bildesøk.",
  },
  maxSnippet: {
    title: "max-snippet",
    description:
      "Maks antall tegn i tekstutdrag i søkeresultater. -1 = ingen grense.",
  },
  maxImagePreview: {
    title: "max-image-preview",
    description: "Maks størrelse på bildeforhåndsvisning i søkeresultater.",
  },
  maxVideoPreview: {
    title: "max-video-preview",
    description:
      "Maks antall sekunder for videoforhåndsvisning. -1 = ingen grense.",
  },
};

export const createRobotsFields = (options: CreateRobotsFieldsOptions = {}) => {
  const { isDefault, isSite, isPage, group = undefined } = options;

  const DEFAULT = {
    robots: {
      title: isDefault ? "Standard robots-innstillinger" : "Robots-innstillinger",
      description: isDefault ? "Globale standarder for hele nettstedet. Individuelle sider kan overstyre disse." : "Sidens robots-innstillinger"
    },
  };


  // Default/site-level: broad controls that set baseline for all pages
  if (isDefault || isSite) {
    return [
      defineField({
        name: "robots",
        title: DEFAULT.robots.title,
        description: DEFAULT.robots.description,
        type: "object",
        group,
        fields: [
          {
            name: "maxSnippet",
            title: DEFAULTS.maxSnippet.title,
            description: DEFAULTS.maxSnippet.description,
            type: "number",
            initialValue: -1,
          },
          {
            name: "maxImagePreview",
            title: DEFAULTS.maxImagePreview.title,
            description: DEFAULTS.maxImagePreview.description,
            type: "string",
            options: {
              list: [
                { title: "Ingen", value: "none" },
                { title: "Standard", value: "standard" },
                { title: "Stor (anbefalt)", value: "large" },
              ],
            },
            initialValue: "large",
          },
          {
            name: "maxVideoPreview",
            title: DEFAULTS.maxVideoPreview.title,
            description: DEFAULTS.maxVideoPreview.description,
            type: "number",
            initialValue: -1,
          },
        ],
      }),
    ];
  }

  // Page-level: full control over indexing, crawling, and snippets
  return [
    defineField({
      name: "robots",
      title: DEFAULTS.robots.title,
      description: DEFAULTS.robots.description,
      type: "object",
      group,
      options: { columns: 2, collapsible: true, collapsed: true },
      fields: [
        {
          name: "noIndex",
          title: DEFAULTS.noIndex.title,
          description: DEFAULTS.noIndex.description,
          type: "boolean",
          initialValue: false,
        },
        {
          name: "noFollow",
          title: DEFAULTS.noFollow.title,
          description: DEFAULTS.noFollow.description,
          type: "boolean",
          initialValue: false,
        },
        {
          name: "noArchive",
          title: DEFAULTS.noArchive.title,
          description: DEFAULTS.noArchive.description,
          type: "boolean",
          initialValue: false,
        },
        {
          name: "noImageIndex",
          title: DEFAULTS.noImageIndex.title,
          description: DEFAULTS.noImageIndex.description,
          type: "boolean",
          initialValue: false,
        },
        {
          name: "maxSnippet",
          title: DEFAULTS.maxSnippet.title,
          description:
            DEFAULTS.maxSnippet.description +
            " La stå tom for å arve global standard.",
          type: "number",
        },
        {
          name: "maxImagePreview",
          title: DEFAULTS.maxImagePreview.title,
          description:
            DEFAULTS.maxImagePreview.description +
            " La stå tom for å arve global standard.",
          type: "string",
          options: {
            list: [
              { title: "Ingen", value: "none" },
              { title: "Standard", value: "standard" },
              { title: "Stor", value: "large" },
            ],
          },
        },
        {
          name: "maxVideoPreview",
          title: DEFAULTS.maxVideoPreview.title,
          description:
            DEFAULTS.maxVideoPreview.description +
            " La stå tom for å arve global standard.",
          type: "number",
        },
      ],
      validation: (Rule) =>
        Rule.custom((value) => {
          const v = value as
            | { noIndex?: boolean; noFollow?: boolean }
            | undefined;

          if (v?.noIndex && !v?.noFollow) {
            return {
              message:
                "Siden er satt til noindex men lenker følges fortsatt. Vurder om nofollow også bør aktiveres.",
              level: "warning",
            };
          }
          return true;
        }),
    }),

    // Separate hideFromLists since it's app-level, not a robots directive
    ...(isPage
      ? [
          defineField({
            name: "hideFromLists",
            title: "Skjul fra lister",
            description:
              "Skjuler siden fra interne lister og navigasjon, men den er fortsatt tilgjengelig via direktelenke.",
            type: "boolean",
            initialValue: false,
            group,
          }),
        ]
      : []),
  ];
};

/**
 * Helper: Build the robots meta content string from a robots object.
 * Useful in your frontend's <head> rendering.
 *
 * @example
 * const content = buildRobotsContent(page.robots, siteDefaults.robots);
 * // → "noindex, nofollow, max-snippet:-1, max-image-preview:large"
 */
export const buildRobotsContent = (
  pageRobots?: {
    noIndex?: boolean;
    noFollow?: boolean;
    noArchive?: boolean;
    noImageIndex?: boolean;
    maxSnippet?: number;
    maxImagePreview?: string;
    maxVideoPreview?: number;
  },
  siteDefaults?: {
    maxSnippet?: number;
    maxImagePreview?: string;
    maxVideoPreview?: number;
  },
): string => {
  const directives: string[] = [];

  if (pageRobots?.noIndex) directives.push("noindex");
  if (pageRobots?.noFollow) directives.push("nofollow");
  if (pageRobots?.noArchive) directives.push("noarchive");
  if (pageRobots?.noImageIndex) directives.push("noimageindex");

  const maxSnippet = pageRobots?.maxSnippet ?? siteDefaults?.maxSnippet;
  if (maxSnippet !== undefined) {
    directives.push(`max-snippet:${maxSnippet}`);
  }

  const maxImg = pageRobots?.maxImagePreview ?? siteDefaults?.maxImagePreview;
  if (maxImg) {
    directives.push(`max-image-preview:${maxImg}`);
  }

  const maxVid = pageRobots?.maxVideoPreview ?? siteDefaults?.maxVideoPreview;
  if (maxVid !== undefined) {
    directives.push(`max-video-preview:${maxVid}`);
  }

  return directives.length > 0 ? directives.join(", ") : "index, follow";
};
