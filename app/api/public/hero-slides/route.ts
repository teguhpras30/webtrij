import { NextResponse } from "next/server";
import { getPublicHeroSlides } from "@/lib/data";

export async function GET() {
  const slides = await getPublicHeroSlides();
  return NextResponse.json(slides, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
