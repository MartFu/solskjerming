import type { FilterByType, Get } from "@sanity/codegen";
import type {
  QueryHomePageDataResult,
  QueryImageTypeResult,
  QueryNavbarDataResult,
  QueryPageBySlugResult,
  QuerySiteConfigResult,
} from "@workspace/sanity/types";

export type PageBuilderBlock = Get<
  QueryHomePageDataResult,
  "pagebuilder",
  number
>;

export type PageBuilderBlockTypes = NonNullable<PageBuilderBlock>["_type"];

export type PagebuilderType<T extends PageBuilderBlockTypes> = FilterByType<
  NonNullable<PageBuilderBlock>,
  T
>;

export type SanityButtonProps = Get<PagebuilderType<"hero">, "buttons", number>;

export type SanityImageProps = NonNullable<QueryImageTypeResult>;

export type SanityRichTextProps = Get<QueryPageBySlugResult, "richText">;

export type SanityRichTextBlock = FilterByType<
  NonNullable<NonNullable<SanityRichTextProps>[number]>,
  "block"
>;

export type Article = NonNullable<QueryPageBySlugResult>;

export type Maybe<T> = T | null | undefined;

// Navigation types
export type NavigationData = {
  navbarData: QueryNavbarDataResult;
  settingsData: QuerySiteConfigResult;
};

export type NavColumn = Get<QueryNavbarDataResult, "columns", number>;

export type ColumnLink =
  Extract<NavColumn, { type: "column" }>["links"] extends Array<infer T>
    ? T
    : never;

export type MenuLinkProps = {
  name: string;
  href: string;
  description?: string;
  icon?: string | null;
  onClick?: () => void;
};
