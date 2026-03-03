import { defineField, defineType } from "sanity";

export const pricing = defineType({
  name: "pricing",
  title: "Pricing",
  type: "object",
  fields: [
    defineField({
      name: "basePrice",
      title: "Base Price",
      type: "number",
    }),
    defineField({
      name: "currency",
      title: "Currency",
      type: "string",
      options: {
        list: [
          { title: "NOK", value: "NOK" },
          { title: "EUR", value: "EUR" },
          { title: "USD", value: "USD" },
        ],
      },
      initialValue: "NOK",
    }),
    defineField({
      name: "priceNote",
      title: "Price Note",
      type: "string",
      description: "e.g., 'Incl. VAT', 'Starting from'",
    }),
  ],
});