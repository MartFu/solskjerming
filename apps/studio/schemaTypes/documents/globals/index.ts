import { article } from "./article";
import { author } from "./author";
import { category } from "./category";
import { documentation } from "./documentation";
import { faq } from "./faq";
import { product } from "./product";
import { video } from "./video";

/**
 * Workspace-level documents that are referenced by sites and their pages,
 * but are not owned by any single site.
 *
 * These are NEVER deleted or archived as part of a site operation. They are
 * used in the deletion preview to inform the editor which documents will be
 * left untouched, and to ensure we never accidentally treat a shared asset
 * reference as an owned document.
 *
 * ⚠️  If you add a new shared asset type, add it here so that it is
 *     correctly excluded from site-scoped operations.
 *
 */
export const globals = [
  documentation,
  category,
  video,
  product,
  faq,
  author,
  article,
] as const;

export type GlobalDefinition = (typeof globals)[number];
export type GlobalType = (typeof globals)[number]["schema"]["name"];

export const globalSchemaTypes = globals.map((d) => d.schema);
export const globalNames = globals.map((d) => d.schema.name);

export const GLOBAL_REGISTRY = Object.fromEntries(
  globals.map((g) => [g.schema.name, g]),
) as {
  [T in GlobalType]: Extract<(typeof globals)[number], { schema: { name: T } }>;
};

export type GlobalFieldNames<T extends GlobalType> =
  (typeof GLOBAL_REGISTRY)[T]["sortFields"][number];

export function isGlobalType(type: string): type is GlobalType {
  return globalNames.includes(type as GlobalType);
} 


export function createGlobalRegistry(globals: readonly GlobalDefinition[]) {
  const byName = new Map(globals.map((g) => [g.schema.name, g]));

  return {
    /** Every schema, ready to spread into Sanity config */
    allSchemas: globals.map((g) => g.schema),

    /** All globals that appear regardless of enabled packages */
    alwaysAvailable: globals.filter((g) => g.alwaysAvailable),

    /** Look up a global by its type name */
    lookup: (type: GlobalType) => byName.get(type),

    /** Check if a type name is a known global */
    isGlobalType: (type: string): type is GlobalType => byName.has(type as GlobalType),

    /** Map over all registered globals */
    map: <T>(fn: (global: GlobalDefinition) => T): T[] => globals.map(fn),
  };
}


/**
 * Primary interface for interacting with the globals outside of the schemaTypes directory.
 * 
 */
export const globalRegistry = createGlobalRegistry(globals);