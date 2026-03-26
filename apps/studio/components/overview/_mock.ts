import type {
  Site,
  FleetStatus,
  SeoReport,
  Incident,
  Deployment,
  MaintenanceWindow,
  DomainRegistration,
  DnsRecord,
  SslCertificate,
} from "./types";

// ─── Sites ─────────────────────────────────────────────────────────────────────

export const SITES: Site[] = [
  {
    siteId: "site-001",
    legalName: "Acme Corporation AS",
    internalSubdomain: "acme",
    customDomain: "acme.no",
    sanityDocId: "doc-001",
    description: "Produsent av industriprodukter",
    category: "Industri",
  },
  {
    siteId: "site-002",
    legalName: "Nordic Solutions AS",
    internalSubdomain: "nordic",
    customDomain: "nordicsolutions.no",
    sanityDocId: "doc-002",
    description: "Rådgivning og IT-tjenester",
    category: "Rådgivning",
  },
  {
    siteId: "site-003",
    legalName: "Fjord Technologies AS",
    internalSubdomain: "fjordtech",
    customDomain: "fjordtech.no",
    sanityDocId: "doc-003",
    description: "Programvareutvikling og SaaS",
    category: "Teknologi",
  },
  {
    siteId: "site-004",
    legalName: "Bergmann & Partners",
    internalSubdomain: "bergmann",
    customDomain: "bergmannpartners.no",
    sanityDocId: "doc-004",
    description: "Advokatfirma",
    category: "Jus",
  },
  {
    siteId: "site-005",
    legalName: "Nordlys Design AS",
    internalSubdomain: "nordlys",
    customDomain: "nordlysdesign.no",
    sanityDocId: "doc-005",
    description: "Designbyrå og merkevarebygging",
    category: "Design",
  },
];

const SITE_MAP = Object.fromEntries(SITES.map((s) => [s.siteId, s]));
export const getSiteById = (id: string): Site | undefined => SITE_MAP[id];

// ─── Fleet Status ──────────────────────────────────────────────────────────────

export const FLEET_STATUSES: FleetStatus[] = [
  {
    id: "site-001",
    site: SITES[0],
    connectivity: {
      expectedIp: "76.76.21.21",
      actualIp: "76.76.21.21",
      sslStatus: "valid",
      ttl: 300,
      dnsMismatch: false,
    },
    health: {
      httpStatus: 200,
      isrCacheAge: 840,
      lastChecked: new Date(),
      uptime7d: 99.98,
    },
    traffic: {
      requests24h: 8_421,
      bandwidth24h: 312_000_000,
      requests7d: [7200, 7900, 8100, 7600, 8300, 8000, 8421],
    },
  },
  {
    id: "site-002",
    site: SITES[1],
    connectivity: {
      expectedIp: "76.76.21.21",
      actualIp: "192.0.2.1",
      sslStatus: "valid",
      ttl: 300,
      dnsMismatch: true,
    },
    health: {
      httpStatus: 200,
      isrCacheAge: 7230,
      lastChecked: new Date(),
      uptime7d: 99.54,
    },
    traffic: {
      requests24h: 3_180,
      bandwidth24h: 89_000_000,
      requests7d: [2900, 3100, 3200, 2800, 3300, 3100, 3180],
    },
  },
  {
    id: "site-003",
    site: SITES[2],
    connectivity: {
      expectedIp: "76.76.21.21",
      actualIp: "76.76.21.21",
      sslStatus: "pending",
      ttl: 300,
      dnsMismatch: false,
    },
    health: {
      httpStatus: 200,
      isrCacheAge: 120,
      lastChecked: new Date(),
      uptime7d: 99.91,
    },
    traffic: {
      requests24h: 12_560,
      bandwidth24h: 540_000_000,
      requests7d: [11200, 11800, 12400, 11600, 12800, 12200, 12560],
    },
  },
  {
    id: "site-004",
    site: SITES[3],
    connectivity: {
      expectedIp: "76.76.21.21",
      actualIp: "76.76.21.21",
      sslStatus: "valid",
      ttl: 3600,
      dnsMismatch: false,
    },
    health: {
      httpStatus: 500,
      isrCacheAge: 0,
      lastError: "Internal Server Error – Lambda timeout",
      lastChecked: new Date(),
      uptime7d: 97.3,
    },
    traffic: {
      requests24h: 1_043,
      bandwidth24h: 24_000_000,
      requests7d: [980, 1020, 1100, 950, 1080, 1010, 1043],
    },
  },
  {
    id: "site-005",
    site: SITES[4],
    connectivity: {
      expectedIp: "76.76.21.21",
      actualIp: "76.76.21.21",
      sslStatus: "valid",
      ttl: 300,
      dnsMismatch: false,
    },
    health: {
      httpStatus: 200,
      isrCacheAge: 290,
      lastChecked: new Date(),
      uptime7d: 100,
    },
    traffic: {
      requests24h: 5_710,
      bandwidth24h: 198_000_000,
      requests7d: [5200, 5400, 5600, 5300, 5800, 5500, 5710],
    },
  },
];

