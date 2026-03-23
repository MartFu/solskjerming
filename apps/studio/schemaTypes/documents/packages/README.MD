# Packages

A package groups related document types into a toggleable unit. When enabled on a site, it registers Sanity schemas, exposes globals in the Studio sidebar, and provides metadata for the page tree and document creation flows.

## Defining a package

```ts
import { ShoppingCart } from "lucide-react";
import { PackageIcon } from "@sanity/icons";
import { definePackage } from "./define-package";

export const commerce = definePackage({
  key: "commerce",
  title: "Netthandel",
  globals: {
    product: {
      structureTitle: "Produkter",
      defaultOrdering: [{ field: "title", direction: "asc" }],
    },
  },
  documents: {
    catalog: {
      name: "catalogRoot",
      title: "Katalog",
      icon: ShoppingCart,
      templateId: "catalogRootTemplate",
      allowPageAsParent: true,
      pagebuilderType: "catalogRootPageBuilder",
    },
    productPage: {
      name: "productPage",
      title: "Produktside",
      icon: PackageIcon,
      templateId: "productPageTemplate",
      allowedParentRoles: ["catalog"],
    },
  },
});
```

## Key concepts

### Document roles

The `documents` object maps **role keys** to document configurations. Role keys are freeform — use names that describe purpose (`"catalog"`, `"productPage"`, `"topic"`).

Structure is derived from two properties on each role:

- **`allowPageAsParent`** — marks this document as an **entry point** that can live under a Page in the site tree.
- **`allowedParentRoles`** — lists which other roles in the same package can be a parent. TypeScript autocompletes these from the keys you define and will error on typos. A role can list itself for recursive nesting.

```ts
documents: {
  root:    { allowPageAsParent: true, ... },
  topic:   { allowedParentRoles: ["root", "topic"], ... },  // recursive
  article: { allowedParentRoles: ["topic"], ... },
}
```

### Globals

Packages can claim **global document types** — workspace-level documents (product, author, article, etc.) that are defined centrally and shared across packages.

Pass `true` for defaults, or an object to override presentation in the Studio sidebar. Each package gets its own filtered view of the global, scoped to documents the package owns.

```ts
globals: {
  product: true,                    // uses defaults from the global definition
  author: {
    structureTitle: "Produktforfattere",  // custom title in sidebar
    defaultOrdering: [{ field: "name", direction: "asc" }],
  },
}
```

The `defaultOrdering` field is type-safe — it only accepts fields declared in the global's `sortFields`.

### What `definePackage` produces

The return value contains:

- **`schemas`** — Sanity `defineType` results to spread into your schema config.
- **`documents`** — resolved metadata per role: type name, icon, template, resolved parent types, and whether it's an entry point.
- **`globals`** — resolved global configs with structure IDs, GROQ filters, and presentation overrides.

## Registering packages

```ts
import { createPackageRegistry } from "./define-package";

export const registry = createPackageRegistry([articles, commerce]);

registry.allSchemas; // every schema, ready for Sanity config
registry.allEntryTypes; // ["page", "catalogRoot", ...] — top-level types
registry.lookup("productPage"); // { package, meta } for any type name
registry.globalsForPackages(["commerce"]); // resolved globals for enabled packages
```

The registry validates that all document type names and package keys are unique,
and throws at startup if there are collisions.
