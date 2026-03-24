// ===========================================================================
// VALIDATION (internal)
// ===========================================================================
//
// Conditional validation rules keyed by `internalRole`. Since all pages
// share one schema, this is how we enforce role-specific field requirements
// (e.g. "ogImage required for articles", "product ref required for
// productPage").
//
// This module is internal to the modules/ directory. Consumers access
// validation through the registry:
//
//   import { moduleRegistry } from "@/schemaTypes/modules";
//   moduleRegistry.getValidationRule("article", "ogImage")
//
// The page schema uses `conditionalValidation("fieldName")` which calls
// into the registry at validation time.
// ===========================================================================

import type { Rule, ValidationContext } from "sanity";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type InternalRole = string;

type FieldValidator = (
  value: unknown,
  context: ValidationContext,
) => true | string;

// ---------------------------------------------------------------------------
// Rules
// ---------------------------------------------------------------------------

/**
 * Role-specific field validation overrides.
 *
 * To add validation for a new role:
 *   1. Add the role string as a key
 *   2. Add field validators as entries
 *
 * If a role/field combo isn't listed here, the field passes (no extra
 * constraint beyond whatever the field's own base validation does).
 */
export const ROLE_RULES: Record<string, Record<string, FieldValidator>> = {
  article: {
    ogImage: (value) => (value ? true : "OG-bilde er påkrevd for artikler."),
  },
  productPage: {
    product: (value) =>
      value ? true : "Produktreferanse er påkrevd for produktsider.",
  },
};

// ---------------------------------------------------------------------------
// Public API (used by the registry)
// ---------------------------------------------------------------------------

/**
 * Get a specific validation rule for a role + field combination.
 * Returns `undefined` if no rule exists (meaning: no extra constraint).
 */
export function getValidationRule(
  role: string,
  fieldName: string,
): FieldValidator | undefined {
  return ROLE_RULES[role]?.[fieldName];
}

/**
 * Creates a Sanity validation function that dispatches to role-specific
 * rules based on the document's `internalRole` at runtime.
 *
 * Used by the page schema to wrap fields that need conditional validation:
 *
 *   defineField({
 *     name: "ogImage",
 *     validation: conditionalValidation("ogImage"),
 *   })
 */
export function conditionalValidation(fieldName: string): (rule: Rule) => Rule {
  return (rule: Rule) =>
    rule.custom((value: unknown, context: ValidationContext) => {
      const doc = context.document as { internalRole?: string } | undefined;
      const role = doc?.internalRole;

      if (!role) return true;

      const validator = ROLE_RULES[role]?.[fieldName];
      if (!validator) return true;

      return validator(value, context);
    });
}
