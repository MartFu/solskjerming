/**
 * ToolLayoutProvider.tsx
 *
 * Provider nesting:
 *   WorkspaceTabsProvider   — tab CRUD, site ops, savedPath, URL, localStorage
 *
 * WorkspaceTabsProvider (selectSite, clearSite, activeSite, sessionStorage,
 *  ?site= deep-link) so there is a single ordered flush path for all site
 *  changes: sessionStorage → URL → emitSiteChanged.
 */

import type { WorkspaceKey } from "@/utils/constant";
import { PreviewProvider } from "./PreviewProvider";
import {
    useWorkspaceTabsContext,
    WorkspaceTabsProvider,
} from "./WorkspaceTabsProvider";
import { useTabSiteScope } from "./TabSiteScopeProvider";
import { useStudioSettings } from "@/hooks/useStudioSettings";

// ─── Composed hook ────────────────────────────────────────────────────────────

export function useToolLayout() {
    const tabs = useWorkspaceTabsContext();
    // When called inside a TabSiteScopeProvider, override selectSite/clearSite
    // with the tab-scoped versions so writes always target the correct tab.
    const scope = useTabSiteScope();

    return {
        ...tabs,
        ...(scope ?? {}),
    };
}

// ─── Composed provider ────────────────────────────────────────────────────────

interface ToolLayoutProviderProps {
    workspace: WorkspaceKey;
    children?: React.ReactNode;
}

export function ToolLayoutProvider({
    workspace,
    children,
}: ToolLayoutProviderProps) {
    const settings = useStudioSettings();

    const tabSettings = {
        enabled: settings.enabled,
        maxTabs: settings.maxTabs,
    };

    return (
        <WorkspaceTabsProvider
            workspace={workspace}
            tabSettings={tabSettings}
        >
            <PreviewProvider>{children}</PreviewProvider>
        </WorkspaceTabsProvider>
    );
}
