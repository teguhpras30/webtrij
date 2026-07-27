import { NextResponse } from "next/server";
import { getPublicCategories } from "@/lib/data";

export async function GET() {
  const categories = await getPublicCategories();
  return NextResponse.json(categories, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
