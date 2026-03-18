import { button } from "@/schemaTypes/definitions/button";
import { customUrl } from "@/schemaTypes/definitions/custom-url";
import * as pagebuilders from "@/schemaTypes/definitions/pagebuilders";
import { richText } from "@/schemaTypes/definitions/rich-text";
import { deploymentMeta } from "./deploymentMeta";
import { pricing } from "./pricing";
import { socialLinks } from "./socialLinks";
import { address } from "./address";

export const definitions = [
    customUrl,
    richText,
    button,
    deploymentMeta,
    pricing,
    socialLinks,
    address,
    pagebuilders.pageBuilder,
    pagebuilders.articleRootPageBuilder,
    pagebuilders.catalogRootPageBuilder
];
