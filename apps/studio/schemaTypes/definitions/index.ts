import { button } from "@/schemaTypes/definitions/button";
import { customUrl } from "@/schemaTypes/definitions/custom-url";
import * as pagebuilders from "@/schemaTypes/definitions/pagebuilders";
import { richText } from "@/schemaTypes/definitions/rich-text";
import { deploymentMeta } from "./deploymentMeta";
import { pricing } from "./pricing";
import { address } from "./address";
import { enabledPackagesField } from "./enabled-packages";
import { socials } from "./social";
import { pageSeo, siteSeo } from "./seo";
import { theme } from "./theme";
import { organization } from "./organization";
import { cookies } from "./cookie";

export const definitions = [
    customUrl,
    richText,
    button,
    deploymentMeta,
    pricing,
    address,
    enabledPackagesField,
    socials,
    pageSeo,
    siteSeo,
    theme,
    cookies,
    organization,
    pagebuilders.pageBuilder,
    pagebuilders.articleRootPageBuilder,
    pagebuilders.catalogRootPageBuilder
];


