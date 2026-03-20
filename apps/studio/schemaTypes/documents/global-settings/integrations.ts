import { createIntegrationFields } from "@/utils/factories/create-integration-fields";
import { Blocks } from "lucide-react";
import { defineType } from "sanity";

export const globalIntegrations = defineType({
  name: "globalIntegrations",
  title: "Globale Integrasjoner",
  type: "document",
  icon: Blocks,
  fields: [
    ...createIntegrationFields({
      googleAnalyticsIdDescription:
        "Standard ID som brukes hvis nettsiden ikke har sin egen (f.eks. G-XXXXXXXXXX).",
      gtmContainerIdDescription: "Standard GTM ID (f.eks. GTM-XXXXXXX).",
      facebookPixelIdDescription:
        "Facebook Pixel-ID for konverteringssporing på tvers av nettsteder.",
    }),
  ],
  preview: {
    prepare() {
      return { title: "Globale Integrasjoner" };
    },
  },
});
