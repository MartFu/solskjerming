import React, { useEffect, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  Container,
  Flex,
  Stack,
  Tab,
  TabList,
  TabPanel,
  Text,
  ThemeProvider,
  studioTheme,
} from "@sanity/ui";
import {
  ActivityIcon,
  DesktopIcon,
  DatabaseIcon,
  SearchIcon,
  InfoOutlineIcon,
  WarningOutlineIcon,
  EarthGlobeIcon,
  BulbOutlineIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from "@sanity/icons";
import { FleetPanel } from "./panels/FleetPanel";
import { SeoPanel } from "./panels/SeoPanel";
import { OperationsPanel } from "./panels/OperationsPanel";
import { DomainsPanel } from "./panels/DomainsPanel";
import {
  fetchFleetStatuses,
  FLEET_STATUSES,
  SEO_REPORTS,
  INCIDENTS,
  DEPLOYMENTS,
  MAINTENANCE_WINDOWS,
  DOMAIN_REGISTRATIONS,
  DNS_RECORDS,
  SSL_CERTIFICATES,
} from "./_mock";
import type { FleetStatus } from "./types";
import styled from "styled-components";

// ─── Alert banner ─────────────────────────────────────────────────────────────

interface AlertItem {
  id: string;
  tone: "critical" | "caution" | "info";
  message: string;
  timestamp?: Date;
}

const deriveAlerts = (statuses: FleetStatus[]): AlertItem[] => {
  const alerts: AlertItem[] = [];

  // HTTP errors (Use the check-time as the event time)
  statuses
    .filter((s) => s.health.httpStatus >= 400)
    .forEach((s) => {
      alerts.push({
        id: `http-${s.id}`,
        tone: "critical",
        message: `${s.site.customDomain ?? s.site.legalName} – HTTP ${s.health.httpStatus}`,
        timestamp: s.health.lastChecked, // REAL TIME from health check
      });
    });

  // DNS mismatches
  statuses
    .filter((s) => s.connectivity.dnsMismatch)
    .forEach((s) => {
      alerts.push({
        id: `dns-${s.id}`,
        tone: "caution",
        message: `DNS-mismatch på ${s.site.customDomain}`,
        timestamp: s.health.lastChecked,
      });
    });

  // For static data like Domain Expiring, use a "Simulated" recent time
  // if no real event time exists, or just omit for a "Pinned" look.
  DOMAIN_REGISTRATIONS.filter((d) => d.status === "expiring_soon").forEach(
    (d) => {
      alerts.push({
        id: `dom-${d.domain}`,
        tone: "caution",
        message: `Domenet ${d.domain} utløper snart`,
        timestamp: new Date(), // "Now" for persistent status alerts
      });
    },
  );

  // Sort by time so the timeline is chronological
  return alerts.sort(
    (a, b) => (b.timestamp?.getTime() ?? 0) - (a.timestamp?.getTime() ?? 0),
  );
};

// ─── Alert Bar ────────────────────────────────────────────────────────────────

const TimelineWrapper = styled(Stack)`
  position: relative;
  /* Space for the time gutter (45px) + the line (approx 15px) */
  padding-left: 60px;

  &::before {
    content: "";
    position: absolute;
    /* This aligns the line exactly under the dots */
    left: 49px;
    top: 8px;
    bottom: 8px;
    width: 2px;
    background: var(--card-border-color);
  }
`;

const TimelineItem = ({ alert }: { alert: AlertItem }) => {
  const timeLabel = alert.timestamp
    ? alert.timestamp.toLocaleTimeString("nb-NO", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "--:--";

  return (
    <Box
      style={{
        position: "relative",
        paddingLeft: "45px",
        marginBottom: "20px",
      }}
    >
      {/* 1. The Time Label (Absolute positioned to the left of the line) */}
      <Box
        style={{
          position: "absolute",
          left: "-15px",
          top: "12px",
          width: "40px",
        }}
      >
        <Text
          size={0}
          muted
          weight="medium"
          style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}
        >
          {timeLabel}
        </Text>
      </Box>

      {/* 2. The Dot (Centered on the line at 35px) */}
      <TimelineDot
        $tone={alert.tone}
        style={{ left: "30px" }}
      />

      {/* 3. The Content Card */}
      <Card
        radius={2}
        border
        padding={3}
        tone={alert.tone === "critical" ? "critical" : "default"}
      >
        <Flex
          align="center"
          gap={3}
        >
          <Box flex={1}>
            <Text
              size={1}
              weight="semibold"
            >
              {alert.message}
            </Text>
          </Box>
          {/* Add a 'status' badge or chevron here if collapsible */}
        </Flex>
      </Card>
    </Box>
  );
};

// The dot that sits on the line
const TimelineDot = styled.div<{ $tone: string }>`
  position: absolute;
  left: -21px;
  top: 14px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--card-bg-color);
  border: 2px solid
    ${(props) =>
      props.$tone === "critical"
        ? "var(--card-stat-status-critical-fg-color)"
        : "var(--card-stat-status-caution-fg-color)"};
  z-index: 2;
`;

const CollapsibleCard = ({ alert }: { alert: AlertItem }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isCritical = alert.tone === "critical";

  const timeLabel = alert.timestamp
    ? alert.timestamp.toLocaleTimeString("nb-NO", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "--:--";

  return (
    <Box style={{ position: "relative", marginBottom: "16px" }}>
      {/* 1. Time Gutter */}
      <Box
        style={{
          position: "absolute",
          left: "-60px",
          top: "14px",
          width: "40px",
        }}
      >

        <Text
          size={0}
          muted
          weight="medium"
          style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}
        >
          {timeLabel}
        </Text>
      </Box>

      {/* 2. The Dot */}
      <TimelineDot
        $tone={alert.tone}
        style={{ left: "-15px", top: "14px" }}
      />

      {/* 3. The Content Card */}
      <Card
        radius={3}
        border
        tone={isCritical ? "critical" : "caution"}
        style={{
          transition: "all 0.2s ease",
          boxShadow: isOpen ? "0 4px 12px rgba(0,0,0,0.1)" : "none",
        }}
      >
        <Stack>
          <Button
            mode="bleed"
            padding={2}
            onClick={() => setIsOpen(!isOpen)}
            style={{ width: "100%", textAlign: "left" }}
          >
            <Flex
              align="center"
              gap={3}
            >
              <WarningOutlineIcon
                style={{
                  color: isCritical
                    ? "var(--card-stat-status-critical-fg-color)"
                    : "var(--card-stat-status-caution-fg-color)",
                }}
              />
              <Box flex={1}>
                <Text
                  size={1}
                  weight="semibold"
                  style={{ textOverflow: "ellipsis" }}
                >
                  {alert.message}
                </Text>
              </Box>
              {isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
            </Flex>
          </Button>

          {isOpen && (
            <Box
              padding={3}
              style={{ borderTop: "1px solid var(--card-border-color)" }}
            >
              <Text
                size={1}
                style={{ lineHeight: 1.5 }}
              >
                {/* Detailed info could go here if your alert object had more props */}
                {alert.message}
              </Text>
              {alert.timestamp && (
                <Box marginTop={3}>
                  <Text
                    size={0}
                    muted
                  >
                    Loggført:{" "}
                    {new Date(alert.timestamp).toLocaleString("nb-NO")}
                  </Text>
                </Box>
              )}
            </Box>
          )}
        </Stack>
      </Card>
    </Box>
  );
};



export const AlertTimeline = ({ alerts }: { alerts: AlertItem[] }) => {
  if (alerts.length === 0) return null;

  // Sort by tone (critical first) or timestamp
  const sortedAlerts = [...alerts].sort((a, b) =>
    a.tone === "critical" ? -1 : 1,
  );

  return (
    <TimelineWrapper space={0}>
      {sortedAlerts.slice(0, 3).map((a) => (
        <CollapsibleCard
          key={a.id}
          alert={a}
        />
      ))}
    </TimelineWrapper>
  );
};

// ─── Section heading ──────────────────────────────────────────────────────────

const SectionHeading = ({
  icon: Icon,
  title,
  badge,
}: {
  icon: React.ComponentType<{ style?: React.CSSProperties }>;
  title: string;
  badge?: number;
}) => (
  <Flex
    align="center"
    gap={3}
  >
    <Icon style={{ fontSize: 18, opacity: 0.65 }} />
    <Text
      size={2}
      weight="semibold"
    >
      {title}
    </Text>
    {badge != null && badge > 0 && (
      <Badge
        tone="critical"
        fontSize={0}
      >
        {badge}
      </Badge>
    )}
  </Flex>
);

// ─── Panel descriptions ────────────────────────────────────────────────────────

const PANELS = [
  {
    id: "flate",
    title: "Flåte",
    description: "Driftstatus, tilkobling og trafikk for alle nettsted",
    Icon: EarthGlobeIcon,
  },
  {
    id: "seo",
    title: "SEO",
    description: "Rangeringer, nøkkelord og teknisk helsesjekk",
    Icon: BulbOutlineIcon,
  },
  {
    id: "drift",
    title: "Drift",
    description: "Hendelser, distribusjoner og vedlikeholdsplaner",
    Icon: ActivityIcon,
  },
  {
    id: "registrar",
    title: "Registrar",
    description: "Proisp – domener, DNS-poster og SSL-sertifikater",
    Icon: DatabaseIcon,
  },
] as const;

type PanelId = (typeof PANELS)[number]["id"];

// ─── FleetManagementConsole ───────────────────────────────────────────────────

export const FleetManagementConsole = () => {
  const [activePanel, setActivePanel] = useState<PanelId>("flate");
  const [fleetStatuses, setFleetStatuses] = useState<FleetStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFleetStatuses().then((data) => {
      setFleetStatuses(data);
      setLoading(false);
    });
  }, []);

  const alerts = loading ? [] : deriveAlerts(fleetStatuses);
  const openIncidents = INCIDENTS.filter((i) => i.status !== "resolved").length;
  const urgentDomains =
    DOMAIN_REGISTRATIONS.filter(
      (d) =>
        !d.autoRenew &&
        (d.status === "expiring_soon" || d.status === "expired"),
    ).length +
    SSL_CERTIFICATES.filter(
      (s) => s.status === "expiring_soon" || s.status === "expired",
    ).length;

  return (
    <Box padding={4}>
      <Stack space={5}>
        {/* Page header */}
        <Stack space={3}>
          <Text
            size={3}
            weight="bold"
          >
            Operasjoner
          </Text>
          <Text
            size={1}
            muted
          >
            Ikke-innholdsmessig administrasjon av alle administrerte nettsted
          </Text>
        </Stack>

        {/* Global alert bar */}
        {alerts.length > 0 && <AlertTimeline alerts={alerts} />}

        {/* Top-level navigation */}
        <TabList space={2}>
          {PANELS.map(({ id, title, Icon }) => {
            const badge =
              id === "drift"
                ? openIncidents
                : id === "registrar"
                  ? urgentDomains
                  : 0;
            return (
              <Tab
                key={id}
                aria-controls={`panel-${id}`}
                id={`tab-${id}`}
                label={badge > 0 ? `${title} (${badge})` : title}
                icon={Icon}
                onClick={() => setActivePanel(id)}
                selected={activePanel === id}
              />
            );
          })}
        </TabList>

        {/* Panel content */}
        <Box>
          {PANELS.map(({ id, title, description, Icon }) => (
            <TabPanel
              key={id}
              aria-labelledby={`tab-${id}`}
              hidden={activePanel !== id}
              id={`panel-${id}`}
            >
              {activePanel === id && (
                <Stack space={5}>
                  {/* Panel header */}
                  <Flex
                    align="flex-start"
                    justify="space-between"
                    gap={4}
                  >
                    <Stack space={1}>
                      <SectionHeading
                        icon={Icon}
                        title={title}
                        badge={
                          id === "drift"
                            ? openIncidents
                            : id === "registrar"
                              ? urgentDomains
                              : undefined
                        }
                      />
                      <Text
                        size={1}
                        muted
                        style={{ paddingLeft: 29 }}
                      >
                        {description}
                      </Text>
                    </Stack>
                  </Flex>

                  {/* Divider */}
                  <div
                    style={{
                      height: 1,
                      backgroundColor: "var(--card-border-color)",
                    }}
                  />

                  {/* Panel body */}
                  {id === "flate" && (
                    <FleetPanel
                      statuses={fleetStatuses}
                      loading={loading}
                    />
                  )}
                  {id === "seo" && <SeoPanel reports={SEO_REPORTS} />}
                  {id === "drift" && (
                    <OperationsPanel
                      incidents={INCIDENTS}
                      deployments={DEPLOYMENTS}
                      maintenanceWindows={MAINTENANCE_WINDOWS}
                    />
                  )}
                  {id === "registrar" && (
                    <DomainsPanel
                      domains={DOMAIN_REGISTRATIONS}
                      dnsRecords={DNS_RECORDS}
                      ssl={SSL_CERTIFICATES}
                    />
                  )}
                </Stack>
              )}
            </TabPanel>
          ))}
        </Box>
      </Stack>
    </Box>
  );
};

export default FleetManagementConsole;
