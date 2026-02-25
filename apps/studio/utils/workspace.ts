import { assist } from "@sanity/assist";
import { visionTool } from "@sanity/vision";
import { defineConfig, definePlugin, WorkspaceOptions } from "sanity";
import { presentationTool } from "sanity/presentation";
import { structureTool } from "sanity/structure";
import { unsplashImageAsset } from "sanity-plugin-asset-source-unsplash";
import { lucideIconPicker } from "sanity-plugin-lucide-icon-picker";
import { media } from "sanity-plugin-media";

import { Logo } from "@/components/logo";
import { locations } from "@/location";
import { presentationUrl } from "@/plugins/presentation-url";
import { schemaTypes } from "@/schemaTypes/index";
import { structure } from "@/structure";
import { getPresentationUrl } from "@/utils/helper";

const projectId = process.env.SANITY_STUDIO_PROJECT_ID ?? "";



export const defineWorkspace = (name: string, title: string, dataset: string): WorkspaceOptions => ({
  name,
  title,
  icon: Logo,
  projectId,
  dataset,
  basePath: `/${name}`, // Studio URL becomes /solskjerming or /efoil
   releases: {
    enabled: true,
  },
  plugins: [
    structureTool({
      // We pass the name so the sidebar knows which site context to use
      structure: (S, context) => structure(S, context, name), 
    }),
    presentationTool({
        resolve: {
            locations,
        },
      previewUrl: {
        origin: `http://localhost:3000/${name}`,
        previewMode: {
          enable: `/api/presentation-draft?site=${name}`,
        },
    }, // Point to specific site preview
    }),
     presentationUrl(),
        visionTool(),
        lucideIconPicker(),
        unsplashImageAsset(),
        media(),
        assist(),
  ],
   document: {
    newDocumentOptions: (prev, { creationContext }) => {
      const { type } = creationContext;
      if (type === "global") {
        return prev.filter(
          (template) =>
            ![
              "homePage",
              "navbar",
              "footer",
              "settings",
              "blogIndex",
              "assist.instruction.context",
              "media.tag",
            ].includes(template?.templateId)
        );
      }
      return prev;
    },
  },
  schema: {
    types: schemaTypes,
    templates: [
      {
        id: "nested-page-template",
        title: "Nested Page",
        schemaType: "page",
        value: (props: { slug?: string; title?: string }) => ({
          ...(props.slug
            ? { slug: { current: props.slug, _type: "slug" } }
            : {}),
          ...(props.title ? { title: props.title } : {}),
        }),
        parameters: [
          {
            name: "slug",
            type: "string",
          },
        ],
      },
    ],
  },
});