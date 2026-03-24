// ===========================================================================
// DEFINE PACKAGE (Blueprint-Driven)
// ===========================================================================
//
// WHAT CHANGED:
// - `definePackage` no longer calls `defineType` for each document role.
//   Every template now targets `schemaType: "page"`.
// - `DocumentRoleConfig.name` becomes an internal identifier (the role's
//   "internalRole" value), NOT a Sanity type name.
// - `pagebuilderType` is replaced by `initialBlocks` — an array of blocks
//   to pre-populate in the universal pageBuilder.
// - `extraFields` is removed. Role-specific fields live in the base `page`
//   schema with `hidden` callbacks that check `internalRole`.
//
// WHAT STAYED:
// - `PackageConfig` shape, `TemplateParams`, `GlobalPresentationConfig` — identical.
// - `allowedParentRoles` / `allowPageAsParent` — same semantics, now
//   resolved to `internalRole` values instead of Sanity type names.
// - `initialValues` (static or function) — identical.
// - `_resolveGlobals`, global handling — unchanged.
// - `createPackageRegistry` — adapted to index by `internalRole` instead of
//   by Sanity type name.
// ===========================================================================

import { type PreviewConfig } from "sanity";
import { type GroupValue } from "@/utils/constant";
import {
  type GlobalType,
  type GlobalFieldNames,
  GLOBAL_REGISTRY,
} from "../globals";
import { type ComponentType, type ReactNode } from "react";
import { PackageKey } from "../packages";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TemplateParams {
  siteId: string;
  parentId?: string;
  title?: string;
}

export interface InitialValueTemplate {
  id: string;
  title: string;
  schemaType: string;
  icon?: ComponentType | ReactNode;
  parameters: Array<{ name: string; type: string }>;
  value: (params: TemplateParams) => Record<string, unknown>;
}

export interface GlobalPresentationConfig<T extends GlobalType = GlobalType> {
  structureTitle?: string;
  icon?: ComponentType | ReactNode;
  defaultOrdering?: {
    field: GlobalFieldNames<T>;
    direction: "asc" | "desc";
  }[];
}

// ---------------------------------------------------------------------------
// Blueprint block config
// ---------------------------------------------------------------------------

/**
 * A single block to pre-populate in the pageBuilder when creating a
 * document from this blueprint.
 *
 * This replaces the old `pagebuilderType` approach. Instead of choosing
 * which pagebuilder schema to use, you declare what blocks to seed.
 */
export interface BlueprintBlock {
  /** The Sanity object type name, e.g. "dynamicCollection", "hero" */
  _type: string;

  /** Pre-configured field values for the block */
  initialData?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Document role config
// ---------------------------------------------------------------------------

/**
 * Configuration for a single document role within a package.
 *
 * A "role" is a named slot in the package's document tree. In the new model,
 * every role creates a `page` document — the role key becomes the
 * `internalRole` value that differentiates it.
 *
 * @typeParam K - Union of role keys defined in the parent `PackageConfig`.
 */
export interface DocumentRoleConfig<K extends string = string> {
  /**
   * The `internalRole` value to write onto created pages.
   *
   * In the old model this was the Sanity schema type name. Now it's a
   * semantic string that the Structure Builder, conditional validation,
   * and frontend all use to identify this document's purpose.
   */
  name: string;

  /** Human-readable title shown in Studio */
  title: string;

  /** Icon shown in Studio lists and structure */
  icon: ComponentType | ReactNode;

  /** Description shown in package selection UI */
  description?: string;

  /**
   * Whether this document can be placed under a generic "page" in the
   * site tree. Defines an **entry point**.
   * @default false
   */
  allowPageAsParent?: boolean;

  /**
   * Which other roles within THIS package can be a parent.
   * Uses role keys — resolved to `internalRole` values automatically.
   */
  allowedParentRoles?: NoInfer<K>[];

  /**
   * Blocks to pre-populate in the pageBuilder on creation.
   * This is the "Blueprint" — the initial content that makes a generic
   * page feel like a catalog, article hub, etc. to the editor.
   *
   * @example
   * initialBlocks: [
   *   { _type: "dynamicCollection", initialData: { source: "product" } },
   * ]
   */
  initialBlocks?: BlueprintBlock[];

  /**
   * Additional initial values merged on top of the core fields.
   * Can be a static object or a function receiving template params.
   */
  initialValues?:
    | Record<string, unknown>
    | ((params: TemplateParams) => Record<string, unknown>);

  /** Override the default preview config */
  preview?: PreviewConfig;

  /** Override which group tab opens by default */
  defaultGroup?: GroupValue;

