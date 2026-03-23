import {  WorkspaceKey } from "@/utils/constant";
import { API_VERSION } from "@/utils/env";

import type { SanityClient, SourceClientOptions, Template } from "sanity";

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

export const from = <T>(source: T | null | undefined, pick: (s: T) => object) =>
  source ? pick(source) : {};

// ─────────────────────────────────────────────────────────────
// Template types
// ─────────────────────────────────────────────────────────────

interface SiteParams {
  siteId: string;
}

interface ChildParams {
  siteId: string;
  parentId: string;
}

interface WorkspaceParams {
  workspace: WorkspaceKey;
}

type SiteTemplateParams = {
  workspace: WorkspaceKey;
  getClient: (options: SourceClientOptions) => SanityClient;
};

export const siteTemplate: Template<SiteTemplateParams> = {
  id: "site-template",
  title: "Nettsted",
  schemaType: "site",
  value: async ({
    workspace,
    getClient,
  }: SiteTemplateParams) => {
    console.log("--- using site-template ---")
    console.log("--- with params", workspace, getClient)

    const client = getClient({ apiVersion: API_VERSION });

    const globals = await client.fetch<{
      org: any;
      seo: any;
      theme: any;
      integrations: any;
      compliance: any;
      structuredData: any;
      robots: any;
      // org: GlobalOrganization;
      // seo: GlobalSeo;
      // theme: GlobalTheme;
      // integrations: GlobalIntegrations;
      // compliance: GlobalCompliance;
      // structuredData: GlobalStructuredData;
      // robots: GlobalRobots;
    }>(`{
      "org":            *[_type == "globalOrganization"][0],
      "seo":            *[_type == "globalSeo"][0],
      "compliance":     *[_type == "globalCompliance"][0],
      "theme":          *[_type == "globalTheme"][0],
      "integrations":   *[_type == "globalIntegrations"][0],
      "structuredData": *[_type == "globalstructuredData"][0],
      "robots":         *[_type == "globalRobots"][0],
    }`);

    const rekey = (arr: any[] | undefined) =>
      (arr ?? []).map(({ _key, ...rest }: any) => ({
        ...rest,
        _key: crypto.randomUUID().slice(0, 8),
      }));

    const {
      org,
      seo,
      theme,
      integrations,
      compliance,
      robots: robotsDoc,
      structuredData: structuredDataDoc,
    } = globals;

    return {
      // ── Organization ──
      ...from(
        org,
        ({
          name,
          organizationNumber,
          email,
          phone,
          address,
          linkedin,
          facebook,
          instagram,
          youtube,
          twitter,
          favicon,
          logo,
        }) => ({
          name,
          organizationNumber,
          email,
          phone,
          address,
          linkedin,
          facebook,
          instagram,
          youtube,
          twitter,
          favicon,
          logo,
        }),
      ),

      // ── SEO ──
      ...from(
        seo,
        ({
          metaTitle,
          metaDescription,
          googleSiteVerification,
          ogTitle,
          ogDescription,
          ogImage,
        }) => ({
          seoTitle: metaTitle,
          seoDescription: metaDescription,
          googleSiteVerification,
          ogTitle,
          ogDescription,
          ogImage,
        }),
      ),

      // ── Theme ──
      ...from(theme, ({ light, dark }) => ({ light, dark })),

      // ── Robots ──
      ...from(robotsDoc?.robots, ({ maxSnippet, maxImagePreview, maxVideoPreview }) => ({
        maxSnippet,
        maxImagePreview,
        maxVideoPreview,
      })),

      // ── Structured Data ──
      ...from(structuredDataDoc?.structuredData, ({ organization, website }) => ({
        organization,
        website,
      })),

      // ── Integrations ──
      ...from(
        integrations,
        ({ googleAnalyticsId, gtmContainerId, facebookPixelId }) => ({
          googleAnalyticsId,
          gtmContainerId,
          facebookPixelId,
        }),
      ),

      // ── Compliance (cookies + legal) ──
      ...from(
        compliance,
        ({ bannerTitle, bannerDescription, categories, legalDocuments }) => ({
          bannerTitle,
          bannerDescription,
          categories: rekey(categories),
          legalDocuments: rekey(legalDocuments),
        }),
      ),

      workspace
    };
  },
};

// ─────────────────────────────────────────────────────────────
// Root / standalone types — created with a site reference
// ─────────────────────────────────────────────────────────────

const SITE_SCOPED_TYPES = [
  "page",
  "articleRoot",
  "catalogRoot",
  "navbar",
  "footer",
] as const;

