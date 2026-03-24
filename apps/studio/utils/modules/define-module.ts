// ===========================================================================
// DEFINE MODULE
// ===========================================================================
//
// The authoring API for declaring feature modules. A module groups related
// page blueprints and their associated globals into a unit that a site can
// enable or disable.
//
// To add a new feature to the system:
//   1. Create a file in modules/definitions/ (e.g. events.ts)
//   2. Call defineModule({ ... })
//   3. Import it in modules/index.ts and add it to the registry
//
// That's it. The registry handles everything downstream: templates,
// structure, validation, creation options, tree queries, badges.
// ===========================================================================

import { type ComponentType, type ReactNode } from "react";
import { type PreviewConfig } from "sanity";
import {
  type GlobalType,
  type GlobalFieldNames,
  GLOBAL_REGISTRY,
} from "@/schemaTypes/documents/globals";
import { type GroupValue } from "@/utils/constant";

// ---------------------------------------------------------------------------
// Blueprint block — what gets seeded into pageBuilder on creation
// ---------------------------------------------------------------------------

export interface BlueprintBlock {
  /** Sanity object type name, e.g. "dynamicCollection", "hero" */
  _type: string;
  /** Pre-configured field values for the block */
  initialData?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Template params — passed by the Studio UI at creation time
// ---------------------------------------------------------------------------

export interface TemplateParams {
  siteId: string;
  parentId?: string;
  title?: string;
}

// ---------------------------------------------------------------------------
// Blueprint config — defines one kind of page within a module
// ---------------------------------------------------------------------------

/**
 * Configuration for a single page blueprint within a module.
 *
 * A blueprint declares how a specific kind of page is created:
 * what `internalRole` it gets, what blocks are pre-populated,
 * where it can live in the tree, and what extra initial values it has.
 *
 * @typeParam K - Union of blueprint keys in the parent module, used
 *               to constrain `allowedParentBlueprints`.
 */
export interface BlueprintConfig<K extends string = string> {
  /**
   * The `internalRole` value written to the created page document.
   * This is the identity anchor — the Structure Builder, validation,
   * frontend, and badge all key off this string.
   */
  role: string;

  /** Human-readable title shown in Studio UI */
  title: string;

  /** Icon for Studio lists, structure, and creation modal */
  icon: ComponentType | ReactNode;

  /** Description shown in the creation modal */
  description?: string;

  /**
   * Whether pages with this blueprint can be placed under a generic
   * page (one with no `internalRole`) in the site tree.
   * @default false
   */
  isEntryPoint?: boolean;

  /**
   * Which other blueprints within THIS module can serve as parents.
   * Uses blueprint keys (the object keys in `blueprints: { ... }`).
   *
   * A blueprint can reference itself for recursive nesting.
   *
   * @example
   * allowedParentBlueprints: ["catalogPage"]  // can nest under catalog
   * allowedParentBlueprints: ["hub", "topic"] // under hub or nested topics
   */
  allowedParentBlueprints?: NoInfer<K>[];

  /**
   * Blocks to pre-populate in the pageBuilder on creation.
   * This is what makes a generic page feel like a catalog, article, etc.
   */
  initialBlocks?: BlueprintBlock[];

  /**
   * Additional initial values merged onto the document at creation.
   * Core fields (site, parent, title, internalRole, blueprintKey) are
   * always set automatically — these are extras on top.
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
// Global presentation config (unchanged from v1)
// ---------------------------------------------------------------------------

export interface GlobalPresentationConfig<T extends GlobalType = GlobalType> {
  structureTitle?: string;
  icon?: ComponentType | ReactNode;
  defaultOrdering?: {
    field: GlobalFieldNames<T>;
    direction: "asc" | "desc";
  }[];
}

// ---------------------------------------------------------------------------
// Module config — the top-level input to defineModule()
// ---------------------------------------------------------------------------

/**
 * Configuration for a feature module.
 *
 * @typeParam K - Union of blueprint keys, inferred from the `blueprints` object.
 */
export interface ModuleConfig<K extends string = string> {
  /** Unique key identifying this module, e.g. "commerce", "articles" */
  key: string;

