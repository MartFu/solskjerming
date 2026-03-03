import { defineConfig } from "sanity";
import { defineWorkspace } from "./workspace";

const dataset = process.env.SANITY_STUDIO_DATASET ?? "production";

export const siteRegistry = {
  solskjerming: {
    title: "Solskjerming",
    sites: [
      {
        id: "terrassemarkise",
        title: "terrassemarkise.no",
        domain: "terrassemarkise.no",
      },
      {
        id: "utvendig-solskjerming",
        title: "utvendig-solskjerming.no",
        domain: "utvendig-solskjerming.no",
      },
      // Add remaining 5-6 sites
    ],
  },
  vannsport: {
    title: "Vannsport",
    sites: [
      { id: "efoil-norge", title: "efoil.no", domain: "efoil-norge.no" },
      // Add remaining water sports sites
    ],
  },
} as const;

export type WorkspaceName = keyof typeof siteRegistry;
export type SiteRegistryConfig = (typeof siteRegistry)[WorkspaceName];
export interface Site {
  id: string;
  title: string;
  domain: string;
}

export default defineConfig([
  defineWorkspace("solskjerming", siteRegistry.solskjerming, dataset),
  defineWorkspace("vannsport", siteRegistry.vannsport, dataset),
]);
