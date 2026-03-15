import { defineField, defineType } from "sanity";

export const address = defineType({
  name: "address",
  title: "Address",
  type: "object",
  fields: [
    defineField({ name: "street", type: "string", title: "Gateaddresse" }),
    defineField({ name: "city", type: "string", title: "By" }),
    defineField({ name: "postalCode", type: "string", title: "Postnummer" }),
    defineField({ name: "country", type: "string", title: "Land", initialValue: "Norway" }),
  ],
});