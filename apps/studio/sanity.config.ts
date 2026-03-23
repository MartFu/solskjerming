import { defineConfig } from "sanity";
import { defineWorkspace } from "./workspace";
import { WORKSPACES } from "./utils/constant";
import { DATASET } from "./utils/env";


export default defineConfig(WORKSPACES.map((workspace) => defineWorkspace(workspace.value, DATASET)));
