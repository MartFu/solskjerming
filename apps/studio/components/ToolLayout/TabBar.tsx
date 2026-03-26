/**
 * TabBar.tsx
 *
 * Browser-style tab strip rendered inside the TopBar.
 * Features:
 *  - Chromium-style tabs with close buttons
 *  - Double-click to rename
 *  - Add-tab (+) button
 *  - Keyboard accessible
 */

import { useRef, useState, useCallback, useEffect } from "react";
import { AddIcon, CloseIcon, InfoOutlineIcon } from "@sanity/icons";
import { useToolLayout } from "@/context/ToolLayoutProvider";
import { Box, Button, Flex, Popover, Text } from "@sanity/ui";
import type { Tab } from "@/utils/types";
import { useRouter } from "sanity/router";
import styled from "styled-components";

// ─── Inline styles (no extra CSS file needed) ────────────────────────────────

const BAR_HEIGHT = 28;

const TabItem = styled.div<{
  $active: boolean;
}>`
  position: relative;
  display: flex;
  align-items: center;
  gap: 4px;
  /* Using props for dynamic height if needed, or a constant */
  height: ${BAR_HEIGHT}px;
  max-width: 200px;
  min-width: 80px;
  padding: 0 8px 0 12px;
  cursor: pointer;
  user-select: none;
  border-radius: 3px;
  border-bottom: none;
  font-size: 12px;
  overflow: hidden;
  flex-shrink: 1;
  transition:
    background 0.12s,
    color 0.12s;

  /* Handle 'active' state via props */
  background: ${(props) =>
    props.$active ? "var(--card-border-color)" : "transparent"};
  color: ${(props) =>
    props.$active ? "var(--card-fg-color)" : "var(--card-muted-fg-color)"};
  font-weight: ${(props) => (props.$active ? 500 : 400)};

  /* The Hover Style */
  &:hover {
    background: ${
      (props) =>
        props.$active
          ? "var(--card-border-color)" // Keep same if active
          : "var(--card-muted-bg-color)" // Subtle gray if inactive
    };
    color: var(--card-fg-color);
  }
`;

const styles = {
  strip: {
    display: "flex",
    alignItems: "flex-end",
    gap: 0,
    height: BAR_HEIGHT,
    overflow: "hidden",
    flex: 1,
    minWidth: 0,
  } satisfies React.CSSProperties,

  tab: (active: boolean, hovered?: boolean): React.CSSProperties => {
    return {
      position: "relative",
      display: "flex",
      alignItems: "center",
      gap: 4,
      height: BAR_HEIGHT - 2,
      maxWidth: 200,
      minWidth: 80,
      padding: "0 8px 0 12px",
      cursor: "pointer",
      userSelect: "none",
      borderRadius: "3px",
      borderBottom: "none",
      background: active ? "var(--card-border-color)" : "transparent",
      color: active ? "var(--card-fg-color)" : "var(--card-muted-fg-color)",
      fontSize: 12,
      fontWeight: active ? 500 : 400,
      transition: "background 0.12s, color 0.12s",
      overflow: "hidden",
      flexShrink: 1,

      // Subtle hover for inactive
      ...(active
        ? {}
        : { ["--tab-hover-bg" as string]: "var(--card-neutral-bg-color)" }),
    };
  },

  tabLabel: {
    flex: 1,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
    lineHeight: "1",
  },

  closeBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 16,
    height: 16,
    borderRadius: 3,
    flexShrink: 0,
    opacity: 0.6,
    color: "inherit",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: 0,
  } satisfies React.CSSProperties,

  addBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 28,
    height: 28,
    borderRadius: 4,
    flexShrink: 0,
    marginLeft: 4,
    alignSelf: "center",
    opacity: 0.7,
    color: "var(--card-muted-fg-color)",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    transition: "background 0.12s, opacity 0.12s",
  } satisfies React.CSSProperties,

  editInput: {
    flex: 1,
    minWidth: 0,
    background: "transparent",
    border: "none",
    outline: "none",
    fontSize: 12,
    fontWeight: 500,
    color: "var(--card-fg-color)",
    padding: 0,
  } satisfies React.CSSProperties,
} as const;

// ─── Single Tab pill ──────────────────────────────────────────────────────────

