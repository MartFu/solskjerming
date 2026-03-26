import React, { useState } from "react";
import {
  Badge,
  Box,
  Card,
  Code,
  Flex,
  Grid,
  Inline,
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
  ClockIcon,
  ErrorOutlineIcon,
  LaunchIcon,
  WarningOutlineIcon,
} from "@sanity/icons";
import {
  AccentCard,
  DataTable,
  DnsBadge,
  EmptyState,
  HttpStatusBadge,
  SectionLabel,
  SslBadge,
  StatCard,
  StatusDot,
  THead,
  Th,
  Td,
} from "../primitives";
import type { FleetStatus } from "../types";
import { formatBytes, formatRelativeTime, getSiteById } from "../_mock";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function siteUptimeTone(u: number): "positive" | "caution" | "critical" {
  if (u >= 99.9) return "positive";
  if (u >= 98) return "caution";
  return "critical";
}

function sparklinePath(values: number[], w: number, h: number): string {
  if (values.length < 2) return "";
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const stepX = w / (values.length - 1);
  return values
    .map((v, i) => {
      const x = i * stepX;
      const y = h - ((v - min) / range) * h;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

// ─── Mini Sparkline ────────────────────────────────────────────────────────────

const Sparkline = ({
  values,
  tone = "default",
}: {
  values: number[];
  tone?: string;
}) => {
  const W = 72;
  const H = 24;
  const color =
    tone === "positive"
      ? "#3ec97e"
      : tone === "critical"
        ? "#e5534b"
        : "#8b95a1";
  const path = sparklinePath(values, W, H);

  return (
    <svg
      width={W}
      height={H}
      style={{ display: "block", flexShrink: 0 }}
    >
      <defs>
        <linearGradient
          id={`sg-${tone}`}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop
            offset="0%"
            stopColor={color}
            stopOpacity={0.15}
          />
          <stop
            offset="100%"
            stopColor={color}
            stopOpacity={0}
          />
        </linearGradient>
      </defs>
      <path
        d={`${path} V ${H} H 0 Z`}
        fill={`url(#sg-${tone})`}
      />
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

// ─── Fleet Summary Bar ─────────────────────────────────────────────────────────

const FleetSummaryBar = ({ statuses }: { statuses: FleetStatus[] }) => {
  const online = statuses.filter((s) => s.health.httpStatus < 400).length;
  const warnings = statuses.filter(
    (s) => s.connectivity.dnsMismatch || s.connectivity.sslStatus !== "valid",
  ).length;
  const errors = statuses.filter((s) => s.health.httpStatus >= 400).length;
  const totalRequests = statuses.reduce((a, s) => a + s.traffic.requests24h, 0);
  const totalBandwidth = statuses.reduce(
    (a, s) => a + s.traffic.bandwidth24h,
    0,
  );
  const avgUptime =
    statuses.reduce((a, s) => a + s.health.uptime7d, 0) / statuses.length;

  return (
    <Grid
      columns={[2, 2, 3, 5]}
      gap={3}
    >
      <StatCard
        label="Nettsted online"
        value={`${online} / ${statuses.length}`}
        tone="positive"
      />
      <StatCard
        label="Advarsler"
        value={warnings}
        tone={warnings > 0 ? "caution" : "positive"}
      />
      <StatCard
        label="Feil"
        value={errors}
        tone={errors > 0 ? "critical" : "positive"}
      />
      <StatCard
        label="Forespørsler (24t)"
        value={totalRequests.toLocaleString("nb-NO")}
        sublabel="alle nettsted"
      />
      <StatCard
        label="Båndbredde (24t)"
        value={formatBytes(totalBandwidth)}
        sublabel={`snitt opp. ${avgUptime.toFixed(2)}%`}
      />
    </Grid>
  );
};

// ─── Fleet Row ─────────────────────────────────────────────────────────────────

const FleetRow = ({ s }: { s: FleetStatus }) => {
  const httpOk = s.health.httpStatus < 400;
  const hasWarning =
    s.connectivity.dnsMismatch || s.connectivity.sslStatus !== "valid";
  const dotTone = !httpOk ? "critical" : hasWarning ? "caution" : "positive";
  const uplTone = siteUptimeTone(s.health.uptime7d);

  return (
    <tr style={{ borderBottom: "1px solid var(--card-border-color)" }}>
      <Td align="left">
        <Flex
          align="flex-start"
          gap={3}
        >
          <StatusDot
            tone={dotTone}
            size={8}
            pulse={dotTone === "critical"}
          />
          <Stack space={1}>
            <Text
              size={1}
              weight="semibold"
            >
              {s.site.legalName}
            </Text>
            <Flex
              align="center"
              gap={2}
            >
              <Text
                size={0}
                muted
              >
                {s.site.customDomain ??
                  `${s.site.internalSubdomain}.sanity.studio`}
              </Text>
              {s.site.customDomain && (
                <a
                  href={`https://${s.site.customDomain}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "inherit", display: "flex" }}
                >
                  <LaunchIcon style={{ fontSize: 12 }} />
                </a>
              )}
            </Flex>
          </Stack>
        </Flex>
      </Td>
      <Td align="center">
        <HttpStatusBadge status={s.health.httpStatus} />
      </Td>
      <Td align="center">
        <SslBadge status={s.connectivity.sslStatus} />
      </Td>
      <Td align="center">
        <DnsBadge mismatch={s.connectivity.dnsMismatch} />
      </Td>
      <Td
        align="right"
        mono
      >
        <Flex
          align="center"
          justify="flex-end"
          gap={2}
        >
          <Sparkline
            values={s.traffic.requests7d}
            tone={uplTone}
          />
          <Text
            size={0}
            style={{
              fontVariantNumeric: "tabular-nums",
              minWidth: 44,
              textAlign: "right",
            }}
          >
            {s.traffic.requests24h.toLocaleString("nb-NO")}
          </Text>
        </Flex>
      </Td>
      <Td
        align="right"
        mono
      >
        <Badge
          tone={uplTone}
          fontSize={0}
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {s.health.uptime7d.toFixed(2)}%
        </Badge>
      </Td>
      <Td>
        <Flex
          align="center"
          gap={2}
        >
          <Text
            size={0}
            muted
          >
            {s.connectivity.actualIp ?? "—"}
          </Text>
          {s.connectivity.dnsMismatch && (
            <Tooltip
              content={
                <Box padding={2}>
                  <Text size={1}>
                    Forventet: {s.connectivity.expectedIp}
                    <br />
                    Faktisk: {s.connectivity.actualIp}
                  </Text>
                </Box>
              }
              portal
              placement="top"
            >
              <span
                style={{
                  display: "flex",
                  color: "var(--yellow-500)",
                  cursor: "help",
                }}
              >
                <WarningOutlineIcon />
              </span>
            </Tooltip>
          )}
        </Flex>
      </Td>
      <Td>
        {s.health.lastError ? (
          <Tooltip
            content={
              <Box
                padding={2}
                style={{ maxWidth: 280 }}
              >
                <Text size={1}>{s.health.lastError}</Text>
              </Box>
            }
            portal
            placement="top"
          >
            <span
              style={{
                display: "flex",
                color: "var(--red-500)",
                cursor: "help",
              }}
            >
              <ErrorOutlineIcon />
            </span>
          </Tooltip>
        ) : (
          <span style={{ display: "flex", color: "var(--green-500)" }}>
            <CheckmarkCircleIcon />
          </span>
        )}
      </Td>
    </tr>
  );
};

// ─── Puls Tab (live status grid) ───────────────────────────────────────────────

const PulsTab = ({ statuses }: { statuses: FleetStatus[] }) => (
  <Stack space={5}>
    <FleetSummaryBar statuses={statuses} />

    <Stack space={3}>
      <SectionLabel>Alle nettsted</SectionLabel>
      <DataTable minWidth="1100px" summary="Driftstatus for alle administrerte nettsted">
        <THead>
          <Th>Nettsted</Th>
          <Th
            align="center"
            width={80}
          >
            HTTP
          </Th>
          <Th
            align="center"
            width={90}
          >
            SSL
          </Th>
          <Th
            align="center"
            width={80}
          >
            DNS
          </Th>
          <Th
            align="right"
            width={180}
          >
            Forespørsler (24t)
          </Th>
          <Th
            align="right"
            width={100}
          >
            Oppetid (7d)
          </Th>
          <Th width={140}>IP-adresse</Th>
          <Th width={48}>Health</Th>
        </THead>
        <tbody>
          {statuses.map((s) => (
            <FleetRow
              key={s.id}
              s={s}
            />
          ))}
        </tbody>
      </DataTable>
    </Stack>

    <Stack space={3}>
      <SectionLabel>Konfigurasjonsdetaljer</SectionLabel>
      <Grid
        columns={[1, 1, 2]}
        gap={3}
      >
        {statuses.map((s) => (
          <Card
            key={s.id}
            padding={4}
            radius={2}
            border
          >
            <Stack space={3}>
              <Flex
                align="center"
                justify="space-between"
              >
                <Text
                  size={1}
                  weight="semibold"
                >
                  {s.site.legalName}
                </Text>
                <Badge
                  tone="default"
                  fontSize={0}
                >
                  {s.site.category ?? "Ukjent"}
                </Badge>
              </Flex>
              <Flex
                gap={4}
                wrap="wrap"
              >
                <Stack space={1}>
                  <SectionLabel>ISR-cache</SectionLabel>
                  <Text
                    size={1}
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {s.health.isrCacheAge < 3600
                      ? `${s.health.isrCacheAge}s`
                      : `${(s.health.isrCacheAge / 3600).toFixed(1)}t`}
                  </Text>
                </Stack>
                <Stack space={1}>
                  <SectionLabel>TTL</SectionLabel>
                  <Text
                    size={1}
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {s.connectivity.ttl}s
                  </Text>
                </Stack>
                <Stack space={1}>
                  <SectionLabel>Båndbredde (24t)</SectionLabel>
                  <Text size={1}>{formatBytes(s.traffic.bandwidth24h)}</Text>
                </Stack>
                <Stack space={1}>
                  <SectionLabel>Sist sjekket</SectionLabel>
                  <Flex
                    align="center"
                    gap={2}
                  >
                    <ClockIcon style={{ fontSize: 11, opacity: 0.5 }} />
                    <Text
                      size={0}
                      muted
                    >
                      {formatRelativeTime(s.health.lastChecked)}
                    </Text>
                  </Flex>
                </Stack>
              </Flex>
              {s.site.description && (
                <Text
                  size={0}
                  muted
                >
                  {s.site.description}
                </Text>
              )}
            </Stack>
          </Card>
        ))}
      </Grid>
    </Stack>
  </Stack>
);

// ─── Connectivity Tab ──────────────────────────────────────────────────────────

const ConnectivityTab = ({ statuses }: { statuses: FleetStatus[] }) => {
  const mismatches = statuses.filter((s) => s.connectivity.dnsMismatch);
  const sslIssues = statuses.filter(
    (s) => s.connectivity.sslStatus !== "valid",
  );

  return (
    <Stack space={5}>
      {mismatches.length > 0 && (
        <Stack space={3}>
          <SectionLabel>DNS-avvik</SectionLabel>
          <Stack space={2}>
            {mismatches.map((s) => (
              <AccentCard
                key={s.id}
                tone="caution"
              >
                <Flex
                  align="flex-start"
                  gap={3}
                >
                  <WarningOutlineIcon
                    style={{
                      color: "var(--yellow-500)",
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  />
                  <Stack
                    space={2}
                    style={{ flex: 1 }}
                  >
                    <Text
                      size={1}
                      weight="semibold"
                    >
                      {s.site.customDomain}
                    </Text>
                    <Text size={1}>
                      A-record peker på{" "}
                      <Code size={1}>{s.connectivity.actualIp}</Code> –
                      forventet{" "}
                      <Code size={1}>{s.connectivity.expectedIp}</Code>{" "}
                      (Vercel).
                    </Text>
                    <Text
                      size={0}
                      muted
                    >
                      Oppdater A-record hos Proisp for å rette avviket.
                    </Text>
                  </Stack>
                </Flex>
              </AccentCard>
            ))}
          </Stack>
        </Stack>
      )}

      {sslIssues.length > 0 && (
        <Stack space={3}>
          <SectionLabel>SSL-problemer</SectionLabel>
          <Stack space={2}>
            {sslIssues.map((s) => (
              <AccentCard
                key={s.id}
                tone={
                  s.connectivity.sslStatus === "invalid"
                    ? "critical"
                    : "caution"
                }
              >
                <Flex
                  align="flex-start"
                  gap={3}
                >
                  {s.connectivity.sslStatus === "invalid" ? (
                    <ErrorOutlineIcon
                      style={{
                        color: "var(--red-500)",
                        flexShrink: 0,
                        marginTop: 2,
                      }}
                    />
                  ) : (
                    <WarningOutlineIcon
                      style={{
                        color: "var(--yellow-500)",
                        flexShrink: 0,
                        marginTop: 2,
                      }}
                    />
                  )}
                  <Stack space={2}>
                    <Text
                      size={1}
                      weight="semibold"
                    >
                      {s.site.customDomain}
                    </Text>
                    <Text size={1}>
                      SSL-status: <SslBadge status={s.connectivity.sslStatus} />
                    </Text>
                    {s.connectivity.sslStatus === "pending" && (
                      <Text
                        size={0}
                        muted
                      >
                        Vercel utsteder sertifikatet. Verifiser at
                        DNS-propagering er fullført.
                      </Text>
                    )}
                  </Stack>
                </Flex>
              </AccentCard>
            ))}
          </Stack>
        </Stack>
      )}

      <Stack space={3}>
        <SectionLabel>Full DNS-oversikt</SectionLabel>
        <DataTable summary="DNS- og SSL-konfigurasjon per nettsted">
          <THead>
            <Th>Nettsted</Th>
            <Th>Forventet IP</Th>
            <Th>Faktisk IP</Th>
            <Th align="center">DNS</Th>
            <Th align="center">SSL</Th>
            <Th align="right">TTL</Th>
          </THead>
          <tbody>
            {statuses.map((s) => (
              <tr
                key={s.id}
                style={{ borderBottom: "1px solid var(--card-border-color)" }}
              >
                <Td>
                  <Stack space={1}>
                    <Text
                      size={1}
                      weight="semibold"
                    >
                      {s.site.legalName}
                    </Text>
                    <Text
                      size={0}
                      muted
                    >
                      {s.site.customDomain}
                    </Text>
                  </Stack>
                </Td>
                <Td mono>{s.connectivity.expectedIp}</Td>
                <Td mono>
                  <Flex
                    align="center"
                    gap={2}
                  >
                    <span>{s.connectivity.actualIp ?? "—"}</span>
                    {s.connectivity.dnsMismatch && (
                      <WarningOutlineIcon
                        style={{ color: "var(--yellow-500)", fontSize: 14 }}
                      />
                    )}
                  </Flex>
                </Td>
                <Td align="center">
                  <DnsBadge mismatch={s.connectivity.dnsMismatch} />
                </Td>
                <Td align="center">
                  <SslBadge status={s.connectivity.sslStatus} />
                </Td>
                <Td
                  align="right"
                  mono
                >
                  {s.connectivity.ttl}s
                </Td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </Stack>

      {mismatches.length === 0 && sslIssues.length === 0 && (
        <AccentCard tone="positive">
          <Flex
            align="center"
            gap={3}
          >
            <CheckmarkCircleIcon style={{ color: "var(--green-500)" }} />
            <Text size={1}>
              Ingen DNS- eller SSL-avvik oppdaget for noen av nettstedene.
            </Text>
          </Flex>
        </AccentCard>
      )}
    </Stack>
  );
};

// ─── Trafikk Tab ───────────────────────────────────────────────────────────────

const TrafikkTab = ({ statuses }: { statuses: FleetStatus[] }) => {
  const sorted = [...statuses].sort(
    (a, b) => b.traffic.requests24h - a.traffic.requests24h,
  );
  const maxRequests = Math.max(...sorted.map((s) => s.traffic.requests24h));

  return (
    <Stack space={5}>
      <Stack space={3}>
        <SectionLabel>Trafikk siste 24 timer</SectionLabel>
        <DataTable summary="Trafikkoversikt per nettsted">
          <THead>
            <Th>Nettsted</Th>
            <Th align="right">Forespørsler (24t)</Th>
            <Th align="right">Båndbredde (24t)</Th>
            <Th>Siste 7 dager</Th>
            <Th align="right">Oppetid (7d)</Th>
          </THead>
          <tbody>
            {sorted.map((s) => {
              const pct = (s.traffic.requests24h / maxRequests) * 100;
              const uplTone = siteUptimeTone(s.health.uptime7d);
              return (
                <tr
                  key={s.id}
                  style={{ borderBottom: "1px solid var(--card-border-color)" }}
                >
                  <Td>
                    <Stack space={1}>
                      <Text
                        size={1}
                        weight="semibold"
                      >
                        {s.site.legalName}
                      </Text>
                      <Text
                        size={0}
                        muted
                      >
                        {s.site.customDomain}
                      </Text>
                    </Stack>
                  </Td>
                  <Td align="right">
                    <Stack
                      space={1}
                      style={{ alignItems: "flex-end" }}
                    >
                      <Text
                        size={1}
                        style={{ fontVariantNumeric: "tabular-nums" }}
                      >
                        {s.traffic.requests24h.toLocaleString("nb-NO")}
                      </Text>
                      <div
                        style={{
                          height: 2,
                          width: `${pct}%`,
                          minWidth: 2,
                          maxWidth: "100%",
                          borderRadius: 1,
                          backgroundColor: "var(--blue-500)",
                          opacity: 0.5,
                        }}
                      />
                    </Stack>
                  </Td>
                  <Td
                    align="right"
                    mono
                  >
                    {formatBytes(s.traffic.bandwidth24h)}
                  </Td>
                  <Td>
                    <Sparkline
                      values={s.traffic.requests7d}
                      tone={uplTone}
                    />
                  </Td>
                  <Td align="right">
                    <Badge
                      tone={uplTone}
                      fontSize={0}
                      style={{ fontVariantNumeric: "tabular-nums" }}
                    >
                      {s.health.uptime7d.toFixed(2)}%
                    </Badge>
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

// ─── FleetPanel ────────────────────────────────────────────────────────────────

interface FleetPanelProps {
  statuses: FleetStatus[];
  loading?: boolean;
}

export const FleetPanel = ({ statuses, loading }: FleetPanelProps) => {
  const [tab, setTab] = useState("puls");

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

  if (!statuses.length) {
    return <EmptyState message="Ingen nettsted funnet." />;
  }

  return (
    <Stack space={4}>
      <TabList space={1}>
        <Tab
          aria-controls="fleet-puls"
          id="tab-puls"
          label="Puls"
          onClick={() => setTab("puls")}
          selected={tab === "puls"}
        />
        <Tab
          aria-controls="fleet-konnektivitet"
          id="tab-konnektivitet"
          label="Konnektivitet"
          onClick={() => setTab("konnektivitet")}
          selected={tab === "konnektivitet"}
        />
        <Tab
          aria-controls="fleet-trafikk"
          id="tab-trafikk"
          label="Trafikk"
          onClick={() => setTab("trafikk")}
          selected={tab === "trafikk"}
        />
      </TabList>

      <TabPanel
        aria-labelledby="tab-puls"
        hidden={tab !== "puls"}
        id="fleet-puls"
      >
        {tab === "puls" && <PulsTab statuses={statuses} />}
      </TabPanel>
      <TabPanel
        aria-labelledby="tab-konnektivitet"
        hidden={tab !== "konnektivitet"}
        id="fleet-konnektivitet"
      >
        {tab === "konnektivitet" && <ConnectivityTab statuses={statuses} />}
      </TabPanel>
      <TabPanel
        aria-labelledby="tab-trafikk"
        hidden={tab !== "trafikk"}
        id="fleet-trafikk"
      >
        {tab === "trafikk" && <TrafikkTab statuses={statuses} />}
      </TabPanel>
    </Stack>
  );
};
