import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedAdmin } from "@/lib/auth";

export async function GET() {
  const user = await getAuthenticatedAdmin();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const testimonials = await db.testimonial.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(testimonials);
}

export async function POST(req: Request) {
  const user = await getAuthenticatedAdmin();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { type, name, role, review, avatar, isActive } = await req.json();

    if (!name || !review) {
      return NextResponse.json({ error: "Nama dan Ulasan (Review) wajib diisi." }, { status: 400 });
    }

    const testimonial = await db.testimonial.create({
      data: {
        type: type === "MEMBER" ? "MEMBER" : "MARKETPLACE",
        name,
        role: role || null,
        review,
        avatar: avatar || null,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json(testimonial, { status: 201 });
  } catch (error) {
    console.error("Create testimonial error:", error);
    return NextResponse.json({ error: "Gagal menambahkan testimoni." }, { status: 500 });
  }
}
