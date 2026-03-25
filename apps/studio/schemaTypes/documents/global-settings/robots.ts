import { DOCUMENT_NAMES } from "@/schemaTypes/constant";
import { createRobotsFields } from "@/utils/factories/create-robots-fields";
import { RobotIcon } from "@sanity/icons";
import { defineGlobal } from "@/utils/globals/define-global";

export const globalRobots = defineGlobal({
  sortFields: [],
  name: DOCUMENT_NAMES.globalRobots,
  title: "Roboter",
  type: "document",
  icon: RobotIcon,
  fields: createRobotsFields({
    isDefault: true,
  }),
});
