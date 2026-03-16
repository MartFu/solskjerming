// pagebuilder/pagebuilder.tsx
import { draftMode } from "next/headers";
import type { PageBuilderBlock } from "@/types";
import { PageBuilderClient } from "./pagebuilder-client";
import { PageBuilderContent } from "./pagebuilder-content";

type PageBuilderProps = {
  readonly pageBuilder?: PageBuilderBlock[];
  readonly id: string;
  readonly type: string;
  readonly siteId: string;
};

export async function PageBuilder({
  pageBuilder,
  id,
  type,
  siteId,
}: PageBuilderProps) {
  const { isEnabled } = await draftMode();

  if (isEnabled) {
    return (
      <PageBuilderClient
        pageBuilder={pageBuilder}
        id={id}
        type={type}
        siteId={siteId}
        isDraftMode
      />
    );
  }

  return (
    <PageBuilderContent
      pageBuilder={pageBuilder}
      siteId={siteId}
    />
  );
}
