import { defineConfig } from "sanity";
import { defineWorkspace } from "./workspace";

const dataset = process.env.SANITY_STUDIO_DATASET ?? "production";



export default defineConfig([
  defineWorkspace("solskjerming", dataset),
  defineWorkspace("vannsport", dataset),
]);
