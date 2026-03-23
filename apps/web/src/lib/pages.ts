import { sanityFetch } from "@workspace/sanity/live";
import { queryHomePageData, queryPageBySlug } from "@workspace/sanity/query";

export async function getPageData(slug: string, siteId: string) {
  const normalizedSlug = slug.replace(/^\/|\/$/g, "");

  // If the normalized slug is empty, we are at the root
  if (normalizedSlug === "") {
    const { data } = await sanityFetch({
      query: queryHomePageData,
      params: { siteId },
    });
    return data;
  }

  // For all other pages
  const { data } = await sanityFetch({
    query: queryPageBySlug,
    params: {
      slug: normalizedSlug,
      siteId,
    },
  });

  return data;
}
