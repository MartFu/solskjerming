import { Box, Card } from "@sanity/ui";
import { ActiveToolLayoutProps } from "sanity";
import { Layout } from "./Layout";
import { WorkspaceView } from "./WorkspaceView";
import { useToolLayout } from "@/context/ToolLayoutProvider";
import { TabSiteScopeProvider } from "@/context/TabSiteScopeProvider";
import { useRouter } from "sanity/router";
import { useEffect } from "react";


function TabPathTracker({ tabId }: { tabId: string }) {
    const { setTabPath, activeTabId } = useToolLayout();
    const { state } = useRouter();

     useEffect(() => {
        if (tabId === activeTabId) {
            const path = window.location.pathname + window.location.search;
            setTabPath(tabId, path);
        }
     }, [state, tabId, activeTabId, setTabPath]);

    return null;
}


export function ToolLayoutShell({
    workspace,
    ...props
}: ActiveToolLayoutProps & { workspace: string }) {
    const { tabs, activeTabId } = useToolLayout();

    const currentTool = props.activeTool.name;

    if (currentTool !== "structure" && currentTool !== "presentation") {
        return props.renderDefault(props);
    }

    return (
        <Card
            height="fill"
            overflow="hidden"
        >
            {tabs.map((tab) => {
                return (
                    <TabSiteScopeProvider key={tab.id} tabId={tab.id}>
                        <TabPathTracker tabId={tab.id} />
                        <Box
                            style={{
                                display:
                                    tab.id === activeTabId ? "flex" : "none",
                                flexDirection: "column",
                                width: "100%",
                                height: "100%",
                                overflow: "auto",
                            }}
                        >
                            {tab?.activeSite ? (
                                <Layout {...props} />
                            ) : (
                                <WorkspaceView />
                            )}
                        </Box>
                    </TabSiteScopeProvider>
                );
            })}
        </Card>
    );
}
