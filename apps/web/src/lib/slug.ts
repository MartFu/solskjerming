import { sanityFetch } from "@workspace/sanity/live";
import { queryAllRoutableDocumentSlugs } from "@workspace/sanity/query";

export async function getAllPageSlugs(siteId: string) {
  const { data } = await sanityFetch({
    query: queryAllRoutableDocumentSlugs,
    params: { siteId },
  });

  return data;
}
