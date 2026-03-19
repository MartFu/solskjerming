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
  icon: LucideIcon;
  childTitle: string;
  childIcon: LucideIcon;
  packageKey: string;
  rootTemplateId: string;
  childTemplateId: string;
  rootSetParentAllowed?: boolean;
}

export const PACKAGES: PackageDefinition[] = [
  {
    rootTitle: "Arkiv",
    rootType: "articleRoot",
    icon: BookOpen,
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
    icon: ShoppingCart,
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

export const packagesByRootType = new Map(
  PACKAGES.map((pkg) => [pkg.rootType, pkg]),
);

export const packagesByChildType = new Map(
  PACKAGES.map((pkg) => [pkg.childType, pkg]),
);

// Every type that can appear at the top level of the page tree
export const ALL_ROOT_TYPES = ["page", ...PACKAGES.map((p) => p.rootType)];
