import { NextResponse } from "next/server";
import { getPublicTestimonials } from "@/lib/data";

export async function GET() {
  const testimonials = await getPublicTestimonials();
  return NextResponse.json(testimonials, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
