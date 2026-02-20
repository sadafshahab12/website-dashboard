import { Reference } from "sanity";



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

export interface Category {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
}

export interface SaleProduct {
  _id: string;
  _createdAt: string;
  _type?: string;
  name: string;
  slug: { current: string };
  category?: {
    _id: string;
    title: string;
    slug: { current: string };
  };
  stockQuantity: number;
  originalPrice: number;
  discountPrice?: number;
  isSoldOut: boolean;
  showSaleBadge: boolean;
  promotion: "none" | "new" | "bestseller" | "featured" | "limited";
  images: Image[];
  description?: string;
  material?: string;
  colors?: string[];
  occasions?: string[];
}

export interface SaleOrderItem {
  _key: string;
  product: Reference;
  quantity: number;
  priceAtPurchase: number;
}

export interface SaleOrder {
  _id?: string;
  _type: "saleOrder";
  customerName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  address: string;
  products: SaleOrderItem[];

  // Payment Info
  paymentMethod: "easypaisa" | "bank";
  transactionScreenshot: {
    _type: "image";
    asset: {
      _ref: string;
      _type: "reference";
    };
  };
  totalAmount: number;
  status: "pending" | "processing" | "shipped" | "completed" | "cancelled";
  _createdAt?: string;
}

