import React, { useState } from "react";
import {
  Badge,
  Box,
  Card,
  Code,
  Flex,
  Grid,
  Inline,
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
  ErrorOutlineIcon,
  InfoOutlineIcon,
  SparklesIcon,
  WarningOutlineIcon,
} from "@sanity/icons";
import {
  AccentCard,
  DataTable,
  EmptyState,
  ScoreBar,
  ScoreRing,
  SectionLabel,
  StatCard,
  THead,
  Th,
  Td,
  TrendBadge,
} from "../primitives";
import type { SeoReport } from "../types";
import { formatDate } from "../_mock";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const cwvLabel = (value: number, metric: "lcp" | "fid" | "cls") => {
  if (metric === "lcp") {
    if (value <= 2500) return { tone: "positive" as const, label: "God" };
    if (value <= 4000)
      return { tone: "caution" as const, label: "Kan forbedres" };
    return { tone: "critical" as const, label: "Dårlig" };
  }
  if (metric === "fid") {
    if (value <= 100) return { tone: "positive" as const, label: "God" };
    if (value <= 300)
      return { tone: "caution" as const, label: "Kan forbedres" };
    return { tone: "critical" as const, label: "Dårlig" };
  }
  // cls (stored as ×1000, so 100 = 0.1)
  if (value <= 100) return { tone: "positive" as const, label: "God" };
  if (value <= 250) return { tone: "caution" as const, label: "Kan forbedres" };
  return { tone: "critical" as const, label: "Dårlig" };
};

// ─── Report Selector ──────────────────────────────────────────────────────────

interface ReportSelectorProps {
  reports: SeoReport[];
  selectedId: string;
  onChange: (id: string) => void;
}

const ReportSelector = ({
  reports,
  selectedId,
  onChange,
}: ReportSelectorProps) => (
  <Flex
    align="center"
    gap={3}
  >
    <SectionLabel>Nettsted</SectionLabel>
    <Select
      fontSize={1}
      padding={2}
      value={selectedId}
      onChange={(e) => onChange((e.target as HTMLSelectElement).value)}
    >
      {reports.map((r) => (
        <option
          key={r.id}
          value={r.id}
        >
          {r.url}
        </option>
      ))}
    </Select>
  </Flex>
);

// ─── Oversikt Tab ─────────────────────────────────────────────────────────────

