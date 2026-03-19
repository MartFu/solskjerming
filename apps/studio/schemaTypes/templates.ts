import { PACKAGES } from "@/utils/package";
import type { Template } from "sanity";

// ─────────────────────────────────────────────────────────────
// Template types
// ─────────────────────────────────────────────────────────────

interface SiteParams {
  siteId: string;
}

interface ChildParams {
  siteId: string;
  parentId: string;
}

interface WorkspaceParams {
  workspace: string;
}

// ─────────────────────────────────────────────────────────────
// Root / standalone types — created with a site reference
// ─────────────────────────────────────────────────────────────

const SITE_SCOPED_TYPES = [
  "page",
  "articleRoot",
  "catalogRoot",
  "navbar",
  "footer",
] as const;

function createSiteTemplates(): Template[] {
  console.log("-- createSiteTemplates --");
  return SITE_SCOPED_TYPES.map((type) => ({
    id: `${type}-with-site`,
    title: type.charAt(0).toUpperCase() + type.slice(1),
    schemaType: type,
    parameters: [{ name: "siteId", type: "string" as const }],
    value: (params: SiteParams) => ({
      site: {
        _type: "reference",
        _ref: params.siteId,
      },
    }),
  }));
}

// ─────────────────────────────────────────────────────────────
// Child types — created with both site and parent references
// ─────────────────────────────────────────────────────────────
// Each entry maps a child type to the root type it belongs to.
// The parent reference is set automatically when creating from
// within a root's children list in the structure.
// ─────────────────────────────────────────────────────────────

const CHILD_TYPE_MAP: { childType: string; parentType: string }[] = [
  { childType: "articlePage", parentType: "articleRoot" },
  { childType: "productPage", parentType: "catalogRoot" },
  // Add new child types here as packages are added.
];

function createChildTemplates(): Template[] {
  console.log("-- createChildTemplates --");
  return CHILD_TYPE_MAP.map(({ childType }) => ({
    id: `${childType}-with-parent`,
    title: childType.charAt(0).toUpperCase() + childType.slice(1),
    schemaType: childType,
    parameters: [
      { name: "siteId", type: "string" as const },
      { name: "parentId", type: "string" as const },
    ],
    value: (params: ChildParams) => {
      console.log("Template received params:", params);
      return {
        site: {
          _type: "reference",
          _ref: params.siteId,
        },
        parent: {
          _type: "reference",
          _ref: params.parentId,
        },
      };
    },
  }));
}

// ─────────────────────────────────────────────────────────────
// Page nesting — pages created as children of other pages
// ─────────────────────────────────────────────────────────────

function createPageNestingTemplate(): Template {
  console.log("-- createPageNestingTemplate --");
  return {
    id: "page-with-parent",
    title: "Underside",
    schemaType: "page",
    parameters: [
      { name: "siteId", type: "string" as const },
      { name: "parentId", type: "string" as const },
    ],
    value: (params: ChildParams) => {
      console.log("Template received params:", params);
      return {
        site: {
          _type: "reference",
          _ref: params.siteId,
        },
        parent: {
          _type: "reference",
          _ref: params.parentId === "" ? undefined : params.parentId,
        },
      };
    },
  };
}

// ─────────────────────────────────────────────────────────────
// Workspace-level templates
// ─────────────────────────────────────────────────────────────

function createWorkspaceTemplates(): Template[] {
  console.log("-- createWorkspaceDefaultTemplates --");
  return [
    {
      id: "workspaceDefault-template",
      title: "Standardinnstillinger",
      schemaType: "workspaceDefault",
      parameters: [{ name: "workspace", type: "string" as const }],
      value: (params: WorkspaceParams) => ({
        workspace: params.workspace,
        title: `${params.workspace.charAt(0).toUpperCase() + params.workspace.slice(1)} - Standardinnstillinger`,
      }),
    },
    {
      id: "site-template",
      title: "Nettsted",
      schemaType: "site",
      parameters: [{ name: "workspace", type: "string" as const }],
      value: (params: WorkspaceParams) => ({
        workspace: params.workspace,
      }),
    },
  ];
}

/**
 * Generates Root Templates (Site-scoped)
 * Used for articleRoot, catalogRoot, etc.
 */
function createPackageRootTemplates(): Template[] {
  console.log("-- createPackageRootTemplates --");
  createWorkspaceTemplates;
  return PACKAGES.map((pkg) => ({
    id: pkg.rootTemplateId, // Use the ID from your definition
    title: pkg.rootTitle,
    schemaType: pkg.rootType,
    parameters: [{ name: "siteId", type: "string" as const }],
    value: (params: SiteParams) => ({
      site: { _type: "reference", _ref: params.siteId },
    }),
  }));
}

/**
 * Generates Child Templates (Parent-scoped)
 * Used for articlePage, productPage, etc.
 */
function createPackageChildTemplates(): Template[] {
  console.log("-- createPackageChildTemplates --");
  return PACKAGES.map((pkg) => ({
    id: pkg.childTemplateId, // Use the ID from your definition
    title: pkg.childTitle,
    schemaType: pkg.childType,
    parameters: [
      { name: "siteId", type: "string" as const },
      { name: "parentId", type: "string" as const },
    ],
    value: (params: ChildParams) => ({
      site: { _type: "reference", _ref: params.siteId },
      parent: { _ref: params.parentId },
    }),
  }));
}

// ─────────────────────────────────────────────────────────────
// Export: plug into sanity.config.ts templates callback
// ─────────────────────────────────────────────────────────────
//
// Usage in sanity.config.ts:
//
//   templates: (prev) => [...prev, ...initialValueTemplates],
//

export const initialValueTemplates: Template[] = [
  ...createSiteTemplates(),
  ...createChildTemplates(),
  ...createPackageChildTemplates(),
  ...createPackageRootTemplates(),
  createPageNestingTemplate(),
  ...createWorkspaceTemplates(),
];
