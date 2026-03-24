// ===========================================================================
// STUDIO COMPONENT: Blueprint Badge
// ===========================================================================
//
// Thin wrapper around moduleRegistry.getBadgeInfo(). Displays the page's
// blueprint identity in the Studio document header.
//
// Register in sanity.config.ts:
//   document: {
//     badges: (prev, context) => {
//       if (context.schemaType === "page") return [...prev, BlueprintBadge]
//       return prev
//     },
//   }
// ===========================================================================

import { moduleRegistry } from "@/schemaTypes/documents/modules";
import type { DocumentBadgeComponent } from "sanity";

export const BlueprintBadge: DocumentBadgeComponent = ({
  published,
  draft,
}) => {
  const doc = (draft ?? published) as { internalRole?: string } | null;
  return moduleRegistry.getBadgeInfo(doc?.internalRole);
};