function createSiteTemplates(): Template[] {
  console.log("-- createSiteTemplates --");
  return SITE_SCOPED_TYPES.map((type) => ({
    id: `${type}-with-site`,
    title: type.charAt(0).toUpperCase() + type.slice(1),
    schemaType: type,
    parameters: [{ name: "siteId", type: "string" as const }],
    value: (params: SiteParams) => ({
      site: {
        _type: "reference",
        _ref: params.siteId,
      },
    }),
  }));
}

// ─────────────────────────────────────────────────────────────
// Child types — created with both site and parent references
// ─────────────────────────────────────────────────────────────
// Each entry maps a child type to the root type it belongs to.
// The parent reference is set automatically when creating from
// within a root's children list in the structure.
// ─────────────────────────────────────────────────────────────

const CHILD_TYPE_MAP: { childType: string; parentType: string }[] = [
  { childType: "articlePage", parentType: "articleRoot" },
  { childType: "productPage", parentType: "catalogRoot" },
  // Add new child types here as packages are added.
];

function createChildTemplates(): Template[] {
  console.log("-- createChildTemplates --");
  return CHILD_TYPE_MAP.map(({ childType }) => ({
    id: `${childType}-with-parent`,
    title: childType.charAt(0).toUpperCase() + childType.slice(1),
    schemaType: childType,
    parameters: [
      { name: "siteId", type: "string" as const },
      { name: "parentId", type: "string" as const },
    ],
    value: (params: ChildParams) => {
      console.log("Template received params:", params);
      return {
        site: {
          _type: "reference",
          _ref: params.siteId,
        },
        parent: {
          _type: "reference",
          _ref: params.parentId,
        },
      };
    },
  }));
}

// ─────────────────────────────────────────────────────────────
// Page nesting — pages created as children of other pages
// ─────────────────────────────────────────────────────────────

function createPageNestingTemplate(): Template {
  console.log("-- createPageNestingTemplate --");
  return {
    id: "page-with-parent",
    title: "Underside",
    schemaType: "page",
    parameters: [
      { name: "siteId", type: "string" as const },
      { name: "parentId", type: "string" as const },
    ],
    value: (params: ChildParams) => {
      console.log("Template received params:", params);
      return {
        site: {
          _type: "reference",
          _ref: params.siteId,
        },
        parent: {
          _type: "reference",
          _ref: params.parentId === "" ? undefined : params.parentId,
        },
      };
    },
  };
}

// ─────────────────────────────────────────────────────────────
// Workspace-level templates
// ─────────────────────────────────────────────────────────────

function createWorkspaceTemplates(): Template[] {
  console.log("-- createWorkspaceDefaultTemplates --");
  return [
    {
      id: "workspaceDefault-template",
      title: "Standardinnstillinger",
      schemaType: "workspaceDefault",
      parameters: [{ name: "workspace", type: "string" as const }],
      value: (params: WorkspaceParams) => ({
        workspace: params.workspace,
        title: `${params.workspace.charAt(0).toUpperCase() + params.workspace.slice(1)} - Standardinnstillinger`,
      }),
    },
    {
      id: "site-template",
      title: "Nettsted",
      schemaType: "site",
      parameters: [{ name: "workspace", type: "string" as const }],
      value: (params: WorkspaceParams) => ({
        workspace: params.workspace,
      }),
    },
  ];
}



// Following your existing pattern
const cookieTemplate: Template = {
  id: "cookie-consent-with-defaults",
  title: "Cookie Samtykke med standardvalg",
  schemaType: "cookieConsent",
  // We don't necessarily need params here if the defaults are hardcoded,
  // but we could add some if we wanted to pass a Site ID.
  parameters: [{ name: "siteId", type: "string" as const }],
  value: (params: { siteId: string }) => ({
    // Pre-fill the site reference
    site: { _type: "reference", _ref: params.siteId },

    // PRE-FILLING THE ARRAY (This addresses your earlier "Defaults" goal)
    categories: [
      {
        _type: "category",
        label: "Nødvendige",
        isNecessary: true,
        id: { _type: "slug", current: "necessary" },
      },
      {
        _type: "category",
        label: "Analyse",
        isNecessary: false,
        id: { _type: "slug", current: "analytics" },
      },
    ],
  }),
};

// ─────────────────────────────────────────────────────────────
// Export: plug into sanity.config.ts templates callback
// ─────────────────────────────────────────────────────────────
//
// Usage in sanity.config.ts:
//
//   templates: (prev) => [...prev, ...initialValueTemplates],
//

export const initialValueTemplates: Template[] = [
  ...createSiteTemplates(),
  ...createChildTemplates(),
  createPageNestingTemplate(),
  ...createWorkspaceTemplates(),
  cookieTemplate,
  siteTemplate
];
