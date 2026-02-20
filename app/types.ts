import { Product } from "./productTypes";
import { SaleProduct } from "./saleType";

export type UnifiedProduct = Product | SaleProduct;
export type ImageAsset = {
  _id: string;
  url: string;
  metadata?: {
    dimensions?: {
      width: number;
      height: number;
    };
    lqip?: string;
  };
};

export type Image = {
  _key: string;
  _type: "image";
  asset: ImageAsset;
  alt?: string;
  crop?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  hotspot?: {
    x: number;
    y: number;
    height: number;
    width: number;
  };
};

export interface OrderItem {
  _key?: string;
  // product reference bhi ho sakta hai ya pura object bhi
  product: UnifiedProduct & {
    _ref?: string;
    _type?: string;
    name?: string;
    images?: Image[];
    discountPrice?: number;
    price?: number;
  };
  quantity: number;
  priceAtPurchase: number;
  itemType: "product" | "sale";
}

export interface Order {
  _id: string;
  _type: "order";
  customerName: string;
  orderNumber: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  address: string;
  postalCode?: string; // Log mein postalCode bhi aa raha hai
  products: OrderItem[];
  paymentMethod: "easypaisa" | "bank";
  transactionScreenshot: {
    _type: "image";
    asset: {
      _ref: string;
      _type: string;
    };
  };
  totalAmount: number;
  _createdAt: string;
  _updatedAt?: string;
  status: "pending" | "processing" | "completed";
  orderDate?: string;
  time?: string;
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
