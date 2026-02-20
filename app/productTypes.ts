export type CareInstruction = string;

export type Color = string;

export type Occasion = string;

export type Tag = string;

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

export type Slug = {
  _type: "slug";
  current: string;
};
export type Category = {
  _id: string;
  title: string;
  slug: Slug;
  image?: Image;
  order?: number;
};

export type Product = {
  _id: string;
  _type: "product";
  _createdAt: string;
  name: string;
  description: string;
  originalPrice: number;
  discountPrice?: number;
  size: string;
  material: string;
  isTrending?: boolean;
  category: Category;
  promotion:
    | "none"
    | "new"
    | "bestseller"
    | "featured"
    | "limited"
    | "clearance";
  colors: Color[];
  occasions: Occasion[];
  tags: Tag[];
  careInstructions: CareInstruction[];
  images: Image[];
  slug: Slug;
};

export interface Contact {
  _type: "contact";
  name: string;
  email: string;
  phone: string;
  country: string;
  subject: "orderInquiry" | "productQuestion" | "returnsExchange" | "other";
  message: string;
  createdAt?: string; // ISO date string
}