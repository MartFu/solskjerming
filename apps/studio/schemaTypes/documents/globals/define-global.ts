import { defineType, DocumentDefinition } from "sanity";

export function defineGlobal<
  const N extends string,
  const S extends readonly string[],
>(
  config: DocumentDefinition & {
    name: N;
    sortFields: S
  },
) {
  const schema = defineType(config as Parameters<typeof defineType>[0]);
  return {
    schema: schema as typeof schema & { readonly name: N },
    sortFields: config.sortFields,
  };
}
