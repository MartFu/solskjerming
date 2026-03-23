import { RouterPanes } from "sanity/structure";
import { parsePaneId } from "./pane-ids";
import { SanityClient } from "sanity";
import { createPreviewSecret } from "@sanity/preview-url-secret/create-secret";
import { packageRegistry } from "@/schemaTypes/documents/packages";
import { PREVIEW_BASE } from "./env";

export async function buildPreviewUrl(
  client: SanityClient,
  site: {
    _id: string;
    slug?: { current: string } | string;
    domain?: string | null;
  },
  preview: { type: string; docId: string },
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
  const pkgMeta = packageRegistry.lookup(preview.type);

  if (preview.type !== "page" && !pkgMeta) {
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
  type: string;
  docId: string;
} | null {
  const first = parsePaneId(panes[0]?.[0]?.id ?? "");
  const secondId = panes[1]?.[0]?.id;

  if (first.kind === "list") {
    if (!secondId) return null;
    return {
      siteId: first.siteId!,
      type: first.type!,
      docId: secondId.replace(/^drafts\./, ""),
    };
  }

  if (first.kind === "singleton") {
    return {
      siteId: first.siteId!,
      type: first.type!,
      docId: first.raw,
    };
  }

  return null;
}
