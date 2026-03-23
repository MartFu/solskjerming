import { article } from "./article";
import { author } from "./author";
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
  video,
  product,
  faq,
  author,
  article,
] as const;

export const globalSchemaTypes = globals.map((d) => d.schema);
export const globalNames = globals.map((d) => d.schema.name);

export type GlobalType = (typeof globals)[number]["schema"]["name"];

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