// ─────────────────────────────────────────────────────────────
// Package registry
// ─────────────────────────────────────────────────────────────
// Maps each root document type to its child type and display
// metadata. To extend the system with a new package, define the
// root + child schema types, then add one entry here.
// ─────────────────────────────────────────────────────────────

import {
  BookOpen,
  FileText,
  LucideIcon,
  Package,
  ShoppingCart,
} from "lucide-react";

export interface PackageDefinition {
  rootType: string;
  childType: string;
  rootTitle: string;
  rootDescription?: string;

  rootIcon: LucideIcon;
  childTitle: string;

  childDescription?: string;
  childIcon: LucideIcon;
  packageKey: string;
  rootTemplateId: string;
  childTemplateId: string;
  rootSetParentAllowed?: boolean;
}

export const PACKAGES: PackageDefinition[] = [
  {
    rootTitle: "Arkiv",
    rootDescription: "En side som støtter søkbare lister over alle artikler.",
    rootType: "articleRoot",
    rootIcon: BookOpen,
    childTitle: "Artikkelside",
    childType: "articlePage",
    childIcon: FileText,
    packageKey: "articles",
    rootTemplateId: "articleRoot",
    childTemplateId: "articleChild",
    rootSetParentAllowed: true,
  },
  {
    rootTitle: "Katalog",
    rootIcon: ShoppingCart,
    rootType: "catalogRoot",
    childType: "productPage",
    childTitle: "Produktside",
    childIcon: Package,
    packageKey: "commerce",
    rootTemplateId: "productRoot",
    childTemplateId: "productChild",
    rootSetParentAllowed: true,
  },
  // ────────────────────────────────────────────────────
  // Add new packages here, e.g.:
  //
  // {
  //     rootType: "eventRoot",
  //     childType: "eventPage",
  //     title: "Arrangementer",
  //     icon: Calendar,
  //     childTitle: "Arrangementer",
  //     childIcon: CalendarDays,
  // },
  // ────────────────────────────────────────────────────
];

// ─────────────────────────────────────────────────────────────
// Package options
// ─────────────────────────────────────────────────────────────
// This list must stay in sync with the PACKAGES registry in
// structure.ts. When you add a new package, add an entry here.
// ─────────────────────────────────────────────────────────────

export const PACKAGE_OPTIONS = [
    { title: "Artikler", value: "articles" },
    { title: "Netthandel", value: "commerce" },
    // { title: "Arrangementer", value: "eventRoot" },
] as const;

export type PackageKey = (typeof PACKAGE_OPTIONS)[number]["value"];

export const packagesByRootType = new Map(
  PACKAGES.map((pkg) => [pkg.rootType, pkg]),
);

export const packagesByChildType = new Map(
  PACKAGES.map((pkg) => [pkg.childType, pkg]),
);

// Every type that can appear at the top level of the page tree
export const ALL_ROOT_TYPES = ["page", ...PACKAGES.map((p) => p.rootType)];

