import { sanityFetchBuild } from "@workspace/sanity/build-client";
import { querySitesList } from "@workspace/sanity/query";
import { QuerySitesListResult } from "@workspace/sanity/types";


export async function getSitesList() {
    return sanityFetchBuild<QuerySitesListResult>({
      query: querySitesList,
    });
}

