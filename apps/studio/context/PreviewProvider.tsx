import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useToolLayout } from "./ToolLayoutProvider";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PreviewContextValue {
  previewUrl: string | null;
  setPreviewUrl: (url: string | null) => void;
  previewHidden: boolean;
  togglePreviewHidden: () => void;
  hidePreview: () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const PreviewContext = createContext<PreviewContextValue | null>(null);

export function usePreviewContext(): PreviewContextValue {
  const ctx = useContext(PreviewContext);
  if (!ctx)
    throw new Error("usePreviewContext must be used within PreviewProvider");
  return ctx;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function PreviewProvider({ children }: { children: React.ReactNode }) {
  const { activeSite } = useToolLayout();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewHidden, setPreviewHidden] = useState(true);

  // Clear preview state when the active site is cleared
  useEffect(() => {
    if (!activeSite) {
      setPreviewUrl(null);
      setPreviewHidden(true);
    }
  }, [activeSite]);

  const togglePreviewHidden = useCallback(
    () => setPreviewHidden((v) => !v),
    [],
  );
  const hidePreview = useCallback(() => setPreviewHidden(true), []);

  const value = useMemo<PreviewContextValue>(
    () => ({
      previewUrl,
      setPreviewUrl,
      previewHidden,
      togglePreviewHidden,
      hidePreview,
    }),
    [previewUrl, previewHidden, togglePreviewHidden, hidePreview],
  );

  return (
    <PreviewContext.Provider value={value}>{children}</PreviewContext.Provider>
  );
}
