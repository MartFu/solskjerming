import { Box, Card } from "@sanity/ui";
import { ToolLayoutShellConfig } from "./types";
import { ActiveToolLayoutProps } from "sanity";
import { Layout } from "./Layout";
import { WorkspaceView } from "./WorkspaceView";
import { ToolLayoutProvider, useToolLayout } from "@/context/ToolLayoutProvider";
import { TabSiteScope } from "@/context/TabSiteScopeProvider";


interface TabShellProps {
  tabId: string;
  active: boolean;
  props: ActiveToolLayoutProps;
}

function TabShell({ tabId, active, props }: TabShellProps) {
  const { tabs } = useToolLayout();
  const tab = tabs.find((t) => t.id === tabId);

  if (props.activeTool.name !== "structure") {
    return props.renderDefault(props);
  }

  return (
    <TabSiteScope tabId={tabId}>
      <Box
        style={{
          display: active ? "flex" : "none",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          overflow: "auto",
        }}
      >
        {tab?.activeSite ? <Layout {...props} /> : <WorkspaceView />}
      </Box>
    </TabSiteScope>
  );
}

// ─── Inner shell (has access to context) ─────────────────────────────────────

function ToolLayoutShell(props: ActiveToolLayoutProps) {
  const { tabs, activeTabId } = useToolLayout();

  return (
    <Card
      height="fill"
      overflow="hidden"
    >
      {tabs.map((tab) => (
        <TabShell
          key={tab.id}
          tabId={tab.id}
          active={tab.id === activeTabId}
          props={props}
        />
      ))}
    </Card>
  );
}

// ─── Tool root (sets up provider) ────────────────────────────────────────────

export function ToolLayout(
  { config }: { config: ToolLayoutShellConfig },
  props: ActiveToolLayoutProps,
) {
  return (
      <ToolLayoutProvider workspace={config.workspace}>
         <ToolLayoutShell {...props} />
      </ToolLayoutProvider>
  );
}
