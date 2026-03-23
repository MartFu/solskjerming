import {
  packageRegistry,
  type PackageKey,
} from "@/schemaTypes/documents/packages";
import { WorkspaceKey } from "@/utils/constant";
import { API_VERSION } from "@/utils/env";
import { asStudioIcon, capitalize } from "@/utils/helper";
import { getSiteInitialValue } from "@/utils/site/getSiteInitialValue";
import { Site } from "@/utils/types";
import { AsteriskIcon, InfoOutlineIcon } from "@sanity/icons";
import {
  Box,
  Button,
  Card,
  Dialog,
  Flex,
  Grid,
  Label,
  Stack,
  Switch,
  Text,
  TextInput,
  Tooltip,
  useToast,
} from "@sanity/ui";
import { Asterisk } from "lucide-react";
import { useState } from "react";
import { useClient } from "sanity";

const StudioAsterisk = asStudioIcon(Asterisk)

export interface CreateSiteDialogProps {
  workspace: WorkspaceKey;
  onClose: () => void;
  onCreated: (site: Site) => void;
}

export function CreateSiteDialog({
  workspace,
  onClose,
  onCreated,
}: CreateSiteDialogProps) {
  const [title, setTitle] = useState("");
  const [domain, setDomain] = useState("");
  const [enabledPackages, setEnabledPackages] = useState<PackageKey[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const client = useClient({ apiVersion: API_VERSION });
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
              <span style={{ color: "var(--card-badge-critical-dot-color)", fontSize: 14 }}>
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
            <Flex
              gap={1}
              align="center"
            >
              <StudioAsterisk />

              <Text
                size={1}
                muted
              >
                Kan legges til eller endres senere i nettsidens innstillinger.
              </Text>
            </Flex>
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
                    nettstedet kan publisere. Dersom nettsiden f.eks. skal ha en
                    nettbutikk, er den avhengig av <b>Netthandel</b>-pakken.
                  </Text>
                }
                placement="top-start"
                portal
              >
                <InfoOutlineIcon />
              </Tooltip>
            </Flex>
            <Stack space={2}>
              {packageRegistry.packages.map((pkg) => {
                const enabled = enabledPackages.includes(pkg.key);
                return (
                  <Card
                    key={pkg.key}
                    padding={3}
                    radius={2}
                    border
                    tone={enabled ? "primary" : "default"}
                    style={{ cursor: "pointer" }}
                    onClick={() => togglePackage(pkg.key)}
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
                        onChange={() => togglePackage(pkg.key)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </Flex>
                  </Card>
                );
              })}
            </Stack>
            <Flex
              gap={1}
              align="center"
            >
              <StudioAsterisk />
              <Text
                size={1}
                muted
              >
                Kan endres senere i nettsidens innstillinger.
              </Text>
            </Flex>
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
