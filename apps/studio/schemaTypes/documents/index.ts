// schemaTypes/documents/index.ts

// ─── Workspace-scoped defaults ─────────────────────────────────────────────────────────────
import { globalSettingsRegistry } from "@/schemaTypes/documents/global-settings";

// ─── Workspace-scoped shared assets ─────────────────────────────────────
import { globalRegistry } from "@/schemaTypes/documents/globals";

// ─── Site config ─────────────────────────────────────────────────────────────
import { site } from "@/schemaTypes/documents/site";
import { redirect } from "@/schemaTypes/documents/redirect";

// ─── Site-scoped, routable documents ─────────────────────────────────────────
import { page } from "./page";

// ─── Site-scoped, non-routable documents ─────────────────────────────────────
import { footer } from "@/schemaTypes/documents/footer";
import { navbar } from "@/schemaTypes/documents/navbar";
import { studioSettings } from "@/schemaTypes/documents/studio";


// ─── Registries ─────────────────────────────────────
export { globalSettingsRegistry } from "@/schemaTypes/documents/global-settings";
export { globalRegistry } from "@/schemaTypes/documents/globals";
export { moduleRegistry } from "@/schemaTypes/documents/modules";

export const isPageType = (type: string) => type === page.name;

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
export const siteOwnedDocuments = [page, redirect, footer, navbar] as const;

export const SITE_OWNED_TYPES = siteOwnedDocuments.map((d) => d.name);
export type SiteOwnedType = (typeof siteOwnedDocuments)[number]["name"];
export function isSiteOwnedType(type: string): type is SiteOwnedType {
    return SITE_OWNED_TYPES.includes(type as SiteOwnedType);
}

/** ─── Config exports ──────────────────────────────────────────
 *
 * ⚠️  Exports should very rarely, if ever, be directly placed in the exports below.
 *     Before proceeding, ensure that they are placed in the appropriate exports
 *     above.
 *
 *     The exports should almost never contain singular documents. Instead,
 *     create a new taxonomic const above and spread it below.
 */

/**
 * All singleton documents — things that should only ever have one instance.
 * The "create new" button in the Studio is suppressed for these types.
 */
export const singletons = [
    ...globalSettingsRegistry.allSchemas,
    studioSettings.schema,
];
export const singletonNames = singletons.map((s) => s.name);
export type SingletonType = (typeof singletons)[number]["name"];
export function isSingletonType(type: string): type is SingletonType {
    return singletonNames.includes(type as SingletonType);
}

/**
 * The full set of document types registered with Sanity.
 * This is passed directly to `schema.types` in sanity.config.ts.
 */
export const documents = [
    site,
    ...siteOwnedDocuments,
    ...globalRegistry.allSchemas,
    ...singletons,
];

export const ALL_DOCUMENT_TYPES = [
    ...documents.map((d) => d.name),
    ...singletons.map((d) => d.name),
];
export type DocumentType =
    | (typeof documents)[number]["name"]
    | (typeof singletons)[number]["name"];
export function isDocumentType(type: string): type is DocumentType {
    return ALL_DOCUMENT_TYPES.includes(type as DocumentType);
}
