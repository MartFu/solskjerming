import { globalCompliance } from "./compliance";
import { globalIntegrations } from "./integrations";
import { globalOrganization } from "./organization";
import { globalRobots } from "./robots";
import { globalSeo } from "./seo";
import { globalStructuredData } from "./structured-data";
import { globalTheme } from "./theme";

/**
 * Workspace-scoped singleton documents that hold global configuration.
 * One instance of each exists per workspace, shared across all sites.
 */
export const globalSettings = [
  globalTheme,
  globalSeo,
  globalIntegrations,
  globalOrganization,
  globalCompliance,
  globalStructuredData,
  globalRobots,
] as const;

export const GLOBAL_SETTINGS = globalSettings.map((d) => d.name);
export type GlobalSettingsType = (typeof globalSettings)[number]["name"];
export function isGlobalSettingsType(type: string): type is GlobalSettingsType {
  return GLOBAL_SETTINGS.includes(type as GlobalSettingsType);
}
