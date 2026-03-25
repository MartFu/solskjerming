import { button } from "@/schemaTypes/definitions/button";
import { customUrl } from "@/schemaTypes/definitions/custom-url";
import { pageBuilder } from "@/schemaTypes/definitions/pagebuilder";
import { richText } from "@/schemaTypes/definitions/rich-text";
import { deploymentMeta } from "./deploymentMeta";
import { address } from "./address";
import { enabledModulesField } from "./enabled-modules";
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
    address,
    enabledModulesField,
    socials,
    pageSeo,
    siteSeo,
    theme,
    cookies,
    organization,
    pageBuilder,
];


export {
    PAGEBUILDER_NAME,
    type PageBuilderType
} from "./pagebuilder"