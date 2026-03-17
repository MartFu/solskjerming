import { Logger } from "@workspace/logger";
import { client } from "@workspace/sanity/client";
import { querySiteDomains } from "@workspace/sanity/query";
import { QuerySiteDomainsResult } from "@workspace/sanity/types";

interface SiteRecord {
    _id: string;
    slug?: string | null;
    domain?: string | null;
}

let cache: SiteRecord[] | null = null;
let cacheTime = 0;

/** In-memory TTL in ms. Keep short until KV cache is in place. */
const TTL = 60_000; // 1 minute

const logger = new Logger("SiteResolver")

async function getSites(): Promise<SiteRecord[]> {
    const now = Date.now();
    if (cache && now - cacheTime < TTL) return cache;
    cache = await client.fetch<QuerySiteDomainsResult>(querySiteDomains);
    cacheTime = now;
    return cache ?? [];
}

export async function resolveSiteId(hostname: string): Promise<string | null> {
    const previewBase = process.env.PREVIEW_BASE_DOMAIN;
    const sites = await getSites();

    // 1. Exact domain match
    const exact = sites.find((s) => s.domain && s.domain === hostname);
    if (exact) return exact._id;

    // 2. Subdomain of preview base domain (e.g. <_id>.preview.youragency.com)
    if (previewBase && hostname.endsWith(`.${previewBase}`)) {
        const subdomain = hostname.slice(0, -(previewBase.length + 1));
        const bySlug = sites.find((s) => s.slug === subdomain);
        if (bySlug) return bySlug._id;
    }

    logger.info("RESOLVER sites:", sites);
    logger.info("RESOLVER previewBase:", previewBase);
    logger.info("RESOLVER hostname:", hostname);

    // 3. Fallback to default site ID
    return process.env.NEXT_PUBLIC_DEFAULT_SITE_ID ?? null;
}
