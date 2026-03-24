/**
 * ToolLayoutProvider.tsx
 *
 * Public surface — composes the three focused providers and exposes a single
 * useToolLayout hook. Consumers never need to know about the internal split.
 *
 * Provider nesting:
 *   TabsProvider          — tab CRUD, savedPath, URL save/restore, localStorage
 *     SiteProvider        — selectSite/clearSite, sessionStorage, ?site= deep-link
 *       PreviewProvider   — previewUrl, previewHidden
 */

import type { WorkspaceKey } from "@/utils/constant";
import { SiteProvider, useSiteContext } from "./SiteProvider";
import { PreviewProvider, usePreviewContext } from "./PreviewProvider";
import { useWorkspaceTabsContext, WorkspaceTabsProvider } from "./WorkspaceTabsProvider";
import { useTabSiteScope } from "./TabSiteScopeProvider";
import { useStudioSettings } from "@/hooks/useStudioSettings";

// ─── Composed hook ────────────────────────────────────────────────────────────

export function useToolLayout() {
  const tabs = useWorkspaceTabsContext();
  const site = useSiteContext();
  const preview = usePreviewContext();
  // When called inside a TabShell, override selectSite/clearSite with the
  // tab-scoped versions so writes always target the correct tab
  const scope = useTabSiteScope();

  return {
    ...tabs,
    ...site,
    ...preview,
    ...(scope ?? {}),
  };
}

// ─── Composed provider ────────────────────────────────────────────────────────

interface ToolLayoutProviderProps {
  workspace: WorkspaceKey;
  children: React.ReactNode;
}

export function ToolLayoutProvider({
  workspace,
  children,
}: ToolLayoutProviderProps) {
  const settings = useStudioSettings();

  const tabSettings = { enabled: settings.enabled, maxTabs: settings.maxTabs };

  return (
    <WorkspaceTabsProvider workspace={workspace} tabSettings={tabSettings}>
      <SiteProvider>
        <PreviewProvider>{children}</PreviewProvider>
      </SiteProvider>
    </WorkspaceTabsProvider>
  );
}
 