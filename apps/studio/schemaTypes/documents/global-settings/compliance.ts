

import { DOCUMENT_NAMES } from "@/schemaTypes/constant";
import { GROUP, GROUPS } from "@/utils/constant";
import { cookieFieldsets, createCookieConsentFields } from "@/utils/factories/create-cookie-consent-fields";
import { asStudioIcon } from "@/utils/helper";
import { ShieldCheck } from "lucide-react";
import { defineField, defineType } from "sanity";

export const globalCompliance = defineType({
  name: DOCUMENT_NAMES.globalCompliance,
  title: "GDPR & Samtykke",
  type: "document",
  icon: asStudioIcon(ShieldCheck),
  fieldsets: cookieFieldsets,
  groups: GROUPS(),
  fields: [
    defineField({
      name: "legalDocuments",
      title: "Juridisk Dokumentasjon",
      type: "array",
      of: [{ type: "reference", to: [{ type: "documentation" }] }],
      group: GROUP.LEGAL,
      description:
        "Referanser til vilkår, personvern og andre juridiske tekster.",
    }),
    ...createCookieConsentFields(),
  ],
  preview: {
    prepare() {
      return { title: "Personvernerklæring" };
    },
  },
});


