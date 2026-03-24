import { Logger } from "@workspace/logger";
import "dotenv/config";
import path from "node:path";
import { defineCliConfig } from "sanity/cli";
import tsconfigPaths from "vite-plugin-tsconfig-paths";
import { DATASET, PROJECT_ID } from "./utils/env";

const logger = new Logger("SanityCLI");


if (!PROJECT_ID) {
  logger.warn(
    "Missing or invalid SANITY_STUDIO_PROJECT_ID - some features may not work"
  );
}
if (!DATASET) {
  logger.warn(
    "Missing or invalid SANITY_STUDIO_DATASET - some features may not work"
  );
}

/**
 * Returns the correct studio host based on environment variables.
 * - If HOST_NAME is set and not "main", returns `${HOST_NAME}-${PRODUCTION_HOSTNAME}`
 * - If HOST_NAME is "main" or not set, returns PRODUCTION_HOSTNAME
 * - If PRODUCTION_HOSTNAME is not set, returns a default using PROJECT_ID
 */
function getStudioHost(): string | undefined {
  const host = process.env.HOST_NAME;
  const productionHostName = process.env.SANITY_STUDIO_PRODUCTION_HOSTNAME;

  if (productionHostName) {
    if (host && host !== "main") {
      return `${host}-${productionHostName}`;
    }

    return productionHostName;
  }

  if (PROJECT_ID) {
    return `${PROJECT_ID}`;
  }

  return;
}

const studioHost = getStudioHost();

if (studioHost) {
  logger.info(`Sanity Studio Host: https://${studioHost}.sanity.studio`);
}

export default defineCliConfig({
  api: {
    projectId: PROJECT_ID,
    dataset: DATASET,
  },
  studioHost,
  deployment: {
    autoUpdates: false,
  },

  schemaExtraction: {
    enabled: true,
    enforceRequiredFields: true,
    workspace: "solskjerming",
  },
  typegen: {
    enabled: true,
    formatGeneratedCode: true,
    path: "../../packages/sanity/src/**/*.{ts,tsx,js,jsx}",
    schema: "schema.json",
    generates: "../../packages/sanity/src/sanity.types.ts",
    overloadClientMethods: true,
  },
  vite: async (config) => ({
    ...config,
    plugins: [...(config.plugins ?? []), tsconfigPaths()],
    resolve: {
      ...config.resolve,
      alias: {
        ...(config.resolve?.alias ?? {}),
        "@": path.resolve(__dirname, "."),
      },
    },
    server: {
      ...config.server,
      host: "0.0.0.0",
      allowedHosts: [".trycloudflare.com"],
    },
  }),
});
