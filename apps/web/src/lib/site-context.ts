
/**
 * Returns the current site id, 
 * prioritizing the build-time-only environment variable SITE_ID
 * 
 * **IMPORTANT**
 * 
 * One should be rigorous about where this is called. It should
 * only ever be called by the root layout and passed along through
 * the _SiteContextProvider_ server context.
 * 
 */
export function getSiteId(params?: { siteId?: string }): string {
  // Static build: SITE_ID is baked in at build time
  if (process.env.SITE_ID) return process.env.SITE_ID;
  // Preview: siteId comes from the URL segment
  if (params?.siteId) return params.siteId;
  throw new Error("No SITE_ID available");
}