export const fetchFleetStatuses = async (): Promise<FleetStatus[]> => {
  await new Promise((r) => setTimeout(r, 700));
  return FLEET_STATUSES;
};

// ─── SEO Reports ──────────────────────────────────────────────────────────────

export const SEO_REPORTS: SeoReport[] = [
  {
    id: "seo-001",
    siteId: "site-001",
    url: "https://acme.no",
    date: "2025-01-20",
    overallScore: 87,
    metrics: { performance: 91, accessibility: 86, bestPractices: 88, seo: 83 },
    keywords: [
      {
        keyword: "industrikomponenter",
        position: 2,
        volume: 880,
        difficulty: 52,
        trend: "up",
      },
      {
        keyword: "acme norge",
        position: 1,
        volume: 340,
        difficulty: 18,
        trend: "stable",
      },
      {
        keyword: "maskinvare grossist",
        position: 7,
        volume: 2100,
        difficulty: 64,
        trend: "up",
      },
      {
        keyword: "teknisk utstyr oslo",
        position: 14,
        volume: 1400,
        difficulty: 71,
        trend: "down",
      },
    ],
    pages: [
      {
        url: "/",
        title: "Forside – Acme Corporation",
        metaDescription: "Ledende leverandør av industrikomponenter i Norge.",
        headingStructure: [
          "H1: Industriløsninger for fremtiden",
          "H2: Våre produkter",
          "H2: Om oss",
        ],
        score: 93,
        issues: [],
      },
      {
        url: "/produkter",
        title: "Produkter | Acme",
        metaDescription: "Se vårt brede utvalg av industrikomponenter.",
        headingStructure: ["H1: Produktkatalog", "H2: Mekaniske deler"],
        score: 81,
        issues: [
          "Meta-beskrivelse er for kort",
          "Mangler alt-tekst på 2 bilder",
        ],
      },
      {
        url: "/kontakt",
        title: "Kontakt oss | Acme",
        metaDescription: "",
        headingStructure: ["H1: Kontakt oss"],
        score: 67,
        issues: [
          "Mangler meta-beskrivelse",
          "Ingen strukturerte data (schema.org)",
          "Duplisert innhold oppdaget",
        ],
      },
    ],
    technical: {
      crawlErrors: 1,
      brokenLinks: 2,
      redirects: 4,
      sitemapPresent: true,
      robotsTxt: "User-agent: *\nAllow: /",
      mobileOptimized: true,
      coreWebVitals: { lcp: 1820, fid: 42, cls: 8 },
    },
  },
  {
    id: "seo-002",
    siteId: "site-002",
    url: "https://nordicsolutions.no",
    date: "2025-01-19",
    overallScore: 74,
    metrics: { performance: 66, accessibility: 80, bestPractices: 75, seo: 75 },
    keywords: [
      {
        keyword: "IT-rådgivning oslo",
        position: 5,
        volume: 1200,
        difficulty: 58,
        trend: "up",
      },
      {
        keyword: "digitaliseringspartner",
        position: 11,
        volume: 560,
        difficulty: 42,
        trend: "stable",
      },
      {
        keyword: "skymigrering norge",
        position: 18,
        volume: 3400,
        difficulty: 79,
        trend: "down",
      },
    ],
    pages: [
      {
        url: "/",
        title: "Nordic Solutions – Din IT-partner",
        metaDescription:
          "Vi hjelper din bedrift med digitalisering og skymigrering.",
        headingStructure: ["H1: Fremtidsrettet IT-rådgivning"],
        score: 78,
        issues: ["Tredjepartsscript bremser ytelsen"],
      },
      {
        url: "/tjenester",
        title: "Tjenester | Nordic Solutions",
        metaDescription: "Utforsk våre IT-tjenester.",
        headingStructure: ["H1: Tjenester", "H2: Rådgivning", "H2: Utvikling"],
        score: 71,
        issues: [
          "H1 mangler fokus-søkeord",
          "Duplisert meta-tittel med /om-oss",
        ],
      },
    ],
    technical: {
      crawlErrors: 6,
      brokenLinks: 9,
      redirects: 14,
      sitemapPresent: true,
      robotsTxt: "User-agent: *\nAllow: /\nDisallow: /admin",
      mobileOptimized: false,
      coreWebVitals: { lcp: 3240, fid: 180, cls: 142 },
    },
  },
  {
    id: "seo-003",
    siteId: "site-003",
    url: "https://fjordtech.no",
    date: "2025-01-21",
    overallScore: 92,
    metrics: { performance: 95, accessibility: 91, bestPractices: 92, seo: 90 },
    keywords: [
      {
        keyword: "saas-plattform norge",
        position: 1,
        volume: 980,
        difficulty: 55,
        trend: "up",
      },
      {
        keyword: "programvareutvikling",
        position: 3,
        volume: 4200,
        difficulty: 68,
        trend: "up",
      },
      {
        keyword: "skybasert ERP",
        position: 6,
        volume: 760,
        difficulty: 61,
        trend: "stable",
      },
    ],
    pages: [
      {
        url: "/",
        title: "Fjord Technologies – Smartere programvare",
        metaDescription: "Skreddersydde SaaS-løsninger for norske bedrifter.",
        headingStructure: ["H1: Teknologi som driver vekst"],
        score: 95,
        issues: [],
      },
    ],
    technical: {
      crawlErrors: 0,
      brokenLinks: 0,
      redirects: 2,
      sitemapPresent: true,
      robotsTxt: "User-agent: *\nAllow: /",
      mobileOptimized: true,
      coreWebVitals: { lcp: 1100, fid: 18, cls: 3 },
    },
  },
];

