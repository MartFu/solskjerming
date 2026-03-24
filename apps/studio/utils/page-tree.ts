import { File } from "lucide-react";
import {
  type PackageResult,
  type DocumentRoleMeta,
  type PackageRegistry,
  packageRegistry,
} from "@/schemaTypes/documents/packages";
import { ComponentType, ReactNode } from "react";

// ─────────────────────────────────────────────────────────────
// Type display metadata
// ─────────────────────────────────────────────────────────────

/**
 * Returns display metadata (icon, title) for any document type.
 * Looks up the type in the package registry; falls back to a
 * generic "Side" (page) label for unknown types.
 */
export function getTypeDisplay(
  docType: string,
): { icon: ComponentType | ReactNode; title: string } {
  const entry = packageRegistry.lookup(docType);
  if (entry) {
    return { icon: entry.meta.icon, title: entry.meta.title };
  }
  return { icon: File, title: "Side" };
}

// ─────────────────────────────────────────────────────────────
// Child type resolution (for "create new" actions)
// ─────────────────────────────────────────────────────────────

export interface ChildTypeInfo {
  type: string;
  title: string;
  description?: string;
  icon: ComponentType | ReactNode;
  templateId: string;
  packageKey?: string;
}

/**
 * Given a parent type and the site's enabled packages, returns
 * which document types can be created as children at that level.
 *
 * Uses `resolvedParentTypes` from the registry metadata — a role
 * is a valid child if its resolved parents include the given type.
 *
 * - `null` or `"page"` → ["page", ...entry points from enabled packages]
 * - Any other type → all roles whose `resolvedParentTypes` includes it
 */
export function getChildTypes(
  parentType: string | null,
  enabledPackages: string[],
): ChildTypeInfo[] {
  // Top-level or under a page → pages + enabled entry points
  if (parentType === null || parentType === "page") {
    const children: ChildTypeInfo[] = [
      {
        type: "page",
        title: "Side",
        icon: File,
        templateId: "page-with-parent",
        description:
          "En fleksibel toppnivåside som benytter hovedsidebyggeren.",
      },
    ];

    for (const pkg of packageRegistry.packages) {
      if (!enabledPackages.includes(pkg.key)) continue;

      for (const meta of Object.values<DocumentRoleMeta>(pkg.documents)) {
        if (meta.isEntryPoint) {
          children.push({
            type: meta.type,
            title: meta.title,
            icon: meta.icon,
            templateId: meta.templateId,
            description: meta.description,
            packageKey: pkg.key,
          });
        }
      }
    }

    return children;
  }

  // Any other type → find all roles that accept it as a parent
  const children: ChildTypeInfo[] = [];

  for (const pkg of packageRegistry.packages) {
    if (!enabledPackages.includes(pkg.key)) continue;

    for (const meta of Object.values<DocumentRoleMeta>(pkg.documents)) {
      if (meta.resolvedParentTypes.includes(parentType)) {
        children.push({
          type: meta.type,
          title: meta.title,
          icon: meta.icon,
          templateId: meta.templateId,
          description: meta.description,
          packageKey: pkg.key,
        });
      }
    }
  }

  return children;
}

// ─────────────────────────────────────────────────────────────
// GROQ query
// ─────────────────────────────────────────────────────────────

/**
 * Returns all routable document type names for the given set of
 * enabled packages. Always includes "page".
 */
export function getRoutableTypes(
  enabledPackages: string[],
): string[] {
  const types = ["page"];

  for (const pkg of packageRegistry.packages) {
    if (!enabledPackages.includes(pkg.key)) continue;

    for (const meta of Object.values<DocumentRoleMeta>(pkg.documents)) {
      types.push(meta.type);
    }
  }

  return types;
}

/**
 * Builds the GROQ query that fetches all routable documents for a
 * site's page tree. The query is scoped to the enabled packages.
 */
export function buildTreeQuery(
  enabledPackages: string[],
): string {
  const types = getRoutableTypes(enabledPackages);
  const typeList = types.map((t) => `"${t}"`).join(", ");

  return `
    *[_type in [${typeList}] && site._ref == $siteId] | order(sortOrder asc, title asc) {
      _id,
      _type,
      title,
      "slug": slug.current,
      sortOrder,
      "parentRef": parent._ref,
      seoNoIndex
    }
  `;
}

// ─────────────────────────────────────────────────────────────
// Tree data structure
// ─────────────────────────────────────────────────────────────

export interface RoutableDoc {
  _id: string;
  _type: string;
  title: string | null;
  slug: string | null;
  sortOrder: number | null;
  parentRef: string | null;
  seoNoIndex: boolean | null;
  internalRole: string;
}

export interface TreeNode {
  doc: RoutableDoc;
  children: TreeNode[];
  /** Ancestor titles from root down, e.g. ["Om oss", "Teamet"] */
  path: string[];
  canHaveChildren: boolean;
}

/**
 * Assembles a flat array of routable documents into a tree.
 * Returns the top-level nodes (documents with no parent).
 */
export function buildTree(
  docs: RoutableDoc[],
  enabledPackages: string[],
): TreeNode[] {
  const childrenOf = new Map<string | null, RoutableDoc[]>();

  for (const doc of docs) {
    const key = doc.parentRef ?? null;
    if (!childrenOf.has(key)) {
      childrenOf.set(key, []);
    }
    childrenOf.get(key)!.push(doc);
  }

  function buildNodes(
    parentRef: string | null,
    ancestorPath: string[],
  ): TreeNode[] {
    const children = childrenOf.get(parentRef) ?? [];

    return children.map((doc) => {
      const label = doc.title ?? "Uten tittel";
      const path = [...ancestorPath, label];
      const canHaveChildren =
        getChildTypes(doc._type, enabledPackages).length > 0;

      return {
        doc,
        path,
        canHaveChildren,
        children: buildNodes(doc._id, path),
      };
    });
  }

  return buildNodes(null, []);
}

/**
 * Flattens the tree into a single array. Useful for search.
 */
export function flattenTree(nodes: TreeNode[]): TreeNode[] {
  const result: TreeNode[] = [];

  function walk(node: TreeNode) {
    result.push(node);
    for (const child of node.children) {
      walk(child);
    }
  }

  for (const node of nodes) {
    walk(node);
  }

  return result;
}

/**
 * Finds a node by document ID anywhere in the tree.
 */
export function findNode(nodes: TreeNode[], docId: string): TreeNode | null {
  for (const node of nodes) {
    if (node.doc._id === docId) return node;
    const found = findNode(node.children, docId);
    if (found) return found;
  }
  return null;
}

/**
 * Returns the ancestor chain from root down to (but not including)
 * the given document. Used for breadcrumb rendering.
 */
export function getAncestors(nodes: TreeNode[], docId: string): TreeNode[] {
  function search(current: TreeNode[], trail: TreeNode[]): TreeNode[] | null {
    for (const node of current) {
      if (node.doc._id === docId) return trail;
      const found = search(node.children, [...trail, node]);
      if (found) return found;
    }
    return null;
  }

  return search(nodes, []) ?? [];
}
