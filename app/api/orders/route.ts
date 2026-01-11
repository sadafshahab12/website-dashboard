import { client } from "@/sanity/lib/client";
import { NextResponse } from "next/server";

export async function GET() {
  const orders = await client.fetch(`
    *[_type == "order"]{
      _id,
      status,
      products[]{
        quantity
      }
    }
  `);

  return NextResponse.json(orders);
}
