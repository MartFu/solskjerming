import { sanityFetchBuild } from "@workspace/sanity/build-client";
import { queryHomePageData, querySlugPageData } from "@workspace/sanity/query";
import {
  QueryHomePageDataResult,
  QuerySlugPageDataResult,
} from "@workspace/sanity/types";

export async function getPageData(slug: string, siteId: string): Promise<QueryHomePageDataResult | QuerySlugPageDataResult>{
  const isHome = slug === "/" || slug === "";

  if (isHome) {
    return sanityFetchBuild({
      query: queryHomePageData,
      params: { siteId },
    });
  }

  return sanityFetchBuild({
    query: querySlugPageData,
    params: { slug, siteId },
  });
}
