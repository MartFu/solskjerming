import { useEffect, useState } from "react";
import { SanityClient, useClient } from "sanity";
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
  Switch,
  Text,
  TextInput,
  Tooltip,
  useToast,
} from "@sanity/ui";
import { AddIcon, InfoOutlineIcon, SearchIcon } from "@sanity/icons";
import { Globe, Settings, Trash2 } from "lucide-react";
import { API_VERSION, WorkspaceKey } from "@/utils/constant";
import { useToolLayout } from "@/context/ToolLayoutProvider";
import { useRouter } from "sanity/router";
import { Site } from "@/utils/types";
import { PACKAGE_OPTIONS, PackageKey } from "@/utils/package";
import { capitalize } from "@/utils/helper";
import { getSiteInitialValue } from "@/utils/site/getSiteInitialValue";
import {
  getSiteDeletionPreview,
  SiteDeletionPreview,
} from "@/utils/site/getSiteDeletionPreview";
import { prepareDeletionData } from "@/utils/site/buildSiteDocumentTree";
import { archiveSite, ArchiveResult } from "@/utils/site/archiveSite";
import { ArchiveSiteDialog } from "../archive-site-dialog";
import { ArchiveSiteProvider } from "@/context/ArchiveSiteProvider";

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

interface CreateSiteDialogProps {
  workspace: WorkspaceKey;
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
  const [enabledPackages, setEnabledPackages] = useState<PackageKey[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toast = useToast();
  const canSubmit = title.trim().length > 0 && !saving;

  const togglePackage = (value: PackageKey) => {
    setEnabledPackages((prev) =>
      prev.includes(value) ? prev.filter((p) => p !== value) : [...prev, value],
    );
  };

  const handleCreate = async () => {
    if (!canSubmit) return;
    setSaving(true);
    setError(null);
    try {
      const initialValues = await getSiteInitialValue(client, workspace);
      const created = await client.create({
        _type: "site",
        ...initialValues,
        title: title.trim(),
        ...(domain.trim() ? { domain: domain.trim() } : {}),
        ...(enabledPackages.length > 0 ? { enabledPackages } : {}),
        workspace,
      });
      onCreated(created);
      toast.push({
        duration: 2000,
        title: `${capitalize(created.title)} opprettet`,
      });
    } catch (err) {
      console.error(err);
      setError("Kunne ikke opprette siden. Prøv igjen.");
      toast.push({
        duration: 5000,
        closable: true,
        title: "En feil oppstod",
        description: "Kunne ikke opprette siden. Prøv igjen.",
      });
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

          <Stack space={3}>
            <Flex
              align="center"
              gap={1}
            >
              <Label size={1}>Pakker</Label>
              <Tooltip
                content={
                  <Text
                    size={1}
                    muted
                    style={{ maxWidth: "340px" }}
                  >
                    Pakker påvirker hvilken type sider og innhold dette
                    nettstedet kan publisere. Dersom nettsiden skal ha en
                    nettbutikk, er den avhengig av <b>Nettbutikk</b>-pakken.
                  </Text>
                }
                placement="top-start"
                portal
              >
                <InfoOutlineIcon />
              </Tooltip>
            </Flex>
            <Stack space={2}>
              {PACKAGE_OPTIONS.map((pkg) => {
                const enabled = enabledPackages.includes(pkg.value);
                return (
                  <Card
                    key={pkg.value}
                    padding={3}
                    radius={2}
                    border
                    tone={enabled ? "primary" : "default"}
                    style={{ cursor: "pointer" }}
                    onClick={() => togglePackage(pkg.value)}
                  >
                    <Flex
                      align="center"
                      justify="space-between"
                    >
                      <Text
                        size={1}
                        weight="medium"
                      >
                        {pkg.title}
                      </Text>
                      <Switch
                        checked={enabled}
                        onChange={() => togglePackage(pkg.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </Flex>
                  </Card>
                );
              })}
            </Stack>
            <Text
              size={1}
              muted
            >
              Kan endres senere i sideinnstillingene.
            </Text>
          </Stack>

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

// ─── Archive dialog ───────────────────────────────────────────────────────────

interface ArchiveDialogProps {
  preview: SiteDeletionPreview;
  onClose: () => void;
  onArchived: (siteId: string) => void;
  client: SanityClient;
}

function ArchiveDialog({
  preview,
  onClose,
  onArchived,
  client,
}: ArchiveDialogProps) {
  const toast = useToast();
  const [isArchiving, setIsArchiving] = useState(false);
  const [archiveResult, setArchiveResult] = useState<
    ArchiveResult | undefined
  >();

  const handleConfirm = async () => {
    setIsArchiving(true);
    const result = await archiveSite(client, preview);
    setArchiveResult(result);
    setIsArchiving(false);

    if (result.success) {
      toast.push({
        duration: 3000,
        title: `«${preview.site.title}» er arkivert`,
      });
      onArchived(preview.site._id);
    }
  };

  return (
    <Dialog
      id="archive-site-dialog"
      header={`Arkivere «${preview.site.title}»`}
      onClose={onClose}
      zOffset={1000}
      width={1}
    >
      <Box padding={4}>
        <ArchiveSiteDialog
          data={prepareDeletionData(preview)}
          onConfirm={handleConfirm}
          onCancel={onClose}
          isArchiving={isArchiving}
          isAlreadyArchived={preview.site.isAlreadyArchived}
          archiveResult={archiveResult}
        />
      </Box>
    </Dialog>
  );
}

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

  return (
    <Card
      radius={2}
      border
      padding={4}
      style={{ cursor: "pointer" }}
      onClick={onSelect}
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
          align="center"
          justify="space-between"
        >
          <Text
            size={0}
            muted
          >
            Oppdatert {new Date(site._updatedAt).toLocaleDateString("nb-NO")}
          </Text>
          <Flex gap={1}>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onArchive();
              }}
              mode="bleed"
              tone="critical"
              padding={2}
              icon={<Trash2 style={{ height: 12, width: 12 }} />}
            />
            <Button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                router.navigateUrl({
                  path: `/${workspace}/structure/${site._id}-settings`,
                  replace: true,
                });
                onSelect();
              }}
              mode="bleed"
              tone="neutral"
              padding={2}
              icon={<Settings style={{ height: 12, width: 12 }} />}
            />
          </Flex>
        </Flex>
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
  const [archivePreview, setArchivePreview] =
    useState<SiteDeletionPreview | null>(null);
  const [archiveLoading, setArchiveLoading] = useState<string | null>(null); // siteId being fetched

  const fetchSites = () => {
    setLoading(true);
    client
      .fetch<Site[]>(
        `*[_type == "site" && workspace == $workspace && !(_id in path("drafts.**")) && !defined(archivedAt)]
         | order(title asc) {
           _id, _updatedAt, title, domain, deployment, "slug": slug.current
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

  const handleSelect = (site: Site) => {
    selectSite({
      _id: site._id,
      title: site.title,
      domain: site.domain,
      slug: site.slug,
      _updatedAt: site._updatedAt,
    });
  };

  const handleCreated = (site: Site) => {
    setShowCreate(false);
    fetchSites();
    handleSelect(site);
  };

  const handleArchiveClick = async (siteId: string) => {
    setArchiveLoading(siteId);
    try {
      const preview = await getSiteDeletionPreview(client, siteId);
      setArchivePreview(preview);
    } catch (err) {
      console.error("Kunne ikke hente arkiveringsdata", err);
    } finally {
      setArchiveLoading(null);
    }
  };

  const handleArchived = (siteId: string) => {
    setArchivePreview(null);
    setSites((prev) => prev.filter((s) => s._id !== siteId));
  };

  return (
    <Box
      padding={5}
      style={{ maxWidth: 1440, margin: "0 auto" }}
    >
      <Stack space={5}>
        {/* Header */}
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
                onArchive={() => handleArchiveClick(site._id)}
              />
            ))}
          </Grid>
        )}
      </Stack>

      {/* Create dialog */}
      {showCreate && (
        <CreateSiteDialog
          workspace={workspace}
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}

      {archivePreview && (
        <ArchiveSiteProvider siteId={archivePreview.site._id}>
          {/* Archive dialog — only shown once preview data is ready */}
          <ArchiveDialog
            preview={archivePreview}
            client={client}
            onClose={() => setArchivePreview(null)}
            onArchived={handleArchived}
          />
        </ArchiveSiteProvider>
      )}
    </Box>
  );
}
