import { defineField, defineType } from "sanity";

export const address = defineType({
  name: "address",
  title: "Address",
  type: "object",
  fields: [
    defineField({ name: "street", type: "string", title: "Street Address" }),
    defineField({ name: "city", type: "string", title: "City" }),
    defineField({ name: "postalCode", type: "string", title: "Postal Code" }),
    defineField({ name: "country", type: "string", title: "Country", initialValue: "Norway" }),
  ],
});