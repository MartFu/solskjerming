// ===========================================================================
// BLUEPRINT VALIDATION
// ===========================================================================
//
// Conditional validation rules keyed by `internalRole`. Since all pages
// share one schema, this module is how we enforce "ogImage required for
// articles" or "product reference required for productPage" without
// needing separate types.
//
// Each rule is a standard Sanity CustomValidator function that returns
// `true` (valid) or a string (error message). The `conditionalValidation`
// helper wraps a field's validation so it dispatches to the right rule
// based on the document's `internalRole` at runtime.
//
// USAGE IN SCHEMA:
//
//   import { conditionalValidation } from "./blueprint-validation";
//
//   defineField({
//     name: "ogImage",
//     // ... other config ...
//     validation: conditionalValidation("ogImage"),
//   })
//
// This keeps the page schema clean — no inline `Rule.custom(...)` chains
// cluttering the field definitions.
// ===========================================================================

import type { Rule, ValidationContext } from "sanity";

// ---------------------------------------------------------------------------
// InternalRole type
// ---------------------------------------------------------------------------

/**
 * All possible `internalRole` values across the system.
 * Extend this union as new blueprints are added.
 *
 * `undefined` is the implicit default for pages created without a blueprint
 * (i.e., standard generic pages).
 */
export type InternalRole =
  | "standard"
  | "catalog"
  | "productPage"
  | "articleHub"
  | "article"
  | "documentation";

// ---------------------------------------------------------------------------
// Validation rules registry
// ---------------------------------------------------------------------------

/**
 * A single field-level validator.
 * Receives the field's value and the full Sanity validation context.
 * Returns `true` if valid, or a string error message.
 */
type FieldValidator = (
  value: unknown,
  context: ValidationContext,
) => true | string;

/**
 * Role-specific field validation overrides.
 *
 * If an `internalRole` has an entry here, its field validators are checked
 * whenever that field's validation runs. If there's no entry for the role
 * or field, the field passes (no extra constraint).
 *
 * Add new roles by extending the `InternalRole` union and adding an entry
 * to this object.
 */
export const ROLE_RULES: Partial<
  Record<InternalRole, Record<string, FieldValidator>>
> = {
  article: {
    ogImage: (value) => (value ? true : "OG-bilde er påkrevd for artikler."),
    publishedAt: (value) =>
      value ? true : "Publiseringsdato er påkrevd for artikler.",
  },
  productPage: {
    // Note the path matches the field name in your page.ts
    "dataRefs.product": (value) =>
      value ? true : "Produktreferanse er påkrevd for produktsider.",
  },
  catalog: {
    filterCategories: (value: any) =>
      value && value.length > 0
        ? true
        : "Velg minst én kategori for katalogen.",
  },
};



// ---------------------------------------------------------------------------
// conditionalValidation helper
// ---------------------------------------------------------------------------

/**
 * Creates a Sanity validation function that dispatches to role-specific
 * rules based on the document's `internalRole`.
 *
 * If the document has no role, or the role has no rule for this field,
 * the field passes validation — this means standard pages have no extra
 * constraints beyond whatever the field's own base validation already does.
 *
 * @param fieldName - The field name to look up in the role's rule set.
 *                    Must match a key in the role's entry in `ROLE_RULES`.
 *
 * @returns A validation function compatible with Sanity's `validation` prop.
 *
 * @example
 * defineField({
 *   name: "ogImage",
 *   type: "image",
 *   validation: conditionalValidation("ogImage"),
 * })
 */
export function conditionalValidation(fieldName: string): (rule: Rule) => Rule {
  return (rule: Rule) =>
    rule.custom((value: unknown, context: ValidationContext) => {
      const doc = context.document as
        | { internalRole?: InternalRole }
        | undefined;
      const role = doc?.internalRole;

      // No role → standard page → no conditional rules apply
      if (!role) return true;

      const roleRules = ROLE_RULES[role];
      if (!roleRules?.[fieldName]) return true;

      return roleRules[fieldName](value, context);
    });
}

// ---------------------------------------------------------------------------
// Export for tests / external validation logic
// ---------------------------------------------------------------------------

/**
 * Direct access to the rules map for unit testing.
 * Don't use this in production code — use `conditionalValidation` instead.
 */
export const _ROLE_RULES_FOR_TESTING = ROLE_RULES;
