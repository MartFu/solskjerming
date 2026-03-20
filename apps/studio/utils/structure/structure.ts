import type {
  StructureBuilder,
  StructureResolverContext,
} from "sanity/structure";

import { getActiveSite } from "../context";
import { map, merge, fromEvent, switchMap, shareReplay } from "rxjs";
import { SITE_CHANGED_EVENT } from "./structure-channel";
import { ActiveSite } from "../types";
import { capitalize } from "../helper";
import { buildSiteItems } from "./build-site-items";
import { buildGlobalItems } from "./build-global-items";

// ─────────────────────────────────────────────────────────────
// Main structure export
// ─────────────────────────────────────────────────────────────

export const createStructure = (
  S: StructureBuilder,
  context: StructureResolverContext,
  workspace: string,
) => {
  const { documentStore } = context;

  const sites$ = documentStore
    .listenQuery(
      `*[_type == "site" && workspace == $workspace]{ _id, title, enabledPackages, _updatedAt }`,
      { workspace },
      {
        tag: "structure-active-site",
        perspective: "published",
        transitions: ["update", "appear"],
      },
    )
    .pipe(shareReplay(1)); // ← one live listener, replays latest to new subscribers

  const siteChanged$ = fromEvent(window, SITE_CHANGED_EVENT);

  return merge(sites$, siteChanged$.pipe(switchMap(() => sites$))).pipe(
    map((sites: ActiveSite[]) => {
      const studioContext = getActiveSite(workspace);
      const activeSite = studioContext?._id
        ? (sites.find((s) => s._id === studioContext._id) ?? sites[0])
        : sites[0];

      return S.list()
        .id(`root`)
        .title(`${capitalize(activeSite?.title)}`)
        .items([
          ...buildSiteItems(S, activeSite, workspace, context),
          ...buildGlobalItems(S, activeSite?.enabledPackages ?? []),
        ]);
    }),
  );
};
