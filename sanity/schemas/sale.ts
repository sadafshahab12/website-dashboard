import { defineField, defineType } from "sanity";

export const sale = defineType({
  name: "sale",
  title: "Sale",
  type: "document",
  fields: [
    defineField({
      name: "status",
      title: "Sale Status",
      type: "string",
      options: {
        list: [
          { title: "Live (Visible on Page)", value: "live" },
          { title: "Archived (Hidden)", value: "archived" },
          { title: "Draft", value: "draft" },
        ],
        layout: "radio", 
      },
      initialValue: "live", 
    }),
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name" },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "reference",
      to: [{ type: "category" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "stockQuantity",
      title: "Stock Quantity",
      type: "number",
      description: "How many units are available?",
      initialValue: 0,
      validation: (Rule) => Rule.required().min(0),
    }),

    defineField({
      name: "isSoldOut",
      title: "Sold Out",
      description:
        "Toggle this on to show a 'Sold Out' overlay and disable 'Add to Cart'",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "showSaleBadge",
      title: "Show Sale Badge?",
      description:
        "If active, a 'SALE' or '% Off' badge will appear on the card",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "originalPrice",
      title: "Original Price",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: "discountPrice",
      title: "Discount Price",
      type: "number",
      description: "Current sale price. If empty, product is full price.",
      validation: (Rule) =>
        Rule.min(0).custom((discountPrice, context) => {
          const doc = context.document as { originalPrice?: number };
          if (
            discountPrice &&
            doc.originalPrice &&
            discountPrice >= doc.originalPrice
          ) {
            return "Discount price must be lower than original price";
          }
          return true;
        }),
    }),
    defineField({
      name: "promotion",
      title: "Promotion Status",
      type: "string",
      options: {
        list: [
          { title: "None", value: "none" },
          { title: "New Arrival", value: "new" },
          { title: "Bestseller", value: "bestseller" },
          { title: "Limited Edition", value: "limited" },
        ],
      },
      initialValue: "none",
    }),

    // --- MEDIA & DETAILS ---
    defineField({
      name: "images",
      title: "Images",
      type: "array",
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              title: "Alt Text",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
          ],
        },
      ],
      validation: (Rule) => Rule.required().min(1).max(4),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
    }),
    defineField({
      name: "material",
      title: "Material",
      type: "string",
      placeholder: "e.g., Gold Plated, Silver, Brass",
    }),
    defineField({
      name: "colors",
      title: "Colors",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "occasions",
      title: "Occasions",
      type: "array",
      of: [{ type: "string" }],
    }),
  ],

  preview: {
    select: {
      title: "name",
      media: "images.0",
      isSoldOut: "isSoldOut",
      dPrice: "discountPrice",
      oPrice: "originalPrice",
    },
    prepare({ title, media, isSoldOut, dPrice, oPrice }) {
      const priceDisplay = dPrice ? `PKR ${dPrice} (Sale)` : `PKR ${oPrice}`;
      const status = isSoldOut ? "❌ SOLD OUT" : "✅ Available";

      return {
        title: title,
        media: media,
        subtitle: `${status} | ${priceDisplay}`,
      };
    },
  },
});
