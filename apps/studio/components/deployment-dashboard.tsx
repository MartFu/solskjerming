// components/DeploymentDashboard.tsx
import { Card, Stack, Text, Button, Badge, Flex } from '@sanity/ui';
import { useEffect, useState } from 'react';
import { useClient } from 'sanity';
import {API_VERSION} from "@/utils/constant"

interface SiteStatus {
  siteId: string;
  count: number;
}

export function DeploymentDashboard() {
  const client = useClient({ apiVersion: API_VERSION });
  const [sites, setSites] = useState<SiteStatus[]>([]);

  const query = `
  *[_type in ["page", "article", "product"] && deployment.status == "staged"] {
    siteId
  } | {
    "results": [
      // This groups them by siteId and counts them
      ...count(*[_type == "site"] {
        "siteId": id,
        "count": count(^.^[_type in ["page", "article", "product"] && siteId == id && deployment.status == "staged"])
      })
    ]
  }.results[count > 0]
`;

  useEffect(() => {
    const fetchStatus = async () => {
      // Aggregate staged documents per site
      const data = await client.fetch(query);
      setSites(data);
    };
    
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [client]);

  return (
    <Stack space={4} padding={4}>
      <Text size={2} weight="semibold">Sites with unpublished changes</Text>
      {sites.map(site => (
        <Card key={site.siteId} tone="caution" padding={3}>
          <Flex justify="space-between" align="center">
            <Text>{site.siteId}: {site.count} changes</Text>
            <Button text="Deploy" tone="primary" />
          </Flex>
        </Card>
      ))}
    </Stack>
  );
}