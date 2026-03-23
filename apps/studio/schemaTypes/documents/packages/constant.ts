export const PACKAGE_KEYS = {
  articles: "articles",
  commerce: "commerce",
} as const
export type PackageKey = (typeof PACKAGE_KEYS)[keyof typeof PACKAGE_KEYS];