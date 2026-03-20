import { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Button, Card, Flex, Stack, Text, TextInput } from "@sanity/ui";
import { AddIcon, SearchIcon } from "@sanity/icons";
import { useDocumentStore } from "sanity";
import { usePaneRouter } from "sanity/structure";
import { map } from "rxjs";

import {
  buildTree,
  buildTreeQuery,
  flattenTree,
  type TreeNode,
  type RoutableDoc,
  getChildTypes,
} from "@/utils/page-tree";
import { API_VERSION } from "@/utils/constant";
import { useRouter } from "sanity/router";

import { DrillDownTree } from "./DrillDownTree";
import { ExpandableTree } from "./ExpandableTree";
import { SearchResults } from "./SearchResults";
import { ModalState } from "./types";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface PageTreeOptions {
  siteId: string;
  enabledPackages: string[];
}

export interface PageTreePaneProps {
  options: PageTreeOptions;
}

// ─────────────────────────────────────────────────────────────
// Hook: viewport width check
// ─────────────────────────────────────────────────────────────

function useIsNarrow(breakpoint = 500): boolean {
  const [isNarrow, setIsNarrow] = useState(
    () => window.innerWidth < breakpoint,
  );

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      setIsNarrow(window.innerWidth < breakpoint);
    });
    observer.observe(document.body);
    return () => observer.disconnect();
  }, [breakpoint]);

  return isNarrow;
}

// ─────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────

export function PageTreePane({ options }: PageTreePaneProps) {
  const { siteId, enabledPackages } = options;
  const documentStore = useDocumentStore();
  const paneRouter = usePaneRouter();
  const router = useRouter();
  const isNarrow = useIsNarrow();

  const [searchQuery, setSearchQuery] = useState("");
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [allNodes, setAllNodes] = useState<TreeNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalState, setModalState] = useState<ModalState | null>(null);

  // Subscribe to live document data
  useEffect(() => {
    const query = buildTreeQuery(enabledPackages);

    const subscription = documentStore
      .listenQuery(query, { siteId }, { apiVersion: API_VERSION })
      .pipe(
        map((docs: RoutableDoc[]) => {
          // Deduplicate: prefer draft over published so editors always work on
          // the latest version. Fall back to published if no draft exists.
          const draftIds = new Set(
            docs
              .filter((doc) => doc._id.startsWith("drafts."))
              .map((doc) => doc._id.replace("drafts.", "")),
          );
          const dedupedDocs = docs.filter(
            (doc) => doc._id.startsWith("drafts.") || !draftIds.has(doc._id),
          );
          const builtTree = buildTree(dedupedDocs, enabledPackages);
          return { tree: builtTree, flat: flattenTree(builtTree) };
        }),
      )
      .subscribe({
        next: ({ tree: newTree, flat }) => {
          setTree(newTree);
          setAllNodes(flat);
          setIsLoading(false);
        },
        error: (err) => {
          console.error("[PageTreePane] listenQuery error:", err);
          setIsLoading(false);
        },
      });

    return () => subscription.unsubscribe();
  }, [documentStore, siteId, enabledPackages]);

  const openEditor = useCallback(
    (docId: string, docType: string) => {
      paneRouter.navigateIntent("edit", { id: docId, type: docType });
    },
    [paneRouter],
  );

  const handleCreate = useCallback(
    (
      type: string,
      templateId: string,
      parentId: string | null,
      title: string,
    ) => {
      // Always use the published ID as parent reference
      const publishedParentId = parentId?.replace(/^drafts\./, "") ?? null;
      router.navigateIntent("create", [
        { type, template: templateId },
        {
          siteId,
          ...(publishedParentId ? { parentId: publishedParentId } : {}),
          ...(title ? { title } : {}),
        },
      ]);
    },
    [router, siteId],
  );

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return allNodes.filter(
      (node) =>
        node.doc.title?.toLowerCase().includes(q) ||
        node.doc.slug?.toLowerCase().includes(q),
    );
  }, [allNodes, searchQuery]);

  const isSearching = searchQuery.trim().length > 0;
  const rootChildTypes = getChildTypes(null, enabledPackages);

  if (isLoading) {
    return (
      <Box
        flex={1}
        padding={4}
      >
        <Text muted>Laster sidetreet…</Text>
      </Box>
    );
  }

  return (
    <Stack
      space={0}
      style={{ height: "100%" }}
      flex={1}
    >
      {/* Search */}
      <Card
        paddingBottom={3}
        paddingX={3}
        borderBottom
        flex={1}
      >
        <Flex
          flex={1}
          gap={1}
        >
          <Box flex={1}>
            <TextInput
              icon={SearchIcon}
              placeholder="Søk etter side…"
              value={searchQuery}
              fontSize={1}
              style={{ width: "100%", flex: 1 }}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
            />
          </Box>
          <Button
            icon={AddIcon}
            mode="ghost"
            tone="primary"
            fontSize={1}
            padding={2}
            style={{ width: 32 }}
            onClick={() =>
              setModalState({
                types: rootChildTypes,
                parentNode: null,
                ancestors: [],
              })
            }
          />
        </Flex>
      </Card>

      {/* Content */}
      <Box
        flex={1}
        overflow="auto"
      >
        {isSearching ? (
          <SearchResults
            results={searchResults}
            onEdit={openEditor}
            onClear={() => setSearchQuery("")}
          />
        ) : isNarrow ? (
          <DrillDownTree
            tree={tree}
            siteId={siteId}
            enabledPackages={enabledPackages}
            onEdit={openEditor}
            onCreate={handleCreate}
          />
        ) : (
          <ExpandableTree
            tree={tree}
            siteId={siteId}
            enabledPackages={enabledPackages}
            rootChildTypes={rootChildTypes}
            modalState={modalState}
            onSetModalState={setModalState}
            onEdit={openEditor}
            onCreate={handleCreate}
          />
        )}
      </Box>
    </Stack>
  );
}
