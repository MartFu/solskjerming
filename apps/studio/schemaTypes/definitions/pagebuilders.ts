
import { articleRootBlocks, catalogRootBlocks, pageBlocks } from "@/schemaTypes/blocks/index";
import { createPageBuilder } from "@/utils/factories";

export const pageBuilder = createPageBuilder("pageBuilder", pageBlocks);

export const articleRootPageBuilder = createPageBuilder(
  "articleRootPageBuilder",
  articleRootBlocks,
);

export const catalogRootPageBuilder = createPageBuilder(
  "catalogRootPageBuilder",
  catalogRootBlocks,
);
