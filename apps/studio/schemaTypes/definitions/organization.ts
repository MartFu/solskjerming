import { GROUPS } from "@/utils/constant";
import { createOrganizationFields } from "@/utils/factories";
import { defineType } from "sanity";


export const organization = defineType({
    name: "organization",
    title: "Organisasjonens Identitet",
    type: "object",
    groups: GROUPS(),
    fields: [
        ...createOrganizationFields()
    ]
})