// ─── Incidents ─────────────────────────────────────────────────────────────────

export const INCIDENTS: Incident[] = [
  {
    id: "inc-001",
    siteId: "site-004",
    severity: "critical",
    title: "HTTP 500 – Lambda-timeout",
    description:
      "Serverløs funksjon overskrider maksimal kjøretid på 10 sekunder. Nettstedet returnerer 500-feil for alle forespørsler.",
    startedAt: new Date(Date.now() - 1_000 * 60 * 47),
    status: "investigating",
    affectedServices: ["HTTP", "ISR", "API-ruter"],
  },
  {
    id: "inc-002",
    siteId: "site-002",
    severity: "warning",
    title: "DNS-mismatch oppdaget",
    description:
      "A-record for nordicsolutions.no peker på 192.0.2.1 i stedet for 76.76.21.21 (Vercel). Nettstedet er tilgjengelig, men via gammel server.",
    startedAt: new Date(Date.now() - 1_000 * 60 * 60 * 3),
    status: "open",
    affectedServices: ["DNS", "CDN"],
  },
  {
    id: "inc-003",
    siteId: "site-003",
    severity: "warning",
    title: "SSL-sertifikat – ventende utstedelse",
    description:
      "Vercel-automatisert SSL-fornyelse for fjordtech.no er i kø. Estimert fullføring innen 15 minutter.",
    startedAt: new Date(Date.now() - 1_000 * 60 * 18),
    status: "investigating",
    affectedServices: ["SSL/TLS"],
  },
  {
    id: "inc-004",
    siteId: null,
    severity: "info",
    title: "Planlagt Vercel-vedlikehold fullført",
    description:
      "Rutinemessig infrastrukturvedlikehold uten nedetid er fullført. Alle nettsted er upåvirket.",
    startedAt: new Date(Date.now() - 1_000 * 60 * 60 * 26),
    resolvedAt: new Date(Date.now() - 1_000 * 60 * 60 * 25),
    status: "resolved",
    affectedServices: ["Alle nettsted"],
  },
  {
    id: "inc-005",
    siteId: "site-001",
    severity: "warning",
    title: "Distribusjonfeil etter git-push",
    description:
      "Bygg feilet på grunn av TypeScript-kompileringsfeil i komponent. Produksjon var upåvirket.",
    startedAt: new Date(Date.now() - 1_000 * 60 * 60 * 48),
    resolvedAt: new Date(Date.now() - 1_000 * 60 * 60 * 47),
    status: "resolved",
    affectedServices: ["Distribusjon"],
  },
];

