import { API_VERSION } from "@/utils/constant";
import { STUDIO_CONTEXT_LS_KEY } from "@/utils/context";
import { buildPreviewUrl, getPreviewContext } from "@/utils/preview";
import { emitSiteChanged } from "@/utils/structure-channel";
import { ActiveSite } from "@/utils/types";
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";
import { useClient } from "sanity";
import { useRouter } from "sanity/router";
import { RouterPanes } from "sanity/structure";


// ─── Types ────────────────────────────────────────────────────────────────────

interface ToolLayoutContextValue {
    /** The Sanity workspace name this tool instance belongs to */
    workspace: string;
    /** The currently active site, or null if at workspace level */
    activeSite: ActiveSite | null;
    /** Select a site — persists to sessionStorage */
    selectSite: (site: ActiveSite) => void;
    /** Return to workspace landing — clears active site */
    clearSite: () => void;

    preview: {
        siteId: string;
        type: string;
        docId: string;
    } | null;

    previewLoading: boolean;
    canPreview: boolean;

    previewHidden: boolean;
    togglePreviewHidden: () => void;
    hidePreview: () => void;

    /**
     * The preview URL for the currently open document, as written by PreviewPane.
     * Null when no previewable document is open.
     */
    previewUrl: string | null;
    /** Called by PreviewPane to register/unregister the current preview URL */
    setPreviewUrl: (url: string | null) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ToolLayoutContext = createContext<ToolLayoutContextValue | null>(null);

// ─── Storage helpers ──────────────────────────────────────────────────────────

function readFromSession(workspace: string): ActiveSite | null {
    try {
        const raw = sessionStorage.getItem(STUDIO_CONTEXT_LS_KEY(workspace));
        return raw ? (JSON.parse(raw) as ActiveSite) : null;
    } catch {
        return null;
    }
}

function writeToSession(workspace: string, site: ActiveSite | null) {
    try {
        if (site) {
            sessionStorage.setItem(
                STUDIO_CONTEXT_LS_KEY(workspace),
                JSON.stringify(site),
            );
        } else {
            sessionStorage.removeItem(STUDIO_CONTEXT_LS_KEY(workspace));
        }
    } catch {
        // sessionStorage unavailable — degrade gracefully, state lives in memory only
    }
}

// ─── Provider ─────────────────────────────────────────────────────────────────

interface ToolLayoutProviderProps {
    workspace: string;
    children: React.ReactNode;
}

export function ToolLayoutProvider({
    workspace,
    children,
}: ToolLayoutProviderProps) {
    const [activeSite, setActiveSiteState] = useState<ActiveSite | null>(() =>
        readFromSession(workspace),
    );
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewHidden, setPreviewHidden] = useState(true);
    const [previewUrlLoading, setPreviewUrlLoading] = useState(false);

    const { state } = useRouter();
    const client = useClient({ apiVersion: API_VERSION });

    const panes = (state?.panes ?? []) as RouterPanes;
    const preview = getPreviewContext(panes);

    const togglePreviewHidden = () => {
        setPreviewHidden((prev) => !prev);
    };

    const hidePreview = () => setPreviewHidden(true);

    const previewBase = process.env.SANITY_STUDIO_PREVIEW_BASE_DOMAIN;
    const canPreview = !!preview && (!!activeSite?.domain || !!previewBase);

    useEffect(() => {
        if (!preview || !activeSite || (!activeSite?.domain && !previewBase))
            return;

        const slugTypes = ["page", "article", "video", "faq"];
        setPreviewUrlLoading(true);

        if (!slugTypes.includes(preview.type)) {
            buildPreviewUrl(client, activeSite, preview)
                .then(setPreviewUrl)
                .finally(() => setPreviewUrlLoading(false));
            return;
        }

        client
            .fetch<{
                slug?: { current: string };
            }>(`*[_id == $id || _id == $draftId][0] { slug }`, {
                id: preview.docId,
                draftId: `drafts.${preview.docId}`,
            })
            .then(async (doc) => {
                const slug = doc?.slug?.current;
                const url = await buildPreviewUrl(
                    client,
                    activeSite,
                    preview,
                    slug,
                );
                setPreviewUrl(url);
            })
            .finally(() => setPreviewUrlLoading(false));
    }, [preview?.docId, activeSite?.domain]);

    // If workspace changes (shouldn't happen mid-session, but defensive), reset
    useEffect(() => {
        const stored = readFromSession(workspace);
        setActiveSiteState(stored);
    }, [workspace]);

    const selectSite = useCallback(
        (site: ActiveSite) => {
            writeToSession(workspace, site);
            setActiveSiteState(site);
            emitSiteChanged();
        },
        [workspace],
    );

    const clearSite = useCallback(() => {
        writeToSession(workspace, null);
        setActiveSiteState(null);
    }, [workspace]);

    return (
        <ToolLayoutContext.Provider
            value={{
                workspace,
                activeSite,
                selectSite,
                clearSite,
                canPreview,
                previewHidden,
                previewLoading: previewUrlLoading,
                togglePreviewHidden,
                hidePreview,
                preview,
                previewUrl,
                setPreviewUrl,
            }}
        >
            {children}
        </ToolLayoutContext.Provider>
    );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useToolLayout(): ToolLayoutContextValue {
    const ctx = useContext(ToolLayoutContext);
    if (!ctx) {
        throw new Error("useToolLayout must be used inside ToolLayoutProvider");
    }
    return ctx;
}
