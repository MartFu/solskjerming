import { DOCUMENT_NAMES } from "@/schemaTypes/constant";
import { GROUP, GROUPS } from "@/utils/constant";
import {
    cookieFieldsets,
} from "@/utils/factories/create-cookie-consent-fields";
import { asStudioIcon } from "@/utils/helper";
import { ShieldCheck } from "lucide-react";
import { defineField } from "sanity";
import { defineGlobal } from "@/utils/globals/define-global";

export const globalCompliance = defineGlobal({
  sortFields: [],
    name: DOCUMENT_NAMES.globalCompliance,
    title: "GDPR & Samtykke",
    type: "document",
    icon: asStudioIcon(ShieldCheck),
    fieldsets: cookieFieldsets,
    groups: GROUPS(),
    fields: [
        defineField({
            name: "cookieBanner",
            title: "Cookiebanner",
            description:
                "Bestem hva det skal stå i cookiebanneren. Dette arves av alle nye nettsider, så husk å oppdatere deres individuelle innstillinger ved avvik.",
            type: "cookies",
            group: GROUP.COOKIES,
        }),
        defineField({
            name: "legalDocuments",
            title: "Juridisk Dokumentasjon",
            type: "array",
            of: [{ type: "reference", to: [{ type: "documentation" }] }],
            group: GROUP.LEGAL,
            description:
                "Referanser til vilkår, personvern og andre juridiske tekster.",
        }),
    ],
    preview: {
        prepare() {
            return { title: "GDPR & Samtykke" };
        },
    },
});
