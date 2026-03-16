// pagebuilder/pagebuilder-client.tsx
"use client";

import { useOptimistic } from "@sanity/visual-editing/react";
import { env } from "@workspace/env/client";
import { createDataAttribute } from "next-sanity";
import { useCallback, useMemo } from "react";
import type { PageBuilderBlock } from "@/types";
import { PageBuilderContent, type BlockWrapperFn } from "./pagebuilder-content";

type PageBuilderClientProps = {
  readonly pageBuilder?: PageBuilderBlock[];
  readonly id: string;
  readonly type: string;
  readonly siteId: string;
  readonly isDraftMode: boolean;
};

function createSanityDataAttribute({
  id,
  type,
  path,
}: {
  id: string;
  type: string;
  path: string;
}): string {
  return createDataAttribute({
    id,
    type,
    path,
    baseUrl: env.NEXT_PUBLIC_SANITY_STUDIO_URL,
    projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: env.NEXT_PUBLIC_SANITY_DATASET,
  }).toString();
}

// biome-ignore lint/suspicious/noExplicitAny: dynamic optimistic update shape
function useOptimisticPageBuilder(
  initialBlocks: PageBuilderBlock[],
  documentId: string,
) {
  return useOptimistic<PageBuilderBlock[], any>(
    initialBlocks,
    (currentBlocks, action) => {
      if (action.id === documentId && action.document?.pageBuilder) {
        return action.document.pageBuilder;
      }
      return currentBlocks;
    },
  );
}

export function PageBuilderClient({
  pageBuilder: initialBlocks = [],
  id,
  type,
  siteId,
  isDraftMode,
}: PageBuilderClientProps) {
  const blocks = useOptimisticPageBuilder(initialBlocks, id);

  const blockWrapper: BlockWrapperFn = useCallback(
    (block, children) =>
      isDraftMode ? (
        <div
          data-sanity={createSanityDataAttribute({
            id,
            type,
            path: `pageBuilder[_key=="${block._key}"]`,
          })}
        >
          {children}
        </div>
      ) : (
        <>{children}</>
      ),
    [id, type, isDraftMode],
  );

  const containerProps = useMemo(
    () =>
      isDraftMode
        ? {
            "data-sanity": createSanityDataAttribute({
              id,
              type,
              path: "pageBuilder",
            }),
          }
        : undefined,
    [id, type, isDraftMode],
  );

  return (
    <PageBuilderContent
      pageBuilder={blocks}
      siteId={siteId}
      blockWrapper={blockWrapper}
      containerProps={containerProps}
    />
  );
}
