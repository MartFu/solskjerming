// ─── Core ─────────────────────────────────────────────────────────────────────

export type SiteId = string;

export interface Site {
  siteId: SiteId;
  legalName: string;
  internalSubdomain: string;
  customDomain?: string;
  sanityDocId: string;
  description?: string;
  category?: string;
}

// ─── Fleet / Infrastructure ────────────────────────────────────────────────────

export interface Connectivity {
  expectedIp: string;
  actualIp: string | null;
  sslStatus: "valid" | "pending" | "invalid";
  ttl: number;
  dnsMismatch: boolean;
}

export interface Health {
  httpStatus: number;
  isrCacheAge: number; // seconds
  lastError?: string;
  lastChecked: Date;
  uptime7d: number; // percentage 0–100
}

export interface Traffic {
  requests24h: number;
  bandwidth24h: number; // bytes
  requests7d: number[]; // 7 daily buckets
}

export interface FleetStatus {
  id: SiteId;
  site: Site;
  connectivity: Connectivity;
  health: Health;
  traffic: Traffic;
}

// ─── SEO ──────────────────────────────────────────────────────────────────────

export interface SeoMetrics {
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
}

export interface SeoKeyword {
  keyword: string;
  position: number;
  volume: number;
  difficulty: number;
  trend: "up" | "down" | "stable";
}

export interface SeoPage {
  url: string;
  title: string;
  metaDescription: string;
  headingStructure: string[];
  score: number;
  issues: string[];
}

export interface SeoTechnicalData {
  crawlErrors: number;
  brokenLinks: number;
  redirects: number;
  sitemapPresent: boolean;
  robotsTxt: string;
  mobileOptimized: boolean;
  coreWebVitals: {
    lcp: number; // ms
    fid: number; // ms
    cls: number; // unitless × 1000
  };
}

export interface SeoReport {
  id: string;
  siteId: SiteId;
  url: string;
  date: string;
  overallScore: number;
  metrics: SeoMetrics;
  keywords: SeoKeyword[];
  pages: SeoPage[];
  technical: SeoTechnicalData;
}

// ─── Drift / Operations ────────────────────────────────────────────────────────

export type IncidentSeverity = "critical" | "warning" | "info";
export type IncidentStatus = "open" | "investigating" | "resolved";

export interface Incident {
  id: string;
  siteId: SiteId | null; // null = fleet-wide
  severity: IncidentSeverity;
  title: string;
  description: string;
  startedAt: Date;
  resolvedAt?: Date;
  status: IncidentStatus;
  affectedServices: string[];
}

export type DeploymentStatus = "success" | "error" | "building" | "cancelled";
export type DeploymentTrigger = "git_push" | "manual" | "scheduled";

export interface Deployment {
  id: string;
  siteId: SiteId;
  status: DeploymentStatus;
  trigger: DeploymentTrigger;
  branch: string;
  commit: string;
  commitMessage: string;
  author: string;
  deployedAt: Date;
  durationSeconds: number;
  url: string;
}

export type MaintenanceStatus = "scheduled" | "active" | "completed";

export interface MaintenanceWindow {
  id: string;
  title: string;
  description: string;
  affectedSiteIds: SiteId[]; // empty = all sites
  scheduledStart: Date;
  scheduledEnd: Date;
  status: MaintenanceStatus;
  createdBy: string;
}

// ─── Registrar ────────────────────────────────────────────────────────────────

export type DomainStatus = "active" | "expiring_soon" | "expired";

export interface DomainRegistration {
  domain: string;
  siteId: SiteId;
  registrar: "proisp";
  registeredAt: Date;
  expiresAt: Date;
  autoRenew: boolean;
  status: DomainStatus;
  nameservers: string[];
  locked: boolean;
}

export type DnsRecordType =
  | "A"
  | "AAAA"
  | "CNAME"
  | "MX"
  | "TXT"
  | "NS"
  | "CAA";

export interface DnsRecord {
  id: string;
  domain: string;
  type: DnsRecordType;
  name: string;
  value: string;
  ttl: number;
  priority?: number;
}

export type SslStatus = "valid" | "expiring_soon" | "expired";

export interface SslCertificate {
  domain: string;
  siteId: SiteId;
  issuer: string;
  issuedAt: Date;
  expiresAt: Date;
  status: SslStatus;
  autoRenew: boolean;
}
