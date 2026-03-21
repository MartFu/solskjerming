import {
  DocumentActionComponent,
  DocumentActionProps,
  DocumentActionDescription,
  SanityDocument,
} from "sanity";

/**
 * A helper to create type-safe document action wrappers.
 * T: The interface of your Sanity document (e.g., SiteDocument)
 */
export function defineDocumentAction<T extends SanityDocument>(
  render: (
    props: DocumentActionProps & { draft: T | null; published: T | null },
    originalResult: DocumentActionDescription,
  ) => DocumentActionDescription | null,
) {
  return (originalAction: DocumentActionComponent): DocumentActionComponent => {
    // This is the functional component Sanity actually renders
    const ActionWrapper = (props: DocumentActionProps) => {
      const originalResult = originalAction(props);

      // 1. Safety First: If the original action shouldn't exist, don't intercept
      if (!originalResult) return null;

      const typedProps = props as DocumentActionProps & {
        draft: T | null;
        published: T | null;
      };

      // 2. Pass the guaranteed originalResult
      return render(typedProps, originalResult);
    };

    // Keep the metadata (like .action = 'publish') so the registry/Sanity knows what this is
    ActionWrapper.action = (originalAction as any).action;

    return ActionWrapper;
  };
}