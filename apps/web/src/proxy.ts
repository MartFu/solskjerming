// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { client } from "@workspace/sanity/client";

type SiteConfig = {
  _id: string;
  domain: string;
};

type SiteCache = {
  sites: SiteConfig[];
  fetchedAt: number;
};

const CACHE_TTL_MS = 60 * 1000; // 60 seconds
let siteCache: SiteCache | null = null;

async function getSiteConfigs(): Promise<SiteConfig[]> {
  const now = Date.now();

  if (siteCache && now - siteCache.fetchedAt < CACHE_TTL_MS) {
    return siteCache.sites;
  }

  const sites = await client.fetch<SiteConfig[]>(
    `*[_type == "site"]{ "_id": _id, domain }`,
  );

  siteCache = { sites, fetchedAt: now };
  return sites;
}

function resolveSiteId(host: string, sites: SiteConfig[]): string {
  const match = sites.find((s) => s.domain === host);
  return match?._id ?? process.env.NEXT_PUBLIC_DEFAULT_SITE_ID ?? "";
}

export default async function proxy(request: NextRequest) {
  const host = request.headers.get("host") ?? "";

  let siteId: string;
  try {
    const sites = await getSiteConfigs();
    siteId = resolveSiteId(host, sites);
  } catch (error) {
    console.error("Failed to resolve siteId from Sanity:", error);
    siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID ?? "";
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-site-id", siteId);

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
