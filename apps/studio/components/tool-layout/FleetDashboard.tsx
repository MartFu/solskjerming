// fleet/components/FleetDashboard.tsx
import React, {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
} from "react";
import {
  Box,
  Card,
  Container,
  Flex,
  Grid,
  Heading,
  Text,
  Button,
  Stack,
  Badge,
  Tooltip,
  Spinner,
  Code,
  TextInput,
  ThemeProvider,
  studioTheme,
  Dialog,
  Switch,
  TabList,
  Tab,
  TabPanel,
  Select,
} from "@sanity/ui";
import {
  RefreshIcon,
  AddIcon,
  SearchIcon,
  DashboardIcon,
  LinkIcon,
  ErrorOutlineIcon,
  WarningOutlineIcon,
  CheckmarkCircleIcon,
  EarthGlobeIcon,
  CheckmarkIcon,
  CloseIcon,
  TrendUpwardIcon,
  ChartUpwardIcon,
  DocumentIcon,
} from "@sanity/icons";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Site {
  siteId: string;
  legalName: string;
  internalSubdomain: string;
  customDomain?: string;
  sanityDocId: string;
}

interface FleetStatus {
  id: string;
  site: Site;
  connectivity: {
    expectedIp: string;
    actualIp: string | null;
    sslStatus: "valid" | "pending" | "invalid";
    ttl: number;
    dnsMismatch: boolean;
  };
  health: {
    httpStatus: number;
    isrCacheAge: number;
    lastError?: string;
    lastChecked: Date;
  };
  traffic: {
    requests24h: number;
    bandwidth24h: number;
  };
}

interface SeoReport {
  id: string;
  url: string;
  date: string;
  overallScore: number;
  metrics: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
  };
  keywords: {
    keyword: string;
    position: number;
    volume: number;
    difficulty: number;
    trend: "up" | "down" | "stable";
  }[];
  pages: {
    url: string;
    title: string;
    metaDescription: string;
    headingStructure: string[];
    score: number;
    issues: string[];
  }[];
  technical: {
    crawlErrors: number;
    brokenLinks: number;
    redirects: number;
    sitemapPresent: boolean;
    robotsTxt: string;
    mobileOptimized: boolean;
  };
}

type MainTab = "fleet" | "seo";
type FleetTab = "pulse" | "domains";
type SeoTab = "overview" | "keywords" | "pages" | "technical";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockSites: Site[] = [
  {
    siteId: "site-001",
    legalName: "Acme Corporation",
    internalSubdomain: "acme",
    customDomain: "acme.no",
    sanityDocId: "doc-001",
  },
  {
    siteId: "site-002",
    legalName: "Nordic Solutions",
    internalSubdomain: "nordic",
    customDomain: "nordicsolutions.no",
    sanityDocId: "doc-002",
  },
  {
    siteId: "site-003",
    legalName: "Fjord Technologies",
    internalSubdomain: "fjordtech",
    customDomain: "fjordtech.no",
    sanityDocId: "doc-003",
  },
];

const mockFetchFleetStatus = async (): Promise<FleetStatus[]> => {
  await new Promise((r) => setTimeout(r, 800));
  return mockSites.map((site) => ({
    id: site.siteId,
    site,
    connectivity: {
      expectedIp: "76.76.21.21",
      actualIp: Math.random() > 0.3 ? "76.76.21.21" : "192.168.1.1",
      sslStatus: Math.random() > 0.2 ? "valid" : "pending",
      ttl: 300,
      dnsMismatch: Math.random() > 0.8,
    },
    health: {
      httpStatus: Math.random() > 0.9 ? 500 : 200,
      isrCacheAge: Math.floor(Math.random() * 3600),
      lastChecked: new Date(),
    },
    traffic: {
      requests24h: Math.floor(Math.random() * 10000),
      bandwidth24h: Math.floor(Math.random() * 1024),
    },
  }));
};

