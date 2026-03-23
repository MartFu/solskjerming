import { useEffect, useState } from "react";
import { useClient } from "sanity";
import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Grid,
  Spinner,
  Stack,
  Text,
  TextInput,
} from "@sanity/ui";
import {
  AddIcon,
  CogIcon,
  EarthGlobeIcon,
  SearchIcon,
  TrashIcon,
} from "@sanity/icons";
import { Globe, Settings, Trash2 } from "lucide-react";
import { WorkspaceKey } from "@/utils/constant";
import { useToolLayout } from "@/context/ToolLayoutProvider";
import { useRouter } from "sanity/router";
import { Site } from "@/utils/types";
import {
  getSiteDeletionPreview,
  SiteDeletionPreview,
} from "@/utils/site/getSiteDeletionPreview";
import { ArchiveSiteDialog } from "./ArchiveSiteDialog";
import { ArchiveSiteProvider } from "@/context/ArchiveSiteProvider";
import { CreateSiteDialog } from "./CreateSiteDialog";
import { API_VERSION } from "@/utils/env";
import { fetchProjectStats } from "@/utils/fetch-project-stats";
import { ProjectStats } from "./Stats";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function deploymentTone(
  status?: string,
): "positive" | "caution" | "critical" | "default" {
  if (status === "active") return "positive";
  if (status === "inactive") return "critical";
  return "caution";
}

function deploymentLabel(status?: string): string {
  if (status === "active") return "Aktiv";
  if (status === "inactive") return "Inaktiv";
  return "Kladd";
}

// ─── Create site dialog ───────────────────────────────────────────────────────

// ─── Archive dialog ───────────────────────────────────────────────────────────

// ─── Site card ────────────────────────────────────────────────────────────────

interface SiteCardProps {
  site: Site;
  workspace: WorkspaceKey;
  onSelect: () => void;
  onArchive: () => void;
}

function SiteCard({ site, workspace, onSelect, onArchive }: SiteCardProps) {
  const status = site.deployment?.status;
  const router = useRouter();
  const [mouseOver, setMouseOver] = useState(false);

  return (
    <Card
      radius={3}
      border
      tone={mouseOver ? "neutral" : "inherit"}
      onMouseEnter={() => setMouseOver(true)}
      onMouseLeave={() => setMouseOver(false)}
      padding={0} // We'll use internal padding for better control
      style={{
        transition: "all 0.2s ease",
        overflow: "hidden",
        cursor: "pointer"
      }}
      // Adding a subtle hover lifting effect via CSS-in-JS or global styles is great,
      // but sticking to Sanity UI:
      onClick={onSelect}
    >
      <Stack>
        {/* Top visual accent based on status */}
        <Box style={{ background: "var(--card-border-color)" }} />

        <Stack
          space={4}
          padding={4}
        >
          <Flex
            justify="space-between"
            align="flex-start"
          >
            <Stack space={3}>
              <Text
                weight="bold"
                size={2}
              >
                {site.title}
              </Text>
              <Flex
                align="center"
                gap={1}
              >
                <EarthGlobeIcon style={{ width: 16, opacity: 0.75, flexShrink: 0 }} />
                <Text
                  size={1}
                  muted
                >
                  {site.domain || "Ingen domene satt"}
                </Text>
              </Flex>
            </Stack>
            <Badge
              tone={deploymentTone(status)}
              fontSize={0}
              radius={2}
              padding={2}
            >
              {deploymentLabel(status)}
            </Badge>
          </Flex>

          <Flex
            align="center"
            justify="space-between"
          >
            <Text
              size={0}
              muted
            >
              Sist endret:{" "}
              {new Date(site._updatedAt).toLocaleDateString("nb-NO")}
            </Text>

            <Flex gap={1}>
              <Button
                mode="bleed"
                icon={<Settings size={16} />}
                fontSize={1}
                onClick={(e) => {
                  e.stopPropagation();
                  router.navigateUrl({
                    path: `/${workspace}/structure/${site._id}-settings`,
                  });
                  onSelect();
                }}
              />
              <Button
                mode="bleed"
                tone="critical"
                icon={<Trash2 size={16} />}
                fontSize={1}
                onClick={(e) => {
                  e.stopPropagation();
                  onArchive();
                }}
              />
            </Flex>
          </Flex>
        </Stack>
      </Stack>
    </Card>
  );
}

