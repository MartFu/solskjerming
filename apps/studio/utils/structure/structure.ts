import type {
  StructureBuilder,
  StructureResolverContext,
} from "sanity/structure";
import { getActiveSite } from "../persistence/context";
import { map, merge, fromEvent, switchMap, shareReplay, startWith } from "rxjs";
import { SITE_CHANGED_EVENT } from "./structure-channel";
import { capitalize } from "../helper";
import { createSiteItems } from "./create-site-items";
import { createGlobalItems } from "./create-global-items";
import { Site } from "@workspace/sanity/types";
import { WorkspaceKey } from "../constant";

// ─────────────────────────────────────────────────────────────
// Main structure export
// ─────────────────────────────────────────────────────────────


export const createStructure = (
  S: StructureBuilder,
  context: StructureResolverContext,
  workspace: WorkspaceKey,
) => {
  const { documentStore } = context;

  const sites$ = documentStore
    .listenQuery(
      `*[_type == "site" && workspace == $workspace]{ _id, title, enabledModules, _updatedAt }`,
      { workspace },
      {
        tag: "structure-active-site",
        perspective: "published",
        transitions: ["update", "appear"],
      },
    )
    .pipe(shareReplay(1));

  // Listen for both manual site changes and browser navigation (tab switching)
  const siteChanged$ = merge(
    fromEvent(window, SITE_CHANGED_EVENT),
    fromEvent(window, "popstate")
  ).pipe(startWith(null));

  return siteChanged$.pipe(
    switchMap(() => sites$),
    map((sites: Site[]) => {
      // 1. Check URL first (The most specific source of truth for the current tab)
      const urlParams = new URLSearchParams(window.location.search);
      const siteIdFromUrl = urlParams.get("site");
      
      // 2. Fallback to persistence (For initial loads)
      const studioContext = getActiveSite(workspace);
      
      const activeSite =
        sites.find((s) => s._id === siteIdFromUrl) || 
        sites.find((s) => s._id === studioContext?._id) || 
        sites[0];

      if (!activeSite) return S.list().title("Laster...").items([]);

      return S.list()
        .id(`root`)
        .title(`${capitalize(activeSite?.title)}`)
        .items([
          ...createSiteItems(S, activeSite, workspace, context),
          ...createGlobalItems(S, activeSite?.enabledModules ?? []),
        ]);
    }),
  );
};