import { articles } from "./articles";
import { commerce } from "./commerce";
import { createPackageRegistry } from "./define-package";

// ===========================================================================
// REGISTRY
// ===========================================================================
//
// Single source of truth for all packages. Replaces the old hand-maintained
// PACKAGES array, PACKAGE_OPTIONS, and manual Map constructions.
//
//
// ===========================================================================

/**
 *   Import `packageRegistry` anywhere you need package lookups:
 *   - packageRegistry.allSchemas        → Primarily for config
 *   - packageRegistry.allRootTypes      → ["page", "articleRoot", "catalogRoot"]
 *   - packageRegistry.byRootType        → Map for structure builder lookups
 *   - packageRegistry.byChildType       → Map for child document actions
 *   - packageRegistry.byType            → Map for any type → { package, role }
 *   - packageRegistry.packageOptions    → [{ title, value }] for UI dropdowns
 */
export const packageRegistry = createPackageRegistry([articles, commerce]);
export type PackageRegistry = ReturnType<typeof createPackageRegistry>;

export type {
  DocumentRoleConfig,
  DocumentRoleMeta,
  GlobalPresentationConfig,
  InitialValueTemplate,
  PackageConfig,
  PackageResult,
  ResolvedGlobalConfig,
} from "./define-package";

export { PACKAGE_KEYS, type PackageKey } from "./constant";