  /** Human-readable name, e.g. "Netthandel", "Artikler" */
  title: string;

  /** Global document types this module surfaces when enabled */
  globals?: { [G in GlobalType]?: boolean | GlobalPresentationConfig<G> };

  /** Page blueprints in this module, keyed by semantic name */
  blueprints: { [B in K]: BlueprintConfig<K> };
}

// ---------------------------------------------------------------------------
// Resolved types — what the registry and consumers work with
// ---------------------------------------------------------------------------

export interface ResolvedGlobalConfig {
  type: string;
  structureTitle: string;
  structureId: string;
  icon?: ComponentType | ReactNode;
  filter: string;
  defaultOrdering: { field: string; direction: "asc" | "desc" }[];
}

/**
 * A fully resolved blueprint, ready for consumption by the registry,
 * structure builder, creation modal, and document actions.
 */
export interface ResolvedBlueprint {
  /** The `internalRole` value stamped on created pages */
  role: string;

  /** Human-readable title */
  title: string;

  /** Studio icon */
  icon: ComponentType | ReactNode;

  /** Description for creation modal */
  description?: string;

  /** Generated Sanity initial value template ID */
  templateId: string;

  /** The blueprint key within its module */
  blueprintKey: string;

  /** The module key this blueprint belongs to */
  moduleKey: string;

  /** Whether this blueprint can nest under generic pages */
  isEntryPoint: boolean;

  /** Resolved `internalRole` values that can be parents */
  allowedParentRoles: string[];

