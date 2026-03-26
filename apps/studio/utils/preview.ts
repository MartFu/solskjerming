import { RouterPanes } from "sanity/structure";
import { parsePaneId } from "./pane-ids";
import { SanityClient } from "sanity";
import { createPreviewSecret } from "@sanity/preview-url-secret/create-secret";
import { PREVIEW_BASE } from "./env";
import { moduleRegistry } from "@/schemaTypes/documents";

export async function buildPreviewUrl(
  client: SanityClient,
  site: {
    _id: string;
    slug?: { current: string } | string;
    domain?: string | null;
  },
  preview: { type: string | null; docId: string },
  slug?: string,
): Promise<string | null> {
  let base: string;

  const siteSlugValue =
    typeof site.slug === "object" ? site.slug?.current : site.slug;

  if (PREVIEW_BASE) {
    // Always use preview subdomain when preview base is configured (local dev + staging)
    const isLocal =
      PREVIEW_BASE.includes("localhost") || PREVIEW_BASE.includes("lvh.me");
    const subdomain = siteSlugValue ?? site._id;
    base = `${isLocal ? "http" : "https"}://${subdomain}.${PREVIEW_BASE}`;
  } else if (site.domain) {
    // Production — use real domain
    base = `https://${site.domain}`;
  } else {
    return null;
  }

  const basePath = "";

  if (preview.type && preview.type !== "page" && !moduleRegistry.getModule(preview.type)) {
    return null;
  }

  if (basePath === null) return null;

  const cleanSlug = slug ? (slug.startsWith("/") ? slug : `/${slug}`) : "/";
  const redirectTo = basePath !== "" ? basePath : cleanSlug;

  const { secret } = await createPreviewSecret(
    client,
    "preview-secret",
    redirectTo,
  );

  return `${base}/api/preview?secret=${secret}&redirect=${encodeURIComponent(redirectTo)}`;
}

export function getPreviewContext(panes: RouterPanes): {
  siteId: string;
  type: string | null;
  docId: string;
} | null {
  const first = parsePaneId(panes[0]?.[0]?.id ?? "");
  const secondId = panes[1]?.[0]?.id;
  const second = parsePaneId(secondId ?? "");

  if (first.kind === "list") {
    if (!secondId) return null;
    return {
      siteId: first.siteId!,
      type: first.type!,
      docId: secondId.replace(/^drafts\./, ""),
    };
  }

  if (first.kind === "singleton") {
    // Page tree: panes[0] is "${siteId}-pages", panes[1] is the document UUID
    if (second.kind === "document" && secondId) {
      return {
        siteId: first.siteId!,
        type: null, // unknown — fetched from Sanity in usePreviewResolver
        docId: secondId.replace(/^drafts\./, ""),
      };
    }
    // True singleton (no child doc pane open)
    return {
      siteId: first.siteId!,
      type: first.type!,
      docId: first.raw,
    };
  }

  return null;
}
