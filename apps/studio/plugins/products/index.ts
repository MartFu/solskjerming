import { definePlugin } from "sanity";
import { PackageIcon } from "@sanity/icons";
import { ProductsView } from "./components/ProductsView";
import { ProductsPluginConfig } from "./types";


export const productsPlugin = definePlugin<ProductsPluginConfig>((config) => {

  return {
    name: "products-plugin",
    studio: {
      components: {},
    },
    document: {
      newDocumentOptions: (prev) => prev,
    },
    plugins: [],
    tools: [
      {
        name: "products",
        title: "Produkter",
        icon: PackageIcon,
        component: () => ProductsView({ config }),
      },
    ],
  };
});
