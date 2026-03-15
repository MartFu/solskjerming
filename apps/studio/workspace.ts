import { assist } from "@sanity/assist";
import { visionTool } from "@sanity/vision";
import { definePlugin, WorkspaceOptions } from "sanity";
import { structureTool } from "sanity/structure";
import { unsplashImageAsset } from "sanity-plugin-asset-source-unsplash";
import { lucideIconPicker } from "sanity-plugin-lucide-icon-picker";
import { nbNOLocale } from "@sanity/locale-nb-no";
import { Logo } from "@/components/logo";
import { schemaTypes } from "@/schemaTypes/index";
import { structure, defaultDocumentNode } from "@/structure";
import { JsonIcon } from "@sanity/icons";
import { ToolLayout } from "./components/toolLayout";

const projectId = process.env.SANITY_STUDIO_PROJECT_ID ?? "";

const sharedConfig = definePlugin<{ workspace: string }>(() => ({
  name: "shared-config",
  document: {
    newDocumentOptions: (prev, { creationContext }) => {
      if (creationContext.type === "global") {
        return prev.filter((template) => {
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
  },
  schema: {
    types: schemaTypes,
    templates: (prev) => [
      ...prev,
      ...[
        "article",
        "video",
        "faq",
        "product",
        "page",
        "articleIndex",
        "homePage",
      ].map((type) => ({
        id: `${type}-with-site`,
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} with Site ID`,
        schemaType: type,
        parameters: [{ name: "siteId", type: "string" }],
        value: (params: { siteId: string }) => ({ siteId: params.siteId }),
      })),
    ],
  },
}));

export const defineWorkspace = (name: string, dataset: string): WorkspaceOptions => ({
  name,
  title: name.charAt(0).toUpperCase() + name.slice(1),
  icon: Logo,
  projectId,
  dataset,
  basePath: `/${name}`,
  releases: {
    enabled: true,
  },

  studio: {
    components: {
      activeToolLayout: (defaultProps) =>
        ToolLayout({ config: { workspace: name } }, defaultProps),
    },
  },

  plugins: [
    nbNOLocale(),
    lucideIconPicker(),
    unsplashImageAsset(),
    assist(),
    sharedConfig({ workspace: name }),

    /* studioNavigator({ workspace: name }), */

    structureTool({
      title: "Studio",
      defaultDocumentNode,

      structure: (S, context) => structure(S, context, name),
    }),
    /*   media(), */
   
    visionTool({
      title: "GROQ Vision",
      icon: JsonIcon,
    }),
  ],
});
