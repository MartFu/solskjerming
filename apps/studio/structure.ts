import { orderableDocumentListDeskItem } from "@sanity/orderable-document-list";
import {
  BookMarked,
  CogIcon,
  File,
  FileText,
  HomeIcon,
  type LucideIcon,
  MessageCircle,
  PanelBottom,
  PanelBottomIcon,
  Settings2,
  TrendingUpDown,
  User,
} from "lucide-react";
import type {
  StructureBuilder,
  StructureResolverContext,
} from "sanity/structure";

import { createSlugBasedStructure } from "@/components/nested-pages-structure";
import type { SchemaType, SingletonType } from "@/schemaTypes/index";
import { getTitleCase } from "@/utils/helper";

type Base<T = SchemaType> = {
  id?: string;
  type: T;
  preview?: boolean;
  title?: string;
  icon?: LucideIcon;
};

type CreateSingleTon = {
  S: StructureBuilder;
} & Base<SingletonType>;

const createSingleTon = ({ S, type, title, icon, siteId }: CreateSingleTon & { siteId?: string }) => {
  const newTitle = title ?? getTitleCase(type);
  const docId = siteId ? `${siteId}-${type}` : type; // e.g., "terrasse-spesialisten-homePage"
  
  return S.listItem()
    .title(newTitle)
    .icon(icon ?? File)
    .child(S.document().schemaType(type).documentId(docId));
};

type CreateList = {
  S: StructureBuilder;
} & Base;

// This function creates a list item for a type. It takes a StructureBuilder instance (S),
// a type, an icon, and a title as parameters. It generates a title for the type if not provided,
// and uses a default icon if not provided. It then returns a list item with the generated or
// provided title and icon.

const createList = ({ S, type, icon, title, id, siteId }: CreateList & { siteId?: string }) => {
  const newTitle = title ?? getTitleCase(type);
  const listBuilder = S.documentTypeListItem(type).id(id ?? type).title(newTitle).icon(icon ?? File);

  if (siteId) {
    return S.listItem()
      .title(newTitle)
      .icon(icon ?? File)
      .child(
        S.documentList()
          .title(newTitle)
          .filter('_type == $type && siteId == $siteId')
          .params({ type, siteId })
      );
  }
  return listBuilder;
};

type CreateIndexList = {
  S: StructureBuilder;
  list: Base;
  index: Base<SingletonType>;
  context: StructureResolverContext;
};

const createIndexListWithOrderableItems = ({
  S,
  index,
  list,
  context,
}: CreateIndexList) => {
  const indexTitle = index.title ?? getTitleCase(index.type);
  const listTitle = list.title ?? getTitleCase(list.type);
  return S.listItem()
    .title(listTitle)
    .icon(index.icon ?? File)
    .child(
      S.list()
        .title(indexTitle)
        .items([
          S.listItem()
            .title(indexTitle)
            .icon(index.icon ?? File)
            .child(
              S.document()
                .views([S.view.form()])
                .schemaType(index.type)
                .documentId(index.type)
            ),
          orderableDocumentListDeskItem({
            type: list.type,
            S,
            context,
            icon: list.icon ?? File,
            title: `${listTitle}`,
          }),
        ])
    );
};


export const structure = (
  S: StructureBuilder,
  context: StructureResolverContext,
  workspaceName: string,
) => {
  const baseTitle = `${getTitleCase(workspaceName)} Content`;

  switch (workspaceName) {
    case "solskjerming":
      return S.list()
        .title(baseTitle)
        .items([
          S.listItem()
            .title("Select a Site")
            .child(
              S.documentTypeList("site")
                .title("Select Site")
                .child((siteId) => 
                  S.list()
                    .title("Site Content")
                    .items([
                      createSingleTon({ S, type: "homePage", icon: HomeIcon, siteId }),
                      S.divider(),
                      createSlugBasedStructure(S, "page", siteId), // We must update this next
                      createList({ S, type: "faq", title: "FAQs", icon: MessageCircle, siteId }),
                      S.divider(),
                      S.listItem()
                        .title("Site Configuration")
                        .icon(Settings2)
                        .child(
                          S.list()
                            .title("Configuration")
                            .items([
                              createSingleTon({ S, type: "navbar", siteId, icon: PanelBottom }),
                              createSingleTon({ S, type: "footer", siteId, icon: PanelBottomIcon }),
                              createSingleTon({ S, type: "settings", siteId, icon: CogIcon }),
                            ])
                        ),
                    ])
                )
            ),
        ]);

    default:
      // Standard layout for other workspaces
      return S.list().title(baseTitle).items([
        createSingleTon({ S, type: "homePage", icon: HomeIcon }),
        // ... rest of your default items
      ]);
  }
};


/* 

 S.list()
    .title(`${getTitleCase(workspaceName)} Content`)
    .items([
      createSingleTon({ S, type: "homePage", icon: HomeIcon, id: `${name}_homePage` }),

      S.divider(),
      createSlugBasedStructure(S, "page"),
      createIndexListWithOrderableItems({
        S,
        index: { type: "blogIndex", icon: BookMarked },
        list: { type: "blog", title: "Blogs", icon: FileText },
        context,
      }),
      createList({
        S,
        type: "faq",
        title: "FAQs",
        icon: MessageCircle,
      }),
      createList({ S, type: "author", title: "Authors", icon: User }),
      createList({
        S,
        type: "redirect",
        title: "Redirects",
        icon: TrendingUpDown,
      }),
      S.divider(),
      S.listItem()
        .title("Site Configuration")
        .icon(Settings2)
        .child(
          S.list()
            .title("Site Configuration")
            .items([
              createSingleTon({
                S,
                type: "navbar",
                title: "Navigation",
                icon: PanelBottom,
              }),
              createSingleTon({
                S,
                type: "footer",
                title: "Footer",
                icon: PanelBottomIcon,
              }),
              createSingleTon({
                S,
                type: "settings",
                title: "Global Settings",
                icon: CogIcon,
              }),
            ])
        ),
    ]);

*/