function TabPill({ tab, active }: { tab: Tab; active: boolean }) {
  const { setActiveTab, removeTab, renameTab, tabs } = useToolLayout();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(tab.label);
  const inputRef = useRef<HTMLInputElement>(null);
  const [hovered, setHovered] = useState(false);

  const commitRename = useCallback(() => {
    const trimmed = draft.trim();
    renameTab(tab.id, trimmed || tab.label);
    setEditing(false);
  }, [draft, renameTab, tab.id, tab.label]);

  const startEdit = useCallback(() => {
    setDraft(tab.label);
    setEditing(true);
    // Focus after state flush
    setTimeout(() => inputRef.current?.select(), 0);
  }, [tab.label]);

  const canClose = tabs.length > 1;

  return (
    <TabItem
      $active={active}
      role="tab"
      aria-selected={active}
      tabIndex={active ? 0 : -1}
      onClick={() => !editing && setActiveTab(tab.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onDoubleClick={startEdit}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !editing) setActiveTab(tab.id);
      }}
      title={
        editing ? undefined : `${tab.label} — dubbelklikk for å gi nytt navn`
      }
    >
      {editing ? (
        <input
          ref={inputRef}
          style={styles.editInput}
          value={draft}
          autoFocus
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitRename}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitRename();
            if (e.key === "Escape") setEditing(false);
            e.stopPropagation();
          }}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span style={styles.tabLabel}>{tab.label}</span>
      )}

      {canClose && hovered && (
        <Button
          tone={"critical"}
          mode={"bleed"}
          aria-label={`Lukk fane "${tab.label}"`}
          title={`Lukk fane "${tab.label}"`}
          onClick={(e) => {
            e.stopPropagation();
            removeTab(tab.id);
          }}
          fontSize={0}
          padding={1}
          icon={CloseIcon}
        />
      )}
    </TabItem>
  );
}

const hideScrollbarStyles = {
  msOverflowStyle: "none",
  scrollbarWidth: "none",
};

// ─── Tab strip ───────────────────────────────────────────────────────────────

export function TabBar() {
  const { tabs, activeTabId, addTab, activeSite, tabsEnabled, maxTabs, workspace } =
    useToolLayout();
  const [isOverTrigger, setIsOverTrigger] = useState(false);
  const [isOverContent, setIsOverContent] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleNavigate = () => {
    router.navigateUrl({
      path: `/${workspace}/structure/studio-settings`,
      replace: true,
    });
  };

  useEffect(() => {
    // If we are hovering over either the icon or the menu, open immediately
    if (isOverTrigger || isOverContent) {
      setIsOpen(true);
      return;
    }

    // If we left both, wait 200ms before closing
    const timer = setTimeout(() => {
      setIsOpen(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [isOverTrigger, isOverContent]);

  if (!tabsEnabled) return null;

  const canAddTab = tabsEnabled && tabs.length < maxTabs;

  return (
    <Flex
      flex={1}
      gap={1}
      height={"fill"}
      align="center"
      role="tablist"
      aria-label="Studio-faner"
      style={{
        minWidth: 0,
        overflowX: "auto",
        ...(hideScrollbarStyles as React.CSSProperties),
      }}
    >
      {tabs.map((tab) => (
        <TabPill
          key={tab.id}
          tab={tab}
          active={tab.id === activeTabId}
        />
      ))}

      {canAddTab && (
        <Button
          style={{ marginLeft: "6px" }}
          aria-label="Ny fane"
          disabled={!canAddTab}
          title="Ny fane"
          onClick={() => addTab(activeSite?.title, activeSite?._id)}
          icon={AddIcon}
          fontSize={0}
          radius={2}
          padding={2}
          tone="primary"
          mode="bleed"
        />
      )}

      {!canAddTab && (
        <Flex
          align="center"
          justify="center"
          height="fill"
          paddingX={3}
        >
          <Popover
            style={{ maxWidth: "280px" }}
            placement="bottom-start"
            portal
            open={isOpen}
            content={
              <Box
                onMouseEnter={() => setIsOverContent(true)}
                onMouseLeave={() => setIsOverContent(false)}
                paddingY={2}
                paddingX={1}
              >
                <Text
                  size={1}
                  style={{ padding: "2px 4px" }}
                >
                  Faner er ressurskrevende, og er i utgangspunktet avkortet til
                  maksimalt 5. Du kan endre dette i{" "}
                  <span
                    role="link"
                    tabIndex={0}
                    style={{
                      color: "var(--card-link-color)",
                      cursor: "pointer",
                      textDecoration: "underline",
                    }}
                    onClick={handleNavigate}
                    onKeyDown={(e) => e.key === "Enter" && handleNavigate()}
                  >
                    Studioinnstillingene.
                  </span>
                </Text>
              </Box>
            }
          >
            <InfoOutlineIcon
              onMouseEnter={() => setIsOverTrigger(true)}
              onMouseLeave={() => setIsOverTrigger(false)}
            />
          </Popover>
        </Flex>
      )}
    </Flex>
  );
}
