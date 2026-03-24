// ===========================================================================
// MODULE REGISTRY
// ===========================================================================
//
// The single public API for everything related to page modules.
//
// Every consumer — structure builder, creation modal, page tree, validation,
// document badges, Sanity config — goes through this registry. No consumer
// imports from define-module.ts, validation.ts, or structure.ts directly.
//
// To use:
//   import { moduleRegistry } from "@/schemaTypes/modules";
//
//   moduleRegistry.getBlueprint("catalog")
//   moduleRegistry.getCreationOptions(parentRole, enabledPkgs)
//   moduleRegistry.allTemplates
//   moduleRegistry.buildStructure(S, siteId, enabledPkgs)
//   moduleRegistry.getValidationRule("article", "ogImage")
//   moduleRegistry.buildTreeQuery(enabledPkgs)
//   moduleRegistry.getBadgeInfo("catalog")
// ===========================================================================

import type { StructureBuilder } from "sanity/structure";
import type {
  ModuleResult,
  ResolvedBlueprint,
  ResolvedGlobalConfig,
  InitialValueTemplate,
  TemplateParams,
} from "./define-module";
import { getValidationRule } from "./validation";
import { buildStructure as buildStructureImpl } from "./structure";

// ---------------------------------------------------------------------------
// CreationOption — what the creation modal receives
// ---------------------------------------------------------------------------

/**
 * A single option in the "New page" creation modal.
 *
 * This is the bridge between the registry and the UI. The modal
 * doesn't need to know about modules, blueprints, or the registry —
 * it just renders a list of these.
 */
export interface CreationOption {
  /** Always "page" — the Sanity schema type */
  type: "page";

  /** The initial value template ID */
  templateId: string;

  /** Human-readable title for the modal */
  title: string;

  /** Description for the modal */
  description?: string;

  /** Icon for the modal */
  icon?: any;

  /**
   * The `internalRole` that will be set on the created page.
   * `undefined` for the standard generic page option.
   */
  role?: string;
}

// ---------------------------------------------------------------------------
// BadgeInfo — what the document badge component receives
// ---------------------------------------------------------------------------

export interface BadgeInfo {
  label: string;
  color: "primary" | "success" | "warning" | "danger";
}

const MODULE_COLORS: Record<string, BadgeInfo["color"]> = {
  commerce: "success",
  articles: "primary",
  documentation: "warning",
};

// ---------------------------------------------------------------------------
// CreationIntent — what the router receives
// ---------------------------------------------------------------------------
 
/**
 * A fully resolved creation intent, ready to pass to
 * `router.navigateIntent("create", [intent.payload, intent.params])`.
 *
 * This is the final output of the creation flow. The component doesn't
 * need to know about template IDs, type names, or parent ID normalization —
 * it just passes this through to the router.
 */
