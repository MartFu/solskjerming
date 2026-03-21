// ─── Token catalogue ──────────────────────────────────────────────────────────
// One entry per shadcn/ui CSS variable. These map directly to the frontend's
// Tailwind theme: --background → bg-background, --primary → bg-primary, etc.

import { TokenDefinition } from "./types";

export const RADIUS_OPTIONS = [
  { title: "Ingen", value: "0rem" },
  { title: "Liten", value: "0.25rem" },
  { title: "Medium", value: "0.5rem" },
  { title: "Stor", value: "0.75rem" },
  { title: "Rund", value: "1rem" },
];


export const TOKEN_DEFS: TokenDefinition[] = [
  {
    name: "background",
    title: "Bakgrunn",
    type: "color",
    description: "Sidens bakgrunnsfarge",
  },
  {
    name: "foreground",
    title: "Forgrunn",
    type: "color",
    description: "Primær tekstfarge",
  },
  {
    name: "card",
    title: "Kort > Bakgrunn",
    type: "color",
    description: "Bakgrunnsfargen på kort og paneler",
  },
  {
    name: "cardForeground",
    title: "Kort > Forgrunn",
    type: "color",
    description: "Tekstfargen på kort og paneler",
  },
  {
    name: "popover",
    title: "Popup > Bakgrunn",
    type: "color",
    description: "Bakgrunnsfargen på nedtrekksmenyer og tooltips",
  },
  {
    name: "popoverForeground",
    title: "Popup > Forgrunn",
    type: "color",
    description: "Tekstfargen i nedtrekksmenyer og tooltips",
  },
  {
    name: "primary",
    title: "Primær > Bakgrunn",
    type: "color",
    description: "Hovedfargen for handlinger og merkevare",
  },
  {
    name: "primaryForeground",
    title: "Primær > Forgrunn",
    type: "color",
    description: "Tekstfargen på primærbakgrunn",
  },
  {
    name: "secondary",
    title: "Sekundær > Bakgrunn",
    type: "color",
    description: "Sekundærfarge for dempede handlinger",
  },
  {
    name: "secondaryForeground",
    title: "Sekundær > Forgrunn",
    type: "color",
    description: "Tekstfargen på sekundærbakgrunn",
  },
  {
    name: "muted",
    title: "Dempet",
    type: "color",
    description: "Bakgrunnsfarge for dempede seksjoner",
  },
  {
    name: "mutedForeground",
    title: "Dempet > Forgrunn",
    type: "color",
    description: "Dempet tekstfarge for sekundær informasjon",
  },
  {
    name: "accent",
    title: "Aksent",
    type: "color",
    description: "Fargen for hover-tilstander og valgte elementer",
  },
  {
    name: "accentForeground",
    title: "Aksent > Forgrunn",
    type: "color",
    description: "Tekstfargen på aksent-bakgrunn",
  },
  {
    name: "destructive",
    title: "Destruktiv",
    type: "color",
    description: "Bakgrunnfarge for feil og sletthandlinger",
  },
  {
    name: "destructiveForeground",
    title: "Destruktiv > Forgrunn",
    type: "color",
    description: "Tekstfargen på destruktiv-bakgrunn",
  },
  {
    name: "warning",
    title: "Advarsel",
    type: "color",
    description: "Bakgrunnfarge for advarsler.",
  },
  {
    name: "warningForeground",
    title: "Advarsel > Forgrunn",
    type: "color",
    description: "Tekstfargen på advarsel-bakgrunn",
  },
  {
    name: "success",
    title: "Suksess",
    type: "color",
    description: "Bakgrunnfarge for suksessmeldinger.",
  },
  {
    name: "successForeground",
    title: "Suksess > Forgrunn",
    type: "color",
    description: "Tekstfargen på suksess-bakgrunn",
  },
  {
    name: "border",
    title: "Kant",
    type: "color",
    description: "Fargen på kanter og skillelinjer",
  },
  {
    name: "input",
    title: "Skjemafelt > Kant",
    type: "color",
    description: "Kantfargen på skjemafelt",
  },
  {
    name: "ring",
    title: "Fokusring",
    type: "color",
    description: "Farge på fokusring ved tastaturnavigasjon",
  },
  {
    name: "radius",
    title: "Kantavrunding",
    type: "unit",
    description: "Kantavrunding for knapper, kort og skjemafelt.",
    options: RADIUS_OPTIONS,
    default: "0.5rem",
  },
] as const;

