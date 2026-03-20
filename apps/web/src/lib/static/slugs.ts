// lib/slug.ts
import { sanityFetchBuild } from "@workspace/sanity/build-client";
import { queryAllPageSlugs } from "@workspace/sanity/query";
import { QueryAllPageSlugsResult } from "@workspace/sanity/types";

export async function getAllPageSlugs(siteId: string): Promise<string[]> {
  const pages = await sanityFetchBuild<QueryAllPageSlugsResult>({
    query: queryAllPageSlugs,
    params: { siteId },
  });

  return pages
    .map((p) => p.slug)
    .filter((slug): slug is string => Boolean(slug) && slug !== "/");
}
