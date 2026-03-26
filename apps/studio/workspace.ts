import { assist } from "@sanity/assist";
import { visionTool } from "@sanity/vision";
import { definePlugin, WorkspaceOptions } from "sanity";
import { structureTool } from "sanity/structure";
import { unsplashImageAsset } from "sanity-plugin-asset-source-unsplash";
import { lucideIconPicker } from "sanity-plugin-lucide-icon-picker";
import { nbNOLocale } from "@sanity/locale-nb-no";
import { Logo } from "@/components/logo";
import { schemaTypes } from "@/schemaTypes/index";
import { JsonIcon } from "@sanity/icons";
import { ToolLayoutShell } from "./components/ToolLayout";

import { createStructure } from "@/utils/structure/structure";
import { initialValueTemplates } from "./schemaTypes/templates";
import { actionRegistry } from "./utils/actions";
import { Logger } from "@workspace/logger";
import { WorkspaceKey } from "./utils/constant";
import { PROJECT_ID } from "./utils/env";
import { moduleRegistry } from "./schemaTypes/documents/modules";
import { BlueprintBadge } from "./components/blueprint-badge";
import { isSingletonType } from "./schemaTypes/documents";
import { presentationTool } from "sanity/presentation";
import { getPresentationUrl } from "./utils/helper";

import { locations } from "@/location";
import { presentationUrl } from "./plugins/presentation-url";
import { createElement } from "react";
import { ToolLayoutProvider } from "./context/ToolLayoutProvider";
import { ToolMenu } from "./components/studio/ToolMenu";
import { noNBOverrides } from "./utils/customTranslations";
import { media } from "sanity-plugin-media";

const logger = new Logger("studio-config");

const sharedConfig = definePlugin<{ workspace: WorkspaceKey }>(() => ({
  name: "shared-config",
  document: {
    badges: (prev, context) => {
      if (context.schemaType === "page") return [...prev, BlueprintBadge];
      return prev;
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
    templates: (prev) => [
      ...prev,
      ...initialValueTemplates,
      ...moduleRegistry.allTemplates,
    ],
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
            toolMenu: ToolMenu,
            layout: (props) => {
                return createElement(ToolLayoutProvider, {
                    workspace,
                    children: props.renderDefault(props),
                });
            },
            // Use createElement here too!
            // This ensures the Shell "looks up" the tree for the Provider.
            activeToolLayout: (props) => {
                return createElement(ToolLayoutShell, {
                    ...props,
                    workspace,
                });
            },
        },
    },

    i18n: {
        bundles: [...noNBOverrides],
    },

    plugins: [
        nbNOLocale(),
        lucideIconPicker(),
        unsplashImageAsset(),
        presentationTool({
            resolve: {
                locations,
            },
            previewUrl: {
                origin: getPresentationUrl(),
                previewMode: {
                    enable: "/api/presentation-draft",
                },
            },
        }),
        presentationUrl(workspace),
        assist({
            assist: {
                localeSettings: () =>
                    Intl.DateTimeFormat("no-NO", {
                        timeZone: "Europe/Oslo",
                        dateStyle: "full",
                        timeStyle: "long",
                    }).resolvedOptions(),
                maxPathDepth: 4,
                temperature: 0.3,
            },
        }),

        structureTool({
            title: "Studio",
            structure: (S, context) => createStructure(S, context, workspace),
        }),
        media({
            creditLine: {
                enabled: true,
                excludeSources: ["unsplash"],
            },
            maximumUploadSize: 10000000,
            directUploads: true,
            
        }),
        visionTool({
            title: "GROQ Vision",
            icon: JsonIcon,
        }),
        sharedConfig({ workspace }),
    ],
});
