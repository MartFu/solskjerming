
import { pageBuilderBlocks } from "@/schemaTypes/blocks/index";
import { createPageBuilder } from "@/utils/factories";

export const pageBuilder = createPageBuilder("pageBuilder", pageBuilderBlocks);

// Specialized article builder (e.g., adds "Latest News" or "Author Bio" blocks)
export const articleRootPageBuilder = createPageBuilder(
    "articleRootPageBuilder",
    pageBuilderBlocks, // This array would contain different block types to those of the standard page builder
);

export const catalogRootPageBuilder = createPageBuilder(
    "catalogRootPageBuilder",
    pageBuilderBlocks, 
);

