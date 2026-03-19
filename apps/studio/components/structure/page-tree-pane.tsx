import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  Dialog,
  Flex,
  Inline,
  Stack,
  Text,
  TextInput,
} from "@sanity/ui";
import {
  AddIcon,
  ChevronRightIcon,
  EditIcon,
  SearchIcon,
  FolderIcon,
  DocumentIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
} from "@sanity/icons";
import { useDocumentStore } from "sanity";
import { usePaneRouter } from "sanity/structure";
import { map } from "rxjs";

import {
  buildTree,
  buildTreeQuery,
  flattenTree,
  findNode,
  getAncestors,
  getChildTypes,
  getTypeDisplay,
  type TreeNode,
  type RoutableDoc,
  type ChildTypeInfo,
} from "@/utils/page-tree";
import { API_VERSION } from "@/utils/constant";
import { useRouter } from "sanity/router";
import { Map } from "lucide-react";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface PageTreeOptions {
  siteId: string;
  enabledPackages: string[];
}

/**
 * Sanity passes component pane props with an `options` object
 * that carries whatever we set in the structure definition.
 */
interface PageTreePaneProps {
  options: PageTreeOptions;
}

interface NavigationState {
  /** null = root level (top-level pages) */
  currentParentId: string | null;
}

// ─────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────

