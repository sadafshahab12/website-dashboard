import { client } from "@/sanity/lib/client";
import { Order } from "../types";

export const fetchOrders = async () => {
  const query = `*[_type == "order"] | order(_createdAt desc){
    _id,
    _type,
    orderNumber,
    customerName,
    email,
    phone,
    country,
    city,
    address,
    postalCode,
    paymentMethod,
    "transactionScreenshot": transactionScreenshot.asset->url,
    totalAmount,
    _createdAt,
    _updatedAt,
    status,
    products[] {
      _key,
      quantity,
      priceAtPurchase,
      itemType,
      product->{
        _id,
        _type,
        name,
        description,
        price,
        discountPrice,
        "images": images[].asset->url
      }
    }
  }`;

  try {
    const data = await client.fetch(query);

    return data.map((order: Order) => {
      const dateObj = new Date(order._createdAt);

      return {
        _id: order._id,
        _type: "order",
        orderNumber: order.orderNumber || "N/A",
        customerName: order.customerName,
        email: order.email,
        phone: order.phone,
        country: order.country,
        city: order.city,
        address: order.address,
        postalCode: order.postalCode,
        paymentMethod: order.paymentMethod,
        totalAmount: order.totalAmount,
        status: order.status,
        _createdAt: order._createdAt,
        _updatedAt: order._updatedAt,
        transactionScreenshot: {
          _type: "image",
          asset: {
            _ref: order.transactionScreenshot || "",
            _type: "reference",
          },
        },

        products: (order.products || []).map((p) => ({
          _key: p._key,
          quantity: p.quantity,
          priceAtPurchase: p.priceAtPurchase,
          itemType: p.itemType || "product",
          product: {
            ...p.product,
            _id: p.product?._id || "",
            name: p.product?.name || "Unknown Product",
            images: p.product?.images || [],
          },
        })),

        // UI Helpers
        orderDate: dateObj.toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        time: dateObj.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
      };
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
};
