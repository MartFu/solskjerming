// lib/navigation.ts
import { sanityFetchBuild } from "@workspace/sanity/build-client"; // Build-safe client
import {
  queryNavbarData,
  queryGlobalSeoSettings,
} from "@workspace/sanity/query";
import { QueryGlobalSeoSettingsResult, QueryNavbarDataResult } from "@workspace/sanity/types";

export const getNavigationData = async (siteId: string) => {
  const [navbarData, settingsData] = await Promise.all([
    sanityFetchBuild<QueryNavbarDataResult>({ query: queryNavbarData, params: { siteId } }),
    sanityFetchBuild<QueryGlobalSeoSettingsResult>({ query: queryGlobalSeoSettings, params: { siteId } }),
  ]);

  return {
    navbarData: navbarData,
    settingsData: settingsData,
  };
};
