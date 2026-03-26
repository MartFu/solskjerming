import { defineField } from "sanity";
import { GROUP } from "@/utils/constant";
import { moduleRegistry } from "@/schemaTypes/documents/modules";

/**
 * Field for the site document that controls which packages
 * are available. Only enabled packages show up in the structure
 * sidebar and allow creation of root/child documents.
 */
export const enabledModulesField = defineField({
    name: "enabledModules",
    title: "Aktiverte moduler",
    type: "array",
    group: GROUP.RELATIONSHIPS,
    description:
        "Velg hvilke innholdstyper som skal være tilgjengelige for dette nettstedet. Kun aktiverte moduler vises i studioet og kan opprettes/utvides. Noter at kun moduler pakker vil ha tilgjengelige URL-er på nettstedets frontend.",
    of: [{ type: "string" }],
    options: {
        list: moduleRegistry.modules.map((mod) => ({
                title: mod.title,
                value: mod.key,
            })),
        layout: "grid",
    },
});