// ─── Deployments ───────────────────────────────────────────────────────────────

export const DEPLOYMENTS: Deployment[] = [
  {
    id: "dep-001",
    siteId: "site-001",
    status: "success",
    trigger: "git_push",
    branch: "main",
    commit: "a3f8c2d",
    commitMessage: "feat: oppdater hjemmeside-banner og kampanjemodul",
    author: "maria.hansen",
    deployedAt: new Date(Date.now() - 1_000 * 60 * 38),
    durationSeconds: 94,
    url: "https://acme.no",
  },
  {
    id: "dep-002",
    siteId: "site-003",
    status: "success",
    trigger: "git_push",
    branch: "main",
    commit: "f1d4e9a",
    commitMessage: "fix: rett opp feil i prisstyring-komponent",
    author: "jonas.berg",
    deployedAt: new Date(Date.now() - 1_000 * 60 * 72),
    durationSeconds: 78,
    url: "https://fjordtech.no",
  },
  {
    id: "dep-003",
    siteId: "site-004",
    status: "error",
    trigger: "git_push",
    branch: "feature/ny-kontaktside",
    commit: "b2c9f3e",
    commitMessage: "chore: legg til ny kontaktside med skjema",
    author: "lars.eriksen",
    deployedAt: new Date(Date.now() - 1_000 * 60 * 95),
    durationSeconds: 31,
    url: "https://bergmannpartners.no",
  },
  {
    id: "dep-004",
    siteId: "site-002",
    status: "success",
    trigger: "manual",
    branch: "main",
    commit: "c7a1b5f",
    commitMessage: "content: oppdater teamside og ansattefoto",
    author: "ana.nikolić",
    deployedAt: new Date(Date.now() - 1_000 * 60 * 60 * 4),
    durationSeconds: 88,
    url: "https://nordicsolutions.no",
  },
  {
    id: "dep-005",
    siteId: "site-005",
    status: "success",
    trigger: "git_push",
    branch: "main",
    commit: "d4e8c1b",
    commitMessage: "feat: ny portefølje-seksjon med animasjoner",
    author: "ingrid.sol",
    deployedAt: new Date(Date.now() - 1_000 * 60 * 60 * 6),
    durationSeconds: 112,
    url: "https://nordlysdesign.no",
  },
  {
    id: "dep-006",
    siteId: "site-001",
    status: "cancelled",
    trigger: "git_push",
    branch: "hotfix/seo",
    commit: "e5f2d8c",
    commitMessage: "fix: meta-tagger for produktsider",
    author: "maria.hansen",
    deployedAt: new Date(Date.now() - 1_000 * 60 * 60 * 8),
    durationSeconds: 12,
    url: "https://acme.no",
  },
  {
    id: "dep-007",
    siteId: "site-003",
    status: "building",
    trigger: "git_push",
    branch: "main",
    commit: "g9h3k7l",
    commitMessage: "perf: optimaliser bildepipeline og WebP-konvertering",
    author: "jonas.berg",
    deployedAt: new Date(Date.now() - 1_000 * 60 * 4),
    durationSeconds: 0,
    url: "https://fjordtech.no",
  },
];

