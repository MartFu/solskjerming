import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  Flex,
  Spinner,
  Stack,
  Text,
  TextInput,
  useToast,
} from "@sanity/ui";
import { AddIcon, SearchIcon } from "@sanity/icons";
import { useDocumentStore } from "sanity";
import { usePaneRouter } from "sanity/structure";
import { map } from "rxjs";
import {
  buildTree,
  flattenTree,
  type TreeNode,
  type RoutableDoc,
} from "@/utils/page-tree";
import { API_VERSION } from "@/utils/env";
import { DrillDownTree } from "./DrillDownTree";
import { ExpandableTree } from "./ExpandableTree";
import { SearchResults } from "./SearchResults";
import {
  PageCreationProvider,
  usePageCreation,
} from "@/context/PageCreationProvider";
import { moduleRegistry } from "@/schemaTypes/documents/modules";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface PageTreeOptions {
  siteId: string;
  enabledPackages: string[];
}

export interface PageTreePaneProps {
  siteId: string;
  enabledPackages: string[];
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
// Inner content (has access to PageCreationContext)
// ─────────────────────────────────────────────────────────────

function PageTreeContent({
  siteId,
  enabledPackages,
}: {
  siteId: string;
  enabledPackages: string[];
}) {
  const documentStore = useDocumentStore();
  const paneRouter = usePaneRouter();
  const isNarrow = useIsNarrow();
  const { openCreationModal } = usePageCreation();

  const [searchQuery, setSearchQuery] = useState("");
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [allNodes, setAllNodes] = useState<TreeNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ── Tree query from registry ──────────────────────────────
  const query = useMemo(
    () => moduleRegistry.buildTreeQuery(enabledPackages),
    [enabledPackages],
  );

  // ── Subscribe to live document data ───────────────────────
  useEffect(() => {
    const subscription = documentStore
      .listenQuery(query, { siteId }, { apiVersion: API_VERSION })
      .pipe(
        map((docs: RoutableDoc[]) => {
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
  }, [documentStore, siteId, query]);

  const openEditor = useCallback(
    (docId: string, docType: string) => {
      paneRouter.navigateIntent("edit", { id: docId, type: docType });
    },
    [paneRouter],
  );

  // ── Creation options from registry ────────────────────────
  const rootCreationOptions = useMemo(
    () => moduleRegistry.getCreationOptions(undefined, enabledPackages),
    [enabledPackages],
  );

  // ── Search ────────────────────────────────────────────────
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

  if (isLoading) {
    return (
      <Flex
        justify="center"
        align="center"
        flex={1}
        padding={4}
        gap={2}
      >
        <Spinner />
        <Text muted>Laster sidetreet…</Text>
      </Flex>
    );
  }

  return (
    <Stack
      space={0}
      style={{ height: "100%" }}
      flex={1}
    >
      {/* Search + New */}
      <Card
        paddingX={3}
        borderTop
        borderBottom
        flex={1}
        style={{ height: "49px" }}
      >
        <Flex
          flex={1}
          gap={1}
          height={"fill"}
          align="center"
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
          <Box>
            <Button
              icon={AddIcon}
              mode="ghost"
              text="Ny side"
              tone="neutral"
              fontSize={1}
              padding={3}
              onClick={() =>
                openCreationModal({
                  options: rootCreationOptions,
                  parentNode: null,
                  ancestors: [],
                })
              }
            /> 
          </Box>
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
          />
        ) : (
          <ExpandableTree
            tree={tree}
            siteId={siteId}
            enabledPackages={enabledPackages}
            onEdit={openEditor}
          />
        )}
      </Box>
    </Stack>
  );
}

// ─────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────

export function PageTreePane({ siteId, enabledPackages }: PageTreePaneProps) {
  return (
    <PageCreationProvider
      siteId={siteId}
    >
      <PageTreeContent
        siteId={siteId}
        enabledPackages={enabledPackages}
      />
    </PageCreationProvider>
  );
}
