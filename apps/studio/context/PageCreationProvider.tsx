import { CreatePageModal } from "@/components/modals/CreatePageDialog";
import { moduleRegistry } from "@/schemaTypes/documents/modules";
import { CreationOption } from "@/utils/modules/registry";
import type { TreeNode } from "@/utils/page-tree";
import { useToast } from "@sanity/ui";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useRouter } from "sanity/router";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
 
export interface ModalState {
  options: CreationOption[];
  parentNode: TreeNode | null;
  ancestors: TreeNode[];
}
 
export interface PageCreationContextValue {
  openCreationModal: (state: ModalState) => void;
  closeCreationModal: () => void;
}
 
export interface PageCreationProviderProps {
  children: ReactNode;
  siteId: string;
}
 
// ─────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────
 
const PageCreationContext = createContext<PageCreationContextValue | undefined>(
  undefined,
);
 
export function PageCreationProvider({
  children,
  siteId,
}: PageCreationProviderProps) {
  const [modalState, setModalState] = useState<ModalState | null>(null);
  const router = useRouter();
  const toast = useToast();
 
  const openCreationModal = useCallback((state: ModalState) => {
    setModalState(state);
  }, []);
 
  const closeCreationModal = useCallback(() => {
    setModalState(null);
  }, []);
 
  /**
   * Called when the modal confirms. Derives all context from the
   * modal state (parentNode) and pane props (siteId), then delegates
   * to the registry to build and validate the creation intent.
   */
  const handleConfirm = useCallback(
    (option: CreationOption, title?: string) => {
      const intent = moduleRegistry.buildCreationIntent(option, {
        siteId,
        parentId: modalState?.parentNode?.doc._id ?? undefined,
        title,
      });
 
      if (!intent) {
        toast.push({
          title: "En feil oppstod",
          description: `Ukjent rolle "${option.role}" — kan ikke opprette siden.`,
          status: "error",
        });
        setModalState(null);
        return;
      }
 
      router.navigateIntent("create", [intent.payload, intent.params]);
      setModalState(null);
    },
    [modalState, siteId, router, toast],
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