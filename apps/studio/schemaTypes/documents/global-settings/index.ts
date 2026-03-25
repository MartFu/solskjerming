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



export type GlobalSettingsDefinition = (typeof globalSettings)[number];
export type GlobalSettingsType = GlobalSettingsDefinition["schema"]["name"];

export const globalSettingsSchemaTypes = globalSettings.map((d) => d.schema);
export const globalSettingsNames = globalSettings.map((d) => d.schema.name);

export const GLOBAL_SETTINGS_REGISTRY = Object.fromEntries(
  globalSettings.map((g) => [g.schema.name, g]),
) as {
  [T in GlobalSettingsType]: Extract<(typeof globalSettings)[number], { schema: { name: T } }>;
};

export type GlobalSettingsFieldNames<T extends GlobalSettingsType> =
    (typeof GLOBAL_SETTINGS_REGISTRY)[T]["sortFields"][number];

export function isGlobalSettingsType(type: string): type is GlobalSettingsType {
  return globalSettingsNames.includes(type as GlobalSettingsType);
}


export function createGlobalSettingsRegistry(globalSettings: readonly GlobalSettingsDefinition[]) {
  const byName = new Map(globalSettings.map((g) => [g.schema.name, g]));

  return {
    /** Every schema, ready to spread into Sanity config */
    allSchemas: globalSettings.map((g) => g.schema),

    /** All globalSettings that appear regardless of enabled packages */
    alwaysAvailable: globalSettings.filter((g) => g.alwaysAvailable),

    /** Look up a global by its type name */
    lookup: (type: GlobalSettingsType) => byName.get(type),

    /** Check if a type name is a known global */
    isGlobalType: (type: string): type is GlobalSettingsType => byName.has(type as GlobalSettingsType),

    /** Map over all registered globalSettings */
    map: <T>(fn: (global: GlobalSettingsDefinition) => T): T[] => globalSettings.map(fn),
  };
}


/**
 * Primary interface for interacting with the globalSettings outside of the schemaTypes directory.
 * 
 */
export const globalSettingsRegistry = createGlobalSettingsRegistry(globalSettings);