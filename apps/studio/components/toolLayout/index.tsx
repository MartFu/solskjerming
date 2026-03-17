import { Card } from "@sanity/ui";
import { ToolLayoutShellConfig } from "./types";
import { ActiveToolLayoutProps } from "sanity";
import { Layout } from "./Layout";
import { WorkspaceView } from "./WorkspaceView";
import { ToolLayoutProvider, useToolLayout } from "@/context/ToolLayoutProvider";

// ─── Inner shell (has access to context) ─────────────────────────────────────

function ToolLayoutShell(props: ActiveToolLayoutProps) {
  const { activeSite } = useToolLayout();

  return (
    <Card
      height="fill"
      overflow="hidden"
    >
      {activeSite  ? <Layout {...props} /> : <WorkspaceView />}
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
