// ===========================================================================
// MODULES — Public API
// ===========================================================================
//
// This is the only file consumers import from.
//
// Usage:
//   import { moduleRegistry } from "@/schemaTypes/modules";
//   import type { CreationOption, ResolvedBlueprint } from "@/schemaTypes/modules";
//
// Adding a new module:
//   1. Create a file in definitions/ (see commerce.ts for the pattern)
//   2. Import it below and add it to the createModuleRegistry call
// ===========================================================================

import { createModuleRegistry } from "@/utils/modules";
// import { commerce } from "./commerce";
import { commerceModule } from "./_example";

export const moduleRegistry = createModuleRegistry([
  // commerce,
  commerceModule,
  // articles,
]);


