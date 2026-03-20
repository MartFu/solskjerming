import { sanityFetchBuild } from "@workspace/sanity/build-client";
import { querySiteDomains } from "@workspace/sanity/query";
import { QuerySiteDomainsResult } from "@workspace/sanity/types";

export async function getSitesList() {
  return sanityFetchBuild<QuerySiteDomainsResult>({
    query: querySiteDomains,
  });
}
