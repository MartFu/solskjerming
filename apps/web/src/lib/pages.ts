import { sanityFetch } from "@workspace/sanity/live";
import { queryHomePageData, queryPageBySlug } from "@workspace/sanity/query";

export async function getPageData(slug: string, siteId: string) {
  const isHome = slug === "/" || slug === "";

  if (isHome) {
    const { data } = await sanityFetch({
      query: queryHomePageData,
      params: { siteId },
    });
    return data;
  }

  const { data } = await sanityFetch({
    query: queryPageBySlug,
    params: { slug, siteId },
  });

  return data;
}
