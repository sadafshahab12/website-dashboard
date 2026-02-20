import { type SchemaTypeDefinition } from "sanity";
import { order } from "../schemas/order";
import { product } from "../schemas/product";
import { category } from "../schemas/category";
import { contact } from "../schemas/contact";
import { sale } from "../schemas/sale";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [order, product, category, contact, sale],
};
