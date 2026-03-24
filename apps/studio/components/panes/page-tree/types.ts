import type { TreeNode } from "@/utils/page-tree";
import type { ModuleCreationOptions } from "@/utils/modules";

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
  /** Available creation options at this level */
  options: ModuleCreationOptions[];
  /** The node under which we're creating, or null for root */
  parentNode: TreeNode | null;
  /** Ancestor chain from root down to (not including) parentNode */
  ancestors: TreeNode[];
  onConfirm: (option: ModuleCreationOptions, title?: string) => void;
  onClose: () => void;
}

export interface SearchResultsProps {
  results: TreeNode[];
  onEdit: (docId: string, docType: string) => void;
  onClear: () => void;
}

export interface ModalState {
  options: ModuleCreationOptions[];
  parentNode: TreeNode | null;
  ancestors: TreeNode[];
}