// ─── Workspace View ───────────────────────────────────────────────────────────

export function WorkspaceView() {
  const { workspace, selectSite } = useToolLayout();
  const client = useClient({ apiVersion: API_VERSION });

  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [archiveSiteId, setArchiveSiteId] = useState<string | null>(null);

  const fetchSites = () => {
    setLoading(true);
    client
      .fetch<Site[]>(
        `*[_type == "site" && workspace == $workspace && !(_id in path("drafts.**")) && !defined(archivedAt)]
         | order(title asc) {
           _id, _updatedAt, title, "slug": siteIdentity.slug.current, "domain": siteIdentity.domain
         }`,
        { workspace },
      )
      .then((result) => {
        setSites(result);
        console.log("RESULT", result)
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchSites();
  }, [workspace]);

  const filtered = sites.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.title.toLowerCase().includes(q) || s.domain?.toLowerCase().includes(q)
    );
  });

  const handleSelect = (site: Site) => {
    selectSite({
      _id: site._id,
      title: site.title,
      domain: site.domain,
      slug: site?.slug,
      _updatedAt: site._updatedAt,
    });
  };

  const handleCreated = (site: Site) => {
    setShowCreate(false);
    fetchSites();
    handleSelect(site);
  };

  return (
    <Box
      padding={5}
      style={{ maxWidth: 1440, margin: "0 auto" }}
    >
      <Stack space={6}>
        {/* Header */}
        <Stack space={4}>
          <Text
            size={4}
            weight="bold"
          >
            {workspace.charAt(0).toUpperCase() + workspace.slice(1)}
          </Text>
          <ProjectStats />
        </Stack>

        <Stack space={4}>
          <Text size={2}>
            Velg en nettside å jobbe med, eller opprett en ny.
          </Text>

          {/* Search + create */}
          <Flex
            align="center"
            gap={3}
          >
            <Box flex={1}>
              <TextInput
                icon={SearchIcon}
                placeholder="Søk i nettsider…"
                value={search}
                onChange={(e) => setSearch(e.currentTarget.value)}
                clearButton={search.length > 0}
                onClear={() => setSearch("")}
              />
            </Box>
            <Button
              icon={AddIcon}
              text="Ny nettside"
              mode="ghost"
              tone="primary"
              onClick={() => setShowCreate(true)}
            />
          </Flex>

          {/* Site grid */}
          {loading ? (
            <Flex
              justify="center"
              padding={6}
            >
              <Spinner muted />
            </Flex>
          ) : filtered.length === 0 ? (
            <Card
              tone="transparent"
              padding={6}
              radius={2}
              border
            >
              <Stack
                space={4}
                style={{ textAlign: "center" }}
              >
                <Text muted>
                  {search
                    ? `Ingen treff på "${search}"`
                    : "Ingen nettsider i dette arbeidsområdet ennå."}
                </Text>
                {!search && (
                  <Flex justify="center">
                    <Button
                      icon={AddIcon}
                      text="Opprett første nettside"
                      tone="primary"
                      onClick={() => setShowCreate(true)}
                    />
                  </Flex>
                )}
              </Stack>
            </Card>
          ) : (
            <Grid
              columns={[1, 1, 2, 3]}
              gap={3}
            >
              {filtered.map((site) => (
                <SiteCard
                  key={site._id}
                  site={site}
                  workspace={workspace}
                  onSelect={() => handleSelect(site)}
                  onArchive={() => setArchiveSiteId(site._id)}
                />
              ))}
            </Grid>
          )}
        </Stack>
      </Stack>

      {/* Create dialog */}
      {showCreate && (
        <CreateSiteDialog
          workspace={workspace}
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}

      {archiveSiteId && (
        <ArchiveSiteProvider
          siteId={archiveSiteId}
          onClose={() => setArchiveSiteId(null)}
          onArchived={(siteId: string) => {
            setSites((prev) => prev.filter((s) => s._id !== siteId));
            setArchiveSiteId(null);
          }}
        >
          {/* Archive dialog — only shown once preview data is ready */}
          <ArchiveSiteDialog />
        </ArchiveSiteProvider>
      )}
    </Box>
  );
}
