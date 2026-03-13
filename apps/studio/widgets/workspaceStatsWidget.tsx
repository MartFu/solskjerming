import { DashboardWidget, DashboardWidgetContainer } from "@sanity/dashboard";
import { useEffect, useState } from "react";
import { useClient } from "sanity";
import { Flex, Spinner, Stack, Text } from "@sanity/ui";
import { API_VERSION } from "@/utils/constant";

interface Options {
  workspace: string;
}

interface Stats {
  totalSites: number;
  activeSites: number;
  totalPages: number;
}

function WorkspaceStatsWidget({ workspace }: Options) {
  const client = useClient({ apiVersion: API_VERSION });
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    client
      .fetch<Stats>(
        `{
          "totalSites": count(*[_type == "site" && workspace == $workspace]),
          "activeSites": count(*[_type == "site" && workspace == $workspace && deployment.status == "active"]),
        }`,
        { workspace: workspace }, // e.g. "solskjerming"
      )
      .then(setStats);
  }, [client, workspace]);

  return (
    <DashboardWidgetContainer header={`${workspace} — overview`}>
      {!stats ? (
        <Flex
          justify="center"
          padding={4}
        >
          <Spinner />
        </Flex>
      ) : (
        <Flex
          padding={4}
          gap={6}
        >
          <StatItem
            label="Total sites"
            value={stats.totalSites}
          />
          <StatItem
            label="Active sites"
            value={stats.activeSites}
          />
          <StatItem
            label="Total pages"
            value={stats.totalPages}
          />
        </Flex>
      )}
    </DashboardWidgetContainer>
  );
}

function StatItem({ label, value }: { label: string; value: number }) {
  return (
    <Stack space={2}>
      <Text
        size={4}
        weight="semibold"
      >
        {value}
      </Text>
      <Text
        size={1}
        muted
      >
        {label}
      </Text>
    </Stack>
  );
}

export const workspaceStatsWidget = ({workspace}: Options): DashboardWidget => ({
  name: "workspace-stats",
  component: () => <WorkspaceStatsWidget workspace={workspace} />,
  layout: { width: "full" },
});
