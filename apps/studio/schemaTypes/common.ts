import {
  defineField,
  type ImageRule,
  type ImageValue,
  type ValidationBuilder,
} from "sanity";

import { PathnameFieldComponent } from "@/components/inputs/slug-field-component";
import { GROUP } from "@/utils/constant";
import {
  createSlugErrorValidator,
  createSlugWarningValidator,
  getDocumentTypeConfig,
} from "@/utils/slug-validation";
import { isUnique } from "@/utils/slug";
import { OklchColorInput } from "@/components/inputs/oklch-color-input";

export const richTextField = defineField({
  name: "richText",
  type: "richText",
  description:
    "A text editor that lets you add formatting like bold text, links, and bullet points",
});

export const buttonsField = defineField({
  name: "buttons",
  type: "array",
  of: [{ type: "button" }],
  description:
    "Add one or more clickable buttons that visitors can use to navigate your website",
});


export const pageBuilderField = defineField({
  name: "pageBuilder",
  group: GROUP.MAIN_CONTENT,
  type: "pageBuilder",
  description:
    "Build your page by adding different sections like text, images, and other content blocks",
});

export const iconField = defineField({
  name: "icon",
  title: "Icon",
  type: "lucide-icon",
  description:
    "Choose a small picture symbol to represent this item, like a home icon or shopping cart",
});



export const documentSlugField = (
  documentType: string,
  options: {
    group?: string;
    description?: string;
    title?: string;
  } = {}
) => {
  const {
    group,
    description = `Nettaddressen der man kan finne din ${documentType} (genereres automatisk fra tittelen)`,
    title = "URL",
  } = options;

  return defineField({
    name: "slug",
    type: "string",
    title,
    description,
    group,
  
    components: {
      field: PathnameFieldComponent,
    },
    validation: (Rule) => {
      const config = getDocumentTypeConfig(documentType);
      return [
        Rule.custom(createSlugErrorValidator(config)),
        Rule.custom(createSlugWarningValidator(config)).warning(),
      ];
    },
  });
};

export const imageWithAltField = ({
  name = "image",
  title = "Image",
  description = "An image, make sure to add an alt text and use the hotspot tool to ensure if image is cropped it highlights the focus point",
  validation,
  group,
}: {
  name?: string;
  title?: string;
  description?: string;
  group?: string;
  validation?: ValidationBuilder<ImageRule, ImageValue>;
} = {}) =>
  defineField({
    name,
    type: "image",
    title,
    description,
    group,
    validation,
    options: {
      hotspot: true,
    },
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


export const oklchField = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: "string",
    components: {
      input: OklchColorInput,
    },
  });