// lib/slug.ts
import { sanityFetchBuild } from "@workspace/sanity/build-client";
import { queryAllPageSlugs } from "@workspace/sanity/query";
import { QueryAllPageSlugsResult } from "@workspace/sanity/types";

export async function getAllPageSlugs(siteId: string): Promise<string[]> {
  // Use build-safe client - no draftMode() inside!
  const pages = await sanityFetchBuild<QueryAllPageSlugsResult>({
    query: queryAllPageSlugs,
    params: { siteId },
  });

  return pages.map((page: any) => {
    if (page.isHomePage) return "";
    if (page._type === "article") return `artikler/${page.slug}`;
    if (page._type === "articleIndex") return "artikler";
    return page.slug;
  });
}
