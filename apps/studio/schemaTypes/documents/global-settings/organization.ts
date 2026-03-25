import { DOCUMENT_NAMES } from "@/schemaTypes/constant";
import { GROUP, GROUPS } from "@/utils/constant";
import { asStudioIcon } from "@/utils/helper";
import { Building2 } from "lucide-react";
import { defineField } from "sanity";
import { defineGlobal } from "@/utils/globals/define-global";

export const globalOrganization = defineGlobal({
  sortFields: [],
    name: DOCUMENT_NAMES.globalOrganization,
    title: "Organisasjon",
    type: "document",
    icon: asStudioIcon(Building2),
    groups: GROUPS(),
    fields: [
        defineField({
            name: "organization",
            title: "Organisasjon",
            description:
                "Definer organisasjonens identitet så nøyaktig som mulig. Disse feltene arves av nye nettsider, men kan overskrives i den enkelte nettsidens innstillinger.",
            type: "organization",
            group: GROUP.ORGANIZATION,
        }),
        defineField({
            name: "socialLinks",
            title: "Sosiale medier",
            type: "defaultSocials",
            group: GROUP.SOME,
        }),
    ],
    preview: {
        select: {
            title: "organization.name",
            legalName: "organization.legalName",
        },
        prepare: ({ title, legalName }) => ({
            title: title || legalName || "Ny organisasjon",
        }),
    },
});
