import { CreatePageModal } from "@/components/structure/page-tree-pane/CreatePageModal";
import { ModalState } from "@/components/structure/page-tree-pane/types";
import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";

export interface PageCreationContextValue {
  openCreationModal: (state: ModalState) => void;
  closeCreationModal: () => void;
}

export interface PageCreationProviderProps {
  children: ReactNode;
  siteId: string;
  onCreate: (
    type: string,
    templateId: string,
    parentId: string | null,
    title?: string,
  ) => void;
}



const PageCreationContext = createContext<PageCreationContextValue | undefined>(undefined);

export function PageCreationProvider({ children, onCreate }: PageCreationProviderProps) {
  const [modalState, setModalState] = useState<ModalState | null>(null);

  const openCreationModal = useCallback((state: ModalState) => {
    setModalState(state);
  }, []);

  const closeCreationModal = useCallback(() => {
    setModalState(null);
  }, []);

  const handleConfirm = useCallback((type: string, templateId: string, title?: string) => {
    // Always use the published ID as parent reference
    const parentId = modalState?.parentNode?.doc._id.replace(/^drafts\./, "") ?? null;
    onCreate(type, templateId, parentId, title);
    setModalState(null);
  }, [modalState, onCreate]);

  const value = useMemo(() => ({
    openCreationModal,
    closeCreationModal
  }), [openCreationModal, closeCreationModal]);

  return (
    <PageCreationContext.Provider value={value}>
      {children}
      {modalState && (
        <CreatePageModal
          types={modalState.types}
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
    throw new Error("usePageCreation must be used within a PageCreationProvider");
  }
  return context;
}