const generateMockSeoReports = (): SeoReport[] => [
  {
    id: "1",
    url: "https://acme.no",
    date: "2024-01-15",
    overallScore: 87,
    metrics: { performance: 92, accessibility: 85, bestPractices: 88, seo: 83 },
    keywords: [
      {
        keyword: "web design services",
        position: 3,
        volume: 1200,
        difficulty: 65,
        trend: "up",
      },
      {
        keyword: "digital agency",
        position: 8,
        volume: 3400,
        difficulty: 78,
        trend: "down",
      },
      {
        keyword: "SEO optimization",
        position: 12,
        volume: 2900,
        difficulty: 72,
        trend: "stable",
      },
    ],
    pages: [
      {
        url: "/",
        title: "Home - Digital Agency",
        metaDescription: "Leading digital agency",
        headingStructure: ["H1: Digital Solutions", "H2: Our Services"],
        score: 92,
        issues: ["Missing alt text on 3 images"],
      },
      {
        url: "/services",
        title: "Services | Digital Agency",
        metaDescription: "Explore our services",
        headingStructure: ["H1: Our Services", "H2: Web Design"],
        score: 78,
        issues: ["Meta description too short", "Missing internal links"],
      },
    ],
    technical: {
      crawlErrors: 2,
      brokenLinks: 3,
      redirects: 5,
      sitemapPresent: true,
      robotsTxt: "User-agent: *\nAllow: /",
      mobileOptimized: true,
    },
  },
  {
    id: "2",
    url: "https://nordicsolutions.no",
    date: "2024-01-14",
    overallScore: 76,
    metrics: { performance: 68, accessibility: 82, bestPractices: 75, seo: 79 },
    keywords: [
      {
        keyword: "blogging tips",
        position: 5,
        volume: 890,
        difficulty: 45,
        trend: "up",
      },
      {
        keyword: "content strategy",
        position: 15,
        volume: 2100,
        difficulty: 68,
        trend: "up",
      },
    ],
    pages: [
      {
        url: "/blog",
        title: "Blog | Nordic Solutions",
        metaDescription: "Latest insights",
        headingStructure: ["H1: Blog", "H2: Latest Posts"],
        score: 76,
        issues: ["No meta keywords", "Duplicate content detected"],
      },
    ],
    technical: {
      crawlErrors: 5,
      brokenLinks: 8,
      redirects: 12,
      sitemapPresent: true,
      robotsTxt: "User-agent: *\nAllow: /blog",
      mobileOptimized: false,
    },
  },
];

// ─── Shared Helpers ───────────────────────────────────────────────────────────

const scoreColor = (score: number) =>
  score >= 90 ? "positive" : score >= 70 ? "caution" : "critical";

const ScoreBar = ({ value }: { value: number }) => (
  <div
    style={{
      height: 3,
      backgroundColor: "var(--card-border-color)",
      borderRadius: 2,
      overflow: "hidden",
      marginTop: 6,
    }}
  >
    <div
      style={{
        width: `${value}%`,
        height: "100%",
        borderRadius: 2,
        backgroundColor:
          value >= 90
            ? "var(--green-500)"
            : value >= 70
              ? "var(--yellow-500)"
              : "var(--red-500)",
        transition: "width 0.4s ease",
      }}
    />
  </div>
);

const ScoreRing = ({ score, size = 64 }: { score: number; size?: number }) => {
  const r = size / 2 - 5;
  const circumference = 2 * Math.PI * r;
  const color = score >= 90 ? "#43d675" : score >= 70 ? "#f59e0b" : "#ef4444";
  return (
    <div
      style={{ position: "relative", width: size, height: size, flexShrink: 0 }}
    >
      <svg
        width={size}
        height={size}
        style={{ transform: "rotate(-90deg)" }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--card-border-color)"
          strokeWidth={4}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={4}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - score / 100)}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          size={1}
          weight="semibold"
          style={{ color }}
        >
          {score}
        </Text>
      </div>
    </div>
  );
};

const TrendChip = ({ trend }: { trend: "up" | "down" | "stable" }) => {
  const map = {
    up: { label: "↑", color: "positive" },
    down: { label: "↓", color: "critical" },
    stable: { label: "→", color: "default" },
  } as const;
  return <Badge tone={map[trend].color}>{map[trend].label}</Badge>;
};

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <Text
    size={0}
    weight="semibold"
    muted
    style={{ textTransform: "uppercase", letterSpacing: "0.08em" }}
  >
    {children}
  </Text>
);

