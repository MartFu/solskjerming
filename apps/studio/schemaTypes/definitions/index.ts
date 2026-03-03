import { button } from "@/schemaTypes/definitions/button";
import { customUrl } from "@/schemaTypes/definitions/custom-url";
import { pageBuilder } from "@/schemaTypes/definitions/pagebuilder";
import { richText } from "@/schemaTypes/definitions/rich-text";
import { deploymentMeta } from "./deploymentMeta";
import { pricing } from "./pricing";
import { socialLinks } from "./socialLinks";
import { address } from "./address";

export const definitions = [customUrl, richText, button, pageBuilder, deploymentMeta, pricing, socialLinks, address];
