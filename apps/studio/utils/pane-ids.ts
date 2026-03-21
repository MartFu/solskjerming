// paneIds.ts

import { WorkspaceKey } from "./constant";

export const paneId = {
    singleton: (siteId: string, type: string) => `${siteId}-${type}`,
    list: (siteId: string, type: string) => `${siteId}-${type}-list`,
    workspace: (workspace: WorkspaceKey, type: string) => `${workspace}-${type}`,
    settings: (siteId: string) => `${siteId}-settings`,
} as const;

export type PaneKind =
    | "singleton"
    | "list"
    | "workspace"
    | "settings"
    | "document"
    | "unknown";

export interface ParsedPaneId {
    kind: PaneKind;
    siteId?: string;
    type?: string;
    docId?: string;
    raw: string;
}

export function parsePaneId(id: string): ParsedPaneId {
    if (!id) return { kind: "unknown", raw: id };

    // "{siteId}-{type}-list"
    const listMatch = id.match(/^([a-zA-Z0-9]{20,})-([a-zA-Z][a-zA-Z]+)-list$/);

    if (listMatch) {
        return {
            kind: "list",
            siteId: listMatch[1],
            type: listMatch[2],
            raw: id,
        };
    }

    // "{siteId}-settings"
    const settingsMatch = id.match(/^([a-zA-Z0-9]{20,})-settings$/);

    if (settingsMatch) {
        return { kind: "settings", siteId: settingsMatch[1], raw: id };
    }

    // "{siteId}-{type}" — singleton
    const singletonMatch = id.match(/^([a-zA-Z0-9]{20,})-([a-zA-Z][a-zA-Z]+)$/);
    if (singletonMatch) {
        return {
            kind: "singleton",
            siteId: singletonMatch[1],
            type: singletonMatch[2],
            raw: id,
        };
    }

    // Plain document ID (UUID-ish)
    return { kind: "document", docId: id.replace(/^drafts\./, ""), raw: id };
}
