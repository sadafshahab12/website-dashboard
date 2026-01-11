// lib/fetchOrders.ts
import { client } from "@/sanity/lib/client";
import { Order, OrderProduct } from "../types";

// Type representing the raw Sanity response for an order
interface SanityProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  material?: string;
  careInstructions?: string[];
  occasions?: string[];
  colors?: string[];
  images: { asset: { _ref: string; _type: string } }[];
}

interface SanityOrderProduct {
  quantity: number;
  price: number;
  product: SanityProduct;
}

interface SanityOrder {
  _id: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  products: SanityOrderProduct[];
  paymentMethod: "easypaisa" | "bank";
  transactionScreenshot: { asset: { _ref: string; _type: string } };
  totalAmount: number;
  _createdAt: string;
  status: "pending" | "processing" | "completed";
}

export const fetchOrders = async (): Promise<Order[]> => {
  const query = `*[_type == "order"] | order(_createdAt desc){
    _id,
    customerName,
    email,
    phone,
    address,
    products[] {
      quantity,
      price,
      product->{
        _id,
        name,
        description,
        price,
        material,
        careInstructions,
        occasions,
        colors,
        images
      }
    },
    paymentMethod,
    transactionScreenshot,
    totalAmount,
    _createdAt,
    status
  }`;

  const data: SanityOrder[] = await client.fetch(query);

  const formattedOrders: Order[] = data.map((order) => ({
    _id: order._id,
    customerName: order.customerName,
    email: order.email,
    phone: order.phone,
    address: order.address,
    products: order.products.map(
      (p): OrderProduct => ({
        product: {
          _id: p.product._id,
          name: p.product.name,
          description: p.product.description,
          price: p.product.price,
          material: p.product.material,
          careInstructions: p.product.careInstructions,
          occasions: p.product.occasions,
          colors: p.product.colors,
          images: p.product.images,
        },
        quantity: p.quantity,
        price: p.price,
      })
    ),
    paymentMethod: order.paymentMethod,
    transactionScreenshot: order.transactionScreenshot,
    totalAmount: order.totalAmount,
    createdAt: order._createdAt,
    status: order.status,
    orderDate: new Date(order._createdAt).toLocaleString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }),
  }));

  return formattedOrders;
};