const OversiktTab = ({ reports }: { reports: SeoReport[] }) => {
  const METRIC_LABELS: Record<string, string> = {
    performance: "Ytelse",
    accessibility: "Tilgjengelighet",
    bestPractices: "Beste praksis",
    seo: "SEO",
  };

  return (
    <Stack space={5}>
      {/* Fleet-wide score cards */}
      <Stack space={3}>
        <SectionLabel>Flåteoversikt – gjennomsnittlige SEO-score</SectionLabel>
        <Grid
          columns={[2, 2, 4]}
          gap={3}
        >
          {(
            ["performance", "accessibility", "bestPractices", "seo"] as const
          ).map((key) => {
            const avg = Math.round(
              reports.reduce((a, r) => a + r.metrics[key], 0) / reports.length,
            );
            return (
              <StatCard
                key={key}
                label={METRIC_LABELS[key]}
                value={avg}
                tone={
                  avg >= 90 ? "positive" : avg >= 70 ? "caution" : "critical"
                }
                sublabel={`av ${reports.length} nettsted`}
              />
            );
          })}
        </Grid>
      </Stack>

      {/* Per-site score overview */}
      <Stack space={3}>
        <SectionLabel>Score per nettsted</SectionLabel>
        <DataTable summary="SEO-score per nettsted">
          <THead>
            <Th>Nettsted</Th>
            <Th
              align="center"
              width={80}
            >
              Samlet
            </Th>
            <Th width={140}>Ytelse</Th>
            <Th width={140}>Tilgjengelighet</Th>
            <Th width={140}>Beste praksis</Th>
            <Th width={140}>SEO</Th>
            <Th align="right">Rapport</Th>
          </THead>
          <tbody>
            {reports.map((r) => (
              <tr
                key={r.id}
                style={{ borderBottom: "1px solid var(--card-border-color)" }}
              >
                <Td>
                  <Stack space={1}>
                    <Text
                      size={1}
                      weight="semibold"
                    >
                      {r.url}
                    </Text>
                    <Text
                      size={0}
                      muted
                    >
                      {formatDate(new Date(r.date))}
                    </Text>
                  </Stack>
                </Td>
                <Td align="center">
                  <ScoreRing
                    score={r.overallScore}
                    size={48}
                  />
                </Td>
                {(
                  [
                    "performance",
                    "accessibility",
                    "bestPractices",
                    "seo",
                  ] as const
                ).map((key) => (
                  <Td key={key}>
                    <Stack space={1}>
                      <Text
                        size={1}
                        style={{ fontVariantNumeric: "tabular-nums" }}
                      >
                        {r.metrics[key]}
                      </Text>
                      <ScoreBar value={r.metrics[key]} />
                    </Stack>
                  </Td>
                ))}
                <Td align="right">
                  <Text
                    size={0}
                    muted
                  >
                    {r.technical.crawlErrors} crawl-feil
                  </Text>
                </Td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </Stack>
    </Stack>
  );
};

// ─── Nøkkelord Tab ────────────────────────────────────────────────────────────

const NokkelordTab = ({ reports }: { reports: SeoReport[] }) => {
  const [selectedId, setSelectedId] = useState(reports[0]?.id ?? "");
  const report = reports.find((r) => r.id === selectedId);

  const difficultyColor = (d: number) =>
    d < 40
      ? "var(--green-500)"
      : d < 65
        ? "var(--yellow-500)"
        : "var(--red-500)";

  if (!report) return <EmptyState message="Ingen rapport valgt." />;

  return (
    <Stack space={4}>
      <ReportSelector
        reports={reports}
        selectedId={selectedId}
        onChange={setSelectedId}
      />

      {report.keywords.length === 0 ? (
        <EmptyState message="Ingen nøkkelord registrert for dette nettstedet." />
      ) : (
        <DataTable summary="Nøkkelordrangeringer">
          <THead>
            <Th>Nøkkelord</Th>
            <Th
              align="center"
              width={80}
            >
              Posisjon
            </Th>
            <Th
              align="right"
              width={100}
            >
              Volum/mnd
            </Th>
            <Th width={160}>Vanskelighetsgrad</Th>
            <Th
              align="center"
              width={80}
            >
              Trend
            </Th>
          </THead>
          <tbody>
            {report.keywords.map((kw) => (
              <tr
                key={kw.keyword}
                style={{ borderBottom: "1px solid var(--card-border-color)" }}
              >
                <Td>
                  <Text
                    size={1}
                    weight="semibold"
                  >
                    {kw.keyword}
                  </Text>
                </Td>
                <Td align="center">
                  <Badge
                    tone={
                      kw.position <= 3
                        ? "positive"
                        : kw.position <= 10
                          ? "caution"
                          : "default"
                    }
                    fontSize={1}
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    #{kw.position}
                  </Badge>
                </Td>
                <Td
                  align="right"
                  mono
                >
                  {kw.volume.toLocaleString("nb-NO")}
                </Td>
                <Td>
                  <Stack space={1}>
                    <Flex
                      align="center"
                      gap={2}
                    >
                      <Text
                        size={1}
                        style={{ fontVariantNumeric: "tabular-nums" }}
                      >
                        {kw.difficulty}
                      </Text>
                      <Text
                        size={0}
                        muted
                        style={{ color: difficultyColor(kw.difficulty) }}
                      >
                        {kw.difficulty < 40
                          ? "Lav"
                          : kw.difficulty < 65
                            ? "Middels"
                            : "Høy"}
                      </Text>
                    </Flex>
                    <div
                      style={{
                        height: 3,
                        borderRadius: 2,
                        overflow: "hidden",
                        backgroundColor: "var(--card-border-color)",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${kw.difficulty}%`,
                          backgroundColor: difficultyColor(kw.difficulty),
                          borderRadius: 2,
                        }}
                      />
                    </div>
                  </Stack>
                </Td>
                <Td align="center">
                  <TrendBadge trend={kw.trend} />
                </Td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      )}
    </Stack>
  );
};

// ─── Sider Tab ────────────────────────────────────────────────────────────────

const SiderTab = ({ reports }: { reports: SeoReport[] }) => {
  const [selectedId, setSelectedId] = useState(reports[0]?.id ?? "");
  const report = reports.find((r) => r.id === selectedId);

  if (!report) return <EmptyState message="Ingen rapport valgt." />;

  return (
    <Stack space={4}>
      <ReportSelector
        reports={reports}
        selectedId={selectedId}
        onChange={setSelectedId}
      />

      {report.pages.length === 0 ? (
        <EmptyState message="Ingen sider analysert for dette nettstedet." />
      ) : (
        <Stack space={3}>
          {report.pages.map((page) => (
            <Card
              key={page.url}
              padding={4}
              radius={2}
              border
            >
              <Stack space={4}>
                <Flex
                  align="flex-start"
                  justify="space-between"
                  gap={4}
                >
                  <Stack
                    space={2}
                    style={{ flex: 1, minWidth: 0 }}
                  >
                    <Flex
                      align="center"
                      gap={3}
                    >
                      <Code size={1}>{page.url}</Code>
                      <ScoreRing
                        score={page.score}
                        size={40}
                      />
                    </Flex>
                    <Text
                      size={1}
                      weight="semibold"
                    >
                      {page.title || (
                        <span style={{ opacity: 0.4 }}>Ingen tittel</span>
                      )}
                    </Text>
                    <Text
                      size={0}
                      muted
                      style={{ wordBreak: "break-word" }}
                    >
                      {page.metaDescription || <em>Ingen meta-beskrivelse</em>}
                    </Text>
                  </Stack>
                </Flex>

                <Grid
                  columns={[1, 2]}
                  gap={4}
                >
                  <Stack space={2}>
                    <SectionLabel>Overskriftsstruktur</SectionLabel>
                    <Stack space={1}>
                      {page.headingStructure.length > 0 ? (
                        page.headingStructure.map((h, i) => (
                          <Text
                            key={i}
                            size={0}
                            muted
                            style={{ fontFamily: "monospace" }}
                          >
                            {h}
                          </Text>
                        ))
                      ) : (
                        <Text
                          size={0}
                          muted
                        >
                          Ingen overskrifter
                        </Text>
                      )}
                    </Stack>
                  </Stack>

                  <Stack space={2}>
                    <SectionLabel>Problemer</SectionLabel>
                    {page.issues.length === 0 ? (
                      <Flex
                        align="center"
                        gap={2}
                      >
                        <CheckmarkCircleIcon
                          style={{ color: "var(--green-500)", fontSize: 14 }}
                        />
                        <Text
                          size={0}
                          muted
                        >
                          Ingen problemer oppdaget
                        </Text>
                      </Flex>
                    ) : (
                      <Stack space={2}>
                        {page.issues.map((issue, i) => (
                          <Flex
                            key={i}
                            align="flex-start"
                            gap={2}
                          >
                            <WarningOutlineIcon
                              style={{
                                color: "var(--yellow-500)",
                                fontSize: 14,
                                flexShrink: 0,
                                marginTop: 1,
                              }}
                            />
                            <Text size={0}>{issue}</Text>
                          </Flex>
                        ))}
                      </Stack>
                    )}
                  </Stack>
                </Grid>
              </Stack>
            </Card>
          ))}
        </Stack>
      )}
    </Stack>
  );
};

// ─── Teknisk Tab ──────────────────────────────────────────────────────────────

const TekniskTab = ({ reports }: { reports: SeoReport[] }) => {
  const [selectedId, setSelectedId] = useState(reports[0]?.id ?? "");
  const report = reports.find((r) => r.id === selectedId);

  if (!report) return <EmptyState message="Ingen rapport valgt." />;

  const { technical: t } = report;
  const lcvData = cwvLabel(t.coreWebVitals.lcp, "lcp");
  const fidData = cwvLabel(t.coreWebVitals.fid, "fid");
  const clsData = cwvLabel(t.coreWebVitals.cls, "cls");

  const issueCount = t.crawlErrors + t.brokenLinks;
  const overallTone =
    issueCount === 0 ? "positive" : issueCount <= 5 ? "caution" : "critical";

  return (
    <Stack space={5}>
      <ReportSelector
        reports={reports}
        selectedId={selectedId}
        onChange={setSelectedId}
      />

      {/* Core Web Vitals */}
      <Stack space={3}>
        <SectionLabel>Core Web Vitals</SectionLabel>
        <Grid
          columns={[1, 3]}
          gap={3}
        >
          <Card
            padding={4}
            radius={2}
            border
            tone={lcvData.tone}
          >
            <Stack space={2}>
              <SectionLabel>LCP – Largest Contentful Paint</SectionLabel>
              <Flex
                align="baseline"
                gap={2}
              >
                <Text
                  size={4}
                  weight="bold"
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {(t.coreWebVitals.lcp / 1000).toFixed(2)}s
                </Text>
                <Badge
                  tone={lcvData.tone}
                  fontSize={0}
                >
                  {lcvData.label}
                </Badge>
              </Flex>
              <Text
                size={0}
                muted
              >
                Mål: under 2,5s
              </Text>
            </Stack>
          </Card>

          <Card
            padding={4}
            radius={2}
            border
            tone={fidData.tone}
          >
            <Stack space={2}>
              <SectionLabel>FID – First Input Delay</SectionLabel>
              <Flex
                align="baseline"
                gap={2}
              >
                <Text
                  size={4}
                  weight="bold"
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {t.coreWebVitals.fid}ms
                </Text>
                <Badge
                  tone={fidData.tone}
                  fontSize={0}
                >
                  {fidData.label}
                </Badge>
              </Flex>
              <Text
                size={0}
                muted
              >
                Mål: under 100ms
              </Text>
            </Stack>
          </Card>

          <Card
            padding={4}
            radius={2}
            border
            tone={clsData.tone}
          >
            <Stack space={2}>
              <SectionLabel>CLS – Cumulative Layout Shift</SectionLabel>
              <Flex
                align="baseline"
                gap={2}
              >
                <Text
                  size={4}
                  weight="bold"
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {(t.coreWebVitals.cls / 1000).toFixed(3)}
                </Text>
                <Badge
                  tone={clsData.tone}
                  fontSize={0}
                >
                  {clsData.label}
                </Badge>
              </Flex>
              <Text
                size={0}
                muted
              >
                Mål: under 0,1
              </Text>
            </Stack>
          </Card>
        </Grid>
      </Stack>

      {/* Crawl health */}
      <Stack space={3}>
        <SectionLabel>Crawl-helse</SectionLabel>
        <Grid
          columns={[2, 4]}
          gap={3}
        >
          <StatCard
            label="Crawl-feil"
            value={t.crawlErrors}
            tone={
              t.crawlErrors === 0
                ? "positive"
                : t.crawlErrors <= 3
                  ? "caution"
                  : "critical"
            }
          />
          <StatCard
            label="Ødelagte lenker"
            value={t.brokenLinks}
            tone={
              t.brokenLinks === 0
                ? "positive"
                : t.brokenLinks <= 5
                  ? "caution"
                  : "critical"
            }
          />
          <StatCard
            label="Omdirigeringer"
            value={t.redirects}
            tone={t.redirects <= 3 ? "positive" : "caution"}
          />
          <StatCard
            label="Mobilvennlig"
            value={t.mobileOptimized ? "Ja" : "Nei"}
            tone={t.mobileOptimized ? "positive" : "critical"}
          />
        </Grid>
      </Stack>

      {/* Config */}
      <Stack space={3}>
        <SectionLabel>Konfigurasjon</SectionLabel>
        <Grid
          columns={[1, 2]}
          gap={3}
        >
          <Card
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
                  Sitemap
                </Text>
                <Badge
                  tone={t.sitemapPresent ? "positive" : "critical"}
                  fontSize={0}
                >
                  {t.sitemapPresent ? "Tilgjengelig" : "Mangler"}
                </Badge>
              </Flex>
              {t.sitemapPresent && (
                <Text
                  size={0}
                  muted
                >
                  {report.url}/sitemap.xml
                </Text>
              )}
            </Stack>
          </Card>

          <Card
            padding={4}
            radius={2}
            border
          >
            <Stack space={3}>
              <Text
                size={1}
                weight="semibold"
              >
                robots.txt
              </Text>
              <Code
                size={1}
                style={{
                  whiteSpace: "pre-wrap",
                  fontFamily: "monospace",
                  fontSize: "0.75rem",
                }}
              >
                {t.robotsTxt}
              </Code>
            </Stack>
          </Card>
        </Grid>
      </Stack>
    </Stack>
  );
};

// ─── SeoPanel ─────────────────────────────────────────────────────────────────

interface SeoPanelProps {
  reports: SeoReport[];
  loading?: boolean;
}

export const SeoPanel = ({ reports, loading }: SeoPanelProps) => {
  const [tab, setTab] = useState("oversikt");

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

  if (!reports.length) {
    return <EmptyState message="Ingen SEO-rapporter tilgjengelig." />;
  }

  return (
    <Stack space={4}>
      <TabList space={1}>
        <Tab
          aria-controls="seo-oversikt"
          id="tab-seo-oversikt"
          label="Oversikt"
          onClick={() => setTab("oversikt")}
          selected={tab === "oversikt"}
        />
        <Tab
          aria-controls="seo-nokkelord"
          id="tab-seo-nokkelord"
          label="Nøkkelord"
          onClick={() => setTab("nokkelord")}
          selected={tab === "nokkelord"}
        />
        <Tab
          aria-controls="seo-sider"
          id="tab-seo-sider"
          label="Sider"
          onClick={() => setTab("sider")}
          selected={tab === "sider"}
        />
        <Tab
          aria-controls="seo-teknisk"
          id="tab-seo-teknisk"
          label="Teknisk"
          onClick={() => setTab("teknisk")}
          selected={tab === "teknisk"}
        />
      </TabList>

      <TabPanel
        aria-labelledby="tab-seo-oversikt"
        hidden={tab !== "oversikt"}
        id="seo-oversikt"
      >
        {tab === "oversikt" && <OversiktTab reports={reports} />}
      </TabPanel>
      <TabPanel
        aria-labelledby="tab-seo-nokkelord"
        hidden={tab !== "nokkelord"}
        id="seo-nokkelord"
      >
        {tab === "nokkelord" && <NokkelordTab reports={reports} />}
      </TabPanel>
      <TabPanel
        aria-labelledby="tab-seo-sider"
        hidden={tab !== "sider"}
        id="seo-sider"
      >
        {tab === "sider" && <SiderTab reports={reports} />}
      </TabPanel>
      <TabPanel
        aria-labelledby="tab-seo-teknisk"
        hidden={tab !== "teknisk"}
        id="seo-teknisk"
      >
        {tab === "teknisk" && <TekniskTab reports={reports} />}
      </TabPanel>
    </Stack>
  );
};
