import { DashboardWidgetContainer, DashboardWidget } from "@sanity/dashboard";
import { useState, useEffect } from "react";
import { useClient } from "sanity";
import {
  Badge,
  Box,
  Button,
  Card,
  Dialog,
  Flex,
  Grid,
  Spinner,
  Stack,
  Text,
  TextInput,
} from "@sanity/ui";
import { AddIcon, SearchIcon } from "@sanity/icons";
import { API_VERSION } from "@/utils/constant";
import { ExternalLink, SettingsIcon } from "lucide-react";
import { Link, useRouter } from "sanity/router";

interface Site {
  _id: string;
  _updatedAt: string;
  title: string;
  slug: { current: string };
  url?: string;
  status?: "active" | "inactive" | "draft";
  locale?: string;
}

interface Options {
  workspace: string;
}

function WorkspaceSitesWidget({ workspace }: Options) {
  const client = useClient({ apiVersion: API_VERSION });
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newSiteData, setNewSiteData] = useState({ title: "", id: "" });
  const router = useRouter()

  const fetchSites = () => {
    setLoading(true);
    client
      .fetch<Site[]>(
        `*[_type == "site" && workspace == $workspace] | order(title asc) {
        _id, 
        _updatedAt, 
        title, 
        id, 
        domain, 
        deployment
      }`,
        { workspace },
      )
      .then((result) => {
        setSites(result);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSites();
  }, [workspace]);

  const filtered = sites.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.slug?.current?.toLowerCase().includes(search.toLowerCase()),
  );

  const handleCreate = async () => {
    if (!newSiteData.title || !newSiteData.id) return;

    setCreating(true);
    try {
      await client.create({
        _type: "site",
        title: newSiteData.title,
        id: newSiteData.id,
        workspace: workspace,
        deployment: { status: "draft" },
      });

      setIsDialogOpen(false);
      setNewSiteData({ title: "", id: "" });
      fetchSites();
    } catch (err) {
      console.error("Creation failed", err);
    } finally {
      setCreating(false);
    }
  };

  const statusTone = (s?: string) =>
    s === "active" ? "positive" : s === "inactive" ? "critical" : "caution";

  return (
    <DashboardWidgetContainer header="Sites">
      <Stack
        space={4}
        padding={3}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyItems: "stretch",
            gap: "1rem",
            width: "100%",
          }}
        >
          <TextInput
            icon={SearchIcon}
            placeholder="Search by name or slug…"
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            clearButton={search.length > 0}
            onClear={() => setSearch("")}
            style={{ flexGrow: 1 }}
          />
          <Button
            fontSize={2}
            icon={AddIcon}
            padding={3}
            text="Create New Site"
            tone="primary"
            onClick={() => setIsDialogOpen(true)}
            loading={creating}
            disabled={creating}
            mode="ghost"
          />
        </div>

        {loading ? (
          <Flex
            justify="center"
            padding={5}
          >
            <Spinner />
          </Flex>
        ) : filtered.length === 0 ? (
          <Flex
            justify="center"
            padding={5}
          >
            <Text muted>
              {search ? `No results for "${search}"` : "No sites yet."}
            </Text>
          </Flex>
        ) : (
          <Grid
            columns={[1, 2, 3]}
            gap={3}
          >
            {filtered.map((site) => (
              <Card
                key={site._id}
                as="a"
                href={`/${workspace}/structure/${site._id}`}
                radius={2}
                border
                padding={3}
                style={{ textDecoration: "none", cursor: "pointer" }}
              >
                <Stack space={2}>
                  <Flex
                    justify="space-between"
                    align="flex-start"
                  >
                    <Text weight="semibold">{site.title}</Text>
                    <Badge
                      tone={statusTone(site.status)}
                      fontSize={0}
                    >
                      {site.status ?? "draft"}
                    </Badge>
                  </Flex>
                  <Text
                    size={1}
                    muted
                  >
                    /{site.slug?.current}
                  </Text>
                  {site.url && (
                    <Flex
                      align="center"
                      gap={1}
                    >
                      <ExternalLink
                        style={{ width: 11, opacity: 0.4, flexShrink: 0 }}
                      />
                      <Text
                        size={0}
                        muted
                      >
                        {site.url}
                      </Text>
                    </Flex>
                  )}
                  <Flex
                    align="flex-end"
                    justify="space-between"
                    gap={1}
                  >
                    <Text
                      size={0}
                      muted
                    >
                      Updated {new Date(site._updatedAt).toLocaleDateString()}
                    </Text>

                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        router.navigateUrl(
                          {
                            path: `/${workspace}/structure/${site._id}-settings`,
                            replace: true,
                          }
                        );
                      }}
                      mode="ghost"
                      fontSize={0}
                      icon={<SettingsIcon style={{ height: 12, width: 12 }} />}
                    />
                  </Flex>
                </Stack>
              </Card>
            ))}
          </Grid>
        )}

        {isDialogOpen && (
          <Dialog
            header="Create new site"
            id="create-site-dialog"
            onClose={() => setIsDialogOpen(false)}
            zOffset={10}
            width={1}
          >
            <Box padding={4}>
              <Stack space={4}>
                <Stack space={2}>
                  <Text
                    size={1}
                    weight="semibold"
                  >
                    Site Title
                  </Text>
                  <TextInput
                    placeholder="e.g. Amazon"
                    value={newSiteData.title}
                    onChange={(e) =>
                      setNewSiteData({
                        ...newSiteData,
                        title: e.currentTarget.value,
                        id: e.currentTarget.value
                          .toLowerCase()
                          .replace(/ /g, "-"),
                      })
                    }
                  />
                </Stack>
                <Grid
                  columns={2}
                  gap={2}
                >
                  <Button
                    text="Cancel"
                    mode="ghost"
                    onClick={() => setIsDialogOpen(false)}
                  />
                  <Button
                    text="Create Site"
                    tone="primary"
                    onClick={handleCreate}
                    loading={creating}
                    disabled={!newSiteData.title || !newSiteData.id}
                  />
                </Grid>
              </Stack>
            </Box>
          </Dialog>
        )}
      </Stack>
    </DashboardWidgetContainer>
  );
}

export const workspaceSitesWidget = ({
  workspace,
}: Options): DashboardWidget => ({
  name: "workspace-sites",
  component: () => <WorkspaceSitesWidget workspace={workspace} />,
  layout: { width: "full" },
});
