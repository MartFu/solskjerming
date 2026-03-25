
import {  allBlocks } from "@/schemaTypes/blocks";
import { createPageBuilder } from "@/utils/factories";

import { allPageBuilderBlocks } from "@/schemaTypes/blocks"

export const PAGEBUILDER_NAME = "pageBuilder";
export const pageBuilder = createPageBuilder(PAGEBUILDER_NAME, allPageBuilderBlocks);
export type PageBuilderType = typeof PAGEBUILDER_NAME;
