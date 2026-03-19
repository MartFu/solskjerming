import {
  BlockElementIcon,
  ColorWheelIcon,
  ComposeIcon,
  DocumentIcon,
  InlineElementIcon,
  InsertAboveIcon,
  SearchIcon,
  LinkIcon,
  DatabaseIcon,
  JsonIcon,
  FaceHappyIcon
} from "@sanity/icons";
import type { FieldGroupDefinition } from "sanity";
import { OklchColor } from "./types";



export const GROUP = {
  IDENTITY: 'identity',
  MAIN_CONTENT: "main-content",
  SEO: "seo",
  CARD: "card",
  RELATED: "related",
  OG: "og",
  BRANDING: 'branding',
  RELATIONSHIPS: 'relationships',
  STRUCTURED_DATA: 'structured-data',
  SOME: "some",
} as const;

export type GroupValue = typeof GROUP[keyof typeof GROUP];

export const GROUPS = (
  defaultGroup: GroupValue = GROUP.MAIN_CONTENT,
): FieldGroupDefinition[] => {
  const baseGroups: FieldGroupDefinition[] = [
    { name: GROUP.IDENTITY, icon: DocumentIcon, title: "Identitet" },
    { name: GROUP.MAIN_CONTENT, icon: ComposeIcon, title: "Innhold" },
    { name: GROUP.SEO, icon: SearchIcon, title: "SEO" },
    { name: GROUP.OG, icon: InsertAboveIcon, title: "Open Graph" },
    { name: GROUP.CARD, icon: BlockElementIcon, title: "Card" },
    { name: GROUP.RELATED, icon: InlineElementIcon, title: "Relatert" },
    { name: GROUP.BRANDING, icon: ColorWheelIcon, title: "Branding" },
    { name: GROUP.RELATIONSHIPS, icon: LinkIcon, title: "Relasjoner" },
    { name: GROUP.STRUCTURED_DATA, icon: JsonIcon, title: "JSON-LD" },
    { name: GROUP.SOME, icon: FaceHappyIcon, title: "Sosiale Medier" },
  ];

  return baseGroups.map((g) => ({
    ...g,
    // Now you are correctly using the boolean 'default' key allowed by FieldGroupDefinition
    default: g.name === defaultGroup,
  }));
};

export const API_VERSION =
  process.env.SANITY_STUDIO_API_VERSION ?? "2025-05-08";

export const WORKSPACES = [
  { title: "Solskjerming", value: "solskjerming" },
  { title: "Vannsport", value: "vannsport" },
] as const;

export type WorkspaceKey = (typeof WORKSPACES)[number]["value"];
export type Workspace = (typeof WORKSPACES)[number];


// ─── Token catalogue ──────────────────────────────────────────────────────────
// One entry per shadcn/ui CSS variable. These map directly to the frontend's
// Tailwind theme: --background → bg-background, --primary → bg-primary, etc.

export const TOKEN_DEFS = [
  {
    name: "background",
    title: "Bakgrunn",
    description: "Sidens bakgrunnsfarge",
  },
  {
    name: "foreground",
    title: "Forgrunn",
    description: "Primær tekstfarge",
  },
  {
    name: "card",
    title: "Kort > Bakgrunn",
    description: "Bakgrunnsfargen på kort og paneler",
  },
  {
    name: "cardForeground",
    title: "Kort > Forgrunn",
    description: "Tekstfargen på kort og paneler",
  },
  {
    name: "popover",
    title: "Popup > Bakgrunn",
    description: "Bakgrunnsfargen på nedtrekksmenyer og tooltips",
  },
  {
    name: "popoverForeground",
    title: "Popup > Forgrunn",
    description: "Tekstfargen i nedtrekksmenyer og tooltips",
  },
  {
    name: "primary",
    title: "Primær > Bakgrunn",
    description: "Hovedfargen for handlinger og merkevare",
  },
  {
    name: "primaryForeground",
    title: "Primær > Forgrunn",
    description: "Tekstfargen på primærbakgrunn",
  },
  {
    name: "secondary",
    title: "Sekundær > Bakgrunn",
    description: "Sekundærfarge for dempede handlinger",
  },
  {
    name: "secondaryForeground",
    title: "Sekundær > Forgrunn",
    description: "Tekstfargen på sekundærbakgrunn",
  },
  {
    name: "muted",
    title: "Dempet",
    description: "Bakgrunnsfarge for dempede seksjoner",
  },
  {
    name: "mutedForeground",
    title: "Dempet > Forgrunn",
    description: "Dempet tekstfarge for sekundær informasjon",
  },
  {
    name: "accent",
    title: "Aksent",
    description: "Fargen for hover-tilstander og valgte elementer",
  },
  {
    name: "accentForeground",
    title: "Aksent > Forgrunn",
    description: "Tekstfargen på aksent-bakgrunn",
  },
  {
    name: "destructive",
    title: "Destruktiv",
    description: "Bakgrunnfarge for feil og sletthandlinger",
  },
  {
    name: "destructiveForeground",
    title: "Destruktiv > Forgrunn",
    description: "Tekstfargen på destruktiv-bakgrunn",
  },
  {
    name: "warning",
    title: "Advarsel",
    description: "Bakgrunnfarge for advarsler.",
  },
  {
    name: "warningForeground",
    title: "Advarsel > Forgrunn",
    description: "Tekstfargen på advarsel-bakgrunn",
  },
  {
    name: "success",
    title: "Suksess",
    description: "Bakgrunnfarge for suksessmeldinger.",
  },
  {
    name: "successForeground",
    title: "Suksess > Forgrunn",
    description: "Tekstfargen på suksess-bakgrunn",
  },
  {
    name: "border",
    title: "Kant",
    description: "Fargen på kanter og skillelinjer",
  },
  {
    name: "input",
    title: "Skjemafelt > Kant",
    description: "Kantfargen på skjemafelt",
  },
  {
    name: "ring",
    title: "Fokusring",
    description: "Farge på fokusring ved tastaturnavigasjon",
  },
] as const;

export const OKLCH_PATTERN =
  /^oklch\(\s*[\d.]+\s+[\d.]+\s+[\d.]+(\s*\/\s*[\d.]+)?\s*\)$/;


export const DEFAULT_COLOR: OklchColor = {
  l: 0.5,
  c: 0,
  h: 0,
  a: 1,
  hexInput: "#000000",
};