import { StructureBuilder, StructureResolverContext } from "sanity/structure";
import { createList, createSingleton } from "./helpers";
import { Link, PanelBottom, PanelTop, Settings } from "lucide-react";
import { WorkspaceKey } from "../constant";
import { Site } from "@workspace/sanity/types";
import { DOCUMENTS } from "@/schemaTypes/constant";
import { asStudioIcon } from "../helper";
import { SquareMenu } from "lucide-react";
import { API_VERSION } from "../env";
import { PageTreePane } from "@/components/panes/page-tree";

// Page tree
export function createPageTree(
  S: StructureBuilder,
  siteId: string,
  enabledPackages: string[],
) {
  // In v2, the only routable Sanity type is "page"
  const PAGE_TYPE = DOCUMENTS.page

  return S.listItem()
    .title("Sider")
    .id(`${siteId}-pages`)
    .icon(asStudioIcon(SquareMenu))
    .child(
      Object.assign(
        S.documentList()
          .id(`${siteId}-page-tree`)
          .title("Sider")
          .filter(`_type == "${PAGE_TYPE}" && site._ref == $siteId`)
          .apiVersion(API_VERSION)
          .params({ siteId })
          .canHandleIntent((intentName, params) => {
            // If the user clicks a search result for a "page" on this site,
            // this pane will claim the intent and open it in the tree context.
            const isTargetType = params.type === PAGE_TYPE;

            return ["edit", "create"].includes(intentName) && isTargetType;
          })
          .serialize(),
        {
          __preserveInstance: true,
          key: `${siteId}-page-tree`,
          id: `${siteId}-page-tree`,
          type: "component",
          component: () =>  PageTreePane({
            siteId,
            enabledPackages,
          }),
          
        },
      ),
    );
}


// ─────────────────────────────────────────────────────────────
// Site content
// ─────────────────────────────────────────────────────────────

export function createSiteItems(
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

        createPageTree(S, site._id, site.enabledModules ?? []),

        createSingleton(S, {
            type: "footer",
            title: "Footer",
            icon: PanelBottom,
            siteId: site._id,
            workspace,
        }),

        S.divider(),

        S.listItem()
            .title("Innstillinger")
            .id(`${site._id}-settings`)
            .icon(Settings)
            .child(
                S.document()
                    .id(`${site._id}-settings-editor`)
                    .schemaType(DOCUMENTS.site)
                    .initialValueTemplate("site-template", {
                        workspace,
                        getClient: context.getClient,
                    })
                    .documentId(site._id),
            ),


        
        createList(S,
          {
            icon: asStudioIcon(Link),
            type: DOCUMENTS.redirect,
            title: "Redirigering"
          }
        )
    ];
}
