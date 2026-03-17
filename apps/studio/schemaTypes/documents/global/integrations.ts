import { Blocks } from "lucide-react";
import { defineField, defineType } from "sanity";

export const globalIntegrations = defineType({
    name: "globalIntegrations",
    title: "Globale Integrasjoner",
    type: "document",
    icon: Blocks,
    fields: [
        defineField({
            name: "googleAnalyticsId",
            title: "Google Analytics Measurement ID",
            type: "string",
            description:
                "Standard ID som brukes hvis nettsiden ikke har sin egen (f.eks. G-XXXXXXXXXX)",
        }),
        defineField({
            name: "gtmContainerId",
            title: "Google Tag Manager ID",
            type: "string",
            description: "Standard GTM ID (f.eks. GTM-XXXXXXX)",
        }),
        defineField({
            name: "facebookPixelId",
            title: "Facebook Pixel ID",
            type: "string",
        }),
    ],
});