export function PageTreePane({ options }: PageTreePaneProps) {
  const { siteId, enabledPackages } = options;
  const documentStore = useDocumentStore();
  const paneRouter = usePaneRouter();

  // Navigation state
  const [nav, setNav] = useState<NavigationState>({ currentParentId: null });
  const [searchQuery, setSearchQuery] = useState("");
  const [showSiteMap, setShowSiteMap] = useState(false);

  // Tree data from live query
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [allNodes, setAllNodes] = useState<TreeNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Subscribe to live document data
  useEffect(() => {
    const query = buildTreeQuery(enabledPackages);

    const subscription = documentStore
      .listenQuery(query, { siteId }, { apiVersion: API_VERSION })
      .pipe(
        map((docs: RoutableDoc[]) => {
          const builtTree = buildTree(docs, enabledPackages);
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

  // ─────────────────────────────────────────────────────────
  // Derived state
  // ─────────────────────────────────────────────────────────

  const currentNode = useMemo(() => {
    if (!nav.currentParentId) return null;
    return findNode(tree, nav.currentParentId);
  }, [tree, nav.currentParentId]);

  const currentChildren = useMemo(() => {
    if (!nav.currentParentId) return tree;
    return currentNode?.children ?? [];
  }, [tree, nav.currentParentId, currentNode]);

  const breadcrumbs = useMemo(() => {
    if (!nav.currentParentId) return [];
    const ancestors = getAncestors(tree, nav.currentParentId);
    // Include the current node itself at the end
    if (currentNode) return [...ancestors, currentNode];
    return ancestors;
  }, [tree, nav.currentParentId, currentNode]);

  const currentParentType = currentNode?.doc._type ?? null;

  const creatableTypes = useMemo(
    () => getChildTypes(currentParentType, enabledPackages),
    [currentParentType, enabledPackages],
  );

  // Search results
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

  // ─────────────────────────────────────────────────────────
  // Navigation handlers
  // ─────────────────────────────────────────────────────────

  const navigateTo = useCallback((parentId: string | null) => {
    setNav({ currentParentId: parentId });
    setSearchQuery("");
  }, []);

  const openEditor = useCallback(
    (docId: string, docType: string) => {
      // Navigate the pane router to open the document editor
      // in the child pane to the right
      paneRouter.navigateIntent("edit", {
        id: docId,
        type: docType,
      });
    },
    [paneRouter],
  );

  const handleRowClick = useCallback(
    (node: TreeNode) => {
      if (node.canHaveChildren) {
        navigateTo(node.doc._id);
      } else {
        openEditor(node.doc._id, node.doc._type);
      }
    },
    [navigateTo, openEditor],
  );

  const handleSearchResultClick = useCallback(
    (node: TreeNode) => {
      // Navigate to the node's parent level, so the user sees
      // the node in context within the tree
      navigateTo(node.doc.parentRef);
    },
    [navigateTo],
  );

  // ─────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────

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
    >
      {/* Search */}
      <Card
        padding={3}
        borderBottom
      >
        <TextInput
          icon={SearchIcon}
          placeholder="Søk etter side…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
        />
      </Card>

      {/* Breadcrumb (hidden during search) */}
      {!isSearching && (
        <Breadcrumb
          crumbs={breadcrumbs}
          onNavigate={navigateTo}
        />
      )}

      {/* Content area */}
      <Box
        flex={1}
        overflow="auto"
        padding={2}
      >
        {isSearching ? (
          <SearchResults
            results={searchResults}
            onNavigate={handleSearchResultClick}
            onEdit={openEditor}
          />
        ) : (
          <Stack space={1}>
            {currentChildren.length === 0 ? (
              <Box padding={3}>
                <Text
                  muted
                  size={1}
                >
                  Ingen undersider ennå.
                </Text>
              </Box>
            ) : (
              currentChildren.map((node) => (
                <TreeRow
                  key={node.doc._id}
                  node={node}
                  onClick={handleRowClick}
                  onEdit={openEditor}
                />
              ))
            )}
          </Stack>
        )}
      </Box>

      {/* Bottom bar: create + sitemap */}
      {!isSearching && (
        <Card
          padding={3}
          borderTop
        >
          <Flex
            justify="space-between"
            align="center"
          >
            <CreateActions
              types={creatableTypes}
              siteId={siteId}
              parentId={nav.currentParentId}
              onEdit={openEditor}
            />
            <Button
              icon={<Map style={{ width: 16, height: 16 }} />}
              text="Sidekart"
              mode="ghost"
              tone="default"
              onClick={() => setShowSiteMap(true)}
            />
          </Flex>
        </Card>
      )}

      {/* Sitemap modal */}
      {showSiteMap && (
        <SiteMapModal
          tree={tree}
          currentId={nav.currentParentId}
          onNavigate={(id) => {
            navigateTo(id);
            setShowSiteMap(false);
          }}
          onClose={() => setShowSiteMap(false)}
        />
      )}
    </Stack>
  );
}

// ─────────────────────────────────────────────────────────────
// Breadcrumb
// ─────────────────────────────────────────────────────────────

function Breadcrumb({
  crumbs,
  onNavigate,
}: {
  crumbs: TreeNode[];
  onNavigate: (id: string | null) => void;
}) {
  return (
    <Card
      padding={1}
      borderBottom
      style={{
        borderStyle: "dashed",
        borderTop: "none",
        borderLeft: "none",
        borderRight: "none",
      }}
    >
      <Flex
        align="center"
        gap={1}
        wrap="wrap"
      >
        <Button
          mode="bleed"
          padding={2}
          onClick={() => onNavigate(null)}
          style={{ fontWeight: crumbs.length === 0 ? 700 : 400 }}
        >
          <Text size={1}>Sider</Text>
        </Button>

        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <Flex
              key={crumb.doc._id}
              align="center"
              gap={1}
            >
              <Text
                size={1}
                muted
              >
                <ChevronRightIcon />
              </Text>
              <Button
                mode="bleed"
                padding={2}
                onClick={() => onNavigate(crumb.doc._id)}
                style={{
                  fontWeight: isLast ? 700 : 400,
                }}
              >
                <Text size={1}>{crumb.doc.title ?? "Uten tittel"}</Text>
              </Button>
            </Flex>
          );
        })}
      </Flex>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────
// Tree row
// ─────────────────────────────────────────────────────────────

function TreeRow({
  node,
  onClick,
  onEdit,
}: {
  node: TreeNode;
  onClick: (node: TreeNode) => void;
  onEdit: (docId: string, docType: string) => void;
}) {
  const display = getTypeDisplay(node.doc._type);
  const Icon = node.canHaveChildren ? FolderIcon : DocumentIcon;
  const title = node.doc.title ?? "Uten tittel";
  const slug = node.doc.slug;
  const isPrivate = node.doc.seoNoIndex;

  return (
    <Card
      padding={2}
      radius={2}
      style={{ cursor: "pointer", position: "relative" }}
      onClick={() => onClick(node)}
      as="button"
      tone="neutral"
    >
      {/* Type badge */}

      <Flex
        align="center"
        gap={3}
      >
        <Box>
          <Text
            size={1}
            muted
          >
            <DocumentIcon />
          </Text>
        </Box>

        {/* Title + slug */}
        <Stack space={1}>
          <Text
            size={1}
            weight="medium"
          >
            {title}
          </Text>
          {slug && (
            <Text
              size={0}
              muted
            >
              {slug}
              {isPrivate && " · skjult"}
            </Text>
          )}
        </Stack>

        {/* Edit button (for nodes with children) */}
        {node.canHaveChildren && (
          <Button
            icon={EditIcon}
            mode="ghost"
            tone="primary"
            style={{ marginLeft: "auto" }}
            padding={2}
            onClick={(e) => {
              e.stopPropagation();
              onEdit(node.doc._id, node.doc._type);
            }}
          />
        )}

        {/* Chevron for navigable nodes */}
        {node.canHaveChildren && (
          <Text
            size={1}
            muted
          >
            <ChevronRightIcon />
          </Text>
        )}
      </Flex>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────
// Search results
// ─────────────────────────────────────────────────────────────

function SearchResults({
  results,
  onNavigate,
  onEdit,
}: {
  results: TreeNode[];
  onNavigate: (node: TreeNode) => void;
  onEdit: (docId: string, docType: string) => void;
}) {
  if (results.length === 0) {
    return (
      <Box padding={3}>
        <Text
          muted
          size={1}
        >
          Ingen resultater.
        </Text>
      </Box>
    );
  }

  return (
    <Stack space={1}>
      {results.map((node) => (
        <Card
          key={node.doc._id}
          padding={2}
          radius={2}
          style={{ cursor: "pointer" }}
          onClick={() => onNavigate(node)}
        >
          <Flex
            align="center"
            gap={3}
          >
            <Box>
              <Text
                size={1}
                muted
              >
                <DocumentIcon />
              </Text>
            </Box>

            <Stack
              space={1}
              flex={1}
            >
              <Text
                size={1}
                weight="medium"
              >
                {node.doc.title ?? "Uten tittel"}
              </Text>
              <Text
                size={0}
                muted
              >
                {node.doc.slug}
              </Text>
            </Stack>

            <Button
              icon={EditIcon}
              mode="ghost"
              tone="primary"
              padding={2}
              onClick={(e) => {
                e.stopPropagation();
                onEdit(node.doc._id, node.doc._type);
              }}
            />
          </Flex>
        </Card>
      ))}
    </Stack>
  );
}

// ─────────────────────────────────────────────────────────────
// Create actions
// ─────────────────────────────────────────────────────────────

function CreateActions({
  types,
  siteId,
  parentId,
  onEdit,
}: {
  types: ChildTypeInfo[];
  siteId: string;
  parentId: string | null;
  onEdit: (docId: string, docType: string) => void;
}) {
  const router = useRouter();

  if (types.length === 0) return null;

  const handleCreate = (typeInfo: ChildTypeInfo) => {
    // Use Sanity's intent system to create a new document
    // with the initial value template that pre-fills site + parent
    router.navigateIntent("create", [
      {
        type: typeInfo.type,
        template: typeInfo.templateId,
      },
      {
        siteId,
        ...(parentId ? { parentId } : {}),
      },
    ]);
  };

  // Determine if we're at root level (no parent) or in a subpage
  const isRootLevel = parentId === null;

  if (types.length === 1) {
    const typeInfo = types[0];
    // Use context-aware titles if available
    const buttonText = isRootLevel 
      ? `Opprett ${(typeInfo.rootTitle || typeInfo.title).toLowerCase()}`
      : `Opprett ${(typeInfo.childTitle || 'underside').toLowerCase()}`;
    
    return (
      <Button
        icon={AddIcon}
        text={buttonText}
        mode="ghost"
        tone="primary"
        onClick={() => handleCreate(typeInfo)}
      />
    );
  }

  // Multiple types — show a button for each with appropriate labels
  return (
    <Inline space={2}>
      {types.map((typeInfo) => {
        const buttonText = isRootLevel 
          ? typeInfo.rootTitle || typeInfo.title
          : typeInfo.childTitle || 'Underside';
        
        return (
          <Button
            key={typeInfo.type}
            icon={AddIcon}
            text={buttonText}
            mode="ghost"
            tone="primary"
            onClick={() => handleCreate(typeInfo)}
          />
        );
      })}
    </Inline>
  );
}


// ─────────────────────────────────────────────────────────────
// Sitemap modal
// ─────────────────────────────────────────────────────────────

function SiteMapModal({
  tree,
  currentId,
  onNavigate,
  onClose,
}: {
  tree: TreeNode[];
  currentId: string | null;
  onNavigate: (id: string | null) => void;
  onClose: () => void;
}) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(() => {
    // Auto-expand all nodes by default
    const set = new Set<string>();
    function collectIds(nodes: TreeNode[]) {
      for (const node of nodes) {
        if (node.children.length > 0) {
          set.add(node.doc._id);
          collectIds(node.children);
        }
      }
    }
    collectIds(tree);
    return set;
  });

  const [searchQuery, setSearchQuery] = useState("");

  const toggleNode = (id: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    const set = new Set<string>();
    function collectIds(nodes: TreeNode[]) {
      for (const node of nodes) {
        if (node.children.length > 0) {
          set.add(node.doc._id);
          collectIds(node.children);
        }
      }
    }
    collectIds(tree);
    setExpandedNodes(set);
  };

  const collapseAll = () => {
    setExpandedNodes(new Set());
  };

  // Filter tree based on search
  const filterTree = useCallback(
    (nodes: TreeNode[], query: string): TreeNode[] => {
      if (!query.trim()) return nodes;

      const q = query.toLowerCase();
      return nodes.reduce<TreeNode[]>((acc, node) => {
        const matches =
          node.doc.title?.toLowerCase().includes(q) ||
          node.doc.slug?.toLowerCase().includes(q) ||
          node.doc._type.toLowerCase().includes(q);

        const filteredChildren = filterTree(node.children, query);

        if (matches || filteredChildren.length > 0) {
          acc.push({
            ...node,
            children: filteredChildren,
          });
        }

        return acc;
      }, []);
    },
    [],
  );

  const filteredTree = useMemo(
    () => filterTree(tree, searchQuery),
    [tree, searchQuery, filterTree],
  );

  const totalNodes = useMemo(() => {
    const count = (nodes: TreeNode[]): number => {
      return nodes.reduce((sum, node) => sum + 1 + count(node.children), 0);
    };
    return count(tree);
  }, [tree]);

  return (
    <Dialog
      id="sitemap-modal"
      header={<Text>Sidekart</Text>}
      width={2}
      onClose={onClose}
    >
      <Stack space={0}>
        {/* Toolbar */}
        <Card
          paddingX={3}
          paddingBottom={1}
          borderBottom
        >
          {/* Legend */}
          <Flex
            align="center"
            justify="space-between"
          >
            <Flex
              gap={4}
              wrap="wrap"
            >
              <Flex
                gap={1}
                align="center"
              >
                <FolderIcon style={{ width: 16, height: 16, flexShrink: 0 }} />
                <Text
                  size={1}
                  muted
                >
                  Har undersider
                </Text>
              </Flex>
              <Flex
                gap={1}
                align="center"
              >
                <DocumentIcon
                  style={{ width: 16, height: 16, flexShrink: 0 }}
                />
                <Text
                  size={1}
                  muted
                >
                  Ingen undersider
                </Text>
              </Flex>
              <Flex
                gap={1}
                align="center"
              >
                <Box
                  style={{
                    width: 12,
                    height: 12,
                    background: "var(--card-focus-ring-color)",
                    borderRadius: "100vw",
                  }}
                />
                <Text
                  size={1}
                  muted
                >
                  Nåværende side
                </Text>
              </Flex>
            </Flex>
            <Flex
              gap={2}
              align="center"
            >
              {expandedNodes.size > 4 && (
                <Button
                  text="Kollaps alle"
                  mode="ghost"
                  onClick={collapseAll}
                  paddingY={2}
                />
              )}
                <Button
                  text="Utvid alle"
                  mode="ghost"
                  disabled={expandedNodes.size === tree.length + 1 || tree.length < totalNodes}
                  onClick={expandAll}
                  paddingY={2}
                />
            </Flex>
          </Flex>
        </Card>

        {/* Tree content */}
        <Box
          padding={0}
          style={{
            maxHeight: "60vh",
            overflow: "auto",
          }}
        >
          {filteredTree.length === 0 ? (
            <Box padding={4}>
              <Stack space={3}>
                <Text
                  size={1}
                  muted
                >
                  Ingen sider funnet
                </Text>
                {searchQuery && (
                  <Button
                    text="Tøm søk"
                    mode="ghost"
                    onClick={() => setSearchQuery("")}
                  />
                )}
              </Stack>
            </Box>
          ) : (
            <Stack space={1}>
              {filteredTree.map((node) => (
                <SiteMapNode
                  key={node.doc._id}
                  node={node}
                  currentId={currentId}
                  depth={0}
                  expandedNodes={expandedNodes}
                  onToggle={toggleNode}
                  onNavigate={onNavigate}
                  searchQuery={searchQuery}
                />
              ))}
            </Stack>
          )}
        </Box>

        {/* Footer */}
        <Card
          paddingX={3}
          paddingY={2}
          borderTop
          tone="neutral"
        >
          <Flex
            justify="space-between"
            align="center"
          >
            <Text
              size={0}
              muted
            >
              {tree.length} Rotnoder · {totalNodes} Sider totalt
            </Text>
          </Flex>
        </Card>
      </Stack>
    </Dialog>
  );
}

function SiteMapNode({
  node,
  currentId,
  depth,
  expandedNodes,
  onToggle,
  onNavigate,
  searchQuery,
}: {
  node: TreeNode;
  currentId: string | null;
  depth: number;
  expandedNodes: Set<string>;
  onToggle: (id: string) => void;
  onNavigate: (id: string | null) => void;
  searchQuery: string;
}) {
  const isExpanded = expandedNodes.has(node.doc._id);
  const isCurrent = node.doc._id === currentId;
  const hasChildren = node.children.length > 0;
  const typeDisplay = getTypeDisplay(node.doc._type);

  // Auto-expand if this node matches search
  useEffect(() => {
    if (searchQuery && !isExpanded) {
      const matches =
        node.doc.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.doc.slug?.toLowerCase().includes(searchQuery.toLowerCase());
      if (matches) {
        onToggle(node.doc._id);
      }
    }
  }, [
    searchQuery,
    node.doc._id,
    node.doc.title,
    node.doc.slug,
    isExpanded,
    onToggle,
  ]);

  return (
    <Card
      padding={2}
      tone={isCurrent ? "primary" : "default"}
      style={{
        marginLeft: depth > 0 ? 24 : 0,
        position: "relative",
      }}
      borderLeft={isCurrent}
    >
      <Flex
        align="center"
        gap={1}
      >
        {/* Expand/collapse button */}
        <Button
          mode="bleed"
          padding={1}
          disabled={!hasChildren}
          onClick={(e) => {
            e.stopPropagation();
            onToggle(node.doc._id);
          }}
          style={{ minWidth: 24 }}
        >
          <Flex
            justify="center"
            align="center"
          >
            {isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
          </Flex>
        </Button>

        {/* Page info - clickable */}
        <Flex
          flex={1}
          align="center"
          gap={2}
          onClick={() =>
            onNavigate(node.canHaveChildren ? node.doc._id : node.doc.parentRef)
          }
          style={{ cursor: "pointer" }}
        >
          {/* Page icon */}
          <Box>
            {hasChildren ? (
              <FolderIcon style={{ width: 18, height: 18, opacity: 0.7 }} />
            ) : (
              <DocumentIcon style={{ width: 18, height: 18, opacity: 0.7 }} />
            )}
          </Box>
          <Stack
            space={1}
            flex={1}
          >
            <Text
              size={1}
              weight={isCurrent ? "bold" : "regular"}
            >
              {node.doc.title || "Uten tittel"}
              {node.doc.seoNoIndex && (
                <Text
                  size={0}
                  muted
                  style={{ marginLeft: 8 }}
                >
                  (skjult)
                </Text>
              )}
            </Text>
            {node.doc.slug && (
              <Text
                size={0}
                muted
              >
                {node.doc.slug}
              </Text>
            )}
          </Stack>

          {/* Type badge with counter */}
          <Card
            padding={1}
            radius={2}
            tone="transparent"
          >
            <Flex
              gap={1}
              align="center"
            >
              <Text
                size={0}
                muted
              >
                {typeDisplay.title}
              </Text>
              {hasChildren && (
                <Card
                  padding={1}
                  radius={2}
                  tone="caution"
                >
                  <Text
                    size={0}
                    muted
                  >
                    {node.children.length}
                  </Text>
                </Card>
              )}
            </Flex>
          </Card>
        </Flex>
      </Flex>

      {/* Children */}
      {hasChildren && isExpanded && (
        <Box
          marginTop={2}
          style={{ marginLeft: 24 }}
        >
          {node.children.map((child) => (
            <SiteMapNode
              key={child.doc._id}
              node={child}
              currentId={currentId}
              depth={depth + 1}
              expandedNodes={expandedNodes}
              onToggle={onToggle}
              onNavigate={onNavigate}
              searchQuery={searchQuery}
            />
          ))}
        </Box>
      )}
    </Card>
  );
}
