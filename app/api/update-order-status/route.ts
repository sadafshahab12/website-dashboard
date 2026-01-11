import { serverClient } from "../../lib/sanityServer";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json(
        { message: "Missing orderId or status" },
        { status: 400 }
      );
    }

    const updated = await serverClient.patch(orderId).set({ status }).commit();

    return NextResponse.json({ success: true, updated });
  } catch (error) {
    console.error("Failed to update status:", error);
    return NextResponse.json({ success: false, error }, { status: 500 });
  }
}