// ─── Maintenance Windows ────────────────────────────────────────────────────────

export const MAINTENANCE_WINDOWS: MaintenanceWindow[] = [
  {
    id: "maint-001",
    title: "Vercel Edge Network – rullerende oppgradering",
    description:
      "Rutinemessig oppgradering av Vercel Edge Network. Mulig latensøkning i kortere perioder.",
    affectedSiteIds: [],
    scheduledStart: new Date(
      Date.now() + 1_000 * 60 * 60 * 24 * 2 + 1_000 * 60 * 60 * 2,
    ),
    scheduledEnd: new Date(
      Date.now() + 1_000 * 60 * 60 * 24 * 2 + 1_000 * 60 * 60 * 3,
    ),
    status: "scheduled",
    createdBy: "system",
  },
  {
    id: "maint-002",
    title: "Database-migrering – Nordic Solutions",
    description:
      "Migrering til ny Sanity-datasetstruktur. Innholds-API kan ha korte avbrudd.",
    affectedSiteIds: ["site-002"],
    scheduledStart: new Date(Date.now() + 1_000 * 60 * 60 * 5),
    scheduledEnd: new Date(Date.now() + 1_000 * 60 * 60 * 6),
    status: "scheduled",
    createdBy: "ana.nikolić",
  },
  {
    id: "maint-003",
    title: "SSL-sertifikatfornyelse – acme.no",
    description:
      "Automatisk fornyelse av SSL-sertifikat via Vercel. Ingen nedetid forventet.",
    affectedSiteIds: ["site-001"],
    scheduledStart: new Date(Date.now() - 1_000 * 60 * 60 * 12),
    scheduledEnd: new Date(Date.now() - 1_000 * 60 * 60 * 11),
    status: "completed",
    createdBy: "system",
  },
];

// ─── Domain Registrations (Proisp) ────────────────────────────────────────────

export const DOMAIN_REGISTRATIONS: DomainRegistration[] = [
  {
    domain: "acme.no",
    siteId: "site-001",
    registrar: "proisp",
    registeredAt: new Date("2018-03-15"),
    expiresAt: new Date("2026-03-15"),
    autoRenew: true,
    status: "active",
    nameservers: ["ns1.proisp.no", "ns2.proisp.no"],
    locked: true,
  },
  {
    domain: "nordicsolutions.no",
    siteId: "site-002",
    registrar: "proisp",
    registeredAt: new Date("2017-06-10"),
    expiresAt: new Date(Date.now() + 1_000 * 60 * 60 * 24 * 38),
    autoRenew: false,
    status: "expiring_soon",
    nameservers: ["ns1.proisp.no", "ns2.proisp.no"],
    locked: true,
  },
  {
    domain: "fjordtech.no",
    siteId: "site-003",
    registrar: "proisp",
    registeredAt: new Date("2020-01-22"),
    expiresAt: new Date("2026-01-22"),
    autoRenew: true,
    status: "active",
    nameservers: ["ns1.proisp.no", "ns2.proisp.no"],
    locked: false,
  },
  {
    domain: "bergmannpartners.no",
    siteId: "site-004",
    registrar: "proisp",
    registeredAt: new Date("2016-09-01"),
    expiresAt: new Date(Date.now() + 1_000 * 60 * 60 * 24 * 12),
    autoRenew: false,
    status: "expiring_soon",
    nameservers: ["ns1.proisp.no", "ns2.proisp.no"],
    locked: true,
  },
  {
    domain: "nordlysdesign.no",
    siteId: "site-005",
    registrar: "proisp",
    registeredAt: new Date("2021-05-30"),
    expiresAt: new Date("2026-05-30"),
    autoRenew: true,
    status: "active",
    nameservers: ["ns1.proisp.no", "ns2.proisp.no"],
    locked: true,
  },
];