  /** Whether the Studio UI allows changing this document's parent */
  setParentAllowed?: boolean;
}

// ---------------------------------------------------------------------------
// Package config
// ---------------------------------------------------------------------------

export interface PackageConfig<K extends string = string> {
  key: PackageKey;
  title: string;
  globals?: { [G in GlobalType]?: boolean | GlobalPresentationConfig<G> };
  documents: { [R in K]: DocumentRoleConfig<K> };
}

// ---------------------------------------------------------------------------
// Result types
// ---------------------------------------------------------------------------

/**
 * Resolved metadata for a single document role.
 *
 * In the new model, `type` is always `"page"` and `internalRole` carries
 * the semantic identity. The old consumers (structure builder, document
 * actions) now use `internalRole` where they used to use `type`.
 */
export interface DocumentRoleMeta {
  /** Always `"page"` — kept for backward compatibility */
  type: "page";

  /** The `internalRole` value written to created documents */
  internalRole: string;

  /** Human-readable title */
  title: string;

  /** Studio icon */
  icon: ComponentType | ReactNode;

  /** Description for UI */
  description?: string;

  /** Generated template ID */
  templateId: string;

  /** Whether the Studio UI allows changing this document's parent */
  setParentAllowed: boolean;

  /** The semantic role key from the package config */
  role: string;

  /** Resolved `internalRole` values that can be parents */
  resolvedParentRoles: string[];

  /** Whether this role can live under a generic Page */
  isEntryPoint: boolean;

  /** The package key this role belongs to */
  packageKey: string;
}

export interface ResolvedGlobalConfig {
  type: string;
  structureTitle: string;
  structureId: string;
  icon?: ComponentType | ReactNode;
  filter: string;
  defaultOrdering: { field: string; direction: "asc" | "desc" }[];
}

export interface PackageResult<K extends string = string> {
  key: PackageKey;
  title: string;

  /**
   * Always empty in the new model — the universal `page` schema is
   * registered separately.
   * @deprecated Register the `page` schema directly in your Sanity config.
   */
  schemas: [];

