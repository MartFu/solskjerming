import { assist } from "@sanity/assist";
import { visionTool } from "@sanity/vision";
import {
  definePlugin,
  WorkspaceOptions,
} from "sanity";
import { structureTool } from "sanity/structure";
import { unsplashImageAsset } from "sanity-plugin-asset-source-unsplash";
import { lucideIconPicker } from "sanity-plugin-lucide-icon-picker";
import { nbNOLocale } from "@sanity/locale-nb-no";
import { Logo } from "@/components/logo";
import { schemaTypes, singletonType } from "@/schemaTypes/index";
import { JsonIcon } from "@sanity/icons";
import { ToolLayout } from "./components/tool-layout";

import { createStructure } from "@/utils/structure/structure";
import { initialValueTemplates } from "./schemaTypes/templates";
import { actionRegistry } from "./utils/actions";
import { Logger } from "@workspace/logger";
import { WorkspaceKey } from "./utils/constant";
import { PROJECT_ID } from "./utils/env";
import { moduleRegistry } from "./schemaTypes/documents/modules";
import { BlueprintBadge } from "./components/blueprint-badge";
import { isSingletonType, singletons } from "./schemaTypes/documents";

const logger = new Logger("studio-config")

const sharedConfig = definePlugin<{ workspace: WorkspaceKey }>(() => ({
  name: "shared-config",
  document: {
    badges: (prev, context) => {
      if (context.schemaType === "page") return [...prev, BlueprintBadge]
      return prev
    },
    newDocumentOptions: (prev, { creationContext }) => {
      if (creationContext.type === "global") {
        return prev.filter((template) => !isSingletonType(template.templateId));
      }
      return prev;
    },
    actions: (prev, context) => {
      const { schemaType } = context;

      // logger.info("[actions] -> initializing actions for schemaType:", schemaType)

      // Look up the enhancer for this specific type
      const enhancer = actionRegistry[schemaType];

      // If we have a custom strategy for this type, run it.
      // Otherwise, return the default actions.
      let actions = enhancer ? enhancer(prev, context) : prev;

     if (isSingletonType(schemaType)) {
         const allowedActions = ["publish", "discardChanges", "restore"];

         actions = actions.filter(
             (a) => a.action && allowedActions.includes(a.action),
         );
     }

      return actions;
    },
  
  },
  schema: {
    types: schemaTypes,
    templates: (prev) => [...prev, ...initialValueTemplates, ...moduleRegistry.allTemplates],
  },
}));

export const defineWorkspace = (
  workspace: WorkspaceKey,
  dataset: string,
): WorkspaceOptions => ({
  name: workspace,
  title: workspace.charAt(0).toUpperCase() + workspace.slice(1),
  icon: Logo,
  projectId: PROJECT_ID,
  dataset,
  basePath: `/${workspace}`,
  releases: {
    enabled: true,
  },

  studio: {
    components: {
      activeToolLayout: (defaultProps) =>
        ToolLayout({ config: { workspace } }, defaultProps),
    },
  },

  plugins: [
    nbNOLocale(),
    lucideIconPicker(),
    unsplashImageAsset(),
    // assist({}),

    structureTool({
      title: "Studio",
      structure: (S, context) => createStructure(S, context, workspace),
      
    }),
    /*   media(), */
    visionTool({
      title: "GROQ Vision",
      icon: JsonIcon,
    }),
    sharedConfig({ workspace }),
  ],
});