// ─── DNS Records ────────────────────────────────────────────────────────────────

export const DNS_RECORDS: DnsRecord[] = [
  // acme.no
  {
    id: "r01",
    domain: "acme.no",
    type: "A",
    name: "@",
    value: "76.76.21.21",
    ttl: 300,
  },
  {
    id: "r02",
    domain: "acme.no",
    type: "CNAME",
    name: "www",
    value: "cname.vercel-dns.com",
    ttl: 300,
  },
  {
    id: "r03",
    domain: "acme.no",
    type: "MX",
    name: "@",
    value: "aspmx.l.google.com",
    ttl: 3600,
    priority: 1,
  },
  {
    id: "r04",
    domain: "acme.no",
    type: "TXT",
    name: "@",
    value: "v=spf1 include:_spf.google.com ~all",
    ttl: 3600,
  },
  {
    id: "r05",
    domain: "acme.no",
    type: "TXT",
    name: "_dmarc",
    value: "v=DMARC1; p=quarantine; rua=mailto:dmarc@acme.no",
    ttl: 3600,
  },
  {
    id: "r06",
    domain: "acme.no",
    type: "CAA",
    name: "@",
    value: '0 issue "letsencrypt.org"',
    ttl: 3600,
  },
  // nordicsolutions.no
  {
    id: "r07",
    domain: "nordicsolutions.no",
    type: "A",
    name: "@",
    value: "192.0.2.1",
    ttl: 300,
  },
  {
    id: "r08",
    domain: "nordicsolutions.no",
    type: "CNAME",
    name: "www",
    value: "cname.vercel-dns.com",
    ttl: 300,
  },
  {
    id: "r09",
    domain: "nordicsolutions.no",
    type: "MX",
    name: "@",
    value: "mail.nordicsolutions.no",
    ttl: 3600,
    priority: 10,
  },
  {
    id: "r10",
    domain: "nordicsolutions.no",
    type: "TXT",
    name: "@",
    value: "v=spf1 mx ~all",
    ttl: 3600,
  },
  // fjordtech.no
  {
    id: "r11",
    domain: "fjordtech.no",
    type: "A",
    name: "@",
    value: "76.76.21.21",
    ttl: 300,
  },
  {
    id: "r12",
    domain: "fjordtech.no",
    type: "CNAME",
    name: "www",
    value: "cname.vercel-dns.com",
    ttl: 300,
  },
  {
    id: "r13",
    domain: "fjordtech.no",
    type: "CNAME",
    name: "api",
    value: "api.fjordtech.no.cdn.cloudflare.net",
    ttl: 300,
  },
  {
    id: "r14",
    domain: "fjordtech.no",
    type: "MX",
    name: "@",
    value: "aspmx.l.google.com",
    ttl: 3600,
    priority: 1,
  },
  {
    id: "r15",
    domain: "fjordtech.no",
    type: "TXT",
    name: "@",
    value: "v=spf1 include:_spf.google.com include:amazonses.com ~all",
    ttl: 3600,
  },
  {
    id: "r16",
    domain: "fjordtech.no",
    type: "TXT",
    name: "_dmarc",
    value: "v=DMARC1; p=reject; rua=mailto:dmarc@fjordtech.no",
    ttl: 3600,
  },
  // bergmannpartners.no
  {
    id: "r17",
    domain: "bergmannpartners.no",
    type: "A",
    name: "@",
    value: "76.76.21.21",
    ttl: 3600,
  },
  {
    id: "r18",
    domain: "bergmannpartners.no",
    type: "CNAME",
    name: "www",
    value: "cname.vercel-dns.com",
    ttl: 3600,
  },
  {
    id: "r19",
    domain: "bergmannpartners.no",
    type: "MX",
    name: "@",
    value: "mail.google.com",
    ttl: 3600,
    priority: 10,
  },
  // nordlysdesign.no
  {
    id: "r20",
    domain: "nordlysdesign.no",
    type: "A",
    name: "@",
    value: "76.76.21.21",
    ttl: 300,
  },
  {
    id: "r21",
    domain: "nordlysdesign.no",
    type: "CNAME",
    name: "www",
    value: "cname.vercel-dns.com",
    ttl: 300,
  },
  {
    id: "r22",
    domain: "nordlysdesign.no",
    type: "TXT",
    name: "@",
    value: "v=spf1 include:_spf.google.com ~all",
    ttl: 3600,
  },
];

