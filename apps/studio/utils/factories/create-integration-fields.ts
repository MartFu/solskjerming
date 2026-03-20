import { GROUP } from "@/utils/constant";
import { defineField } from "sanity";
import type { FieldDefinition } from "sanity";

interface IntegrationFieldOptions {
  googleAnalyticsIdDescription?: string;
  gtmContainerIdDescription?: string;
  facebookPixelIdDescription?: string;

  groupsEnabled?: boolean;
}

export function createIntegrationFields(
  options: IntegrationFieldOptions = {},
): FieldDefinition[] {
  const {
    googleAnalyticsIdDescription = "Google Analytics Measurement ID (f.eks. G-XXXXXXXXXX).",
    gtmContainerIdDescription = "Google Tag Manager container-ID (f.eks. GTM-XXXXXXX).",
    facebookPixelIdDescription = "Facebook Pixel-ID for konverteringssporing.",
    groupsEnabled = false
  } = options;

  const group = groupsEnabled ? GROUP.INTEGRATIONS : undefined;


  return [
    defineField({
      name: "googleAnalyticsId",
      title: "Google Analytics Measurement ID",
      type: "string",
      group,
      description: googleAnalyticsIdDescription,
    }),
    defineField({
      name: "gtmContainerId",
      title: "Google Tag Manager ID",
      type: "string",
      group,
      description: gtmContainerIdDescription,
    }),
    defineField({
      name: "facebookPixelId",
      title: "Facebook Pixel ID",
      type: "string",
      group,
      description: facebookPixelIdDescription,
    }),
  ];
}
