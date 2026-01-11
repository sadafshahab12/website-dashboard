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
  _createdAt: string;
  name: string;
  description: string;
  price: number;
  size: string;
  material: string;
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
export interface CartItem extends Product {
  quantity: number;
}
export type Review = {
  _id: string;
  _createdAt: string;
  name: string; // reviewer name
  text: string; // review text
  rating: number; // rating out of 5
  product?: {
    // optional relation to a product
    _ref: string;
    _type: "reference";
  };
};

export type CheckoutProduct = Pick<Product, "_id" | "price" | "name"> & {
  quantity: number;
};
