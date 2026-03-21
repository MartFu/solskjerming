
// lib/actions/registry.ts
import { DocumentActionComponent, DocumentActionsContext } from "sanity";

type ActionEnhancer = (
  prev: DocumentActionComponent[],
  context: DocumentActionsContext,
) => DocumentActionComponent[];

export const actionRegistry: Record<string, ActionEnhancer> = {

};
