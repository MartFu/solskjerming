import { sanityFetch } from "@workspace/sanity/live";
import { queryAllPageSlugs } from "@workspace/sanity/query";

export async function getAllPageSlugs(siteId: string): Promise<string[]> {
  const pages = await sanityFetch({
    query: queryAllPageSlugs,
    params: { siteId },
  });

  return pages.data.map((page: any) => {
    // Home page gets empty string (root path)
    if (page.isHomePage) {
      return "";
    }

    // Articles get prefixed with /artikler/
    if (page._type === "article") {
      return `artikler/${page.slug}`;
    }

    // Article index gets /artikler
    if (page._type === "articleIndex") {
      return "artikler";
    }

    // Regular pages use their slug as-is
    return page.slug;
  });
}