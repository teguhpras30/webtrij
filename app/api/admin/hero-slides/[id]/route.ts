import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedAdmin } from "@/lib/auth";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthenticatedAdmin();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const slideId = Number(id);

  try {
    const { title, description, desktopImage, mobileImage, isActive, sortOrder } = await req.json();

    const updated = await db.heroSlide.update({
      where: { id: slideId },
      data: {
        title,
        description,
        desktopImage,
        mobileImage,
        isActive,
        sortOrder: Number(sortOrder) || 0,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update hero slide error:", error);
    return NextResponse.json({ error: "Gagal memperbarui hero banner." }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthenticatedAdmin();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const slideId = Number(id);

  try {
    await db.heroSlide.delete({ where: { id: slideId } });
    return NextResponse.json({ success: true, message: "Hero banner berhasil dihapus." });
  } catch (error) {
    console.error("Delete hero slide error:", error);
    return NextResponse.json({ error: "Gagal menghapus hero banner." }, { status: 500 });
  }
}
