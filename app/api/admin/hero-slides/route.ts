import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedAdmin } from "@/lib/auth";

export async function GET() {
  const user = await getAuthenticatedAdmin();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const slides = await db.heroSlide.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json(slides);
}

export async function POST(req: Request) {
  const user = await getAuthenticatedAdmin();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, description, desktopImage, mobileImage, isActive, sortOrder } = await req.json();

    if (!title || !description || !desktopImage || !mobileImage) {
      return NextResponse.json(
        { error: "Judul, Deskripsi, Gambar Desktop, dan Gambar Mobile wajib diisi." },
        { status: 400 }
      );
    }

    const slide = await db.heroSlide.create({
      data: {
        title,
        description,
        desktopImage,
        mobileImage,
        isActive: isActive ?? true,
        sortOrder: Number(sortOrder) || 0,
      },
    });

    return NextResponse.json(slide, { status: 201 });
  } catch (error) {
    console.error("Create hero slide error:", error);
    return NextResponse.json({ error: "Gagal membuat hero banner." }, { status: 500 });
  }
}
