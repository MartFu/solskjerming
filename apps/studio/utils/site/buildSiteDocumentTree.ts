import { isPageType } from "@/schemaTypes/documents";
import type {
  DeletionCandidate,
  SiteDeletionPreview,
} from "./getSiteDeletionPreview";

// ─── Types ────────────────────────────────────────────────────────────────────

export type DocumentTreeNode = DeletionCandidate & {
  children: DocumentTreeNode[];
};

export type Breadcrumb = {
  _id: string;
  title: string;
  slug?: string;
};

export type PreparedDeletionData = {
  siteName: string;
  pageTree: DocumentTreeNode[];
  otherOwned: DocumentTreeNode[];
  sharedAssets: SiteDeletionPreview["sharedAssets"];
  counts: SiteDeletionPreview["counts"];
};

// ─── Tree ─────────────────────────────────────────────────────────────────────

/**
 * Builds a nested tree from a flat list of owned documents.
 * Page-type documents are nested by their parent reference.
 * Non-page documents (navbar, footer, redirects) are returned separately as a flat list.
 */
export function buildSiteDocumentTree(docs: DeletionCandidate[]): {
  pageTree: DocumentTreeNode[];
  otherOwned: DocumentTreeNode[];
} {
  const nodeMap = new Map<string, DocumentTreeNode>();

  for (const d of docs) {
    nodeMap.set(d._id, { ...d, children: [] });
  }

  const pageTree: DocumentTreeNode[] = [];
  const otherOwned: DocumentTreeNode[] = [];

  for (const node of nodeMap.values()) {
    if (!isPageType(node._type)) {
      otherOwned.push(node);
      continue;
    }

    const parentId = node.parent?._id;
    if (parentId && nodeMap.has(parentId)) {
      nodeMap.get(parentId)!.children.push(node);
    } else {
      pageTree.push(node);
    }
  }

  return { pageTree, otherOwned };
}

// ─── Preparation ──────────────────────────────────────────────────────────────

/**
 * Derives all data the deletion/archive UI needs from the raw preview.
 * This is the single entry point — components should call this rather than
 * buildSiteDocumentTree directly.
 */
export function prepareDeletionData(
  data: SiteDeletionPreview,
): PreparedDeletionData {
  const { pageTree, otherOwned } = buildSiteDocumentTree(data.owned);

  return {
    siteName: data.site.title,
    pageTree,
    otherOwned,
    sharedAssets: data.sharedAssets,
    counts: data.counts,
  };
}

// ─── Tree traversal ───────────────────────────────────────────────────────────

/**
 * Walks the tree to find the ancestor trail for a given node id.
 * Returns an ordered array from root to the target node, or null if not found.
 */
export function findAncestors(
  id: string,
  tree: DocumentTreeNode[],
  trail: Breadcrumb[] = [],
): Breadcrumb[] | null {
  for (const node of tree) {
    const current = [
      ...trail,
      { _id: node._id, title: node.title, slug: node.slug },
    ];
    if (node._id === id) return current;
    const found = findAncestors(id, node.children, current);
    if (found) return found;
  }
  return null;
}

/**
 * Finds a single node anywhere in the tree by id.
 */
export function findNode(
  id: string,
  tree: DocumentTreeNode[],
): DocumentTreeNode | null {
  for (const node of tree) {
    if (node._id === id) return node;
    const found = findNode(id, node.children);
    if (found) return found;
  }
  return null;
}

/**
 * Flattens the entire tree into a single array, depth-first.
 */
export function flattenTree(nodes: DocumentTreeNode[]): DocumentTreeNode[] {
  return nodes.flatMap((n) => [n, ...flattenTree(n.children)]);
}
