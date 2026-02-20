import { defineField, defineType } from "sanity";

export const order = defineType({
  name: "order",
  title: "All Orders",
  type: "document",
  fields: [
    // --- Order Identification ---
    defineField({
      name: "orderNumber",
      title: "Order Number",
      type: "string",
      description: "Unique ID (e.g., PRN-123456)",
      readOnly: true,
      validation: (Rule) => Rule.required(),
    }),

    // --- Customer Information ---
    defineField({
      name: "customerName",
      title: "Customer Name",
      type: "string",
      validation: (Rule) => Rule.required(),
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
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "address",
      title: "Shipping Address",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "city",
      title: "City",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "country",
      title: "Country",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "postalCode",
      title: "Postal Code",
      type: "string",
    }),

    defineField({
      name: "products",
      title: "Ordered Items",
      type: "array",
      of: [
        {
          type: "object",
          name: "item",
          fields: [
            {
              name: "product",
              title: "Product Reference",
              type: "reference",
              to: [{ type: "product" }, { type: "sale" }],
              validation: (Rule) => Rule.required(),
            },
            {
              name: "quantity",
              title: "Quantity",
              type: "number",
              validation: (Rule) => Rule.required().min(1),
            },
            {
              name: "priceAtPurchase",
              title: "Unit Price (Paid)",
              type: "number",
              description: "Final price per unit at the time of checkout",
              validation: (Rule) => Rule.required().min(0),
            },
            {
              name: "itemType",
              title: "Item Category",
              type: "string",
              options: {
                list: ["product", "sale"],
              },
              initialValue: "product",
            },
          ],
          preview: {
            select: {
              title: "product.name",
              qty: "quantity",
              price: "priceAtPurchase",
            },
            prepare({ title, qty, price }) {
              return {
                title: title || "Product",
                subtitle: `Qty: ${qty} | Price: PKR ${price}`,
              };
            },
          },
        },
      ],
    }),

    // --- Payment Details ---
    defineField({
      name: "paymentMethod",
      title: "Payment Method",
      type: "string",
      options: {
        list: [
          { title: "EasyPaisa", value: "easypaisa" },
          { title: "Bank Transfer", value: "bank" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "transactionScreenshot",
      title: "Payment Receipt",
      type: "image",
      options: { hotspot: true },
      validation: (Rule) => Rule.required().error("Payment proof is mandatory"),
    }),
    defineField({
      name: "totalAmount",
      title: "Grand Total (with Shipping)",
      type: "number",
      validation: (Rule) => Rule.required(),
    }),

    // --- Order Tracking ---
    defineField({
      name: "status",
      title: "Order Status",
      type: "string",
      options: {
        list: [
          { title: "Pending", value: "pending" },
          { title: "Processing", value: "processing" },
          { title: "Shipped", value: "shipped" },
          { title: "Completed", value: "completed" },
          { title: "Cancelled", value: "cancelled" },
        ],
        layout: "radio",
      },
      initialValue: "pending",
    }),
  ],
  preview: {
    select: {
      orderNo: "orderNumber",
      customer: "customerName",
      amount: "totalAmount",
      status: "status",
    },
    prepare({ orderNo, customer, amount, status }) {
      return {
        title: `#${orderNo} - ${customer}`,
        subtitle: `PKR ${amount} | ${status.toUpperCase()}`,
      };
    },
  },
});
