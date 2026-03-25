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
  FaceHappyIcon,
  UsersIcon,
  LockIcon,
  PlugIcon,
  CaseIcon,
  SunIcon,
  MoonIcon,
  RobotIcon
} from "@sanity/icons";
import { Brush, Building, Building2, Cookie, Fingerprint, Scale, ShieldCheck } from "lucide-react";
import type { FieldGroupDefinition } from "sanity";
import { OklchColor } from "./types";
import { asStudioIcon } from "./helper";



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
  ORGANIZATION: "organization",
  THEME: "theme",
  INTEGRATIONS: "integrations",
  LEGAL: "legal",
  LIGHT_MODE: "light",
  DARK_MODE: "dark",
  COOKIES: 'cookies',
  ROBOTS: 'robots'
} as const;

export type GroupValue = typeof GROUP[keyof typeof GROUP];

export const GROUPS = (
  defaultGroup?: GroupValue,
): FieldGroupDefinition[] => {
  const baseGroups: FieldGroupDefinition[] = [
    {
      name: GROUP.IDENTITY,
      icon: asStudioIcon(Fingerprint),
      title: "Identitet",
    },
    { name: GROUP.MAIN_CONTENT, icon: ComposeIcon, title: "Innhold" },
    { name: GROUP.SEO, icon: SearchIcon, title: "SEO" },
    { name: GROUP.OG, icon: InsertAboveIcon, title: "Open Graph" },
    { name: GROUP.CARD, icon: BlockElementIcon, title: "Card" },
    { name: GROUP.RELATED, icon: InlineElementIcon, title: "Relatert" },
    { name: GROUP.BRANDING, icon: ColorWheelIcon, title: "Branding" },
    { name: GROUP.RELATIONSHIPS, icon: LinkIcon, title: "Relasjoner" },
    { name: GROUP.STRUCTURED_DATA, icon: JsonIcon, title: "JSON-LD" },
    { name: GROUP.SOME, icon: FaceHappyIcon, title: "Sosiale Medier" },
    {
      name: GROUP.ORGANIZATION,
      icon: asStudioIcon(Building2),
      title: "Organisasjon",
    },
    { name: GROUP.THEME, icon: asStudioIcon(Brush), title: "CSS Variabler" },
    { name: GROUP.INTEGRATIONS, icon: PlugIcon, title: "Integrasjoner" },
    {
      name: GROUP.LEGAL,
      icon: asStudioIcon(Scale),
      title: "Juridisk",
    },
    {
      name: GROUP.LIGHT_MODE,
      icon: SunIcon,
      title: "Lys modus",
    },
    {
      name: GROUP.DARK_MODE,
      icon: MoonIcon,
      title: "Mørk modus",
    },
    {
      name: GROUP.COOKIES,
      icon: asStudioIcon(Cookie),
      title: "Cookiebanner",
    },
    {
      name: GROUP.ROBOTS,
      icon: RobotIcon,
      title: "Roboter",
    },
  ];

  return baseGroups.map((g) => ({
    ...g,
    default: g.name === defaultGroup,
  }));
};




export const WORKSPACES = [
  { title: "Solskjerming", value: "solskjerming" },
  { title: "Vannsport", value: "vannsport" },
] as const;

export type WorkspaceKey = (typeof WORKSPACES)[number]["value"];
export type Workspace = (typeof WORKSPACES)[number];



export const OKLCH_PATTERN =
  /^oklch\(\s*[\d.]+\s+[\d.]+\s+[\d.]+(\s*\/\s*[\d.]+)?\s*\)$/;


export const DEFAULT_COLOR: OklchColor = {
  l: 0.5,
  c: 0,
  h: 0,
  a: 1,
  hexInput: "#000000",
};