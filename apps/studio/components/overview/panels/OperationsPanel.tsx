import React, { useState } from "react";
import {
  Badge,
  Box,
  Card,
  Code,
  Flex,
  Grid,
  Spinner,
  Stack,
  Tab,
  TabList,
  TabPanel,
  Text,
  Tooltip,
} from "@sanity/ui";
import {
  CheckmarkCircleIcon,
  CircleIcon,
  ClockIcon,
  CloseCircleIcon,
  ErrorOutlineIcon,
  LaunchIcon,
  PackageIcon,
  SyncIcon,
  WarningOutlineIcon,
} from "@sanity/icons";
import {
  AccentCard,
  DataTable,
  EmptyState,
  SectionLabel,
  StatCard,
  StatusDot,
  THead,
  Th,
  Td,
} from "../primitives";
import type {
  Incident,
  IncidentSeverity,
  Deployment,
  DeploymentStatus,
  MaintenanceWindow,
} from "../types";
import { formatDateTime, formatRelativeTime, getSiteById } from "../_mock";

// ─── Incident Helpers ─────────────────────────────────────────────────────────

const SEVERITY_CONFIG: Record<
  IncidentSeverity,
  { tone: "critical" | "caution" | "default"; label: string; color: string }
> = {
  critical: { tone: "critical", label: "Kritisk", color: "var(--red-500)" },
  warning: { tone: "caution", label: "Advarsel", color: "var(--yellow-500)" },
  info: { tone: "default", label: "Info", color: "var(--gray-400)" },
};

const INCIDENT_STATUS_MAP = {
  open: { label: "Åpen", tone: "critical" as const },
  investigating: { label: "Undersøkes", tone: "caution" as const },
  resolved: { label: "Løst", tone: "positive" as const },
};

const SeverityIcon = ({ severity }: { severity: IncidentSeverity }) => {
  if (severity === "critical")
    return (
      <ErrorOutlineIcon style={{ color: "var(--red-500)", flexShrink: 0 }} />
    );
  if (severity === "warning")
    return (
      <WarningOutlineIcon
        style={{ color: "var(--yellow-500)", flexShrink: 0 }}
      />
    );
  return <CircleIcon style={{ color: "var(--gray-400)", flexShrink: 0 }} />;
};

// ─── Deployment Helpers ───────────────────────────────────────────────────────

const DEPLOYMENT_STATUS: Record<
  DeploymentStatus,
  { tone: "positive" | "critical" | "caution" | "default"; label: string }
> = {
  success: { tone: "positive", label: "Vellykket" },
  error: { tone: "critical", label: "Feil" },
  building: { tone: "caution", label: "Bygger..." },
  cancelled: { tone: "default", label: "Avbrutt" },
};

const TRIGGER_LABELS: Record<string, string> = {
  git_push: "Git push",
  manual: "Manuell",
  scheduled: "Planlagt",
};

const DeployStatusIcon = ({ status }: { status: DeploymentStatus }) => {
  if (status === "success")
    return (
      <CheckmarkCircleIcon
        style={{ color: "var(--green-500)", flexShrink: 0 }}
      />
    );
  if (status === "error")
    return (
      <CloseCircleIcon style={{ color: "var(--red-500)", flexShrink: 0 }} />
    );
  if (status === "building")
    return <SyncIcon style={{ color: "var(--yellow-500)", flexShrink: 0 }} />;
  return <CircleIcon style={{ color: "var(--gray-400)", flexShrink: 0 }} />;
};

// ─── Hendelser Tab (Incidents) ────────────────────────────────────────────────

