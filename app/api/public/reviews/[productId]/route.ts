import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
    const id = Number(productId);

    if (isNaN(id)) {
      return NextResponse.json([], { status: 400 });
    }

    const reviews = await db.review.findMany({
      where: { productId: id, isActive: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(reviews, {
      headers: {
        "Cache-Control": "public, s-maxage=10, stale-while-revalidate=60",
      },
    });
  } catch (error: any) {
    console.error("Error fetching product reviews:", error);
    return NextResponse.json([], { status: 500 });
  }
}
