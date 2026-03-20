import { sanityFetchBuild } from "@workspace/sanity/build-client";
import { queryHomePageData, queryPageBySlug } from "@workspace/sanity/query";
import {
  QueryHomePageDataResult,
  QueryPageBySlugResult,
} from "@workspace/sanity/types";

export async function getPageData(
  slug: string,
  siteId: string,
): Promise<QueryHomePageDataResult | QueryPageBySlugResult> {
  const isHome = slug === "/" || slug === "";

  if (isHome) {
    return sanityFetchBuild({
      query: queryHomePageData,
      params: { siteId },
    });
  }

  return sanityFetchBuild({
    query: queryPageBySlug,
    params: { slug, siteId },
  });
}
