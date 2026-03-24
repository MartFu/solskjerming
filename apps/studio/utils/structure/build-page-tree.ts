import { SquareMenu } from "lucide-react";
import { StructureBuilder } from "sanity/structure";
import { asStudioIcon } from "../helper";
import { API_VERSION } from "../env";
import { DOCUMENT_NAMES } from "@/schemaTypes/constant";
import { PageTreePane } from "@/components/panes/page-tree";

export function buildPageTree(
  S: StructureBuilder,
  siteId: string,
  enabledPackages: string[],
) {
  // In v2, the only routable Sanity type is "page"
  const PAGE_TYPE = DOCUMENT_NAMES.page

  return S.listItem()
    .title("Sider")
    .id(`${siteId}-pages`)
    .icon(asStudioIcon(SquareMenu))
    .child(
      Object.assign(
        S.documentList()
          .id(`${siteId}-page-tree`)
          .title("Sider")
          // 2. Simplified filter: only fetch pages belonging to this site
          .filter(`_type == "${PAGE_TYPE}" && site._ref == $siteId`)
          .apiVersion(API_VERSION)
          .params({ siteId })
          .canHandleIntent((intentName, params) => {
            // 3. The pane now handles ALL "page" document intents.
            // If the user clicks a search result for a "page" on this site,
            // this pane will claim the intent and open it in the tree context.
            const isTargetType = params.type === PAGE_TYPE;

            // Optional: You could further verify if the document belongs to this site
            // by checking params.id, but usually checking type is enough for the pane router.
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
