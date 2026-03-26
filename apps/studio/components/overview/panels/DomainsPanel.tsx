import React, { useState } from "react";
import {
  Badge,
  Box,
  Card,
  Code,
  Flex,
  Grid,
  Select,
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
  LockIcon,
  UnlockIcon,
  WarningOutlineIcon,
} from "@sanity/icons";
import {
  AccentCard,
  DataTable,
  EmptyState,
  SectionLabel,
  StatCard,
  THead,
  Th,
  Td,
} from "../primitives";
import type {
  DomainRegistration,
  DnsRecord,
  DnsRecordType,
  SslCertificate,
} from "../types";
import { formatDate, formatRelativeTime, getSiteById } from "../_mock";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function daysUntil(d: Date): number {
  return Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

const DOMAIN_STATUS_MAP = {
  active: { tone: "positive" as const, label: "Aktiv" },
  expiring_soon: { tone: "caution" as const, label: "Utløper snart" },
  expired: { tone: "critical" as const, label: "Utløpt" },
};

const SSL_STATUS_MAP = {
  valid: { tone: "positive" as const, label: "Gyldig" },
  expiring_soon: { tone: "caution" as const, label: "Utløper snart" },
  expired: { tone: "critical" as const, label: "Utløpt" },
};

// Each DNS record type gets a subtle colour hint in monospace
const DNS_TYPE_TONES: Record<
  DnsRecordType,
  "positive" | "caution" | "critical" | "default"
> = {
  A: "default",
  AAAA: "default",
  CNAME: "default",
  MX: "caution",
  TXT: "default",
  NS: "default",
  CAA: "default",
};

// ─── Domener Tab ──────────────────────────────────────────────────────────────

const DomainsTab = ({
  domains,
  ssl,
}: {
  domains: DomainRegistration[];
  ssl: SslCertificate[];
}) => {
  const expiringSoon = domains.filter(
    (d) => d.status === "expiring_soon" || d.status === "expired",
  );
  const noAutoRenew = expiringSoon.filter((d) => !d.autoRenew);
  const sslExpiring = ssl.filter(
    (s) => s.status === "expiring_soon" || s.status === "expired",
  );

  const sslMap = Object.fromEntries(ssl.map((s) => [s.domain, s]));

  return (
    <Stack space={5}>
      {/* Urgent alerts */}
      {noAutoRenew.length > 0 && (
        <Stack space={3}>
          <SectionLabel>Handling kreves</SectionLabel>
          <Stack space={2}>
            {noAutoRenew.map((d) => {
              const days = daysUntil(d.expiresAt);
              return (
                <AccentCard
                  key={d.domain}
                  tone={days <= 14 ? "critical" : "caution"}
                >
                  <Flex
                    align="flex-start"
                    gap={3}
                  >
                    <WarningOutlineIcon
                      style={{
                        color:
                          days <= 14 ? "var(--red-500)" : "var(--yellow-500)",
                        flexShrink: 0,
                        marginTop: 2,
                      }}
                    />
                    <Stack
                      space={2}
                      style={{ flex: 1 }}
                    >
                      <Flex
                        align="center"
                        gap={3}
                      >
                        <Text
                          size={1}
                          weight="semibold"
                        >
                          {d.domain}
                        </Text>
                        <Badge
                          tone={DOMAIN_STATUS_MAP[d.status].tone}
                          fontSize={0}
                        >
                          {DOMAIN_STATUS_MAP[d.status].label}
                        </Badge>
                        <Badge
                          tone="critical"
                          fontSize={0}
                        >
                          Ingen auto-fornying
                        </Badge>
                      </Flex>
                      <Text size={1}>
                        Domenet utløper om{" "}
                        <strong>
                          {days} dag{days !== 1 ? "er" : ""}
                        </strong>{" "}
                        ({formatDate(d.expiresAt)}). Auto-fornying er deaktivert
                        – forny manuelt hos Proisp.
                      </Text>
                    </Stack>
                  </Flex>
                </AccentCard>
              );
            })}
          </Stack>
        </Stack>
      )}

      {sslExpiring.length > 0 && (
        <Stack space={3}>
          <SectionLabel>SSL-sertifikater som utløper</SectionLabel>
          <Stack space={2}>
            {sslExpiring.map((cert) => {
              const days = daysUntil(cert.expiresAt);
              return (
                <AccentCard
                  key={cert.domain}
                  tone={cert.status === "expired" ? "critical" : "caution"}
                >
                  <Flex
                    align="center"
                    gap={3}
                  >
                    <WarningOutlineIcon
                      style={{
                        color:
                          cert.status === "expired"
                            ? "var(--red-500)"
                            : "var(--yellow-500)",
                      }}
                    />
                    <Stack
                      space={1}
                      style={{ flex: 1 }}
                    >
                      <Flex
                        align="center"
                        gap={3}
                      >
                        <Text
                          size={1}
                          weight="semibold"
                        >
                          {cert.domain}
                        </Text>
                        <Badge
                          tone={SSL_STATUS_MAP[cert.status].tone}
                          fontSize={0}
                        >
                          {SSL_STATUS_MAP[cert.status].label}
                        </Badge>
                      </Flex>
                      <Text
                        size={0}
                        muted
                      >
                        Utløper {formatDate(cert.expiresAt)} ({days} dag
                        {days !== 1 ? "er" : ""}). Utstedt av {cert.issuer}.
                        {cert.autoRenew
                          ? " Auto-fornying aktivert."
                          : " Manuell fornying kreves."}
                      </Text>
                    </Stack>
                  </Flex>
                </AccentCard>
              );
            })}
          </Stack>
        </Stack>
      )}

      {/* Domain table */}
      <Stack space={3}>
        <SectionLabel>Alle domener – Proisp</SectionLabel>
        <DataTable summary="Domeneoversikt med registreringsinformasjon fra Proisp">
          <THead>
            <Th>Domene</Th>
            <Th>Nettsted</Th>
            <Th
              align="center"
              width={120}
            >
              Status
            </Th>
            <Th width={120}>Registrert</Th>
            <Th width={120}>Utløper</Th>
            <Th
              align="center"
              width={100}
            >
              Auto-fornying
            </Th>
            <Th
              align="center"
              width={80}
            >
              Lås
            </Th>
            <Th>SSL</Th>
          </THead>
          <tbody>
            {domains.map((d) => {
              const site = getSiteById(d.siteId);
              const cert = sslMap[d.domain];
              const days = daysUntil(d.expiresAt);
              const urgent = days <= 30 && !d.autoRenew;

              return (
                <tr
                  key={d.domain}
                  style={{
                    borderBottom: "1px solid var(--card-border-color)",
                    background: urgent
                      ? "var(--card-border-color)0a"
                      : undefined,
                  }}
                >
                  <Td mono>
                    <Flex
                      align="center"
                      gap={2}
                    >
                      <Text
                        size={1}
                        weight="semibold"
                        style={{ fontFamily: "monospace" }}
                      >
                        {d.domain}
                      </Text>
                    </Flex>
                  </Td>
                  <Td>
                    <Text
                      size={0}
                      muted
                    >
                      {site?.legalName ?? d.siteId}
                    </Text>
                  </Td>
                  <Td align="center">
                    <Badge
                      tone={DOMAIN_STATUS_MAP[d.status].tone}
                      fontSize={0}
                    >
                      {DOMAIN_STATUS_MAP[d.status].label}
                    </Badge>
                  </Td>
                  <Td mono>
                    <Text
                      size={0}
                      muted
                    >
                      {formatDate(d.registeredAt)}
                    </Text>
                  </Td>
                  <Td mono>
                    <Stack space={1}>
                      <Text
                        size={0}
                        style={{
                          fontVariantNumeric: "tabular-nums",
                          color:
                            days <= 14
                              ? "var(--red-500)"
                              : days <= 60
                                ? "var(--yellow-500)"
                                : undefined,
                        }}
                      >
                        {formatDate(d.expiresAt)}
                      </Text>
                      <Text
                        size={0}
                        muted
                      >
                        {days}d
                      </Text>
                    </Stack>
                  </Td>
                  <Td align="center">
                    <Badge
                      tone={d.autoRenew ? "positive" : "critical"}
                      fontSize={0}
                    >
                      {d.autoRenew ? "Ja" : "Nei"}
                    </Badge>
                  </Td>
                  <Td align="center">
                    <Tooltip
                      content={
                        <Box padding={2}>
                          <Text size={1}>
                            {d.locked
                              ? "Domenet er låst (anbefalt)"
                              : "Domenet er ulåst – risiko for overføring"}
                          </Text>
                        </Box>
                      }
                      portal
                      placement="top"
                    >
                      <span
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          color: d.locked
                            ? "var(--green-500)"
                            : "var(--red-500)",
                          cursor: "help",
                        }}
                      >
                        {d.locked ? <LockIcon /> : <UnlockIcon />}
                      </span>
                    </Tooltip>
                  </Td>
                  <Td>
                    {cert ? (
                      <Flex
                        align="center"
                        gap={2}
                      >
                        <Badge
                          tone={SSL_STATUS_MAP[cert.status].tone}
                          fontSize={0}
                        >
                          {SSL_STATUS_MAP[cert.status].label}
                        </Badge>
                        <Text
                          size={0}
                          muted
                        >
                          {daysUntil(cert.expiresAt)}d igjen
                        </Text>
                      </Flex>
                    ) : (
                      <Text
                        size={0}
                        muted
                      >
                        —
                      </Text>
                    )}
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </DataTable>
      </Stack>

      {/* Nameservers summary */}
      <Stack space={3}>
        <SectionLabel>Navnetjenere</SectionLabel>
        <Grid
          columns={[1, 2, 3]}
          gap={3}
        >
          {domains.map((d) => (
            <Card
              key={d.domain}
              padding={3}
              radius={2}
              border
            >
              <Stack space={2}>
                <Text
                  size={1}
                  weight="semibold"
                >
                  {d.domain}
                </Text>
                {d.nameservers.map((ns) => (
                  <Code
                    key={ns}
                    size={0}
                  >
                    {ns}
                  </Code>
                ))}
              </Stack>
            </Card>
          ))}
        </Grid>
      </Stack>
    </Stack>
  );
};

// ─── DNS-poster Tab ───────────────────────────────────────────────────────────

const DnsPostedTab = ({
  records,
  domains,
}: {
  records: DnsRecord[];
  domains: DomainRegistration[];
}) => {
  const [selectedDomain, setSelectedDomain] = useState(
    domains[0]?.domain ?? "",
  );
  const filtered = records.filter((r) => r.domain === selectedDomain);

  const byType = filtered.reduce<Record<string, DnsRecord[]>>((acc, r) => {
    acc[r.type] = [...(acc[r.type] ?? []), r];
    return acc;
  }, {});

  const typeOrder: DnsRecordType[] = [
    "A",
    "AAAA",
    "CNAME",
    "MX",
    "TXT",
    "NS",
    "CAA",
  ];

  return (
    <Stack space={4}>
      <Flex
        align="center"
        gap={3}
      >
        <SectionLabel>Domene</SectionLabel>
        <Select
          fontSize={1}
          padding={2}
          value={selectedDomain}
          onChange={(e) =>
            setSelectedDomain((e.target as HTMLSelectElement).value)
          }
        >
          {domains.map((d) => (
            <option
              key={d.domain}
              value={d.domain}
            >
              {d.domain}
            </option>
          ))}
        </Select>
      </Flex>

      {filtered.length === 0 ? (
        <EmptyState message="Ingen DNS-poster funnet for dette domenet." />
      ) : (
        <Stack space={4}>
          {typeOrder
            .filter((t) => byType[t])
            .map((recordType) => (
              <Stack
                key={recordType}
                space={3}
              >
                <SectionLabel>{recordType}-poster</SectionLabel>
                <DataTable
                  summary={`${recordType} DNS-poster for ${selectedDomain}`}
                >
                  <THead>
                    <Th width={60}>Type</Th>
                    <Th width={120}>Navn</Th>
                    <Th>Verdi</Th>
                    <Th
                      align="right"
                      width={80}
                    >
                      TTL
                    </Th>
                    {recordType === "MX" && (
                      <Th
                        align="right"
                        width={80}
                      >
                        Prioritet
                      </Th>
                    )}
                  </THead>
                  <tbody>
                    {byType[recordType].map((rec) => (
                      <tr
                        key={rec.id}
                        style={{
                          borderBottom: "1px solid var(--card-border-color)",
                        }}
                      >
                        <Td>
                          <Badge
                            tone={DNS_TYPE_TONES[rec.type]}
                            fontSize={0}
                          >
                            {rec.type}
                          </Badge>
                        </Td>
                        <Td mono>{rec.name}</Td>
                        <Td mono>
                          <Text
                            size={0}
                            style={{
                              fontFamily: "monospace",
                              wordBreak: "break-all",
                              maxWidth: 440,
                              display: "block",
                            }}
                          >
                            {rec.value}
                          </Text>
                        </Td>
                        <Td
                          align="right"
                          mono
                        >
                          {rec.ttl}s
                        </Td>
                        {recordType === "MX" && (
                          <Td
                            align="right"
                            mono
                          >
                            {rec.priority ?? "—"}
                          </Td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </DataTable>
              </Stack>
            ))}
        </Stack>
      )}
    </Stack>
  );
};

// ─── SSL Tab ──────────────────────────────────────────────────────────────────

const SslTab = ({ ssl }: { ssl: SslCertificate[] }) => {
  const sorted = [...ssl].sort(
    (a, b) => a.expiresAt.getTime() - b.expiresAt.getTime(),
  );

  return (
    <Stack space={5}>
      <Grid
        columns={[2, 4]}
        gap={3}
      >
        <StatCard
          label="Gyldige sertifikater"
          value={ssl.filter((s) => s.status === "valid").length}
          tone="positive"
          sublabel={`av ${ssl.length} totalt`}
        />
        <StatCard
          label="Utløper snart"
          value={ssl.filter((s) => s.status === "expiring_soon").length}
          tone={
            ssl.some((s) => s.status === "expiring_soon")
              ? "caution"
              : "positive"
          }
        />
        <StatCard
          label="Med auto-fornying"
          value={ssl.filter((s) => s.autoRenew).length}
          sublabel={`${ssl.filter((s) => !s.autoRenew).length} uten`}
        />
        <StatCard
          label="Korteste levetid"
          value={`${Math.min(...ssl.map((s) => daysUntil(s.expiresAt)))}d`}
          tone={
            Math.min(...ssl.map((s) => daysUntil(s.expiresAt))) <= 14
              ? "critical"
              : "positive"
          }
        />
      </Grid>

      <Stack space={3}>
        <SectionLabel>Sertifikater</SectionLabel>
        <DataTable summary="SSL/TLS-sertifikater per domene">
          <THead>
            <Th>Domene</Th>
            <Th>Nettsted</Th>
            <Th
              align="center"
              width={120}
            >
              Status
            </Th>
            <Th width={120}>Utsteder</Th>
            <Th width={120}>Utstedt</Th>
            <Th width={120}>Utløper</Th>
            <Th
              align="right"
              width={80}
            >
              Gjenstår
            </Th>
            <Th
              align="center"
              width={110}
            >
              Auto-fornying
            </Th>
          </THead>
          <tbody>
            {sorted.map((cert) => {
              const site = getSiteById(cert.siteId);
              const days = daysUntil(cert.expiresAt);
              return (
                <tr
                  key={cert.domain}
                  style={{ borderBottom: "1px solid var(--card-border-color)" }}
                >
                  <Td mono>
                    <Text
                      size={1}
                      style={{ fontFamily: "monospace" }}
                    >
                      {cert.domain}
                    </Text>
                  </Td>
                  <Td>
                    <Text
                      size={0}
                      muted
                    >
                      {site?.legalName ?? cert.siteId}
                    </Text>
                  </Td>
                  <Td align="center">
                    <Badge
                      tone={SSL_STATUS_MAP[cert.status].tone}
                      fontSize={0}
                    >
                      {SSL_STATUS_MAP[cert.status].label}
                    </Badge>
                  </Td>
                  <Td>
                    <Text
                      size={0}
                      muted
                    >
                      {cert.issuer}
                    </Text>
                  </Td>
                  <Td mono>
                    <Text
                      size={0}
                      muted
                    >
                      {formatDate(cert.issuedAt)}
                    </Text>
                  </Td>
                  <Td mono>
                    <Text
                      size={0}
                      style={{
                        fontVariantNumeric: "tabular-nums",
                        color:
                          days <= 7
                            ? "var(--red-500)"
                            : days <= 30
                              ? "var(--yellow-500)"
                              : undefined,
                      }}
                    >
                      {formatDate(cert.expiresAt)}
                    </Text>
                  </Td>
                  <Td
                    align="right"
                    mono
                  >
                    <Text
                      size={0}
                      weight={days <= 14 ? "semibold" : "regular"}
                      style={{
                        fontVariantNumeric: "tabular-nums",
                        color:
                          days <= 7
                            ? "var(--red-500)"
                            : days <= 30
                              ? "var(--yellow-500)"
                              : undefined,
                      }}
                    >
                      {days}d
                    </Text>
                  </Td>
                  <Td align="center">
                    <Flex
                      align="center"
                      justify="center"
                      gap={2}
                    >
                      {cert.autoRenew ? (
                        <CheckmarkCircleIcon
                          style={{ color: "var(--green-500)" }}
                        />
                      ) : (
                        <WarningOutlineIcon
                          style={{ color: "var(--yellow-500)" }}
                        />
                      )}
                      <Text
                        size={0}
                        muted
                      >
                        {cert.autoRenew ? "Automatisk" : "Manuell"}
                      </Text>
                    </Flex>
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

// ─── DomainsPanel ────────────────────────────────────────────────────────────

interface DomainsPanelProps {
  domains: DomainRegistration[];
  dnsRecords: DnsRecord[];
  ssl: SslCertificate[];
  loading?: boolean;
}

export const DomainsPanel = ({
  domains,
  dnsRecords,
  ssl,
  loading,
}: DomainsPanelProps) => {
  const [tab, setTab] = useState("domener");

  const urgentCount =
    domains.filter(
      (d) =>
        !d.autoRenew &&
        (d.status === "expiring_soon" || d.status === "expired"),
    ).length +
    ssl.filter((s) => s.status === "expiring_soon" || s.status === "expired")
      .length;

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
          aria-controls="reg-domener"
          id="tab-reg-domener"
          label={urgentCount > 0 ? `Domener (${urgentCount})` : "Domener"}
          onClick={() => setTab("domener")}
          selected={tab === "domener"}
        />
        <Tab
          aria-controls="reg-dns"
          id="tab-reg-dns"
          label="DNS-poster"
          onClick={() => setTab("dns")}
          selected={tab === "dns"}
        />
        <Tab
          aria-controls="reg-ssl"
          id="tab-reg-ssl"
          label="SSL-sertifikater"
          onClick={() => setTab("ssl")}
          selected={tab === "ssl"}
        />
      </TabList>

      <TabPanel
        aria-labelledby="tab-reg-domener"
        hidden={tab !== "domener"}
        id="reg-domener"
      >
        {tab === "domener" && (
          <DomainsTab
            domains={domains}
            ssl={ssl}
          />
        )}
      </TabPanel>
      <TabPanel
        aria-labelledby="tab-reg-dns"
        hidden={tab !== "dns"}
        id="reg-dns"
      >
        {tab === "dns" && (
          <DnsPostedTab
            records={dnsRecords}
            domains={domains}
          />
        )}
      </TabPanel>
      <TabPanel
        aria-labelledby="tab-reg-ssl"
        hidden={tab !== "ssl"}
        id="reg-ssl"
      >
        {tab === "ssl" && <SslTab ssl={ssl} />}
      </TabPanel>
    </Stack>
  );
};
