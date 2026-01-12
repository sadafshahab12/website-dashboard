// schemas/contact.ts
import { defineType, defineField } from "sanity";

export const contact = defineType({
  name: "contact",
  title: "Contact",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (Rule) => Rule.required().min(2).max(100),
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: "phone",
      title: "Phone Number",
      type: "string",
      validation: (Rule) =>
        Rule.required()
          .min(7)
          .max(20)
          .warning("Please enter a valid phone number"),
    }),
    defineField({
      name: "country",
      title: "Country",
      type: "string",
      validation: (Rule) => Rule.required().min(2).max(100),
    }),
    defineField({
      name: "subject",
      title: "Subject",
      type: "string",
      options: {
        list: [
          { title: "Order Inquiry", value: "orderInquiry" },
          { title: "Product Question", value: "productQuestion" },
          { title: "Returns & Exchange", value: "returnsExchange" },
          { title: "Other", value: "other" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "message",
      title: "Message",
      type: "text",
      validation: (Rule) => Rule.required().min(10).max(1000),
    }),
  ],
});