const EventsTab = ({ incidents }: { incidents: Incident[] }) => {
  const open = incidents.filter((i) => i.status !== "resolved");
  const resolved = incidents.filter((i) => i.status === "resolved");

  return (
    <Stack space={5}>
      {/* Active */}
      <Stack space={3}>
        <Flex
          align="center"
          justify="space-between"
        >
          <SectionLabel>Aktive hendelser</SectionLabel>
          {open.length > 0 && (
            <Badge
              tone="critical"
              fontSize={0}
            >
              {open.length} aktiv{open.length !== 1 ? "e" : ""}
            </Badge>
          )}
        </Flex>

        {open.length === 0 ? (
          <AccentCard tone="positive">
            <Flex
              align="center"
              gap={3}
            >
              <CheckmarkCircleIcon style={{ color: "var(--green-500)" }} />
              <Text size={1}>Ingen aktive hendelser. Alt ser bra ut.</Text>
            </Flex>
          </AccentCard>
        ) : (
          <Stack space={2}>
            {open.map((incident) => {
              const cfg = SEVERITY_CONFIG[incident.severity];
              const site = incident.siteId
                ? getSiteById(incident.siteId)
                : null;
              return (
                <AccentCard
                  key={incident.id}
                  tone={
                    incident.severity === "critical"
                      ? "critical"
                      : incident.severity === "warning"
                        ? "caution"
                        : "default"
                  }
                >
                  <Stack space={3}>
                    <Flex
                      align="flex-start"
                      justify="space-between"
                      gap={3}
                    >
                      <Flex
                        align="flex-start"
                        gap={3}
                        style={{ flex: 1 }}
                      >
                        <SeverityIcon severity={incident.severity} />
                        <Stack
                          space={2}
                          style={{ flex: 1 }}
                        >
                          <Flex
                            align="center"
                            gap={2}
                            wrap="wrap"
                          >
                            <Text
                              size={1}
                              weight="semibold"
                            >
                              {incident.title}
                            </Text>
                            <Badge
                              tone={cfg.tone}
                              fontSize={0}
                            >
                              {cfg.label}
                            </Badge>
                            <Badge
                              tone={INCIDENT_STATUS_MAP[incident.status].tone}
                              fontSize={0}
                            >
                              {INCIDENT_STATUS_MAP[incident.status].label}
                            </Badge>
                          </Flex>
                          <Text
                            size={1}
                            muted
                          >
                            {incident.description}
                          </Text>
                        </Stack>
                      </Flex>
                    </Flex>

                    <Flex
                      align="center"
                      gap={4}
                      wrap="wrap"
                    >
                      {site && (
                        <Flex
                          align="center"
                          gap={2}
                        >
                          <SectionLabel>Nettsted</SectionLabel>
                          <Text size={0}>{site.legalName}</Text>
                        </Flex>
                      )}
                      {!site && (
                        <Flex
                          align="center"
                          gap={2}
                        >
                          <SectionLabel>Scope</SectionLabel>
                          <Text size={0}>Alle nettsted</Text>
                        </Flex>
                      )}
                      <Flex
                        align="center"
                        gap={2}
                      >
                        <SectionLabel>Startet</SectionLabel>
                        <Text size={0}>
                          {formatRelativeTime(incident.startedAt)}
                        </Text>
                      </Flex>
                      <Flex
                        align="center"
                        gap={2}
                      >
                        <SectionLabel>Berørte tjenester</SectionLabel>
                        <Flex
                          gap={1}
                          wrap="wrap"
                        >
                          {incident.affectedServices.map((svc) => (
                            <Badge
                              key={svc}
                              tone="default"
                              fontSize={0}
                            >
                              {svc}
                            </Badge>
                          ))}
                        </Flex>
                      </Flex>
                    </Flex>
                  </Stack>
                </AccentCard>
              );
            })}
          </Stack>
        )}
      </Stack>

      {/* Resolved */}
      {resolved.length > 0 && (
        <Stack space={3}>
          <SectionLabel>Løste hendelser</SectionLabel>
          <DataTable summary="Historikk over løste hendelser">
            <THead>
              <Th>Hendelse</Th>
              <Th width={100}>Alvorlighet</Th>
              <Th width={140}>Startet</Th>
              <Th width={140}>Løst</Th>
              <Th>Nettsted</Th>
            </THead>
            <tbody>
              {resolved.map((inc) => {
                const site = inc.siteId ? getSiteById(inc.siteId) : null;
                const cfg = SEVERITY_CONFIG[inc.severity];
                return (
                  <tr
                    key={inc.id}
                    style={{
                      borderBottom: "1px solid var(--card-border-color)",
                      opacity: 0.7,
                    }}
                  >
                    <Td>
                      <Text size={1}>{inc.title}</Text>
                    </Td>
                    <Td>
                      <Badge
                        tone={cfg.tone}
                        fontSize={0}
                      >
                        {cfg.label}
                      </Badge>
                    </Td>
                    <Td mono>{formatDateTime(inc.startedAt)}</Td>
                    <Td mono>
                      {inc.resolvedAt ? formatDateTime(inc.resolvedAt) : "—"}
                    </Td>
                    <Td>
                      <Text
                        size={0}
                        muted
                      >
                        {site?.legalName ?? "Alle nettsted"}
                      </Text>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </DataTable>
        </Stack>
      )}
    </Stack>
  );
};

// ─── Distribusjoner Tab ────────────────────────────────────────────────────────

const DistributionsTab = ({ deployments }: { deployments: Deployment[] }) => {
  const building = deployments.filter((d) => d.status === "building");
  const recent = deployments.filter((d) => d.status !== "building");

  const successRate = Math.round(
    (deployments.filter((d) => d.status === "success").length /
      deployments.length) *
      100,
  );

  return (
    <Stack space={5}>
      <Grid
        columns={[2, 4]}
        gap={3}
      >
        <StatCard
          label="Siste distribusjoner"
          value={deployments.length}
          sublabel="siste periode"
        />
        <StatCard
          label="Suksessrate"
          value={`${successRate}%`}
          tone={
            successRate >= 90
              ? "positive"
              : successRate >= 70
                ? "caution"
                : "critical"
          }
        />
        <StatCard
          label="Pågår nå"
          value={building.length}
          tone={building.length > 0 ? "caution" : "positive"}
        />
        <StatCard
          label="Feil"
          value={deployments.filter((d) => d.status === "error").length}
          tone={
            deployments.some((d) => d.status === "error")
              ? "critical"
              : "positive"
          }
        />
      </Grid>

      {building.length > 0 && (
        <Stack space={3}>
          <SectionLabel>Pågående bygg</SectionLabel>
          <Stack space={2}>
            {building.map((dep) => {
              const site = getSiteById(dep.siteId);
              return (
                <AccentCard
                  key={dep.id}
                  tone="caution"
                >
                  <Flex
                    align="center"
                    gap={3}
                  >
                    <SyncIcon style={{ color: "var(--yellow-500)" }} />
                    <Stack
                      space={1}
                      style={{ flex: 1 }}
                    >
                      <Text
                        size={1}
                        weight="semibold"
                      >
                        {site?.legalName ?? dep.siteId}
                      </Text>
                      <Text
                        size={0}
                        muted
                      >
                        {dep.commitMessage}
                      </Text>
                    </Stack>
                    <Flex
                      align="center"
                      gap={2}
                    >
                      <Code size={0}>{dep.commit}</Code>
                      <Text
                        size={0}
                        muted
                      >
                        {formatRelativeTime(dep.deployedAt)}
                      </Text>
                    </Flex>
                  </Flex>
                </AccentCard>
              );
            })}
          </Stack>
        </Stack>
      )}

      <Stack space={3}>
        <SectionLabel>Distribusjonslogg</SectionLabel>
        <DataTable summary="Historikk over Vercel-distribusjoner">
          <THead>
            <Th>Nettsted</Th>
            <Th>Commit</Th>
            <Th
              align="center"
              width={100}
            >
              Status
            </Th>
            <Th width={100}>Trigger</Th>
            <Th width={80}>Gren</Th>
            <Th
              align="right"
              width={100}
            >
              Varighet
            </Th>
            <Th width={140}>Tidspunkt</Th>
            <Th width={40}></Th>
          </THead>
          <tbody>
            {deployments.map((dep) => {
              const site = getSiteById(dep.siteId);
              const dsCfg = DEPLOYMENT_STATUS[dep.status];
              return (
                <tr
                  key={dep.id}
                  style={{ borderBottom: "1px solid var(--card-border-color)" }}
                >
                  <Td>
                    <Stack space={1}>
                      <Text
                        size={1}
                        weight="semibold"
                      >
                        {site?.legalName ?? dep.siteId}
                      </Text>
                      <Text
                        size={0}
                        muted
                      >
                        {dep.author}
                      </Text>
                    </Stack>
                  </Td>
                  <Td>
                    <Stack space={1}>
                      <Flex
                        align="center"
                        gap={2}
                      >
                        <Code size={0}>{dep.commit}</Code>
                      </Flex>
                      <Text
                        size={0}
                        muted
                        style={{
                          maxWidth: 260,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {dep.commitMessage}
                      </Text>
                    </Stack>
                  </Td>
                  <Td align="center">
                    <Flex
                      align="center"
                      justify="center"
                      gap={2}
                    >
                      <DeployStatusIcon status={dep.status} />
                      <Badge
                        tone={dsCfg.tone}
                        fontSize={0}
                      >
                        {dsCfg.label}
                      </Badge>
                    </Flex>
                  </Td>
                  <Td>
                    <Text
                      size={0}
                      muted
                    >
                      {TRIGGER_LABELS[dep.trigger]}
                    </Text>
                  </Td>
                  <Td mono>
                    <Badge
                      tone="default"
                      fontSize={0}
                    >
                      {dep.branch}
                    </Badge>
                  </Td>
                  <Td
                    align="right"
                    mono
                  >
                    {dep.durationSeconds > 0 ? `${dep.durationSeconds}s` : "—"}
                  </Td>
                  <Td mono>
                    <Text
                      size={0}
                      muted
                    >
                      {formatRelativeTime(dep.deployedAt)}
                    </Text>
                  </Td>
                  <Td>
                    <a
                      href={dep.url}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: "inherit", display: "flex" }}
                    >
                      <LaunchIcon style={{ fontSize: 14, opacity: 0.5 }} />
                    </a>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </DataTable>
      </Stack>
    </Stack>
  );
};

// ─── Vedlikehold Tab ──────────────────────────────────────────────────────────

const MaintenanceTab = ({ windows }: { windows: MaintenanceWindow[] }) => {
  const upcoming = windows.filter((w) => w.status === "scheduled");
  const active = windows.filter((w) => w.status === "active");
  const completed = windows.filter((w) => w.status === "completed");

  const formatRange = (start: Date, end: Date) =>
    `${formatDateTime(start)} – ${new Intl.DateTimeFormat("nb-NO", { timeStyle: "short" }).format(end)}`;

  return (
    <Stack space={5}>
      {active.length > 0 && (
        <Stack space={3}>
          <SectionLabel>Aktiv nå</SectionLabel>
          {active.map((w) => (
            <AccentCard
              key={w.id}
              tone="caution"
            >
              <Stack space={2}>
                <Text
                  size={1}
                  weight="semibold"
                >
                  {w.title}
                </Text>
                <Text
                  size={1}
                  muted
                >
                  {w.description}
                </Text>
                <Text
                  size={0}
                  muted
                >
                  {formatRange(w.scheduledStart, w.scheduledEnd)}
                </Text>
              </Stack>
            </AccentCard>
          ))}
        </Stack>
      )}

      <Stack space={3}>
        <SectionLabel>Planlagt vedlikehold</SectionLabel>
        {upcoming.length === 0 ? (
          <AccentCard tone="positive">
            <Flex
              align="center"
              gap={3}
            >
              <CheckmarkCircleIcon style={{ color: "var(--green-500)" }} />
              <Text size={1}>Ingen planlagt vedlikehold.</Text>
            </Flex>
          </AccentCard>
        ) : (
          <Stack space={2}>
            {upcoming.map((w) => {
              const allSites = w.affectedSiteIds.length === 0;
              return (
                <Card
                  key={w.id}
                  padding={4}
                  radius={2}
                  border
                >
                  <Stack space={3}>
                    <Flex
                      align="flex-start"
                      justify="space-between"
                      gap={3}
                    >
                      <Stack
                        space={1}
                        style={{ flex: 1 }}
                      >
                        <Text
                          size={1}
                          weight="semibold"
                        >
                          {w.title}
                        </Text>
                        <Text
                          size={1}
                          muted
                        >
                          {w.description}
                        </Text>
                      </Stack>
                      <Badge
                        tone="default"
                        fontSize={0}
                        style={{ flexShrink: 0 }}
                      >
                        Planlagt
                      </Badge>
                    </Flex>

                    <Grid
                      columns={[1, 3]}
                      gap={3}
                    >
                      <Stack space={1}>
                        <SectionLabel>Tidspunkt</SectionLabel>
                        <Text
                          size={0}
                          style={{ fontVariantNumeric: "tabular-nums" }}
                        >
                          {formatRange(w.scheduledStart, w.scheduledEnd)}
                        </Text>
                        <Text
                          size={0}
                          muted
                        >
                          ({formatRelativeTime(w.scheduledStart)})
                        </Text>
                      </Stack>
                      <Stack space={1}>
                        <SectionLabel>Berørte nettsted</SectionLabel>
                        {allSites ? (
                          <Text size={0}>Alle nettsted</Text>
                        ) : (
                          <Stack space={1}>
                            {w.affectedSiteIds.map((id) => {
                              const site = getSiteById(id);
                              return (
                                <Text
                                  key={id}
                                  size={0}
                                >
                                  {site?.legalName ?? id}
                                </Text>
                              );
                            })}
                          </Stack>
                        )}
                      </Stack>
                      <Stack space={1}>
                        <SectionLabel>Opprettet av</SectionLabel>
                        <Text
                          size={0}
                          muted
                        >
                          {w.createdBy}
                        </Text>
                      </Stack>
                    </Grid>
                  </Stack>
                </Card>
              );
            })}
          </Stack>
        )}
      </Stack>

      {completed.length > 0 && (
        <Stack space={3}>
          <SectionLabel>Fullført vedlikehold</SectionLabel>
          <DataTable summary="Historikk over fullført vedlikehold">
            <THead>
              <Th>Tittel</Th>
              <Th width={200}>Tidspunkt</Th>
              <Th>Berørte nettsted</Th>
              <Th width={120}>Opprettet av</Th>
            </THead>
            <tbody>
              {completed.map((w) => (
                <tr
                  key={w.id}
                  style={{
                    borderBottom: "1px solid var(--card-border-color)",
                    opacity: 0.65,
                  }}
                >
                  <Td>
                    <Text size={1}>{w.title}</Text>
                  </Td>
                  <Td mono>
                    <Text
                      size={0}
                      muted
                    >
                      {formatRange(w.scheduledStart, w.scheduledEnd)}
                    </Text>
                  </Td>
                  <Td>
                    <Text
                      size={0}
                      muted
                    >
                      {w.affectedSiteIds.length === 0
                        ? "Alle nettsted"
                        : w.affectedSiteIds
                            .map((id) => getSiteById(id)?.legalName ?? id)
                            .join(", ")}
                    </Text>
                  </Td>
                  <Td>
                    <Text
                      size={0}
                      muted
                    >
                      {w.createdBy}
                    </Text>
                  </Td>
                </tr>
              ))}
            </tbody>
          </DataTable>
        </Stack>
      )}
    </Stack>
  );
};

// ─── OperationsPanel ────────────────────────────────────────────────────────────────

interface OperationsPanelProps {
  incidents: Incident[];
  deployments: Deployment[];
  maintenanceWindows: MaintenanceWindow[];
  loading?: boolean;
}

export const OperationsPanel = ({
  incidents,
  deployments,
  maintenanceWindows,
  loading,
}: OperationsPanelProps) => {
  const [tab, setTab] = useState("hendelser");

  const openIncidents = incidents.filter((i) => i.status !== "resolved").length;

  if (loading) {
    return (
      <Flex
        align="center"
        justify="center"
        padding={7}
      >
        <Spinner muted />
      </Flex>
    );
  }

  return (
    <Stack space={4}>
      <TabList space={1}>
        <Tab
          aria-controls="drift-hendelser"
          id="tab-drift-hendelser"
          label={
            openIncidents > 0 ? `Hendelser (${openIncidents})` : "Hendelser"
          }
          onClick={() => setTab("hendelser")}
          selected={tab === "hendelser"}
        />
        <Tab
          aria-controls="drift-distribusjoner"
          id="tab-drift-distribusjoner"
          label="Distribusjoner"
          onClick={() => setTab("distribusjoner")}
          selected={tab === "distribusjoner"}
        />
        <Tab
          aria-controls="drift-vedlikehold"
          id="tab-drift-vedlikehold"
          label="Vedlikehold"
          onClick={() => setTab("vedlikehold")}
          selected={tab === "vedlikehold"}
        />
      </TabList>

      <TabPanel
        aria-labelledby="tab-drift-hendelser"
        hidden={tab !== "hendelser"}
        id="drift-hendelser"
      >
        {tab === "hendelser" && <EventsTab incidents={incidents} />}
      </TabPanel>
      <TabPanel
        aria-labelledby="tab-drift-distribusjoner"
        hidden={tab !== "distribusjoner"}
        id="drift-distribusjoner"
      >
        {tab === "distribusjoner" && (
          <DistributionsTab deployments={deployments} />
        )}
      </TabPanel>
      <TabPanel
        aria-labelledby="tab-drift-vedlikehold"
        hidden={tab !== "vedlikehold"}
        id="drift-vedlikehold"
      >
        {tab === "vedlikehold" && (
          <MaintenanceTab windows={maintenanceWindows} />
        )}
      </TabPanel>
    </Stack>
  );
};
