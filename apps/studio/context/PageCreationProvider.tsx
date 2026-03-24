import { CreatePageModal } from "@/components/modals/create-page";
import type { ModuleCreationOptions } from "@/utils/modules";
import type { TreeNode } from "@/utils/page-tree";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface ModalState {
  /** Available page kinds for this creation context */
  options: ModuleCreationOptions[];
  /** The parent node, or null for root-level creation */
  parentNode: TreeNode | null;
  /** Ancestor chain for the breadcrumb */
  ancestors: TreeNode[];
}

export interface PageCreationContextValue {
  openCreationModal: (state: ModalState) => void;
  closeCreationModal: () => void;
}

export interface PageCreationProviderProps {
  children: ReactNode;
  siteId: string;
  onCreate: (
    option: ModuleCreationOptions,
    parentId: string | null,
    title?: string,
  ) => void;
}

// ─────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────

const PageCreationContext = createContext<PageCreationContextValue | undefined>(
  undefined,
);

export function PageCreationProvider({
  children,
  onCreate,
}: PageCreationProviderProps) {
  const [modalState, setModalState] = useState<ModalState | null>(null);

  const openCreationModal = useCallback((state: ModalState) => {
    setModalState(state);
  }, []);

  const closeCreationModal = useCallback(() => {
    setModalState(null);
  }, []);

  const handleConfirm = useCallback(
    (option: ModuleCreationOptions, title?: string) => {
      const parentId =
        modalState?.parentNode?.doc._id.replace(/^drafts\./, "") ?? null;
      onCreate(option, parentId, title);
      setModalState(null); 
    },
    [modalState, onCreate],
  );

  const value = useMemo(
    () => ({ openCreationModal, closeCreationModal }),
    [openCreationModal, closeCreationModal],
  );

  return (
    <PageCreationContext.Provider value={value}>
      {children}
      {modalState && (
        <CreatePageModal
          options={modalState.options}
          parentNode={modalState.parentNode}
          ancestors={modalState.ancestors}
          onConfirm={handleConfirm}
          onClose={closeCreationModal}
        />
      )}
    </PageCreationContext.Provider>
  );
}

export function usePageCreation() {
  const context = useContext(PageCreationContext);
  if (!context) {
    throw new Error(
      "usePageCreation must be used within a PageCreationProvider",
    );
  }
  return context;
}
