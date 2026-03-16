"use client";

import { useOptimistic } from "@sanity/visual-editing/react";
import { env } from "@workspace/env/client";
import { createDataAttribute } from "next-sanity";
import { useCallback, useMemo } from "react";

import type { PageBuilderBlock } from "@/types";
import { type BlockWrapperFn, PageBuilder } from "./pagebuilder";

export type PageBuilderPreviewProps = {
  readonly pageBuilder?: PageBuilderBlock[];
  readonly id: string;
  readonly type: string;
  readonly siteId: string;
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

/**
 * PageBuilderPreview — wraps the base PageBuilder with Sanity visual editing.
 *
 * Owns: optimistic updates, data-sanity attributes on blocks and container.
 * Delegates: all rendering to PageBuilder via blockWrapper + containerProps.
 *
 * This is the only component in the pagebuilder/ folder that is "use client".
 */
export function PageBuilderPreview({
  pageBuilder: initialBlocks = [],
  id,
  type,
  siteId,
}: PageBuilderPreviewProps) {
  const blocks = useOptimisticPageBuilder(initialBlocks, id);

  const blockWrapper: BlockWrapperFn = useCallback(
    (block, children) => (
      <div
        data-sanity={createSanityDataAttribute({
          id,
          type,
          path: `pageBuilder[_key=="${block._key}"]`,
        })}
      >
        {children}
      </div>
    ),
    [id, type],
  );

  const containerProps = useMemo(
    () => ({
      "data-sanity": createSanityDataAttribute({
        id,
        type,
        path: "pageBuilder",
      }),
    }),
    [id, type],
  );

  return (
    <PageBuilder
      pageBuilder={blocks}
      siteId={siteId}
      blockWrapper={blockWrapper}
      containerProps={containerProps}
    />
  );
}