// ─── SSL Certificates ──────────────────────────────────────────────────────────

export const SSL_CERTIFICATES: SslCertificate[] = [
  {
    domain: "acme.no",
    siteId: "site-001",
    issuer: "Let's Encrypt",
    issuedAt: new Date(Date.now() - 1_000 * 60 * 60 * 24 * 58),
    expiresAt: new Date(Date.now() + 1_000 * 60 * 60 * 24 * 32),
    status: "valid",
    autoRenew: true,
  },
  {
    domain: "nordicsolutions.no",
    siteId: "site-002",
    issuer: "Let's Encrypt",
    issuedAt: new Date(Date.now() - 1_000 * 60 * 60 * 24 * 60),
    expiresAt: new Date(Date.now() + 1_000 * 60 * 60 * 24 * 30),
    status: "valid",
    autoRenew: true,
  },
  {
    domain: "fjordtech.no",
    siteId: "site-003",
    issuer: "Let's Encrypt",
    issuedAt: new Date(Date.now() - 1_000 * 60 * 60 * 24 * 85),
    expiresAt: new Date(Date.now() + 1_000 * 60 * 60 * 24 * 5),
    status: "expiring_soon",
    autoRenew: true,
  },
  {
    domain: "bergmannpartners.no",
    siteId: "site-004",
    issuer: "Let's Encrypt",
    issuedAt: new Date(Date.now() - 1_000 * 60 * 60 * 24 * 70),
    expiresAt: new Date(Date.now() + 1_000 * 60 * 60 * 24 * 20),
    status: "valid",
    autoRenew: false,
  },
  {
    domain: "nordlysdesign.no",
    siteId: "site-005",
    issuer: "Let's Encrypt",
    issuedAt: new Date(Date.now() - 1_000 * 60 * 60 * 24 * 10),
    expiresAt: new Date(Date.now() + 1_000 * 60 * 60 * 24 * 80),
    status: "valid",
    autoRenew: true,
  },
];

// ─── Formatters ────────────────────────────────────────────────────────────────

export const formatBytes = (bytes: number): string => {
  if (bytes < 1_000) return `${bytes} B`;
  if (bytes < 1_000_000) return `${(bytes / 1_000).toFixed(0)} KB`;
  if (bytes < 1_000_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  return `${(bytes / 1_000_000_000).toFixed(2)} GB`;
};

export const formatDate = (d: Date): string =>
  new Intl.DateTimeFormat("nb-NO", { dateStyle: "medium" }).format(d);

export const formatDateTime = (d: Date): string =>
  new Intl.DateTimeFormat("nb-NO", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(d);

export const formatRelativeTime = (d: Date): string => {
  const diff = d.getTime() - Date.now();
  const abs = Math.abs(diff);
  const past = diff < 0;
  if (abs < 60_000) return "akkurat nå";
  if (abs < 3_600_000) {
    const m = Math.floor(abs / 60_000);
    return past ? `${m} min siden` : `om ${m} min`;
  }
  if (abs < 86_400_000) {
    const h = Math.floor(abs / 3_600_000);
    return past ? `${h}t siden` : `om ${h}t`;
  }
  const days = Math.floor(abs / 86_400_000);
  if (days < 30) return past ? `${days} dager siden` : `om ${days} dager`;
  const months = Math.floor(days / 30);
  return past ? `${months} mnd siden` : `om ${months} mnd`;
};

export const daysUntil = (d: Date): number =>
  Math.ceil((d.getTime() - Date.now()) / 86_400_000);
