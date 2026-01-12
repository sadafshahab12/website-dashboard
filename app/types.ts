// types.ts
export interface Product {
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

export interface OrderProduct {
  product: Product;
  quantity: number;
  price: number;
}

export interface Order {
  _id: string;
  customerName: string;
  time?: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  address: string;
  products: OrderProduct[];
  paymentMethod: "easypaisa" | "bank";
  transactionScreenshot: { asset: { _ref: string; _type: string } };
  totalAmount: number;
  createdAt: string; // raw timestamp from Sanity
  status: "pending" | "processing" | "completed";
  orderDate?: string;
}
export interface Contact {
  _id: string;
  _type: "contact";
  name: string;
  email: string;
  phone: string;
  country: string;
  subject: "orderInquiry" | "productQuestion" | "returnsExchange" | "other";
  message: string;
  _createdAt: string; // ISO date string
}
