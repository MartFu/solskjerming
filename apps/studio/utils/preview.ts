import { RouterPanes } from "sanity/structure";
import { parsePaneId } from "./pane-ids";
import { SchemaType } from "@/schemaTypes";
import { SanityClient } from "sanity";
import {  createPreviewSecret} from "@sanity/preview-url-secret/create-secret";

const TYPE_PATHS: Partial<Record<SchemaType, string | null>> = {
    homePage: "/",
    articleIndex: "/artikler",
    article: "/artikler", // + slug
    page: "", // + slug
    video: "/video", // + slug?
    faq: "/faq", // + slug?
    navbar: null, // not previewable
    footer: null,
    site: null,
    workspaceDefault: null,
};

export async function buildPreviewUrl(
    client: SanityClient,
    site: { _id: string; slug?: string | null; domain?: string | null },
    preview: { type: string; docId: string },
    slug?: string,
): Promise<string | null> {
    const previewBase = process.env.SANITY_STUDIO_PREVIEW_BASE_DOMAIN;

    let base: string;

    if (previewBase) {
        // Always use preview subdomain when preview base is configured (local dev + staging)
        const isLocal =
            previewBase.includes("localhost") || previewBase.includes("lvh.me");
        const subdomain = site.slug ?? site._id;
        base = `${isLocal ? "http" : "https"}://${subdomain}.${previewBase}`;
    } else if (site.domain) {
        // Production — use real domain
        base = `https://${site.domain}`;
    } else {
        return null;
    }

    const basePath = TYPE_PATHS[preview.type as SchemaType];
    if (basePath === null || basePath === undefined) return null;

    const redirectTo = basePath !== "" ? basePath : slug ? `/${slug}` : "/";

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
