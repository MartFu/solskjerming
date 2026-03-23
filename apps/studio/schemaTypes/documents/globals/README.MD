# Globals

Globals are workspace-level document types that exist independently of any package or site. They are shared resources — a single `product` or `author` document can be referenced by pages across multiple sites and packages.

## Defining a global

Use `defineGlobal` instead of Sanity's `defineType`. It preserves the document name and sortable field names as TypeScript literals, enabling type-safe references elsewhere in the system.

```ts
import { defineField } from "sanity";
import { UserIcon } from "lucide-react";
import { defineGlobal } from "./define-global";

export const author = defineGlobal({
  name: "author",
  title: "Forfatter",
  type: "document",
  icon: UserIcon,
  sortFields: ["name", "position"],
  fields: [
    defineField({ name: "name", type: "string", title: "Navn" }),
    defineField({ name: "position", type: "string", title: "Rolle" }),
    defineField({ name: "bio", type: "text", title: "Biografi" }),
  ],
});
```

### Why `defineGlobal`?

Sanity's `defineType` widens the `name` property to `string`, losing the literal type. `defineGlobal` preserves it so that:

- `GlobalType` is a union of all global names, derived automatically.
- Packages referencing a global get compile-time validation on the name.

### Why `sortFields`?

Sanity's `defineField` similarly widens field names to `string`. Rather than replacing `defineField` everywhere, `sortFields` declares which fields are meaningful for ordering.

When a package overrides `defaultOrdering` for a global, TypeScript constrains the `field` value to only the names listed in `sortFields`. This catches typos at compile time:

```ts
// In a package config:
globals: {
  author: {
    defaultOrdering: [{ field: "name", direction: "asc" }],  // ✓ valid
  },
}

globals: {
  author: {
    defaultOrdering: [{ field: "title", direction: "asc" }], // ✗ error — author has no "title" sort field
  },
}
```

Only include fields that make sense for ordering in Studio document lists. Not every schema field needs to be a sort field.

## Registering globals

The index file exports the array and derives all types from it:

```ts
import { author } from "./author";
import { product } from "./product";
// ...

export const globals = [author, product, ...] as const;

export const GLOBAL_SCHEMAS = globals.map((g) => g.schema);
export const GLOBAL_NAMES = globals.map((g) => g.schema.name);
export type GlobalType = (typeof globals)[number]["schema"]["name"];

export const GLOBAL_REGISTRY = Object.fromEntries(
  globals.map((g) => [g.schema.name, g]),
) as { [T in GlobalType]: Extract<(typeof globals)[number], { schema: { name: T } }> };

export type GlobalFieldNames<T extends GlobalType> =
  (typeof GLOBAL_REGISTRY)[T]["sortFields"][number];

export function isGlobalType(type: string): type is GlobalType {
  return GLOBAL_NAMES.includes(type as GlobalType);
}
```

Adding a new global is two steps: create the file with `defineGlobal`, then add it to the array in the index. Everything else — types, registry lookups, package autocomplete — updates automatically.

## How packages use globals

Packages don't define globals — they claim to use them. A package's `globals` config controls whether the global appears in the Studio sidebar when that package is enabled, and optionally overrides presentation (title, icon, ordering). The global's schema is always registered centrally.

Each package gets its own filtered view. If both `commerce` and `articles` claim the `author` global, the sidebar shows two entries, each filtered to only the authors referenced by that package's documents.