export interface CreationIntent {
  payload: { type: string; template: string };
  params: Record<string, string>;
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------
 
export function createModuleRegistry(modules: ModuleResult<string>[]) {
  // ── Index all data ────────────────────────────────────────
 
  const allTemplates: InitialValueTemplate[] = [];
  const byRole = new Map<string, { module: ModuleResult<string>; blueprint: ResolvedBlueprint }>();
  const byKey = new Map<string, ModuleResult<string>>();
  const entryPointRoles = new Set<string>();
 
  for (const mod of modules) {
    if (byKey.has(mod.key)) {
      throw new Error(`Duplicate module key "${mod.key}".`);
    }
    byKey.set(mod.key, mod);
    allTemplates.push(...mod.templates);
 
    for (const bp of Object.values<ResolvedBlueprint>(mod.blueprints)) {
      if (byRole.has(bp.role)) {
        const existing = byRole.get(bp.role)!;
        throw new Error(
          `Duplicate role "${bp.role}" in modules "${existing.module.key}" and "${mod.key}".`,
        );
      }
      byRole.set(bp.role, { module: mod, blueprint: bp });
      if (bp.isEntryPoint) entryPointRoles.add(bp.role);
    }
  }
 
  // ── Shared helper: globals for enabled modules ────────────
 
  function globalsForModules(
    enabledKeys: string[],
  ): Array<ResolvedGlobalConfig & { packageKey: string }> {
    const result: Array<ResolvedGlobalConfig & { packageKey: string }> = [];
    for (const key of enabledKeys) {
      const mod = byKey.get(key);
      if (!mod) continue;
      for (const config of Object.values(mod.globals)) {
        result.push({ ...config, packageKey: key });
      }
    }
    return result;
  }
 
  // ── The standard page template ──────────────────────────────
  //
  // The universal "page" type needs its own template for creating
  // standard pages (no internalRole). Without this, Sanity can't
  // find "page-template" and creates a blank document.
 
  const STANDARD_PAGE_TEMPLATE_ID = "page-template";
 
  allTemplates.push({
    id: STANDARD_PAGE_TEMPLATE_ID,
    title: "Side",
    schemaType: "page",
    parameters: [
      { name: "siteId", type: "string" },
      { name: "parentId", type: "string" },
      { name: "title", type: "string" },
    ],
    value: (params: TemplateParams) => {
      const base: Record<string, unknown> = {};
 
      if (params.title) base.title = params.title;
      if (params.siteId) {
        base.site = { _type: "reference", _ref: params.siteId };
      }
      if (params.parentId) {
        base.parent = { _type: "reference", _ref: params.parentId };
      }
 
      return base;
    },
  });
 
  // ── The standard page creation option ─────────────────────
 
  const STANDARD_PAGE_OPTION: CreationOption = {
    type: "page",
    templateId: STANDARD_PAGE_TEMPLATE_ID,
    title: "Side",
    description: "En standard innholdsside.",
    role: undefined,
  };
 
  // ── Public API ────────────────────────────────────────────
 
  return {
    // -- Raw data --
 
    /** All registered modules */
    modules,
 
    /** All initial value templates, ready for Sanity config */
    allTemplates,
 
    /** All roles that can appear at root level of the site tree */
    allEntryRoles: Array.from(entryPointRoles),
 
    /** For UI dropdowns (site's enabledPackages field) */
    moduleOptions: modules.map((m) => ({ title: m.title, value: m.key })),
 
    // -- Blueprint lookups --
 
    /**
     * Get the resolved blueprint and its parent module for a given role.
     * Returns `undefined` for unknown roles (including standard pages).
     */
    getBlueprint: (role: string) => byRole.get(role),
 
    /** Get a module by its key */
    getModule: (key: string) => byKey.get(key),
 
    /**
     * Get all resolved blueprints for a set of enabled module keys.
     */
    blueprintsForModules: (enabledKeys: string[]): ResolvedBlueprint[] => {
      return enabledKeys.flatMap((key) => {
        const mod = byKey.get(key);
        if (!mod) return [];
        return Object.values<ResolvedBlueprint>(mod.blueprints);
      });
    },
 
    // -- Creation --
 
    /**
     * Get the list of page kinds that can be created as children of
     * a given parent.
     *
     * This is what feeds the "New page" modal. Returns `CreationOption[]`
     * including the standard page option.
     *
     * @param parentRole - The parent's `internalRole`, or `undefined` for
     *                     root-level / generic page parents.
     * @param enabledKeys - Module keys enabled on the current site.
     */
    getCreationOptions: (
      parentRole: string | undefined,
      enabledKeys: string[],
    ): CreationOption[] => {
      const options: CreationOption[] = [STANDARD_PAGE_OPTION];
 
      const allBlueprints = enabledKeys.flatMap((key) => {
        const mod = byKey.get(key);
        if (!mod) return [];
        return Object.values<ResolvedBlueprint>(mod.blueprints);
      });
 
      for (const bp of allBlueprints) {
        const canCreate =
          // Entry points can be created under generic pages (no role)
          (!parentRole && bp.isEntryPoint) ||
          // Or under a parent whose role is in this blueprint's allowed list
          (parentRole && bp.allowedParentRoles.includes(parentRole));
 
        if (canCreate) {
          options.push({
            type: "page",
            templateId: bp.templateId,
            title: bp.title,
            description: bp.description,
            icon: bp.icon,
            role: bp.role,
          });
        }
      }
 
      return options;
    },
 
    // -- Validation --
 
    /**
     * Get a conditional validation rule for a given role + field.
     * Returns `undefined` if no special rule exists.
     */
    getValidationRule,
 
    // -- Structure --
 
    /**
     * Build the Studio sidebar structure for a site.
     *
     * @param S - Sanity's StructureBuilder
     * @param siteId - The site document ID
     * @param enabledKeys - Module keys enabled on this site
     */
    buildStructure: (
      S: StructureBuilder,
      siteId: string,
      enabledKeys: string[],
    ) => {
      return buildStructureImpl(
        S,
        siteId,
        modules,
        enabledKeys,
        globalsForModules,
      );
    },
 
    // -- Globals --
 
    /**
     * Collect resolved globals for a set of enabled module keys.
     */
    globalsForModules,
 
    // -- Tree query --
 
    /**
     * Build the GROQ query for the page tree pane.
     *
     * Returns a query that fetches all pages for a given site,
     * including standard pages and all blueprint-created pages.
     *
     * @param enabledKeys - Module keys enabled on the current site.
     */
    buildTreeQuery: (enabledKeys: string[]): string => {
      // All blueprint-created pages have _type == "page" with an internalRole.
      // Standard pages have _type == "page" without an internalRole.
      // In both cases, we're just fetching all pages for the site.
      //
      // If you need to restrict the tree to only certain roles, filter
      // on internalRole in the query. For now, we fetch everything.
      return `*[_type == "page" && site._ref == $siteId] {
        _id,
        _type,
        title,
        "slug": slug.current,
        parent,
        sortOrder,
        internalRole
      }`;
    },
 
    // -- Creation intent --
 
    /**
     * Build a creation intent from a CreationOption and template params.
     *
     * The `context` parameter is `TemplateParams` — the same shape the
     * Initial Value Template expects. This ensures the intent builder and
     * the template always agree on what fields are needed.
     *
     * Validates the option, normalizes the parent ID, and returns an
     * object ready to pass to `router.navigateIntent("create", ...)`.
     *
     * Returns `null` if the option references an unknown role.
     *
     * @example
     * const intent = moduleRegistry.buildCreationIntent(option, {
     *   siteId,
     *   parentId: parentNode?.doc._id,
     *   title: "Cool Product",
     * });
     *
     * if (intent) {
     *   router.navigateIntent("create", [intent.payload, intent.params]);
     * }
     */
    buildCreationIntent: (
      option: CreationOption,
      context: TemplateParams,
    ): CreationIntent | null => {
      // Validate blueprint roles exist
      if (option.role && !byRole.has(option.role)) {
        return null;
      }
 
      // Normalize parent ID (strip drafts. prefix)
      const parentId = context.parentId?.replace(/^drafts\./, "") ?? undefined;
 
      const params: Record<string, string> = {
        siteId: context.siteId,
      };
      if (parentId) params.parentId = parentId;
      if (context.title) params.title = context.title;
 
      return {
        payload: { type: option.type, template: option.templateId },
        params,
      };
    },
 
    // -- Badge --
 
    /**
     * Get badge info for the Studio document header.
     *
     * @param role - The document's `internalRole` value, or `undefined`.
     */
    getBadgeInfo: (role: string | undefined): BadgeInfo => {
      if (!role) return { label: "Side", color: "primary" };
 
      const entry = byRole.get(role);
      if (entry) {
        return {
          label: entry.blueprint.title,
          color: MODULE_COLORS[entry.module.key] ?? "primary",
        };
      }
 
      // Unknown role — capitalize and show with primary color
      return {
        label: role.charAt(0).toUpperCase() + role.slice(1),
        color: "primary",
      };
    },
  };
}
 
export type ModuleRegistry = ReturnType<typeof createModuleRegistry>;