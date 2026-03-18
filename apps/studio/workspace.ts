import { assist } from "@sanity/assist";
import { visionTool } from "@sanity/vision";
import { definePlugin, DocumentActionComponent, WorkspaceOptions } from "sanity";
import { structureTool } from "sanity/structure";
import { unsplashImageAsset } from "sanity-plugin-asset-source-unsplash";
import { lucideIconPicker } from "sanity-plugin-lucide-icon-picker";
import { nbNOLocale } from "@sanity/locale-nb-no";
import { Logo } from "@/components/logo";
import { schemaTypes } from "@/schemaTypes/index";
import { JsonIcon } from "@sanity/icons";
import { ToolLayout } from "./components/toolLayout";

import { createStructure } from "@/structure";
import { initialValueTemplates } from "./schemaTypes/templates";
import { useRouter } from "sanity/router";

const projectId = process.env.SANITY_STUDIO_PROJECT_ID ?? "";



const SitePublishAction = (originalAction: DocumentActionComponent) => {
    return (props: any) => {
        const originalResult = originalAction(props);
        const router = useRouter();

        return {
            ...originalResult,
            onHandle: () => {
                // 1. Run the actual publish
                originalResult?.onHandle?.();

                // 2. Update the URL with a "cache buster"
                // This adds ?rev=[timestamp] to the URL
                router.navigate({
                    stickyParams: { rev: Date.now().toString() },
                });
            },
        };
    };
};

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
        actions: (prev, { schemaType }) => { 
            return prev.map((originalAction) => {
                // We only want to wrap the Publish action,
                // and only for the "site" document type
                if (
                    originalAction.action === "publish" &&
                    schemaType === "site"
                ) {
                

                    return SitePublishAction(originalAction);
                }

                return originalAction;
            });
        }
    },
    schema: {
        types: schemaTypes,
       templates: (prev) => [...prev, ...initialValueTemplates]
    },
}));

export const defineWorkspace = (
    workspace: string,
    dataset: string,
): WorkspaceOptions => ({
    name: workspace,
    title: workspace.charAt(0).toUpperCase() + workspace.slice(1),
    icon: Logo,
    projectId,
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
        assist(),
        sharedConfig({ workspace }),
        structureTool({
            title: "Studio",
            structure: (S, context) => createStructure(S, context, workspace),
        }),
        /*   media(), */
        visionTool({
            title: "GROQ Vision",
            icon: JsonIcon,
        }),
    ],
});


/* 

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
                title: `${type.charAt(0).toUpperCase() + type.slice(1)}`,
                schemaType: type,
                parameters: [{ name: "siteId", type: "string" }],
                value: (params: { siteId: string }) => ({
                    siteId: params.siteId,
                    site: {
                        _type: "reference",
                        _ref: params.siteId,
                    },
                }),
            })),
            {
                schemaType: `workspaceDefault`,
                type: `document`,
                parameters: [{ name: "workspace", type: "string" }],
                value: (params: { workspace: string }) => ({
                    workspace: params.workspace,
                    title: `${params.workspace.charAt(0).toUpperCase() + params.workspace.slice(1)} - Standardinnstillinger}`,
                }),
            },
            {
                schemaType: "site",
                type: "document",
                parameters: [
                    {
                        name: "workspace",
                        type: "string",
                    },
                ],
                value: (params: { workspace: string }) => ({
                    workspace: params.workspace,
                }),
            },
        ],

*/