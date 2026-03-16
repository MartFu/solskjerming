import { defineConfig } from "sanity";
import { defineWorkspace } from "./workspace";
import { WORKSPACES } from "./utils/constant";


const dataset = process.env.SANITY_STUDIO_DATASET ?? "production";


export default defineConfig(WORKSPACES.map((workspace) => defineWorkspace(workspace.value, dataset)));
