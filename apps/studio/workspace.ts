import { assist } from "@sanity/assist";
import { visionTool } from "@sanity/vision";
import { definePlugin, WorkspaceOptions } from "sanity";
import { presentationTool } from "sanity/presentation";
import { structureTool } from "sanity/structure";
import { unsplashImageAsset } from "sanity-plugin-asset-source-unsplash";
import { lucideIconPicker } from "sanity-plugin-lucide-icon-picker";
import { media } from "sanity-plugin-media";
import { workflow } from "sanity-plugin-workflow";
import {nbNOLocale} from "@sanity/locale-nb-no"

import { Logo } from "@/components/logo";
import { createLocations } from "@/location";
import { presentationUrl } from "@/plugins/presentation-url";
import { schemaTypes } from "@/schemaTypes/index";
import { structure, defaultDocumentNode } from "@/structure";
import { SiteRegistryConfig } from "@/sanity.config";
import { product } from "@/schemaTypes/documents/product";
// import { getPresentationUrl } from "@/utils/helper"; // later

const projectId = process.env.SANITY_STUDIO_PROJECT_ID ?? "";
const PREVIEW_ORIGIN =
  process.env.SANITY_STUDIO_PREVIEW_ORIGIN ?? "http://localhost:3000";

const customDocumentActions = (
  prev: any[],
  context: any,
  options: { workspaceName: string; siteConfig: SiteRegistryConfig },
) => {
  const filtered = prev.filter((action) => action.name !== "publish");

  return [
    // Preview action - opens Vercel preview in new tab
    {
      name: "preview",
      title: "Open Preview",
      icon: () => "👁️",
      onHandle: () => {
        const { draft, published, type } = context;
        const doc = draft || published;
        const siteId = doc?.siteId;

        if (!siteId) {
          alert("Please select a site first");
          return;
        }

        const origin = PREVIEW_ORIGIN;
        const slug = doc?.slug?.current;
        const path = type === "homePage" ? "" : slug || "";

        window.open(`${origin}/${siteId}/${path}?preview=true`, "_blank");
      },
    },

    // Deploy action - triggers GitHub Action for this site
    {
      name: "deploy",
      title: "Deploy to Live Site",
      icon: () => "🚀",
      onHandle: async () => {
        const { draft, published, id, type } = context;
        const doc = draft || published;
        const siteId = doc?.siteId;

        if (!siteId) {
          alert("Please select a site first");
          return;
        }

        // Update status in Sanity
        // await sanityClient.patch(id).set({ 'deployment.status': 'staged' }).commit();

        // Trigger webhook
        const res = await fetch("/api/trigger-deploy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            siteId,
            workspace: options.workspaceName,
            documentId: id,
            type,
          }),
        });

        if (res.ok) {
          alert(
            `Deploy triggered for ${siteId}. Check Deployment Center for status.`,
          );
        } else {
          alert("Deploy failed to trigger. Please try again.");
        }
      },
    },
    ...filtered,
  ];
};

const sharedConfig = definePlugin<{
  workspaceName: string;
  siteConfig: SiteRegistryConfig;
}>((options) => ({
  name: "shared-config",

  document: {
    // Filter new document templates by workspace context
    newDocumentOptions: (prev, { creationContext }) => {
      const { type } = creationContext;

      if (type === "global") {
        return prev.filter((template) => {
          // Exclude singletons that are site-specific from global creation
          const siteSingletons = [
            "homePage",
            "navbar",
            "footer",
            "settings",
            "blogIndex",
          ];
          return !siteSingletons.includes(template.templateId);
        });
      }

      return prev;
    },

    // Inject custom actions (Preview + Deploy)
    // actions: (prev, context) => customDocumentActions(prev, context, options),
  },

  schema: {
    types: schemaTypes,
    templates: (prev) => [
      ...prev,
      // Create a template for each multi-site type
      ...["article", "video", "faq", "product", "page", "articleIndex", "homePage"].map((type) => ({
        id: `${type}-with-site`,
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} with Site ID`,
        schemaType: type,
        parameters: [{ name: "siteId", type: "string" }],
        value: (params: { siteId: string }) => ({
          siteId: params.siteId,
        }),
      })),
    ],
  },
}));

export const defineWorkspace = (
  name: string,
  config: SiteRegistryConfig,
  dataset: string,
): WorkspaceOptions => ({
  name,
  title: config.title,
  icon: Logo,
  projectId,
  dataset,
  basePath: `/${name}`, // Studio URL becomes /solskjerming or /efoil
  releases: {
    enabled: true,
  },
 
  plugins: [
    nbNOLocale(),
    lucideIconPicker(),
    unsplashImageAsset(),
    assist(),
    sharedConfig({ workspaceName: name, siteConfig: config }),

    // Plugins that produce additional views
    structureTool({
      title: "Innhold",
      defaultDocumentNode,
      
      structure: (S, context) => structure(S, context, name, config),
    }),

    workflow({
      schemaTypes: ["product", "article", "page", "video", "faq"],

      states: [
        {
          // Required configuration
          id: "changesRequested",
          title: "Forespurte endringer",
          // Optional settings:
          // Used for the color of the Document Badge
          // color: "success",
          // Will limit document actions and drag-and-drop for only users with these Role
          // roles: ["publisher", "administrator"],
          // Requires the user to be "assigned" in order to update to this State
          // requireAssignment: true,
          // Requires the document to be valid before being promoted out of this State
          // Warning: With many documents in the Kanban view this can negatively impact performance
          // requireValidation: true,
          // Defines which States a document can be moved to from this one
          transitions: ["inProgress", "completed"],
        },
        {
          // Required configuration
          id: "inProgress",
          title: "Endres nå",

          transitions: ["completed"],
        },
        {
          // Required configuration
          id: "completed",
          title: "Ferdigstilt",

          transitions: ["changesRequested"],
        },
      ],
    }),
    media(),
    visionTool({
      title: "GROQ Vision",
    }),
  ],
});
