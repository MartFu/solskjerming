import { ImageIcon, LinkIcon } from "@sanity/icons";
import {
  type ConditionalProperty,
  defineArrayMember,
  defineField,
} from "sanity";

export const buttonsField = defineField({
  name: "buttons",
  type: "array",
  of: [{ type: "button" }],
  description:
    "Add one or more clickable buttons that visitors can use to navigate your website",
});

export const iconField = defineField({
  name: "icon",
  title: "Icon",
  type: "lucide-icon",
  description:
    "Choose a small picture symbol to represent this item, like a home icon or shopping cart",
});

export const imageWithAltField = ({
  name = "image",
  title = "Image",
  description = "An image — add alt text and use the hotspot tool to ensure the crop focuses on the right area",
}: {
  name?: string;
  title?: string;
  description?: string;
} = {}) =>
  defineField({
    name,
    type: "image",
    title,
    description,
    options: { hotspot: true },
    fields: [
      defineField({
        name: "alt",
        type: "string",
        title: "Alt Text",
        description:
          "The text that describes the image for screen readers and search engines",
      }),
    ],
  });

const richTextMembers = [
  defineArrayMember({
    name: "block",
    type: "block",
    styles: [
      { title: "Normal", value: "normal" },
      { title: "H2", value: "h2" },
      { title: "H3", value: "h3" },
      { title: "H4", value: "h4" },
      { title: "H5", value: "h5" },
      { title: "H6", value: "h6" },
      { title: "Inline", value: "inline" },
    ],
    lists: [
      { title: "Numbered", value: "number" },
      { title: "Bullet", value: "bullet" },
    ],
    marks: {
      annotations: [
        {
          name: "customLink",
          type: "object",
          title: "Internal/External Link",
          icon: LinkIcon,
          fields: [
            defineField({
              name: "customLink",
              type: "customUrl",
            }),
          ],
        },
      ],
      decorators: [
        { title: "Strong", value: "strong" },
        { title: "Emphasis", value: "em" },
        { title: "Code", value: "code" },
      ],
    },
  }),
  defineArrayMember({
    name: "image",
    title: "Image",
    type: "image",
    icon: ImageIcon,
    options: { hotspot: true },
    fields: [
      defineField({
        name: "caption",
        type: "string",
        title: "Caption Text",
      }),
    ],
  }),
];

type MemberType = NonNullable<(typeof richTextMembers)[number]["name"]>;

export const customRichText = (
  types: MemberType[],
  options?: {
    name?: string;
    title?: string;
    group?: string[] | string;
    description?: string;
    hidden?: ConditionalProperty;
  },
) => {
  const { name, description, hidden } = options ?? {};
  const members = richTextMembers.filter(
    (m) => m.name && types.includes(m.name),
  );
  return defineField({
    ...options,
    name: name ?? "richText",
    type: "array",
    description: description ?? "",
    hidden,
    of: members,
  });
};
