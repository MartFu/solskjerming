import React, { useState, useMemo, useCallback } from "react";
import {
  Box,
  Card,
  Dialog,
  Flex,
  Spinner,
  Stack,
  Text,
  useToast,
} from "@sanity/ui";
import { useClient } from "sanity";
import { useProducts } from "../hooks/useProducts";
import { buildFolderTree } from "../folderTree";
import { FolderSidebar } from "./FolderSidebar";
import { ProductList } from "./ProductList";
import { ProductDetailPane } from "./ProductDetailPane";
import { FolderDialog } from "./FolderDialog";
import type {
  FolderTreeNode,
  ProductListItem,
  ProductsPluginConfig,
} from "../types";
import { API_VERSION } from '@/utils/env';
import { useSites } from "../hooks/useSites";

interface ProductsViewProps {
  config: ProductsPluginConfig;
}

type FolderDialogState =
  | { mode: "create"; parentId: string | null; parentName?: string }
  | { mode: "rename"; id: string; currentName: string }
  | null;

export function ProductsView({ config }: ProductsViewProps) {
  const client = useClient({ apiVersion: API_VERSION });
  const toast = useToast();
  const { products, folders, loading, error, refresh } = useProducts();
  const { sites } = useSites(config);

  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [folderDialog, setFolderDialog] = useState<FolderDialogState>(null);

  // Build folder tree
  const { roots, unassigned } = useMemo(
    () => buildFolderTree(folders, products),
    [folders, products],
  );

  // Determine which products to show in the list pane
  const visibleProducts = useMemo<ProductListItem[]>(() => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return products.filter((p) => p.name.toLowerCase().includes(q));
    }
    if (selectedFolderId === null) return products;
    if (selectedFolderId === "__unassigned__") return unassigned;

    // Collect all products under the selected folder (including sub-folders)
    function collect(nodes: FolderTreeNode[]): ProductListItem[] {
      const acc: ProductListItem[] = [];
      for (const n of nodes) {
        if (n._id === selectedFolderId) {
          acc.push(...n.products);
          acc.push(...collectChildren(n.children));
        } else {
          acc.push(...collect(n.children));
        }
      }
      return acc;
    }
    function collectChildren(nodes: FolderTreeNode[]): ProductListItem[] {
      return nodes.flatMap((n) => [
        ...n.products,
        ...collectChildren(n.children),
      ]);
    }
    return collect(roots);
  }, [products, unassigned, roots, selectedFolderId, searchQuery]);

  // ── Folder CRUD ─────────────────────────────────────────────────────────────

  const handleCreateFolder = useCallback(
    async (name: string, color?: string) => {
      const parentId =
        folderDialog?.mode === "create" ? folderDialog.parentId : null;

      await client.create({
        _type: "productFolder",
        name,
        ...(color ? { color } : {}),
        ...(parentId ? { parent: { _type: "reference", _ref: parentId } } : {}),
      });
      refresh();
      toast.push({ title: `Folder "${name}" created`, status: "success" });
    },
    [client, folderDialog, refresh, toast],
  );

  const handleRenameFolder = useCallback(
    async (name: string) => {
      if (folderDialog?.mode !== "rename") return;
      await client.patch(folderDialog.id).set({ name }).commit();
      refresh();
      toast.push({ title: `Folder renamed to "${name}"`, status: "success" });
    },
    [client, folderDialog, refresh, toast],
  );

  const handleDeleteFolder = useCallback(
    async (id: string) => {
      // Check if any products live in this folder
      const productsInFolder = products.filter((p) => p.folder?._id === id);
      if (productsInFolder.length > 0) {
        toast.push({
          title: "Cannot delete folder",
          description: `Move or reassign the ${productsInFolder.length} product(s) in this folder first.`,
          status: "error",
        });
        return;
      }
      if (
        !window.confirm(
          "Delete this folder? Sub-folders will become root folders.",
        )
      )
        return;
      await client.delete(id);
      refresh();
      if (selectedFolderId === id) setSelectedFolderId(null);
      toast.push({ title: "Folder deleted", status: "success" });
    },
    [client, products, refresh, selectedFolderId, toast],
  );

  // ── Product CRUD ─────────────────────────────────────────────────────────────

  const handleCreateProduct = useCallback(async () => {
    const newDoc = await client.create({
      _type: "product",
      name: "New product",
      status: "draft",
      pricingType: "fixed",
      ...(selectedFolderId && selectedFolderId !== "__unassigned__"
        ? { folder: { _type: "reference", _ref: selectedFolderId } }
        : {}),
    });
    refresh();
    setSelectedProductId(newDoc._id);
    toast.push({ title: "Product created", status: "success" });
  }, [client, selectedFolderId, refresh, toast]);

  const handleDeleteProduct = useCallback(
    async (id: string) => {
      if (!window.confirm("Delete this product?")) return;
      await client.delete(id);
      refresh();
      if (selectedProductId === id) setSelectedProductId(null);
      toast.push({ title: "Product deleted", status: "success" });
    },
    [client, refresh, selectedProductId, toast],
  );

  const handleDuplicateProduct = useCallback(
    async (id: string) => {
      const source = products.find((p) => p._id === id);
      if (!source) return;
      const full = await client.getDocument(id);
      if (!full) return;
      const { _id, _rev, _createdAt, _updatedAt, ...rest } = full as any;
      const newDoc = await client.create({
        ...rest,
        name: `${source.name} (copy)`,
        status: "draft",
        slug: undefined,
      });
      refresh();
      setSelectedProductId(newDoc._id);
      toast.push({ title: "Product duplicated", status: "success" });
    },
    [client, products, refresh, toast],
  );

  // ── Render ───────────────────────────────────────────────────────────────────

  if (error) {
    return (
      <Flex
        align="center"
        justify="center"
        style={{ height: "100%" }}
      >
        <Card
          tone="critical"
          padding={4}
          radius={2}
        >
          <Text>Failed to load products: {error.message}</Text>
        </Card>
      </Flex>
    );
  }

  return (
    <Flex style={{ height: "100%", overflow: "hidden" }}>
      {/* Left: folder sidebar */}
      <FolderSidebar
        roots={roots}
        unassigned={unassigned}
        selectedFolderId={selectedFolderId}
        onSelectFolder={setSelectedFolderId}
        onCreateFolder={(parentId) => {
          const parent = folders.find((f) => f._id === parentId);
          setFolderDialog({
            mode: "create",
            parentId,
            parentName: parent?.name,
          });
        }}
        onRenameFolder={(id, currentName) =>
          setFolderDialog({ mode: "rename", id, currentName })
        }
        onDeleteFolder={handleDeleteFolder}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          if (q) setSelectedFolderId(null);
        }}
      />

      {/* Centre: product list */}
      <ProductList
        products={visibleProducts}
        loading={loading}
        selectedProductId={selectedProductId}
        onSelect={setSelectedProductId}
        onCreateProduct={handleCreateProduct}
        onDeleteProduct={handleDeleteProduct}
        onDuplicateProduct={handleDuplicateProduct}
      />

      {/* Right: detail pane */}
      {selectedProductId && (
        <ProductDetailPane
          key={selectedProductId}
          productId={selectedProductId}
          sites={sites}
          onClose={() => setSelectedProductId(null)}
          onDeleted={() => {
            setSelectedProductId(null);
            refresh();
          }}
        />
      )}

      {/* Folder create/rename dialog */}
      {folderDialog && (
        <FolderDialog
          mode={folderDialog.mode}
          initialName={
            folderDialog.mode === "rename" ? folderDialog.currentName : ""
          }
          parentName={
            folderDialog.mode === "create" ? folderDialog.parentName : undefined
          }
          onConfirm={
            folderDialog.mode === "create"
              ? handleCreateFolder
              : handleRenameFolder
          }
          onClose={() => setFolderDialog(null)}
        />
      )}
    </Flex>
  );
}
