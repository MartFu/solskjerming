import { commerce } from "./commerce";
import { createPackageRegistry } from "./define-package";

// ===========================================================================
// REGISTRY
// ===========================================================================
//
// WHAT CHANGED:
// - `allSchemas` is gone — the universal `page` schema is registered
//   separately in your Sanity config.
// - `allEntryTypes` → `allEntryRoles` — since everything is `page`,
//   entry points are identified by `internalRole`, not Sanity type.
// - `lookup(typeName)` → `lookup(internalRole)` — finds package + metadata
//   by the role string.
// - Added `rolesForPackages` and `allowedChildRoles` for the structure
//   builder and "new child" document action.
//
// WHAT STAYED:
// - `allTemplates` — same usage, spread into `schema.templates`.
// - `packageOptions` — same usage, for UI dropdowns.
// - `getPackage` — same usage.
// - `globalsForPackages` — same usage.
// ===========================================================================

/**
 *   Import `packageRegistry` anywhere you need package lookups:
 *
 *   packageRegistry.allTemplates       → spread into schema.templates
 *   packageRegistry.allEntryRoles      → ["catalog", "articleHub"]
 *   packageRegistry.lookup("catalog")  → { package, meta }
 *   packageRegistry.rolesForPackages(["commerce"]) → all roles in commerce
 *   packageRegistry.allowedChildRoles("catalog", ["commerce"]) → [productPage meta]
 *   packageRegistry.packageOptions     → [{ title, value }] for dropdowns
 */
export const packageRegistry = createPackageRegistry([commerce]);
export type PackageRegistry = ReturnType<typeof createPackageRegistry>;

