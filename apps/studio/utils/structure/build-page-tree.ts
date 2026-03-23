import { Globe, SquareMenu } from "lucide-react";
import type {
  StructureBuilder,
  StructureResolverContext,
} from "sanity/structure";

import { PageTreePane } from "@/components/structure/page-tree-pane";
import { getRoutableTypes } from "@/utils/page-tree";
import { API_VERSION } from '@/utils/env';

/**
 * Builds the "Sider" list item with the custom PageTreePane component.
 *
 * Uses the Object.assign pattern to serialize a documentList (so Sanity's
 * pane router knows how to resolve child document editors) and then override
 * the rendering with our custom React component.
 *
 * This means:
 * - Clicking "edit" inside PageTreePane correctly opens the document
 *   editor in the pane to the right
 * - Intent resolution (global search, deep links) still works
 * - The pane instance is preserved across re-renders (__preserveInstance)
 */
export function buildPageTree(
  S: StructureBuilder,
  siteId: string,
  enabledPackages: string[],
  context: StructureResolverContext,
) {
  const routableTypes = getRoutableTypes(enabledPackages);
  const typeList = routableTypes.map((t) => `"${t}"`).join(", ");

  return S.listItem()
    .title("Sider")
    .id(`${siteId}-pages`)
    .icon(SquareMenu)
    .child(
      Object.assign(
        S.documentList()
          .id(`${siteId}-page-tree`)
          .title("Sider")
          .filter(`_type in [${typeList}] && site._ref == $siteId`)
          .apiVersion(API_VERSION)
          .params({ siteId })
          .canHandleIntent((intentName, params) => {
            // Handle edit + create intents for all routable types
            if (
              intentName === "edit" &&
              params.type &&
              routableTypes.includes(params.type as string)
            ) {
              return true;
            }
            if (
              intentName === "create" &&
              params.type &&
              routableTypes.includes(params.type as string)
            ) {
              return true;
            }
            return false;
          })
          .serialize(),
        {
          __preserveInstance: true,
          key: `${siteId}-page-tree`,
          id: `${siteId}-page-tree`,
          type: "component",
          component: PageTreePane,
          options: {
            siteId,
            enabledPackages,
          },
        },
      ),
    );
}