// ─── Fleet: Status Card ───────────────────────────────────────────────────────

const StatusCard = ({ status }: { status: FleetStatus }) => {
  const isCritical =
    status.health.httpStatus !== 200 || status.connectivity.dnsMismatch;
  const tone = isCritical ? "critical" : "default";

  return (
    <Card
      padding={4}
      radius={3}
      tone={tone}
      border
    >
      <Stack space={4}>
        <Flex
          align="center"
          justify="space-between"
        >
          <Stack space={1}>
            <Text
              weight="semibold"
              size={2}
            >
              {status.site.legalName}
            </Text>
            <Text
              size={1}
              muted
            >
              {status.site.customDomain ||
                `${status.site.internalSubdomain}.vercel.app`}
            </Text>
          </Stack>
          <Badge
            tone={status.health.httpStatus === 200 ? "positive" : "critical"}
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {status.health.httpStatus}
          </Badge>
        </Flex>

        <Grid
          columns={2}
          gap={3}
        >
          <Stack space={1}>
            <SectionLabel>ISR Age</SectionLabel>
            <Text size={1}>
              {Math.floor(status.health.isrCacheAge / 60)}m ago
            </Text>
          </Stack>
          <Stack space={1}>
            <SectionLabel>24h Requests</SectionLabel>
            <Text size={1}>{status.traffic.requests24h.toLocaleString()}</Text>
          </Stack>
          <Stack space={1}>
            <SectionLabel>SSL</SectionLabel>
            <Badge
              tone={
                status.connectivity.sslStatus === "valid"
                  ? "positive"
                  : status.connectivity.sslStatus === "pending"
                    ? "caution"
                    : "critical"
              }
            >
              {status.connectivity.sslStatus}
            </Badge>
          </Stack>
          <Stack space={1}>
            <SectionLabel>DNS</SectionLabel>
            <Badge
              tone={status.connectivity.dnsMismatch ? "critical" : "positive"}
            >
              {status.connectivity.dnsMismatch ? "Mismatch" : "OK"}
            </Badge>
          </Stack>
        </Grid>

        <Flex gap={2}>
          <Button
            text="Revalidate"
            tone="primary"
            mode="ghost"
            fontSize={1}
            padding={2}
            onClick={() => {}}
          />
          <Button
            text="Details"
            mode="bleed"
            fontSize={1}
            padding={2}
            onClick={() => {}}
          />
        </Flex>
      </Stack>
    </Card>
  );
};

// ─── Fleet: Pulse Tab ─────────────────────────────────────────────────────────

const FleetPulse = ({
  statuses,
  onRefresh,
}: {
  statuses: FleetStatus[];
  onRefresh: () => void;
}) => {
  const critical = statuses.filter(
    (s) => s.health.httpStatus !== 200 || s.connectivity.dnsMismatch,
  );
  const incident = (critical.length / statuses.length) * 100 > 5;

  return (
    <Stack space={5}>
      {incident && (
        <Card
          padding={3}
          radius={2}
          tone="caution"
          border
        >
          <Flex
            align="center"
            gap={3}
          >
            <WarningOutlineIcon />
            <Text size={1}>
              <strong>
                {critical.length} site{critical.length !== 1 ? "s" : ""}
              </strong>{" "}
              reporting issues — review before proceeding.
            </Text>
          </Flex>
        </Card>
      )}

      <Grid
        columns={[1, 2, 3]}
        gap={4}
      >
        {statuses.map((s) => (
          <StatusCard
            key={s.id}
            status={s}
          />
        ))}
      </Grid>
    </Stack>
  );
};

// ─── Fleet: Domains Tab ───────────────────────────────────────────────────────

