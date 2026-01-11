import { client } from "@/sanity/lib/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const created = await client.create({
      _type: "product",
      name: data.name,
      slug: { _type: "slug", current: data.slug },
      category: {
        _type: "reference",
        _ref: data.categoryId,
      },
      price: data.price,
      promotion: data.promotion || "none",
      description: data.description || "",
      material: data.material || "",
      size: data.size || "",
      colors: data.colors || [],
      occasions: data.occasions || [],
      tags: data.tags || [],
      careInstructions: data.careInstructions || [],
      images: data.images,
    });

    return NextResponse.json({ success: true, product: created });
  } catch (err) {
    // Use TypeScript type narrowing
    let message: string;
    if (err instanceof Error) {
      message = err.message;
    } else {
      message = String(err);
    }
    console.error("Creation Error:", message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