  /** Whether the Studio UI allows changing the parent */
  setParentAllowed: boolean;
}

/**
 * The output of `defineModule()`. Contains everything the registry
 * needs to process this module.
 */
export interface ModuleResult<K extends string = string> {
  key: string;
  title: string;
  blueprints: Record<K, ResolvedBlueprint>;
  globals: Record<string, ResolvedGlobalConfig>;
  templates: InitialValueTemplate[];
}

// ---------------------------------------------------------------------------
// Initial value template (Sanity-compatible)
// ---------------------------------------------------------------------------

export interface InitialValueTemplate {
  id: string;
  title: string;
  schemaType: string;
  icon?: ComponentType | ReactNode;
  parameters: Array<{ name: string; type: string }>;
  value: (params: TemplateParams) => Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TEMPLATE_PARAMETERS = [
  { name: "siteId", type: "string" },
  { name: "parentId", type: "string" },
  { name: "title", type: "string" },
] as const;

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Define a feature module.
 *
 * This is the single entry point for extending the system with new page
 * kinds. Each call produces resolved blueprints, initial value templates,
 * and global configs — everything the registry needs.
 *
 * @example
 * ```ts
 * export const commerce = defineModule({
 *   key: "commerce",
 *   title: "Netthandel",
 *   globals: { product: true },
 *   blueprints: {
 *     catalogPage: {
 *       role: "catalog",
 *       title: "Katalog",
 *       icon: ShoppingCart,
 *       isEntryPoint: true,
 *       initialBlocks: [
 *         { _type: "dynamicCollection", initialData: { source: "product" } },
 *       ],
 *     },
 *     productPage: {
 *       role: "productPage",
 *       title: "Produktside",
 *       icon: PackageIcon,
 *       allowedParentBlueprints: ["catalogPage", "productPage"],
 *     },
 *   },
 * });
 * ```
 */
export function defineModule<K extends string>(
  config: ModuleConfig<K>,
): ModuleResult<K> {
  const { key, title, blueprints: blueprintConfigs } = config;

  const resolved = {} as Record<K, ResolvedBlueprint>;
  const templates: InitialValueTemplate[] = [];

  for (const [bpKey, bpConfig] of Object.entries<BlueprintConfig<K>>(
    blueprintConfigs,
  )) {
    const parentRoles = resolveParentRoles(bpKey, bpConfig, blueprintConfigs);
    const templateId = `module-${key}-${bpKey}`;

    // Build the Sanity initial value template
    templates.push(buildTemplate(key, bpKey, bpConfig, templateId));

    // Build the resolved blueprint
    resolved[bpKey as K] = {
      role: bpConfig.role,
      title: bpConfig.title,
      icon: bpConfig.icon,
      description: bpConfig.description,
      templateId,
      blueprintKey: bpKey,
      moduleKey: key,
      isEntryPoint: !!bpConfig.isEntryPoint,
      allowedParentRoles: parentRoles,
      setParentAllowed: bpConfig.setParentAllowed ?? false,
    };
  }

  const roleNames = Object.values<BlueprintConfig<K>>(blueprintConfigs).map(
    (bp) => bp.role,
  );
  const globals = resolveGlobals(key, config.globals, roleNames);

  return { key, title, blueprints: resolved, globals, templates };
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function resolveParentRoles<K extends string>(
  bpKey: string,
  bpConfig: BlueprintConfig<K>,
  allBlueprints: Record<string, BlueprintConfig<K>>,
): string[] {
  const parents: string[] = [];

  if (bpConfig.isEntryPoint) {
    parents.push("page"); // can nest under generic pages
  }

  for (const ref of bpConfig.allowedParentBlueprints ?? []) {
    const parent = allBlueprints[ref];
    if (!parent) {
      throw new Error(
        `Blueprint "${bpKey}" references parent "${ref}" which does not exist in this module.`,
      );
    }
    parents.push(parent.role);
  }

  return parents;
}

function buildTemplate<K extends string>(
  moduleKey: string,
  bpKey: string,
  bpConfig: BlueprintConfig<K>,
  templateId: string,
): InitialValueTemplate {
  return {
    id: templateId,
    title: bpConfig.title,
    schemaType: "page",
    icon: bpConfig.icon,
    parameters: [...TEMPLATE_PARAMETERS],
    value: (params: TemplateParams) => {
      const base: Record<string, unknown> = {
        internalRole: bpConfig.role,
        blueprintKey: `${moduleKey}.${bpKey}`,
      };

      if (params.title) base.title = params.title;
      if (params.siteId) {
        base.site = { _type: "reference", _ref: params.siteId };
      }
      if (params.parentId) {
        base.parent = { _type: "reference", _ref: params.parentId };
      }

      // Pre-populate pageBuilder with blueprint blocks
      if (bpConfig.initialBlocks?.length) {
        base.pageBuilder = bpConfig.initialBlocks.map((block, i) => ({
          _type: block._type,
          _key: `bp-${bpKey}-${i}`,
          ...(block.initialData ?? {}),
        }));
      }

      // Merge consumer-provided initial values
      const iv = bpConfig.initialValues;
      const extra = typeof iv === "function" ? iv(params) : (iv ?? {});

      return { ...extra, ...base };
    },
  };
}

function resolveGlobals(
  moduleKey: string,
  globalsConfig: ModuleConfig["globals"],
  moduleRoleNames: string[],
): Record<string, ResolvedGlobalConfig> {
  const resolved: Record<string, ResolvedGlobalConfig> = {};
  if (!globalsConfig) return resolved;

  for (const [globalType, config] of Object.entries(globalsConfig)) {
    if (!config) continue;

    const globalDef = GLOBAL_REGISTRY[globalType as GlobalType];
    const overrides = typeof config === "boolean" ? {} : config;

    if (overrides.defaultOrdering && globalDef) {
      const validFields = new Set(globalDef.sortFields);
      for (const ordering of overrides.defaultOrdering) {
        if (!validFields.has(ordering.field)) {
          throw new Error(
            `Global "${globalType}" has no sortable field "${ordering.field}". ` +
              `Available: ${globalDef.sortFields.join(", ")}`,
          );
        }
      }
    }

    const roleList = JSON.stringify(moduleRoleNames);

    resolved[globalType] = {
      type: globalType,
      structureTitle:
        overrides.structureTitle ?? globalDef?.schema.title ?? globalType,
      structureId: `global-${moduleKey}-${globalType}`,
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
