import { useEffect, useState } from "react";
import { useClient } from "sanity";
import {
  Badge,
  Box,
  Button,
  Card,
  Dialog,
  Flex,
  Grid,
  Label,
  Spinner,
  Stack,
  Text,
  TextInput,
} from "@sanity/ui";
import { AddIcon, SearchIcon } from "@sanity/icons";
import { Globe, Settings } from "lucide-react";
import { API_VERSION } from "@/utils/constant";
import {
  useToolLayout,
} from "@/context/ToolLayoutProvider";
import { useRouter } from "sanity/router";
import { ActiveSite, Site } from "@/utils/types";


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

function deriveId(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

// ─── Create site dialog ───────────────────────────────────────────────────────

interface CreateSiteDialogProps {
  workspace: string;
  onClose: () => void;
  onCreated: (site: Site) => void;
}

function CreateSiteDialog({
  workspace,
  onClose,
  onCreated,
}: CreateSiteDialogProps) {
  const client = useClient({ apiVersion: API_VERSION });
  const [title, setTitle] = useState("");
  const [domain, setDomain] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = title.trim().length > 0 && !saving;

  const handleCreate = async () => {
    if (!canSubmit) return;
    setSaving(true);
    setError(null);
    try {
      const created = await client.create({
        _type: "site",
        title: title.trim(),
        ...(domain.trim() ? { domain: domain.trim() } : {}),
        workspace
      });
      onCreated(created);
    } catch (err) {
      console.error(err);
      setError("Kunne ikke opprette siden. Prøv igjen.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      header="Opprett ny nettside"
      id="create-site-dialog"
      onClose={onClose}
      zOffset={1000}
      width={1}
    >
      <Box padding={4}>
        <Stack space={5}>
          {/* Title */}
          <Stack space={2}>
            <Label size={1}>
              Navn på siden{" "}
              <span style={{ color: "var(--card-badge-critical-dot-color)" }}>
                *
              </span>
            </Label>
            <TextInput
              placeholder="f.eks. Amazon Norge"
              value={title}
              onChange={(e) => setTitle(e.currentTarget.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              autoFocus
            />
          </Stack>

          {/* Domain — optional */}
          <Stack space={2}>
            <Label size={1}>Domene (valgfritt)</Label>
            <TextInput
              placeholder="f.eks. amazon.no"
              value={domain}
              onChange={(e) => setDomain(e.currentTarget.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
            <Text
              size={1}
              muted
            >
              Kan legges til eller endres senere i sideinnstillingene.
            </Text>
          </Stack>

          {/* Error */}
          {error && (
            <Card
              tone="critical"
              padding={3}
              radius={2}
              border
            >
              <Text size={1}>{error}</Text>
            </Card>
          )}

          {/* Actions */}
          <Grid
            columns={2}
            gap={2}
          >
            <Button
              text="Avbryt"
              mode="ghost"
              onClick={onClose}
              disabled={saving}
            />
            <Button
              text="Opprett side"
              tone="primary"
              onClick={handleCreate}
              loading={saving}
              disabled={!canSubmit}
            />
          </Grid>
        </Stack>
      </Box>
    </Dialog>
  );
}

// ─── Site card ────────────────────────────────────────────────────────────────

interface SiteCardProps {
  site: Site;
  workspace: string;
  onSelect: (site: ActiveSite) => void;
}

function SiteCard({ site, workspace, onSelect }: SiteCardProps) {
  const status = site.deployment?.status;
  const router = useRouter();

  return (
    <Card
      radius={2}
      border
      padding={4}
      style={{ cursor: "pointer" }}
      onClick={() => onSelect({ _id: site._id, title: site.title })}
    >
      <Stack space={3}>
        <Flex
          justify="space-between"
          align="flex-start"
          gap={2}
        >
          <Text
            weight="semibold"
            size={2}
          >
            {site.title}
          </Text>
          <Badge
            tone={deploymentTone(status)}
            fontSize={0}
            style={{ flexShrink: 0 }}
          >
            {deploymentLabel(status)}
          </Badge>
        </Flex>

        {site.domain ? (
          <Flex
            align="center"
            gap={2}
          >
            <Globe
              style={{ width: 12, height: 12, opacity: 0.4, flexShrink: 0 }}
            />
            <Text
              size={1}
              muted
            >
              {site.domain}
            </Text>
          </Flex>
        ) : (
          <Text
            size={1}
            muted
          >
            Ingen domene satt
          </Text>
        )}

        <Flex
          align={"center"}
          justify={"space-between"}
        >
          <Text
            size={0}
            muted
          >
            Oppdatert {new Date(site._updatedAt).toLocaleDateString("nb-NO")}
          </Text>

          <Button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              router.navigateUrl({
                path: `/${workspace}/structure/${site._id}-settings`,
                replace: true,
              });
              onSelect({ _id: site._id, title: site.title })
            }}
            mode="bleed"
            tone="neutral"
            padding={[2]}
            fontSize={0}
            icon={<Settings style={{ height: 12, width: 12 }} />}
          />
        </Flex>
      </Stack>
    </Card>
  );
}

// ─── Workspace View ────────────────────────────────────────────────────────

export function WorkspaceView() {
  const { workspace, selectSite } = useToolLayout();
  const client = useClient({ apiVersion: API_VERSION });

  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const fetchSites = () => {
    setLoading(true);
    client
      .fetch<Site[]>(
        `*[_type == "site" && workspace == $workspace && !(_id in path("drafts.**"))]
         | order(title asc) {
           _id, _updatedAt, title, id, domain, deployment
         }`,
        { workspace },
      )
      .then((result) => {
        setSites(result);
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

  const handleCreated = (site: Site) => {
    setShowCreate(false);
    fetchSites();
    // Immediately navigate into the newly created site
    selectSite({ _id: site._id, title: site.title });
  };

  return (
    <Box
      padding={5}
      style={{ maxWidth: 1440, margin: "0 auto" }}
    >
      <Stack space={5}>
        {/* ── Header ── */}
        <Stack space={4}>
          <Text
            size={4}
            weight="bold"
          >
            {workspace.charAt(0).toUpperCase() + workspace.slice(1)}
          </Text>
          <Text
            size={2}
            muted
          >
            Velg en nettside å jobbe med, eller opprett en ny.
          </Text>
        </Stack>

        {/* ── Search + create ── */}
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

        {/* ── Site grid ── */}
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
            columns={[1, 2]}
            gap={3}
          >
            {filtered.map((site) => (
              <SiteCard
                key={site._id}
                site={site}
                workspace={workspace}
                onSelect={selectSite}
              />
            ))}
          </Grid>
        )}
      </Stack>

      {/* ── Create dialog ── */}
      {showCreate && (
        <CreateSiteDialog
          workspace={workspace}
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}
    </Box>
  );
}
