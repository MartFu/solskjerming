import { defineConfig } from "sanity";
import { defineWorkspace } from "./utils/workspace";

const dataset = process.env.SANITY_STUDIO_DATASET ?? "production";
const title = process.env.SANITY_STUDIO_TITLE;

export default defineConfig([
  defineWorkspace("solskjerming", "Solskjerming", dataset),
  defineWorkspace("vannsport", "Vannsport", dataset),
]);