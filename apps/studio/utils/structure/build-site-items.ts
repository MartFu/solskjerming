import { StructureBuilder, StructureResolverContext } from "sanity/structure";
import { capitalize } from "../helper";
import { createSingleton } from "./helpers";
import { buildPageTree } from "./build-page-tree";
import { PanelBottom, PanelTop, Settings } from "lucide-react";

// ─────────────────────────────────────────────────────────────
// Site content
// ─────────────────────────────────────────────────────────────

export function buildSiteItems(
  S: StructureBuilder,
  site: { _id: string; title: string; enabledPackages?: string[] },
  workspace: string,
  context: StructureResolverContext,
) {
  return [
    createSingleton(S, {
      type: "navbar",
      title: "Header",
      icon: PanelTop,
      siteId: site._id,
      workspace,
    }),

    buildPageTree(S, site._id, site.enabledPackages ?? [], context),

    createSingleton(S, {
      type: "footer",
      title: "Footer",
      icon: PanelBottom,
      siteId: site._id,
      workspace,
    }),

    S.listItem()
      .title(`${capitalize(site.title)} Innstillinger`)
      .id(`${site._id}-settings`)
      .icon(Settings)
      .child(
        S.document()
          .id(`${site._id}-settings-editor`)
          .schemaType("site")
          .documentId(site._id),
      ),
  ];
}
