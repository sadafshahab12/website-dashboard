import { type SchemaTypeDefinition } from "sanity";
import { order } from "../schemas/order";
import { product } from "../schemas/product";
import { category } from "../schemas/category";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [order, product, category],
};
