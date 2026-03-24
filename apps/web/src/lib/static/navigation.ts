// lib/navigation.ts
import { sanityFetchBuild } from "@workspace/sanity/build-client";
import { queryNavbarData, querySiteConfig } from "@workspace/sanity/query";
import { QueryNavbarDataResult, QuerySiteConfigResult } from "@workspace/sanity/types";

export const getNavigationData = async (siteId: string) => {
  const [navbarData] = await Promise.all([
    sanityFetchBuild<QueryNavbarDataResult>({ query: queryNavbarData, params: { siteId } }),
  ]);

  return {
    navbarData: navbarData,
  };
};
