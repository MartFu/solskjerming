import { StructureBuilder, StructureResolverContext } from "sanity/structure";
import { createList, createSingleton } from "./helpers";
import { Link, PanelBottom, PanelTop, Settings } from "lucide-react";
import { WorkspaceKey } from "../constant";
import { Site } from "@workspace/sanity/types";
import { buildPageTree } from "./build-page-tree";
import { DOCUMENT_NAMES } from "@/schemaTypes/constant";
import { LinkIcon } from "@sanity/icons";
import { asStudioIcon } from "../helper";

// import { buildPageTree } from "./build-page-tree";

// ─────────────────────────────────────────────────────────────
// Site content
// ─────────────────────────────────────────────────────────────

export function buildSiteItems(
    S: StructureBuilder,
    site: Site,
    workspace: WorkspaceKey,
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

        buildPageTree(S, site._id, site.enabledPackages ?? []),

        createSingleton(S, {
            type: "footer",
            title: "Footer",
            icon: PanelBottom,
            siteId: site._id,
            workspace,
        }),

        S.listItem()
            .title("Innstillinger")
            .id(`${site._id}-settings`)
            .icon(Settings)
            .child(
                S.document()
                    .id(`${site._id}-settings-editor`)
                    .schemaType(DOCUMENT_NAMES.site)
                    .initialValueTemplate("site-template", {
                        workspace,
                        getClient: context.getClient,
                    })
                    .documentId(site._id),
            ),


        
        createList(S,
          {
            icon: asStudioIcon(Link),
            type: DOCUMENT_NAMES.redirect,
            title: "Redirigeringer"
          }
        )
    ];
}
