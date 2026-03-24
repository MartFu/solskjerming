// ===========================================================================
// PACKAGE: Commerce (Blueprint-Driven)
// ===========================================================================
//
// WHAT CHANGED:
// - `name` is now the `internalRole` value, not a Sanity type name.
// - `pagebuilderType` → `initialBlocks` — pre-populates the universal
//   pageBuilder with a `dynamicCollection` block.
// - `extraFields` removed — role-specific fields like `filterCategories`
//   and `product` now live in the base `page` schema with `hidden`
//   callbacks that check `internalRole`.
//
// WHAT STAYED:
// - Package key, title, globals — identical.
// - Parent/child relationships — same `allowedParentRoles` semantics.
// - The API call site looks almost identical.
// ===========================================================================

import { ShoppingCart } from "lucide-react";
import { PackageIcon } from "@sanity/icons";
import { definePackage } from "./define-package";
import { PACKAGE_KEYS } from "../packages";

export const commerce = definePackage({
  key: PACKAGE_KEYS.commerce,
  title: "Netthandel",
  globals: {
    product: true,
  },
  documents: {
    catalogPage: {
      name: "catalog", // ← this becomes the internalRole value
      title: "Katalog",
      description: "En side som viser en liste over produkter.",
      allowPageAsParent: true,
      icon: ShoppingCart,

      // The "Blueprint" — instead of pagebuilderType: "catalogRootPageBuilder",
      // we pre-populate the universal pageBuilder with a dynamicCollection block.
      initialBlocks: [
        {
          _type: "dynamicCollection",
          initialData: {
            source: "product",
            layout: "grid",
            limit: 24,
          },
        },
      ],

      // Old `extraFields: [filterCategories]` is now handled by a
      // conditionally-visible field in the base `page` schema.
      // We seed its initial value here:
      initialValues: {
        filterCategories: [],
      },
    },

    productPage: {
      name: "productPage", // ← internalRole value
      title: "Produktside",
      icon: PackageIcon,
      allowedParentRoles: ["catalogPage", "productPage"],

      // Product pages get a product detail block + marketing content
      initialBlocks: [
        {
          _type: "productDetail",
          initialData: {
            showPrice: true,
            showSpecifications: true,
          },
        },
        {
          _type: "richText",
        },
      ],

      // Old `extraFields: [product, marketingCopy, coverImage]` are now:
      // - `product` → conditionally-visible field in `page` schema
      //   (validated via blueprint-validation.ts)
      // - `marketingCopy` → a richText block in the pageBuilder (above)
      // - `coverImage` → use the standard ogImage or a hero block
    },
  },
});
