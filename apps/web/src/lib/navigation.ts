import { sanityFetch } from "@workspace/sanity/live";
import { querySiteConfig, queryNavbarData } from "@workspace/sanity/query";

export const getNavigationData = async (siteId: string) => {
  const [navbarData, settingsData] = await Promise.all([
    sanityFetch({ query: queryNavbarData, params: { siteId } }),
    sanityFetch({ query: querySiteConfig, params: { siteId } }),
  ]);

  return { navbarData: navbarData.data, settingsData: settingsData.data };
};
