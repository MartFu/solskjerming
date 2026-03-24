import { GROUPS } from "@/utils/constant";
import { createCookieConsentFields } from "@/utils/factories/create-cookie-consent-fields";
import { defineType } from "sanity";


export const cookies = defineType({
    name: "cookies",
    title: "Cookiesamtykke",
    type: "object",
    groups: GROUPS(),
    fields: createCookieConsentFields()
})