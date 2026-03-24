// ===========================================================================
// STRUCTURE (internal)
// ===========================================================================
//
// Builds the Studio sidebar from the registry's resolved data. This module
// is internal — consumers call `moduleRegistry.buildStructure(S, siteId, pkgs)`
// which delegates here.
//
// The sidebar groups pages by their `internalRole` via GROQ filters:
//
//   📄 Sider               ← !defined(internalRole)
//   🛒 Netthandel
//      📋 Kataloger        ← internalRole == "catalog"
//      📦 Produktsider     ← internalRole == "productPage"
//   🏷️ Produkter          ← strict data (global)
// ===========================================================================

import type { ListItemBuilder, StructureBuilder } from "sanity/structure";
import type {
  ResolvedBlueprint,
  ResolvedGlobalConfig,
  ModuleResult,
} from "./define-module";
import { DOCUMENT_NAMES } from "@/schemaTypes/constant";
import { asStudioIcon } from "../helper";
import { SquareMenu } from "lucide-react";
import { API_VERSION } from "../env";
import { PageTreePane } from "@/components/panes/page-tree";
import { moduleRegistry } from "@/schemaTypes/documents/modules";

// ---------------------------------------------------------------------------
// GROQ filter helpers
// ---------------------------------------------------------------------------

function roleFilter(role: string, siteId: string): string {
  return `_type == "page" && internalRole == "${role}" && site._ref == "${siteId}"`;
}

function standardPageFilter(siteId: string): string {
  return `_type == "page" && !defined(internalRole) && site._ref == "${siteId}"`;
}

// ---------------------------------------------------------------------------
// Builder
// ---------------------------------------------------------------------------

export function buildStructure(
  S: StructureBuilder,
  siteId: string,
  modules: ModuleResult<string>[],
  enabledKeys: string[],
  globalsForModules: typeof moduleRegistry.globalsForModules,
) {
  const items: ListItemBuilder[] = [];
  const enabledSet = new Set(enabledKeys);

  const PAGE_TYPE = DOCUMENT_NAMES.page;

  // 1. Standard pages
  items.push(
    S.listItem()
      .title("Sider")
      .icon(asStudioIcon(SquareMenu))
      .child(
        Object.assign(
          S.documentList()
            .id(`${siteId}-page-tree`)
            .title("Sider")
            // 2. Simplified filter: only fetch pages belonging to this site
            .filter(standardPageFilter(siteId))
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
            component: () => PageTreePane({
              siteId,
              enabledPackages: enabledKeys,
            }),
            
          },
        ),
      ),
  );

  // 2. Module groups
  for (const mod of modules) {
    if (!enabledSet.has(mod.key)) continue;

    const blueprints = Object.values<ResolvedBlueprint>(mod.blueprints);

    if (blueprints.length === 1) {
      const bp = blueprints[0];
      items.push(
        S.listItem()
          .title(bp.title)
          .icon(bp.icon as any)
          .child(
            S.documentList()
              .title(bp.title)
              .filter(roleFilter(bp.role, siteId))
              .defaultOrdering([{ field: "title", direction: "asc" }]),
          ),
      );
    } else {
      items.push(
        S.listItem()
          .title(mod.title)
          .child(
            S.list()
              .title(mod.title)
              .items(
                blueprints.map((bp) =>
                  S.listItem()
                    .title(bp.title)
                    .icon(bp.icon as any)
                    .child(
                      S.documentList()
                        .title(bp.title)
                        .filter(roleFilter(bp.role, siteId))
                        .defaultOrdering([
                          { field: "title", direction: "asc" },
                        ]),
                    ),
                ),
              ),
          ),
      );
    }
  }

  // 3. Globals
  const globals = globalsForModules(enabledKeys);
  for (const global of globals) {
    items.push(
      S.listItem()
        .title(global.structureTitle)
        .id(global.structureId)
        .icon(global.icon as any)
        .child(
          S.documentList()
            .title(global.structureTitle)
            .filter(global.filter)
            .defaultOrdering(
              global.defaultOrdering.map((o) => ({
                field: o.field,
                direction: o.direction,
              })),
            ),
        ),
    );
  }

  return S.list().title("Innhold").items(items);
}
