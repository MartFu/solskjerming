export const buildMode = process.env.SITE_ID ? "static" : "preview";
export const siteId = process.env.SITE_ID ?? null;
export const isStaticBuild = buildMode === "static";
export const isPreviewBuild = buildMode === "preview";
