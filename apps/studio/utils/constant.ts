import {
  BlockElementIcon,
  ColorWheelIcon,
  ComposeIcon,
  DocumentIcon,
  InlineElementIcon,
  InsertAboveIcon,
  SearchIcon,
  LinkIcon
} from "@sanity/icons";
import type { FieldGroupDefinition } from "sanity";



export const GROUP = {
  IDENTITY: 'identity',
  MAIN_CONTENT: "main-content",
  SEO: "seo",
  CARD: "card",
  RELATED: "related",
  OG: "og",
  BRANDING: 'branding',
  RELATIONSHIPS: 'relationships',
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