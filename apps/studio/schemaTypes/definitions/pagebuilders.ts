
import { articleRootBlocks, catalogRootBlocks, pageBlocks } from "@/schemaTypes/blocks/index";
import { createPageBuilder } from "@/utils/factories";

export const PAGE_BUILDERS = {
  pageBuilder: "pageBuilder",
  articleRootPageBuilder: "articleRootPageBuilder",
  catalogRootPageBuilder: "catalogRootPageBuilder",
}

export type PageBuilderType = keyof typeof PAGE_BUILDERS;


export const pageBuilder = createPageBuilder(PAGE_BUILDERS.pageBuilder, pageBlocks);

export const articleRootPageBuilder = createPageBuilder(
  PAGE_BUILDERS.articleRootPageBuilder,
  articleRootBlocks,
);

export const catalogRootPageBuilder = createPageBuilder(
  PAGE_BUILDERS.catalogRootPageBuilder,
  catalogRootBlocks,
);
