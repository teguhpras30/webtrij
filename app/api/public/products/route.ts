import { NextResponse } from "next/server";
import { getPublicProducts } from "@/lib/data";

export async function GET() {
  const products = await getPublicProducts();
  return NextResponse.json(products, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
