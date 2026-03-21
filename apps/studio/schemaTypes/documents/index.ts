// schemaTypes/documents/index.ts

// ─── Site config ─────────────────────────────────────────────────────────────
import { site } from "@/schemaTypes/documents/site";
import { redirect } from "@/schemaTypes/documents/redirect";

// ─── Site-scoped, routable documents ─────────────────────────────────────────
import {
  articlePage,
  articleRoot,
  catalogRoot,
  page,
  productPage,
} from "@/schemaTypes/documents/pages";

// ─── Site-scoped, non-routable documents ─────────────────────────────────────
import { footer } from "@/schemaTypes/documents/footer";
import { navbar } from "@/schemaTypes/documents/navbar";

// ─── Workspace-scoped shared assets ──────────────────────────────────────────
import { documentation } from "@/schemaTypes/documents/shared-assets/documentation";
import { video } from "./shared-assets/video";
import { product } from "./shared-assets/product";
import { article } from "@/schemaTypes/documents/shared-assets/article";
import { author } from "@/schemaTypes/documents/shared-assets/author";
import { faq } from "@/schemaTypes/documents/shared-assets/faq";

// ─── Workspace-scoped globals ─────────────────────────────────────────────────
import { globalSeo } from "@/schemaTypes/documents/global-settings/seo";
import { globalIntegrations } from "@/schemaTypes/documents/global-settings/integrations";
import { globalOrganization } from "@/schemaTypes/documents/global-settings/organization";
import { globalTheme } from "@/schemaTypes/documents/global-settings/theme";
import { globalCompliance } from "./global-settings/compliance";
import { globalStructuredData } from "./global-settings/structured-data";
import { globalRobots } from "./global-settings/robots";


export const pageDocuments = [
  page,
  articleRoot,
  catalogRoot,
  articlePage,
  productPage,
] as const

export const PAGE_TYPES = pageDocuments.map((d) => d.name);
export type PageType = (typeof pageDocuments)[number]["name"];
export function isPageType(type: string): type is PageType {
  return PAGE_TYPES.includes(type as PageType);
}

/**
 * Documents that are scoped to a single site and owned exclusively by it.
 *
 * This array is the source of truth for what gets archived or deleted when a
 * site is removed. It is used to derive `OWNED_TYPES` in the deletion utils,
 * which drives both the deletion preview and the archive operation.
 *
 * ⚠️  If you add a new site-scoped document type, you MUST add it here.
 *     Failing to do so means documents of that type will be orphaned when
 *     their parent site is archived — they will never be cleaned up.
 */
export const siteOwnedDocuments = [
  ...pageDocuments,
  site,
  redirect,
  footer,
  navbar,
] as const;

export const SITE_OWNED_TYPES = siteOwnedDocuments.map((d) => d.name);
export type SiteOwnedType = (typeof siteOwnedDocuments)[number]["name"];
export function isSiteOwnedType(type: string): type is SiteOwnedType {
  return SITE_OWNED_TYPES.includes(type as SiteOwnedType);
}

/**
 * Workspace-level documents that are referenced by sites and their pages,
 * but are not owned by any single site.
 *
 * These are NEVER deleted or archived as part of a site operation. They are
 * used in the deletion preview to inform the editor which documents will be
 * left untouched, and to ensure we never accidentally treat a shared asset
 * reference as an owned document.
 *
 * ⚠️  If you add a new shared asset type, add it here so it is correctly
 *     excluded from site-scoped operations.
 */
export const sharedAssetDocuments = [
  documentation,
  video,
  product,
  faq,
  author,
  article,
] as const;

export const SHARED_ASSET_TYPES = sharedAssetDocuments.map((d) => d.name);
export type SharedAssetType = (typeof sharedAssetDocuments)[number]["name"];
export function isSharedAssetType(type: string): type is SharedAssetType {
  return SHARED_ASSET_TYPES.includes(type as SharedAssetType);
}

/**
 * Workspace-scoped singleton documents that hold global configuration.
 * One instance of each exists per workspace, shared across all sites.
 */
export const globals = [
  globalTheme,
  globalSeo,
  globalIntegrations,
  globalOrganization,
  globalCompliance,
  globalStructuredData,
  globalRobots,
] as const;

export const WORKSPACE_GLOBAL_TYPES = globals.map((d) => d.name);
export type WorkspaceGlobalType = (typeof globals)[number]["name"];
export function isWorkspaceGlobalType(type: string): type is WorkspaceGlobalType {
  return WORKSPACE_GLOBAL_TYPES.includes(type as WorkspaceGlobalType);
}


/**
 * PackageType includes any document that is part of a feature module.
 * We exclude the "Core" site documents and "General" shared assets.
 */
export type PackageType = 
  | Exclude<SiteOwnedType, "page" | "redirect" | "site" | "navbar" | "footer"> 
  | Exclude<SharedAssetType, "documentation" | "video" | "faq">;


/**
 * Maps document types to their respective package keys.
 * This keeps the schema objects "clean" while providing metadata for the studio UI.
 */
export const DOCUMENT_PACKAGE_MAPPING: Record<string, string> = {
  product: "commerce",
  productPage: "commerce",
  catalogRoot: "commerce",
  article: "articles",
  author: "articles",
  articlePage: "articles",
  articleRoot: "articles",
};

/** ─── Config exports ──────────────────────────────────────────
 *
 * ⚠️ Exports should very rarely, if ever, be directly placed in the exports below.
 *     Before proceeding, ensure that they are placed in the appropriate exports
 *     above.
 *
 *     The exports should almost never contain singular documents. Instead,
 *     create a new taxonomic const above and spread it below.
 */

/**
 * All singleton documents — things that should only ever have one instance.
 * Used to suppress the "create new" button in the Studio for these types.
 */
export const singletons = [...globals];

/**
 * The full set of document types registered with Sanity.
 * This is passed directly to `schema.types` in sanity.config.ts.
 */
export const documents = [
  ...siteOwnedDocuments,
  ...sharedAssetDocuments,
];


export const ALL_DOCUMENT_TYPES = [...documents.map((d) => d.name), ...singletons.map((d) => d.name)];
export type DocumentType = typeof documents[number]["name"] | typeof singletons[number]["name"];
export function isDocumentType(type: string): type is DocumentType {
  return ALL_DOCUMENT_TYPES.includes(type as DocumentType);
}