const FleetDomains = ({ statuses }: { statuses: FleetStatus[] }) => {
  const [search, setSearch] = useState("");
  const filtered = statuses.filter(
    (s) =>
      s.site.legalName.toLowerCase().includes(search.toLowerCase()) ||
      s.site.customDomain?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Stack space={4}>
      <Box style={{ maxWidth: 320 }}>
        <TextInput
          placeholder="Search domains…"
          icon={SearchIcon}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
        />
      </Box>

      <Card
        radius={2}
        overflow="hidden"
        border
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--card-border-color)" }}>
              {["Site", "Domain", "Expected IP", "Actual IP", "SSL", ""].map(
                (h) => (
                  <th
                    key={h}
                    style={{ padding: "10px 16px", textAlign: "left" }}
                  >
                    <SectionLabel>{h}</SectionLabel>
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, i) => (
              <tr
                key={s.id}
                style={{
                  borderBottom:
                    i < filtered.length - 1
                      ? "1px solid var(--card-border-color)"
                      : "none",
                }}
              >
                <td style={{ padding: "12px 16px" }}>
                  <Text
                    size={1}
                    weight="semibold"
                  >
                    {s.site.legalName}
                  </Text>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <Text
                    size={1}
                    muted
                  >
                    {s.site.customDomain ||
                      `${s.site.internalSubdomain}.vercel.app`}
                  </Text>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <Code size={1}>{s.connectivity.expectedIp}</Code>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <Flex
                    align="center"
                    gap={2}
                  >
                    <Code size={1}>{s.connectivity.actualIp || "—"}</Code>
                    {s.connectivity.dnsMismatch && (
                      <Badge tone="caution">Mismatch</Badge>
                    )}
                  </Flex>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <Badge
                    tone={
                      s.connectivity.sslStatus === "valid"
                        ? "positive"
                        : s.connectivity.sslStatus === "pending"
                          ? "caution"
                          : "critical"
                    }
                  >
                    {s.connectivity.sslStatus}
                  </Badge>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  {s.connectivity.dnsMismatch && (
                    <Button
                      text="Fix DNS"
                      tone="primary"
                      fontSize={1}
                      padding={2}
                      onClick={() => {}}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </Stack>
  );
};

// ─── Fleet: Provisioning Dialog ───────────────────────────────────────────────

const ProvisioningWizard = () => {
  const [open, setOpen] = useState(false);
  const [domain, setDomain] = useState("");
  const [available, setAvailable] = useState<boolean | null>(null);

  const steps = [
    { label: "Sanity dataset", done: true },
    { label: "DNS configured", done: false },
    { label: "Vercel linked", done: false },
    { label: "Live", done: false },
  ];

  return (
    <>
      <Button
        text="New site"
        icon={AddIcon}
        tone="primary"
        onClick={() => setOpen(true)}
      />
      {open && (
        <Dialog
          header="Provision new site"
          id="provisioning"
          onClose={() => setOpen(false)}
          width={1}
        >
          <Box padding={5}>
            <Stack space={5}>
              <Stack space={2}>
                <Text
                  size={1}
                  weight="semibold"
                >
                  Domain name
                </Text>
                <Flex gap={2}>
                  <Box flex={1}>
                    <TextInput
                      placeholder="example.no"
                      value={domain}
                      onChange={(e) => setDomain(e.currentTarget.value)}
                    />
                  </Box>
                  <Button
                    text="Check"
                    disabled={!domain}
                    onClick={() => setAvailable(Math.random() > 0.3)}
                  />
                </Flex>
                {available !== null && (
                  <Badge tone={available ? "positive" : "critical"}>
                    {available ? "Available" : "Already taken"}
                  </Badge>
                )}
              </Stack>

              <Stack space={1}>
                <SectionLabel>Deployment steps</SectionLabel>
                <Box marginTop={2}>
                  <Stack space={3}>
                    {steps.map((step, i) => (
                      <Flex
                        key={i}
                        align="center"
                        gap={3}
                      >
                        <div
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: "50%",
                            flexShrink: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: step.done
                              ? "var(--green-500)"
                              : "var(--card-border-color)",
                          }}
                        >
                          {step.done && (
                            <CheckmarkIcon
                              style={{ color: "white", fontSize: 12 }}
                            />
                          )}
                        </div>
                        <Text
                          size={1}
                          style={{
                            color: step.done ? "inherit" : "var(--muted-fg)",
                          }}
                        >
                          {step.label}
                        </Text>
                      </Flex>
                    ))}
                  </Stack>
                </Box>
              </Stack>

              <Flex
                gap={2}
                justify="flex-end"
              >
                <Button
                  text="Cancel"
                  mode="ghost"
                  onClick={() => setOpen(false)}
                />
                <Button
                  text="Start provisioning"
                  tone="primary"
                  disabled={!domain}
                />
              </Flex>
            </Stack>
          </Box>
        </Dialog>
      )}
    </>
  );
};

// ─── SEO: Overview Tab ────────────────────────────────────────────────────────

const SeoOverview = ({ report }: { report: SeoReport }) => {
  const metricLabels: Record<string, string> = {
    performance: "Performance",
    accessibility: "Accessibility",
    bestPractices: "Best Practices",
    seo: "SEO Score",
  };

  return (
    <Stack space={5}>
      <Flex
        align="center"
        gap={4}
      >
        <ScoreRing
          score={report.overallScore}
          size={72}
        />
        <Stack space={1}>
          <Text
            weight="semibold"
            size={2}
          >
            Overall health
          </Text>
          <Text
            size={1}
            muted
          >
            {report.overallScore >= 80
              ? "Site is performing well across all signals."
              : report.overallScore >= 60
                ? "Good, but room for improvement."
                : "Needs immediate attention."}
          </Text>
        </Stack>
      </Flex>

      <Grid
        columns={[2, 4]}
        gap={3}
      >
        {Object.entries(report.metrics).map(([key, val]) => (
          <Card
            key={key}
            padding={4}
            radius={2}
            border
          >
            <Stack space={2}>
              <Flex
                align="center"
                justify="space-between"
              >
                <SectionLabel>{metricLabels[key] || key}</SectionLabel>
                <Text
                  size={1}
                  weight="semibold"
                  style={{
                    color:
                      val >= 90
                        ? "var(--green-500)"
                        : val >= 70
                          ? "var(--yellow-500)"
                          : "var(--red-500)",
                  }}
                >
                  {val}
                </Text>
              </Flex>
              <ScoreBar value={val} />
            </Stack>
          </Card>
        ))}
      </Grid>
    </Stack>
  );
};

// ─── SEO: Keywords Tab ────────────────────────────────────────────────────────

const SeoKeywords = ({ report }: { report: SeoReport }) => (
  <Card
    radius={2}
    overflow="hidden"
    border
  >
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr style={{ borderBottom: "1px solid var(--card-border-color)" }}>
          {["Keyword", "Position", "Monthly volume", "Difficulty", "Trend"].map(
            (h) => (
              <th
                key={h}
                style={{ padding: "10px 16px", textAlign: "left" }}
              >
                <SectionLabel>{h}</SectionLabel>
              </th>
            ),
          )}
        </tr>
      </thead>
      <tbody>
        {report.keywords.map((kw, i) => (
          <tr
            key={kw.keyword}
            style={{
              borderBottom:
                i < report.keywords.length - 1
                  ? "1px solid var(--card-border-color)"
                  : "none",
            }}
          >
            <td style={{ padding: "12px 16px" }}>
              <Text
                size={1}
                weight="semibold"
              >
                {kw.keyword}
              </Text>
            </td>
            <td style={{ padding: "12px 16px" }}>
              <Badge
                tone={
                  kw.position <= 5
                    ? "positive"
                    : kw.position <= 15
                      ? "caution"
                      : "default"
                }
              >
                #{kw.position}
              </Badge>
            </td>
            <td style={{ padding: "12px 16px" }}>
              <Text size={1}>{kw.volume.toLocaleString()}</Text>
            </td>
            <td style={{ padding: "12px 16px" }}>
              <Flex
                align="center"
                gap={2}
              >
                <div
                  style={{
                    width: 48,
                    height: 3,
                    backgroundColor: "var(--card-border-color)",
                    borderRadius: 2,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${kw.difficulty}%`,
                      height: "100%",
                      backgroundColor:
                        kw.difficulty >= 70
                          ? "var(--red-500)"
                          : kw.difficulty >= 45
                            ? "var(--yellow-500)"
                            : "var(--green-500)",
                    }}
                  />
                </div>
                <Text
                  size={1}
                  muted
                >
                  {kw.difficulty}
                </Text>
              </Flex>
            </td>
            <td style={{ padding: "12px 16px" }}>
              <TrendChip trend={kw.trend} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </Card>
);

// ─── SEO: Pages Tab ───────────────────────────────────────────────────────────

const SeoPages = ({ report }: { report: SeoReport }) => (
  <Stack space={3}>
    {report.pages.map((page) => (
      <Card
        key={page.url}
        padding={4}
        radius={2}
        border
      >
        <Stack space={3}>
          <Flex
            align="center"
            justify="space-between"
          >
            <Stack space={1}>
              <Text
                size={1}
                weight="semibold"
              >
                {page.title}
              </Text>
              <Text
                size={1}
                muted
              >
                {page.url}
              </Text>
            </Stack>
            <ScoreRing
              score={page.score}
              size={44}
            />
          </Flex>

          <Text
            size={1}
            muted
          >
            {page.metaDescription}
          </Text>

          {page.issues.length > 0 && (
            <Stack space={2}>
              <SectionLabel>Issues</SectionLabel>
              <Stack space={1}>
                {page.issues.map((issue) => (
                  <Flex
                    key={issue}
                    align="center"
                    gap={2}
                  >
                    <WarningOutlineIcon
                      style={{
                        color: "var(--yellow-500)",
                        fontSize: 14,
                        flexShrink: 0,
                      }}
                    />
                    <Text size={1}>{issue}</Text>
                  </Flex>
                ))}
              </Stack>
            </Stack>
          )}
        </Stack>
      </Card>
    ))}
  </Stack>
);

// ─── SEO: Technical Tab ───────────────────────────────────────────────────────

const SeoTechnical = ({ report }: { report: SeoReport }) => {
  const { technical } = report;
  const checks = [
    { label: "Sitemap present", ok: technical.sitemapPresent },
    { label: "Mobile optimized", ok: technical.mobileOptimized },
  ];

  return (
    <Grid
      columns={[1, 2]}
      gap={4}
    >
      <Card
        padding={4}
        radius={2}
        border
      >
        <Stack space={4}>
          <SectionLabel>Crawl health</SectionLabel>
          <Grid
            columns={3}
            gap={3}
          >
            {[
              {
                label: "Crawl errors",
                value: technical.crawlErrors,
                bad: technical.crawlErrors > 0,
              },
              {
                label: "Broken links",
                value: technical.brokenLinks,
                bad: technical.brokenLinks > 0,
              },
              {
                label: "Redirects",
                value: technical.redirects,
                bad: technical.redirects > 10,
              },
            ].map((item) => (
              <Stack
                key={item.label}
                space={1}
              >
                <SectionLabel>{item.label}</SectionLabel>
                <Text
                  size={2}
                  weight="semibold"
                  style={{ color: item.bad ? "var(--red-500)" : "inherit" }}
                >
                  {item.value}
                </Text>
              </Stack>
            ))}
          </Grid>
        </Stack>
      </Card>

      <Card
        padding={4}
        radius={2}
        border
      >
        <Stack space={4}>
          <SectionLabel>Configuration</SectionLabel>
          <Stack space={3}>
            {checks.map((c) => (
              <Flex
                key={c.label}
                align="center"
                justify="space-between"
              >
                <Text size={1}>{c.label}</Text>
                {c.ok ? (
                  <CheckmarkCircleIcon style={{ color: "var(--green-500)" }} />
                ) : (
                  <ErrorOutlineIcon style={{ color: "var(--red-500)" }} />
                )}
              </Flex>
            ))}
          </Stack>
          <Stack space={2}>
            <SectionLabel>robots.txt</SectionLabel>
            <Card
              tone="default"
              padding={3}
              radius={2}
              border
            >
              <Code
                size={1}
                style={{ whiteSpace: "pre", fontFamily: "monospace" }}
              >
                {technical.robotsTxt}
              </Code>
            </Card>
          </Stack>
        </Stack>
      </Card>
    </Grid>
  );
};

// ─── SEO Panel ────────────────────────────────────────────────────────────────

const SeoPanel = () => {
  const [reports] = useState<SeoReport[]>(generateMockSeoReports);
  const [current, setCurrent] = useState<SeoReport>(reports[0]);
  const [tab, setTab] = useState<SeoTab>("overview");

  return (
    <Stack space={5}>
      {/* Report selector */}
      <Flex
        gap={2}
        align="center"
      >
        <SectionLabel>Report</SectionLabel>
        {reports.map((r) => (
          <Button
            key={r.id}
            text={new URL(r.url).hostname}
            mode={current.id === r.id ? "default" : "ghost"}
            tone={current.id === r.id ? "primary" : "default"}
            fontSize={1}
            padding={3}
            onClick={() => {
              setCurrent(r);
              setTab("overview");
            }}
          />
        ))}
      </Flex>

      {/* Score hero */}
      <Card
        padding={4}
        radius={2}
        border
      >
        <SeoOverview report={current} />
      </Card>

      {/* Tabs */}
      <Stack space={4}>
        <TabList space={2}>
          {(["overview", "keywords", "pages", "technical"] as SeoTab[]).map(
            (t) => (
              <Tab
                key={t}
                id={`seo-${t}-tab`}
                aria-controls={`seo-${t}-panel`}
                label={t.charAt(0).toUpperCase() + t.slice(1)}
                selected={tab === t}
                onClick={() => setTab(t)}
              />
            ),
          )}
        </TabList>

        <TabPanel
          id="seo-overview-panel"
          aria-labelledby="seo-overview-tab"
          hidden={tab !== "overview"}
        >
          <SeoOverview report={current} />
        </TabPanel>
        <TabPanel
          id="seo-keywords-panel"
          aria-labelledby="seo-keywords-tab"
          hidden={tab !== "keywords"}
        >
          <SeoKeywords report={current} />
        </TabPanel>
        <TabPanel
          id="seo-pages-panel"
          aria-labelledby="seo-pages-tab"
          hidden={tab !== "pages"}
        >
          <SeoPages report={current} />
        </TabPanel>
        <TabPanel
          id="seo-technical-panel"
          aria-labelledby="seo-technical-tab"
          hidden={tab !== "technical"}
        >
          <SeoTechnical report={current} />
        </TabPanel>
      </Stack>
    </Stack>
  );
};

// ─── Fleet Panel ──────────────────────────────────────────────────────────────

const FleetPanel = () => {
  const [statuses, setStatuses] = useState<FleetStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<FleetTab>("pulse");
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await mockFetchFleetStatus();
    setStatuses(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const iv = setInterval(load, 60000);
    return () => clearInterval(iv);
  }, [load]);

  const healthy = statuses.filter(
    (s) => s.health.httpStatus === 200 && !s.connectivity.dnsMismatch,
  ).length;
  const warning = statuses.filter(
    (s) => s.health.httpStatus === 200 && s.connectivity.dnsMismatch,
  ).length;
  const critical = statuses.filter((s) => s.health.httpStatus !== 200).length;

  if (loading && statuses.length === 0) {
    return (
      <Flex
        justify="center"
        align="center"
        style={{ minHeight: 300 }}
      >
        <Spinner />
      </Flex>
    );
  }

  return (
    <Stack space={5}>
      {/* Summary strip */}
      <Grid
        columns={4}
        gap={3}
      >
        {[
          {
            label: "Total sites",
            value: statuses.length,
            tone: "default" as const,
          },
          { label: "Healthy", value: healthy, tone: "positive" as const },
          { label: "Warning", value: warning, tone: "caution" as const },
          { label: "Critical", value: critical, tone: "critical" as const },
        ].map((item) => (
          <Card
            key={item.label}
            padding={4}
            radius={2}
            tone={item.tone !== "default" ? item.tone : undefined}
            border
          >
            <Stack space={1}>
              <SectionLabel>{item.label}</SectionLabel>
              <Text
                size={4}
                weight="bold"
              >
                {item.value}
              </Text>
            </Stack>
          </Card>
        ))}
      </Grid>

      {/* Fleet tabs */}
      <Stack space={4}>
        <Flex
          align="center"
          justify="space-between"
        >
          <TabList space={2}>
            <Tab
              id="fleet-pulse-tab"
              aria-controls="fleet-pulse-panel"
              label="Pulse"
              icon={DashboardIcon}
              selected={tab === "pulse"}
              onClick={() => setTab("pulse")}
            />
            <Tab
              id="fleet-domains-tab"
              aria-controls="fleet-domains-panel"
              label="Domains"
              icon={LinkIcon}
              selected={tab === "domains"}
              onClick={() => setTab("domains")}
            />
          </TabList>
          <Button
            text="Refresh"
            icon={RefreshIcon}
            mode="ghost"
            fontSize={1}
            padding={2}
            onClick={load}
          />
        </Flex>

        <TabPanel
          id="fleet-pulse-panel"
          aria-labelledby="fleet-pulse-tab"
          hidden={tab !== "pulse"}
        >
          <FleetPulse
            statuses={statuses}
            onRefresh={load}
          />
        </TabPanel>
        <TabPanel
          id="fleet-domains-panel"
          aria-labelledby="fleet-domains-tab"
          hidden={tab !== "domains"}
        >
          <FleetDomains statuses={statuses} />
        </TabPanel>
      </Stack>

      {/* System override footer */}
      <Card
        padding={3}
        radius={2}
        border
      >
        <Flex
          align="center"
          justify="space-between"
        >
          <Flex
            align="center"
            gap={3}
          >
            <Text
              size={1}
              weight="semibold"
            >
              System override
            </Text>
            <Text
              size={1}
              muted
            >
              Emergency controls
            </Text>
          </Flex>
          <Flex
            align="center"
            gap={4}
          >
            <Flex
              align="center"
              gap={2}
            >
              <Text size={1}>Maintenance mode</Text>
              <Switch
                checked={maintenanceMode}
                onChange={() => setMaintenanceMode((v) => !v)}
              />
            </Flex>
            <Button
              text="Force sync all"
              tone="critical"
              mode="ghost"
              fontSize={1}
              padding={2}
              onClick={() => {}}
            />
          </Flex>
        </Flex>
      </Card>
    </Stack>
  );
};

// ─── Root Component ───────────────────────────────────────────────────────────

export const FleetManagementConsole = () => {
  const [mainTab, setMainTab] = useState<MainTab>("fleet");

  return (
    <ThemeProvider theme={studioTheme}>
      <Box padding={5}>
        <Container width={2}>
          <Stack space={6}>
            {/* Header */}
            <Flex
              align="flex-start"
              justify="space-between"
            >
              <Stack space={2}>
                <Flex
                  align="center"
                  gap={3}
                >
                  <EarthGlobeIcon style={{ fontSize: 22 }} />
                  <Heading
                    as="h1"
                    size={2}
                  >
                    Fleet Management
                  </Heading>
                </Flex>
                <Text
                  size={1}
                  muted
                >
                  Sanity · Vercel · PRO ISP
                </Text>
              </Stack>
              <ProvisioningWizard />
            </Flex>

            {/* Top-level tabs */}
            <TabList space={2}>
              <Tab
                id="main-fleet-tab"
                aria-controls="main-fleet-panel"
                label="Fleet"
                icon={EarthGlobeIcon}
                selected={mainTab === "fleet"}
                onClick={() => setMainTab("fleet")}
              />
              <Tab
                id="main-seo-tab"
                aria-controls="main-seo-panel"
                label="SEO Reports"
                icon={ChartUpwardIcon}
                selected={mainTab === "seo"}
                onClick={() => setMainTab("seo")}
              />
            </TabList>

            <TabPanel
              id="main-fleet-panel"
              aria-labelledby="main-fleet-tab"
              hidden={mainTab !== "fleet"}
            >
              <FleetPanel />
            </TabPanel>
            <TabPanel
              id="main-seo-panel"
              aria-labelledby="main-seo-tab"
              hidden={mainTab !== "seo"}
            >
              <SeoPanel />
            </TabPanel>
          </Stack>
        </Container>
      </Box>
    </ThemeProvider>
  );
};
