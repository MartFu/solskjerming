// ===========================================================================
// STRUCTURE BUILDER: Blueprint-Aware
// ===========================================================================
//
// Builds the Studio sidebar using `internalRole` GROQ filters instead of
// per-type document lists. Since all documents are `_type == "page"`,
// grouping is done by filtering on the `internalRole` field.
//
// Example sidebar for a site with Commerce enabled:
//
//   📄 Sider              ← !defined(internalRole) (generic pages)
//   🛒 Netthandel
//      📋 Kataloger       ← internalRole == "catalog"
//      📦 Produktsider    ← internalRole == "productPage"
//   🏷️ Produkter         ← strict data type (global)
// ===========================================================================

import type { StructureBuilder } from "sanity/structure";
import type { DocumentRoleMeta } from "./define-package";
import { packageRegistry } from "./package-registry";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function roleFilter(internalRole: string, siteId: string): string {
  return (
    `_type == "page" && internalRole == "${internalRole}" ` +
    `&& site._ref == "${siteId}"`
  );
}

function standardPageFilter(siteId: string): string {
  return (
    `_type == "page" && !defined(internalRole) ` + `&& site._ref == "${siteId}"`
  );
}

// ---------------------------------------------------------------------------
// Main builder
// ---------------------------------------------------------------------------

/**
 * Builds the sidebar structure for a given site.
 *
 * @param S - Sanity's StructureBuilder
 * @param siteId - The site document ID to scope all filters
 * @param enabledPackages - Package keys enabled on this site
 */
export function buildSiteStructure(
  S: StructureBuilder,
  siteId: string,
  enabledPackages: string[],
) {
  const items = [];

  // 1. Standard pages (no internalRole)
  items.push(
    S.listItem()
      .title("Sider")
      .child(
        S.documentList()
          .title("Sider")
          .filter(standardPageFilter(siteId))
          .defaultOrdering([{ field: "title", direction: "asc" }]),
      ),
  );

  // 2. Package-specific role groups
  for (const pkgKey of enabledPackages) {
    const pkg = packageRegistry.getPackage(pkgKey);
    if (!pkg) continue;

    const roles = Object.values<DocumentRoleMeta>(pkg.documents);

    if (roles.length === 1) {
      // Single-role package → flat list
      const role = roles[0];
      items.push(
        S.listItem()
          .title(role.title)
          .icon(role.icon as any)
          .child(
            S.documentList()
              .title(role.title)
              .filter(roleFilter(role.internalRole, siteId))
              .defaultOrdering([{ field: "title", direction: "asc" }]),
          ),
      );
    } else {
      // Multi-role package → nested folder
      items.push(
        S.listItem()
          .title(pkg.title)
          .child(
            S.list()
              .title(pkg.title)
              .items(
                roles.map((role) =>
                  S.listItem()
                    .title(role.title)
                    .icon(role.icon as any)
                    .child(
                      S.documentList()
                        .title(role.title)
                        .filter(roleFilter(role.internalRole, siteId))
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

  // 3. Globals (strict data) for enabled packages
  const globals = packageRegistry.globalsForPackages(enabledPackages);
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

// ---------------------------------------------------------------------------
// Child document action
// ---------------------------------------------------------------------------

/**
 * Given a parent document's `internalRole`, return which blueprint roles
 * can be created as children.
 *
 * Used by the "New child page" action in the document header.
 */
export function getChildBlueprints(
  parentRole: string | undefined,
  enabledPackages: string[],
): DocumentRoleMeta[] {
  return packageRegistry.allowedChildRoles(parentRole, enabledPackages);
}
