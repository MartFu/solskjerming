// ===========================================================================
// MODULE: Commerce
// ===========================================================================

import { ShoppingCart } from "lucide-react";
import { PackageIcon } from "@sanity/icons";
import { defineModule } from "@/utils/modules";

export const commerce = defineModule({
  key: "commerce",
  title: "Netthandel",
  globals: {
    product: true,
  },
  blueprints: {
    catalogPage: {
      role: "catalog",
      title: "Katalog",
      description: "En side som viser en liste over produkter.",
      icon: ShoppingCart,
      isEntryPoint: true,
      initialBlocks: [
        {
          _type: "dynamicCollection",
          initialData: { source: "product", layout: "grid", limit: 24 },
        },
      ],
      initialValues: {
        filterCategories: [],
      },
    },

    productPage: {
      role: "productPage",
      title: "Produktside",
      description: "Nettstedsspesifikk side for et produkt.",
      icon: PackageIcon,
      allowedParentBlueprints: ["catalogPage", "productPage"],
      initialBlocks: [
        {
          _type: "productDetail",
          initialData: { showPrice: true, showSpecifications: true },
        },
        { _type: "richText" },
      ],
    },
  },
});
