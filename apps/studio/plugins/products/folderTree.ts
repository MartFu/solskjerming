import type { FolderNode, FolderTreeNode, ProductListItem } from "./types";

/**
 * Builds a nested folder tree from a flat list of FolderNodes and assigns
 * products to their respective folders.
 *
 * Products with no folder end up in the implicit root.
 */
export function buildFolderTree(
  folders: FolderNode[],
  products: ProductListItem[],
): { roots: FolderTreeNode[]; unassigned: ProductListItem[] } {
  const nodeMap = new Map<string, FolderTreeNode>();

  // Initialise every folder as a tree node
  for (const f of folders) {
    nodeMap.set(f._id, { ...f, children: [], products: [] });
  }

  // Wire up parent → children relationships
  const roots: FolderTreeNode[] = [];
  for (const f of folders) {
    const node = nodeMap.get(f._id)!;
    if (f.parent?._id) {
      const parent = nodeMap.get(f.parent._id);
      if (parent) {
        parent.children.push(node);
      } else {
        // Orphaned folder (parent deleted) — treat as root
        roots.push(node);
      }
    } else {
      roots.push(node);
    }
  }

  // Assign products to folders
  const unassigned: ProductListItem[] = [];
  for (const p of products) {
    if (p.folder?._id) {
      const folderNode = nodeMap.get(p.folder._id);
      if (folderNode) {
        folderNode.products.push(p);
      } else {
        unassigned.push(p);
      }
    } else {
      unassigned.push(p);
    }
  }

  return { roots, unassigned };
}

/**
 * Flatten a tree back to a sorted array for searching / filtering.
 */
export function flattenTree(roots: FolderTreeNode[]): FolderTreeNode[] {
  const result: FolderTreeNode[] = [];
  function walk(nodes: FolderTreeNode[]) {
    for (const n of nodes) {
      result.push(n);
      walk(n.children);
    }
  }
  walk(roots);
  return result;
}

/**
 * Collect all products under a folder node, recursively.
 */
export function collectProducts(node: FolderTreeNode): ProductListItem[] {
  const products = [...node.products];
  for (const child of node.children) {
    products.push(...collectProducts(child));
  }
  return products;
}
