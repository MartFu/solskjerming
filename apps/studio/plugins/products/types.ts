import { WorkspaceKey } from "@/utils/constant";

export interface ProductsPluginConfig {
  workspace: WorkspaceKey;
}

export interface Site {
  _id: string;
  title: string;
}

export interface FolderNode {
  _id: string;
  name: string;
  color?: string;
  parent?: { _id: string; name: string } | null;
  /** Populated client-side when building the tree */
  children?: FolderNode[];
}

export interface ProductListItem {
  _id: string;
  _rev: string;
  _updatedAt: string;
  name: string;
  slug: string;
  status: "active" | "draft" | "archived";
  pricingType: "fixed" | "configured";
  basePrice?: number;
  vatRate?: number;
  optionCount: number;
  folder?: FolderNode | null;
}

export interface ProductReference {
  _id: string;
  _type: string;
  title: string;
  site?: { _id: string; title: string } | null;
}

export type ViewMode = "list" | "detail";

export interface FolderTreeNode extends FolderNode {
  children: FolderTreeNode[];
  products: ProductListItem[];
}
