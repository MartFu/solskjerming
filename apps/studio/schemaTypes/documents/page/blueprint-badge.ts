// // ===========================================================================
// // STUDIO COMPONENT: Blueprint Badge
// // ===========================================================================
// //
// // A Document Badge that displays the page's blueprint identity in the
// // Studio header. Since all documents are `type: "page"`, this restores
// // the contextual hint that used to come from having separate types.
// //
// // When editing a catalog page, the header shows:
// //   📄 Side  ›  🛒 Katalog
// //
// // Register in sanity.config.ts:
// //
// //   document: {
// //     badges: (prev, context) => {
// //       if (context.schemaType === "page") {
// //         return [...prev, BlueprintBadge]
// //       }
// //       return prev
// //     },
// //   }
// // ===========================================================================

// import type { DocumentBadgeComponent } from "sanity";
// import { packageRegistry } from "./package-registry";

// export const BlueprintBadge: DocumentBadgeComponent = ({
//   published,
//   draft,
// }) => {
//   const doc = (draft ?? published) as {
//     internalRole?: string;
//     blueprintKey?: string;
//   } | null;

//   const role = doc?.internalRole;

//   // No role → standard page
//   if (!role) {
//     return { label: "Side", color: "default" };
//   }

//   // Look up the role's metadata for a rich label
//   const entry = packageRegistry.lookup(role);
//   if (entry) {
//     return {
//       label: entry.meta.title,
//       color: colorForPackage(entry.meta.packageKey),
//     };
//   }

//   // Fallback: capitalize the role string
//   return {
//     label: role.charAt(0).toUpperCase() + role.slice(1),
//     color: "primary",
//   };
// };

// function colorForPackage(
//   packageKey: string,
// ): "primary" | "success" | "warning" | "danger" | "default" {
//   const map: Record<string, "primary" | "success" | "warning" | "danger"> = {
//     commerce: "success",
//     articles: "primary",
//     documentation: "warning",
//   };
//   return map[packageKey] ?? "default";
// }