  templates: InitialValueTemplate[];
  documents: Record<K, DocumentRoleMeta>;
  globals: Record<string, ResolvedGlobalConfig>;
}

// ---------------------------------------------------------------------------
// Default preview (unchanged)
// ---------------------------------------------------------------------------

const defaultPreview: PreviewConfig = {
  select: {
    title: "title",
    slug: "slug.current",
    media: "ogImage",
    isPrivate: "seoNoIndex",
    role: "internalRole",
  },
  prepare: ({ title, slug, media, isPrivate, role }) => {
    const status = isPrivate ? "skjult" : "indeksert";
    const roleLabel = role ? `[${role}] ` : "";
    return {
      title: `${roleLabel}${title || "Side uten tittel"}`,
      subtitle: slug ? `${slug} · ${status}` : status,
      media,
    };
  },
};

/** Standard template parameters — unchanged from v1 */
const TEMPLATE_PARAMETERS = [
  { name: "siteId", type: "string" },
  { name: "parentId", type: "string" },
  { name: "title", type: "string" },
] as const;

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Resolves role keys into `internalRole` values (which are now the
 * `name` field on each `DocumentRoleConfig`).
 *
 * In v1 this resolved to Sanity type names — same logic, different
 * output semantics.
 */
function _resolveParentRoles(
  roleKey: string,
  roleConfig: DocumentRoleConfig<string>,
  allRoles: Record<string, DocumentRoleConfig<string>>,
): string[] {
  const parents: string[] = [];

  // Entry points can be placed under any generic "page"
  // (internalRole: undefined / "standard")
  if (roleConfig.allowPageAsParent) {
    parents.push("page");
  }

  for (const ref of roleConfig.allowedParentRoles ?? []) {
    if (allRoles[ref]) {
      parents.push(allRoles[ref].name);
    } else {
      throw new Error(
        `Role "${roleKey}" references parent role "${ref}" which does not exist in this package.`,
      );
    }
  }

  return parents;
}

/**
 * Builds an Initial Value Template that creates a `page` document
 * with the correct `internalRole`, pre-populated `pageBuilder` blocks,
 * and site/parent/title wiring.
 */
function _buildTemplate(
  packageKey: string,
  roleKey: string,
  roleConfig: DocumentRoleConfig<string>,
): InitialValueTemplate {
  const templateId = `pkg-${packageKey}-${roleKey}-template`;

  return {
    id: templateId,
    title: roleConfig.title,
    schemaType: "page", // ← the key change
    icon: roleConfig.icon,
    parameters: [...TEMPLATE_PARAMETERS],
    value: (params: TemplateParams) => {
      // Core fields — always set from creation context
      const base: Record<string, unknown> = {
        internalRole: roleConfig.name,
        blueprintKey: `${packageKey}.${roleKey}`,
      };

      if (params.title) {
        base.title = params.title;
      }

      if (params.siteId) {
        base.site = { _type: "reference", _ref: params.siteId };
      }

      if (params.parentId) {
        base.parent = { _type: "reference", _ref: params.parentId };
      }

      // Pre-populate the pageBuilder with blueprint blocks
      if (roleConfig.initialBlocks?.length) {
        base.pageBuilder = roleConfig.initialBlocks.map((block, i) => ({
          _type: block._type,
          _key: `blueprint-${roleKey}-${i}`,
          ...(block.initialData ?? {}),
        }));
      }

      // Consumer-provided extra values
      const iv = roleConfig.initialValues;
      const extra = typeof iv === "function" ? iv(params) : (iv ?? {});

      // Extra values merge on top, but core fields always win
      return { ...extra, ...base };
    },
  };
}

/**
 * Resolves globals config — unchanged from v1 except the GROQ filter
 * now matches `_type == "page"` instead of per-package type names.
 */
function _resolveGlobals(
  packageKey: string,
  globalsConfig: PackageConfig["globals"],
  packageRoleNames: string[],
): Record<string, ResolvedGlobalConfig> {
  const resolved: Record<string, ResolvedGlobalConfig> = {};

  if (!globalsConfig) return resolved;

  for (const [globalType, config] of Object.entries(globalsConfig)) {
    if (!config) continue;

    const globalDef = GLOBAL_REGISTRY[globalType as GlobalType];
    const overrides = typeof config === "boolean" ? {} : config;

    // Runtime validation: ensure ordering fields exist in sortFields
    if (overrides.defaultOrdering && globalDef) {
      const validFields = new Set(globalDef.sortFields);
      for (const ordering of overrides.defaultOrdering) {
        if (!validFields.has(ordering.field)) {
          throw new Error(
            `Global "${globalType}" has no sortable field "${ordering.field}". ` +
              `Available sort fields: ${globalDef.sortFields.join(", ")}`,
          );
        }
      }
    }

    // In v1: filter by _type in packageDocumentTypes
    // In v2: filter by _type == "page" && internalRole in packageRoleNames
    const roleList = JSON.stringify(packageRoleNames);

    resolved[globalType] = {
      type: globalType,
      structureTitle:
        overrides.structureTitle ?? globalDef?.schema.title ?? globalType,
      structureId: `global-${packageKey}-${globalType}`,
      icon: overrides.icon ?? globalDef?.schema.icon,
      filter: `_type == "${globalType}" && count(*[_type == "page" && internalRole in ${roleList} && references(^._id)]) > 0`,
      defaultOrdering: overrides.defaultOrdering ?? [
        {
          field: globalDef?.sortFields[0] ?? "title",
          direction: "asc" as const,
        },
      ],
    };
  }

  return resolved;
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Define a complete package: templates + metadata in one declaration.
 *
 * In the new model, this no longer produces Sanity schema definitions.
 * Instead it produces Initial Value Templates that all target the
 * universal `page` type, setting `internalRole` and pre-populating
 * `pageBuilder` blocks.
 *
 * @example
 * ```ts
 * const commerce = definePackage({
 *   key: "commerce",
 *   title: "Netthandel",
 *   globals: { product: true },
 *   documents: {
 *     catalogPage: {
 *       name: "catalog",            // ← internalRole value
 *       title: "Katalog",
 *       icon: ShoppingCart,
 *       allowPageAsParent: true,
 *       initialBlocks: [
 *         { _type: "dynamicCollection", initialData: { source: "product" } },
 *       ],
 *     },
 *     productPage: {
 *       name: "productPage",        // ← internalRole value
 *       title: "Produktside",
 *       icon: PackageIcon,
 *       allowedParentRoles: ["catalogPage", "productPage"],
 *     },
 *   },
 * });
 *
 * // Register in Sanity config:
 * // schemas → just the universal `page` + your strict data types
 * // templates → (prev) => [...prev, ...commerce.templates]
 * ```
 */
export function definePackage<K extends string>(
  config: PackageConfig<K>,
): PackageResult<K> {
  const { key, title, documents } = config;

  const templates: InitialValueTemplate[] = [];
  const documentsMeta = {} as Record<K, DocumentRoleMeta>;

  for (const [roleKey, roleConfig] of Object.entries<DocumentRoleConfig<K>>(
    documents,
  )) {
    const resolvedParentRoles = _resolveParentRoles(
      roleKey,
      roleConfig,
      documents,
    );

    const templateId = `pkg-${key}-${roleKey}-template`;

    // Build template (no more schema generation)
    templates.push(_buildTemplate(key, roleKey, roleConfig));

    // Build metadata
    documentsMeta[roleKey as K] = {
      type: "page",
      internalRole: roleConfig.name,
      title: roleConfig.title,
      icon: roleConfig.icon,
      description: roleConfig.description,
      templateId,
      setParentAllowed: roleConfig.setParentAllowed ?? false,
      role: roleKey,
      resolvedParentRoles,
      isEntryPoint: !!roleConfig.allowPageAsParent,
      packageKey: key,
    };
  }

  const packageRoleNames = Object.values<DocumentRoleConfig<K>>(documents).map(
    (r) => r.name,
  );
  const globals = _resolveGlobals(key, config.globals, packageRoleNames);

  return {
    key,
    title,
    schemas: [],
    templates,
    documents: documentsMeta,
    globals,
  };
}

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

/**
 * Create lookup maps from an array of PackageResults.
 *
 * Now indexes by `internalRole` instead of by Sanity type name, since
 * all documents share `_type: "page"`.
 */
export function createPackageRegistry(packages: PackageResult<string>[]) {
  const allTemplates = packages.flatMap((pkg) => pkg.templates);

  const byRole = new Map<
    string,
    { package: PackageResult<string>; meta: DocumentRoleMeta }
  >();
  const byKey = new Map<string, PackageResult<string>>();
  const entryPointRoles = new Set<string>();

  for (const pkg of packages) {
    if (byKey.has(pkg.key)) {
      throw new Error(
        `Duplicate package key "${pkg.key}". Package keys must be unique.`,
      );
    }
    byKey.set(pkg.key, pkg);

    for (const meta of Object.values<DocumentRoleMeta>(pkg.documents)) {
      if (byRole.has(meta.internalRole)) {
        const existing = byRole.get(meta.internalRole)!;
        throw new Error(
          `Duplicate internalRole "${meta.internalRole}" found in packages ` +
            `"${existing.package.key}" and "${pkg.key}". ` +
            `Internal role names must be unique across packages.`,
        );
      }

      byRole.set(meta.internalRole, { package: pkg, meta });

      if (meta.isEntryPoint) {
        entryPointRoles.add(meta.internalRole);
      }
    }
  }

  return {
    /** All registered packages */
    packages,

    /** Every template from every package */
    allTemplates,

    /**
     * All `internalRole` values that represent entry points.
     * Use in structure builder to determine which roles can appear
     * at the top of the site tree.
     */
    allEntryRoles: Array.from(entryPointRoles),

    /** For UI dropdowns (site's enabledPackages field) */
    packageOptions: packages.map((pkg) => ({
      title: pkg.title,
      value: pkg.key,
    })),

    /**
     * Find the package and role metadata for a given `internalRole` value.
     * This replaces the old `lookup(typeName)`.
     */
    lookup: (internalRole: string) => byRole.get(internalRole),

    /** Find a package by its key */
    getPackage: (key: string) => byKey.get(key),

    /**
     * Collect resolved globals for a set of enabled package keys.
     */
    globalsForPackages: (
      enabledKeys: string[],
    ): Array<ResolvedGlobalConfig & { packageKey: string }> => {
      const result: Array<ResolvedGlobalConfig & { packageKey: string }> = [];

      for (const key of enabledKeys) {
        const pkg = byKey.get(key);
        if (!pkg) continue;

        for (const config of Object.values(pkg.globals)) {
          result.push({ ...config, packageKey: key });
        }
      }

      return result;
    },

    /**
     * Get all document role metadata for a set of enabled packages.
     * Useful for the structure builder and "new document" menus.
     */
    rolesForPackages: (enabledKeys: string[]): DocumentRoleMeta[] => {
      return enabledKeys.flatMap((key) => {
        const pkg = byKey.get(key);
        if (!pkg) return [];
        return Object.values<DocumentRoleMeta>(pkg.documents);
      });
    },

    /**
     * Given a parent page's `internalRole`, return which blueprint roles
     * can be created as children under it.
     */
    allowedChildRoles: (
      parentRole: string | undefined,
      enabledKeys: string[],
    ): DocumentRoleMeta[] => {
      const allMetas = enabledKeys.flatMap((key) => {
        const pkg = byKey.get(key);
        if (!pkg) return [];
        return Object.values<DocumentRoleMeta>(pkg.documents);
      });

      return allMetas.filter((meta) => {
        // Entry points can be children of generic pages (no role)
        if (!parentRole && meta.isEntryPoint) return true;

        // Check if this meta's resolved parents include the parent role
        if (parentRole && meta.resolvedParentRoles.includes(parentRole)) {
          return true;
        }

        return false;
      });
    },
  };
}
