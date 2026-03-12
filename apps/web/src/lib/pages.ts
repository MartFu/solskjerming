import { sanityFetch } from "@workspace/sanity/live";
import { queryHomePageData, querySlugPageData } from "@workspace/sanity/query";
import { QueryHomePageDataResult, QuerySlugPageDataResult } from "@workspace/sanity/types";

export async function getPageData(slug: string, siteId: string): Promise<QueryHomePageDataResult | QuerySlugPageDataResult> {
  const isHome = slug === "/" || slug === "";

  if (isHome) {
    const { data } = await sanityFetch({
      query: queryHomePageData,
      params: { siteId },
    });
    return data;
  }

  const { data } = await sanityFetch({
    query: querySlugPageData,
    params: { slug, siteId },
  });

  return data;
}