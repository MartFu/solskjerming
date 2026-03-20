import { defineField } from "sanity";
import { GROUP } from "@/utils/constant";
import { PACKAGE_OPTIONS } from "@/utils/package";

/**
 * Field for the site document that controls which packages
 * are available. Only enabled packages show up in the structure
 * sidebar and allow creation of root/child documents.
 */
export const enabledPackagesField = defineField({
    name: "enabledPackages",
    title: "Aktiverte pakker",
    type: "array",
    group: GROUP.RELATIONSHIPS,
    description:
        "Velg hvilke innholdstyper som skal være tilgjengelige for dette nettstedet. Kun aktiverte pakker vises i studioet og kan opprettes/utvides. Noter at kun aktiverte pakker vil ha tilgjengelige URL-er på nettstedets frontend.",
    of: [{ type: "string" }],
    options: {
        list: [...PACKAGE_OPTIONS],
        layout: "grid",
    },
});
