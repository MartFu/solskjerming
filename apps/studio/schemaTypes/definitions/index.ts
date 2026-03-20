import { button } from "@/schemaTypes/definitions/button";
import { customUrl } from "@/schemaTypes/definitions/custom-url";
import * as pagebuilders from "@/schemaTypes/definitions/pagebuilders";
import { richText } from "@/schemaTypes/definitions/rich-text";
import { deploymentMeta } from "./deploymentMeta";
import { pricing } from "./pricing";
import { address } from "./address";
import { enabledPackagesField } from "./enabled-packages";

export const definitions = [
    customUrl,
    richText,
    button,
    deploymentMeta,
    pricing,
    address,
    enabledPackagesField,
    pagebuilders.pageBuilder,
    pagebuilders.articleRootPageBuilder,
    pagebuilders.catalogRootPageBuilder
];


