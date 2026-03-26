
// ─────────────────────────────────────────────────────────────
// Child type resolution (for "create new" actions)
// ─────────────────────────────────────────────────────────────

import { moduleRegistry } from "@/schemaTypes/documents/modules";
import { ComponentType, ReactNode } from "react";

export interface ChildTypeInfo {
  type: string;
  title: string;
  description?: string;
  icon: ComponentType | ReactNode;
  templateId: string;
  packageKey?: string;
}

/**
 * Checks the module registry to see what document types (blueprints) 
 * are allowed to be created under a specific parent document.
 * * @param parentRole - The 'internalRole' of the parent document.
 * @param enabledModules - The list of active module keys for the site.
 */
export function getChildTypes(
  parentRole: string | undefined,
  enabledModules: string[]
): ChildTypeInfo[] {
  // Use the registry's existing logic to find valid child blueprints
  const options = moduleRegistry.getCreationOptions(parentRole, enabledModules);

  // Map the Registry's CreationOption to your Tree's ChildTypeInfo
  return options.map((option) => ({
    type: option.type,
    title: option.title,
    description: option.description,
    icon: option.icon,
    templateId: option.templateId,
    // We don't strictly need packageKey here because 
    // getCreationOptions already filtered them for us.
  }));
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
  enabledModules: string[],
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
          getChildTypes(doc.internalRole, enabledModules).length > 0;

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
