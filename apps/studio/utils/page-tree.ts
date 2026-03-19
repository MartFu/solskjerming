import { File, type LucideIcon } from "lucide-react";

import {
  PACKAGES,
  packagesByChildType,
  packagesByRootType,
} from "@/utils/package";

// ─────────────────────────────────────────────────────────────
// Type display metadata
// ─────────────────────────────────────────────────────────────

export function getTypeDisplay(docType: string): {
  icon: LucideIcon;
  title: string;
} {
  const asRoot = packagesByRootType.get(docType);
  if (asRoot) return { icon: asRoot.icon, title: asRoot.rootTitle };

  const asChild = packagesByChildType.get(docType);
  if (asChild) return { icon: asChild.childIcon, title: asChild.childTitle };

  return { icon: File, title: "Side" };
}

// ─────────────────────────────────────────────────────────────
// Child type resolution (for "create new" actions)
// ─────────────────────────────────────────────────────────────

export interface ChildTypeInfo {
  type: string;
  title: string;
  icon: LucideIcon;
  templateId: string;
  // Add these to preserve package context
  rootTitle?: string; // For root-level creation
  childTitle?: string; // For child-level creation
  packageKey?: string; // To identify which package this belongs to
}


/**
 * Given a parent type and the site's enabled packages, returns
 * which document types can be created as children at that level.
 *
 * - null (top-level) or "page" → ["page", ...enabled package root types]
 * - package root → [its child type]
 * - anything else → [] (leaf)
 */
export function getChildTypes(
  parentType: string | null,
  enabledPackages: string[],
): ChildTypeInfo[] {
  // Package root → its specific child type
  if (parentType) {
    const pkg = packagesByRootType.get(parentType);
    if (pkg) {
      return [
        {
          type: pkg.childType,
          title: pkg.childTitle, // This is the display name for the child
          icon: pkg.childIcon,
          templateId: pkg.childTemplateId,
          rootTitle: pkg.rootTitle, // Preserve for context
          childTitle: pkg.childTitle, // Preserve for context
          packageKey: pkg.packageKey,
        },
      ];
    }
  }

  // Top-level or generic page → pages + enabled roots
  if (parentType === null || parentType === "page") {
    const children: ChildTypeInfo[] = [
      {
        type: "page",
        title: "Side",
        icon: File,
        templateId: "page-with-parent",
        rootTitle: "Side", // For root level
        childTitle: "Underside", // For child level
      },
    ];

    for (const pkg of PACKAGES) {
      if (enabledPackages.includes(pkg.packageKey)) {
        children.push({
          type: pkg.rootType,
          title: pkg.rootTitle, // Default display name
          icon: pkg.icon,
          templateId: pkg.rootTemplateId,
          rootTitle: pkg.rootTitle,
          childTitle: pkg.childTitle,
          packageKey: pkg.packageKey,
        });
      }
    }

    return children;
  }

  // Leaf type
  return [];
}

// ─────────────────────────────────────────────────────────────
// GROQ query
// ─────────────────────────────────────────────────────────────

export function getRoutableTypes(enabledPackages: string[]): string[] {
  const types = ["page"];
  for (const pkg of PACKAGES) {
    if (enabledPackages.includes(pkg.packageKey)) {
      types.push(pkg.rootType, pkg.childType);
    }
  }
  return types;
}

export function buildTreeQuery(enabledPackages: string[]): string {
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
  // Group documents by their parent ref
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
