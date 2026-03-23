import type { ChildTypeInfo, TreeNode } from "@/utils/page-tree";

export interface ExpandableTreeProps {
  tree: TreeNode[];
  siteId: string;
  enabledPackages: string[];
  onEdit: (docId: string, docType: string) => void;
}

export interface DrillDownTreeProps {
  tree: TreeNode[];
  siteId: string;
  enabledPackages: string[];
  onEdit: (docId: string, docType: string) => void;
}

export interface CreatePageModalProps {
  /** Available types at this level */
  types: ChildTypeInfo[];
  /** The node under which we're creating, or null for root */
  parentNode: TreeNode | null;
  /** Ancestor chain from root down to (not including) parentNode */
  ancestors: TreeNode[];
  onConfirm: (type: string, templateId: string, title?: string) => void;
  onClose: () => void;
}

export interface SearchResultsProps {
  results: TreeNode[];
  onEdit: (docId: string, docType: string) => void;
  onClear: () => void;
}

export interface ModalState {
  types: ChildTypeInfo[];
  parentNode: TreeNode | null;
  ancestors: TreeNode[];
}
