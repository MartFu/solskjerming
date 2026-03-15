const PREVIEW_ORIGIN =
  process.env.SANITY_STUDIO_PREVIEW_ORIGIN ?? "http://localhost:3000";

// ─────────────────────────────────────────────────────────────
// Preview path resolvers
// One entry per previewable schema type.
// Each resolver receives the live document and returns a path
// (relative to PREVIEW_ORIGIN) or null if required fields are missing.
// ─────────────────────────────────────────────────────────────

const previewPathResolvers: Record<
  string,
  (doc: Record<string, unknown>) => string | null
> = {
  homePage: (doc) => (typeof doc.siteId === "string" ? `/${doc.siteId}` : null),

  articleIndex: (doc) =>
    typeof doc.siteId === "string" ? `/${doc.siteId}/artikler` : null,

  page: (doc) =>
    typeof doc.siteId === "string" &&
    typeof (doc.slug as Record<string, unknown> | undefined)?.current ===
      "string"
      ? `/${doc.siteId}/${(doc.slug as Record<string, unknown>).current}`
      : null,

  article: (doc) =>
    typeof doc.siteId === "string" &&
    typeof (doc.slug as Record<string, unknown> | undefined)?.current ===
      "string"
      ? `/${doc.siteId}/artikler/${(doc.slug as Record<string, unknown>).current}`
      : null,

  product: (doc) =>
    typeof doc.siteId === "string" &&
    typeof (doc.slug as Record<string, unknown> | undefined)?.current ===
      "string"
      ? `/${doc.siteId}/produkter/${(doc.slug as Record<string, unknown>).current}`
      : null,

  video: (doc) =>
    typeof doc.siteId === "string" &&
    typeof (doc.slug as Record<string, unknown> | undefined)?.current ===
      "string"
      ? `/${doc.siteId}/videoer/${(doc.slug as Record<string, unknown>).current}`
      : null,
};

export const PREVIEWABLE_TYPES = new Set(Object.keys(previewPathResolvers));

/**
 * Resolves a full preview URL for a given schema type and document.
 * Returns null if the type is not previewable or required fields are missing.
 */
export function resolvePreviewUrl(
  schemaType: string,
  doc: Record<string, unknown>,
): string | null {
  const path = previewPathResolvers[schemaType]?.(doc);
  return path ? `${PREVIEW_ORIGIN}${path}` : null;
}
