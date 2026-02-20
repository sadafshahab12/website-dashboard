import { client } from "@/sanity/lib/client";
import { groq } from "next-sanity";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const query = groq`*[_type == "order"] | order(_createdAt desc) {
      _id,
      orderNumber,
      _createdAt,
      customerName,
      email,
      phone,
      address,
      city,
      country,
      postalCode,
      paymentMethod,
      status,
      totalAmount,
      "transactionScreenshot": transactionScreenshot.asset->url,
      products[] {
        _key,
        quantity,
        priceAtPurchase,
        itemType,
        "productDetails": product-> {
          _id,
          name,
          "imageUrl": image.asset->url
        }
      }
    }`;

    const orders = await client.fetch(query);
    return NextResponse.json(orders);
  } catch (error) {
    console.error("Sanity Fetch Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 },
    );
  }
}
