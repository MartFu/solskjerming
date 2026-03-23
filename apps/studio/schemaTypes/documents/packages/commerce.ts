// ===========================================================================
// PACKAGE: Commerce
// ===========================================================================
//
// Root: catalogRoot — the product listing/catalog page.
//   Nests under generic pages: /shop/catalog
//   Adds filter categories for the product grid.
//
// Child: productPage — site-specific proxy for a workspace-global product.
//   Nests under catalogRoot: /shop/catalog/cool-product
// ===========================================================================

import { DOCUMENT_NAMES } from "@/schemaTypes/constant";
import { ShoppingCart } from "lucide-react";
import { defineField } from "sanity";
import { GROUP } from "@/utils/constant";
import { PackageIcon } from "@sanity/icons";
import { definePackage } from "./define-package";
import { PACKAGE_KEYS } from "./constant";

export const commerce = definePackage({
  key: PACKAGE_KEYS.commerce,
  title: "Netthandel",
  globals: {
    product: true
  },
  documents: {
    catalogPage: {
      name: DOCUMENT_NAMES.catalogRoot,
      title: "Katalog",
      description: "En side som viser en liste over produkter.",
      allowPageAsParent: true,
      icon: ShoppingCart,
      pagebuilderType: "catalogRootPageBuilder",
      extraFields: [
        defineField({
          name: "filterCategories",
          title: "Filterkategorier",
          type: "array",
          group: GROUP.MAIN_CONTENT,
          of: [{ type: "string" }],
          description:
            "Kategorier som er tilgjengelige for filtrering av produkter i denne katalogen.",
          options: { layout: "tags" },
        }),
      ],
    },

    productPage: {
      name: DOCUMENT_NAMES.productPage,
      title: "Produktside",
      icon: PackageIcon,
      allowedParentRoles: ["catalogPage", "productPage"], 
      extraFields: [
        defineField({
          name: "product",
          title: "Produkt",
          type: "reference",
          group: GROUP.MAIN_CONTENT,
          to: [{ type: "product" }],
          description:
            "Referanse til det globale produktobjektet. Produktets faste data som pris og spesifikasjoner hentes derfra.",
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: "marketingCopy",
          title: "Markedsmessig innhold",
          type: "richText",
          group: GROUP.MAIN_CONTENT,
          description:
            "Nettstedsspesifikt kampanjeinnhold for dette produktet.",
        }),
        defineField({
          name: "coverImage",
          title: "Hovedbilde",
          type: "image",
          group: GROUP.MAIN_CONTENT,
          options: { hotspot: true },
          description:
            "Spesifikt bilde for dette nettstedet. Bruker produktets standardbilde hvis feltet er tomt.",
        }),
      ],
    },
  },
});
